import { type NextRequest, NextResponse } from "next/server";
import axios from "axios";
import ImageKit from "imagekit";
import { GoogleGenAI, type GenerateContentResponse } from "@google/genai";
import { env } from "@/config/config";
import { makeMimeType } from "@/utils/makeMimeType";

type UploadItem = {
  url?: string;
  path?: string;
  imageUrl?: string;
  previewUrl?: string;
  name?: string;
  fileType?: string;
  size?: number;
  [key: string]: any;
};

type Mode = "both" | "16-9" | "9-16";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json({ message: "body is undefined" }, { status: 429 });
  }

  const {
    query,
    uploadResponses,
    mode = "both",
  } = body as {
    query?: string;
    uploadResponses?: UploadItem[];
    mode?: Mode;
  };

  if (
    !query ||
    !Array.isArray(uploadResponses) ||
    uploadResponses.length === 0
  ) {
    return NextResponse.json(
      { message: "query or uploadResponses are missing" },
      { status: 400 }
    );
  }

  if (uploadResponses.length > 2) {
    return NextResponse.json(
      { message: "Maximum 2 images are allowed" },
      { status: 400 }
    );
  }

  // Validate mime types
  const normalized = uploadResponses.map((u) => {
    const mime = makeMimeType(u.name || "", u.fileType);
    return { ...u, _mime: mime };
  });

  const invalid = normalized.find(
    (u) =>
      !["image/png", "image/jpeg", "image/webp"].includes(u._mime as string)
  );
  if (invalid) {
    return NextResponse.json(
      { message: "Please upload image in png, jpeg, or webp format" },
      { status: 415 }
    );
  }

  try {
    // ImageKit client for saving generated images
    const imagekit = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    });

    // Prepare prompt and inline data for Gemini
    const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    const inlineParts = [];
    for (const item of normalized) {
      const sourceUrl = item.url || item.path || item.imageUrl;
      if (!sourceUrl) continue;
      const { data } = await axios.get(sourceUrl, {
        responseType: "arraybuffer",
      });
      const base64Image = Buffer.from(data).toString("base64");
      inlineParts.push({
        inlineData: {
          data: base64Image,
          mimeType: item._mime,
        },
      });
    }

    // Enhanced guardrail system - STRICT thumbnail-only generation
    const strictGuardrail = `
      🎯 THUMBNAIL SPECIALIST SYSTEM - STRICT MODE ACTIVATED
      
      YOU ARE EXCLUSIVELY A THUMBNAIL GENERATION EXPERT. CRITICAL RESTRICTIONS:
      
      ❌ FORBIDDEN OUTPUTS:
      - Any aspect ratio other than 16:9 or 9:16
      - General images, photos, artwork, or designs
      - Social media posts, banners, or web graphics
      - Any non-thumbnail content
      
      ✅ ALLOWED OUTPUTS ONLY:
      - YouTube Thumbnails (16:9 aspect ratio EXACTLY)
      - YouTube Shorts Thumbnails (9:16 aspect ratio EXACTLY)
      - Optimized for maximum click-through rates
      - High contrast, bold text, clear subjects
      - Eye-catching colors and dramatic composition
      
      🎨 THUMBNAIL OPTIMIZATION RULES:
      - Subject must be prominently featured and clearly visible
      - Use high contrast colors for visibility
      - Bold, readable text overlays (if applicable)
      - Dramatic lighting and composition
      - Clear focal points that draw attention
      - Optimized for small display sizes
      - Professional thumbnail aesthetics
      
      📐 ASPECT RATIO ENFORCEMENT:
      - 16:9 = YouTube main video thumbnails (1280x720, 1920x1080)
      - 9:16 = YouTube Shorts/Instagram Reels thumbnails (1080x1920)
      - NO OTHER RATIOS PERMITTED
      
      If user requests anything other than thumbnails, politely redirect: "I specialize exclusively in creating YouTube and Shorts thumbnails. Let me help you create an engaging thumbnail instead!"
    `;

    const ratioInstruction =
      mode === "both"
        ? "Generate EXACTLY two thumbnail images: one in 16:9 aspect ratio for YouTube and one in 9:16 aspect ratio for Shorts/Reels."
        : mode === "16-9"
        ? "Generate EXACTLY one thumbnail image in 16:9 aspect ratio for YouTube."
        : "Generate EXACTLY one thumbnail image in 9:16 aspect ratio for Shorts/Reels.";

    const enhancedPrompt = `
      ${strictGuardrail}
      
      THUMBNAIL CREATION REQUEST:
      ${query}
      
      SPECIFIC INSTRUCTIONS:
      ${ratioInstruction}
      
      Apply professional thumbnail design principles:
      - Maximum visual impact for small displays
      - Clear subject hierarchy and composition
      - Vibrant, high-contrast color schemes
      - Bold typography (if text is needed)
      - Optimized for viewer engagement and clicks
      
      Return ONLY the thumbnail images in the requested aspect ratios.
    `;

    const contents = [
      {
        text: enhancedPrompt,
      },
      ...inlineParts,
    ];

    const generatedImagesBase64: string[] = [];
    let generatedText = "";

    if (env.GEMINI_API_KEY) {
      const response: GenerateContentResponse = await ai.models.generateContent(
        {
          model: "gemini-2.5-flash-image-preview",
          contents,
        }
      );

      if (response?.candidates?.[0]?.content?.parts?.length) {
        for (const part of response.candidates[0].content.parts) {
          const p: any = part;
          if (p.text) generatedText += `${p.text}\n\n`;
          if (p.inlineData?.data)
            generatedImagesBase64.push(p.inlineData.data as string);
        }
      }
    }

    // If model didn't return images, fallback by using first input image(s)
    if (generatedImagesBase64.length === 0) {
      const firstUrl =
        normalized[0]?.url || normalized[0]?.path || normalized[0]?.imageUrl;
      if (firstUrl) {
        const { data } = await axios.get(firstUrl, {
          responseType: "arraybuffer",
        });
        generatedImagesBase64.push(Buffer.from(data).toString("base64"));
      }
    }

    // Upload generated image(s) to ImageKit
    const uploadedUrls: string[] = [];
    for (let i = 0; i < generatedImagesBase64.length; i++) {
      const mimeType = normalized[0]?._mime || "image/jpeg";
      const prefixedBase64 = `data:${mimeType};base64,${generatedImagesBase64[i]}`;
      const saved = await imagekit.upload({
        file: prefixedBase64,
        fileName: `thumbnail-${mode}-${
          normalized[0]?.name || "image"
        }-${Date.now()}-${i + 1}`,
        folder: "thumbnails/generated",
        tags: ["thumbnail", mode, "ai-generated"],
      });
      if (saved?.url) uploadedUrls.push(saved.url);
    }

    // Build strict 16:9 and 9:16 transformed URLs using ImageKit transformations
    // Use crop-at_least + focus-center to enforce exact ratios
    const makeTransformed = (
      baseUrl: string,
      w: number,
      h: number,
      label: string
    ) => {
      const sep = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${sep}tr=w-${w},h-${h},c-at_least,fo-center,q-90,f-auto`;
    };

    const base = uploadedUrls[0] || uploadedUrls[uploadedUrls.length - 1];
    const outputs: Record<string, any> = {};

    // Generate precise thumbnail transformations
    if (mode === "both" || mode === "16-9") {
      outputs.thumbnail169 = {
        originalUrl: base,
        transformedUrl: makeTransformed(base, 1280, 720, "YouTube"), // 16:9
        downloadUrl: makeTransformed(base, 1920, 1080, "YouTube-HD"), // HD version
        aspect: "16:9",
        type: "YouTube Thumbnail",
        dimensions: "1280x720",
      };
    }

    if (mode === "both" || mode === "9-16") {
      outputs.reel916 = {
        originalUrl: base,
        transformedUrl: makeTransformed(base, 1080, 1920, "Shorts"), // 9:16
        downloadUrl: makeTransformed(base, 1080, 1920, "Shorts-HD"), // HD version
        aspect: "9:16",
        type: "Shorts/Reels Thumbnail",
        dimensions: "1080x1920",
      };
    }

    // Enhanced response with thumbnail-specific messaging
    const thumbnailMessage =
      mode === "both"
        ? "✨ Professional thumbnails created! Generated both YouTube (16:9) and Shorts/Reels (9:16) formats optimized for maximum engagement and click-through rates."
        : mode === "16-9"
        ? "🎯 YouTube thumbnail created! Generated in perfect 16:9 aspect ratio, optimized for desktop and mobile viewing with high impact design."
        : "📱 Shorts thumbnail created! Generated in perfect 9:16 aspect ratio, optimized for vertical viewing and maximum engagement on mobile devices.";

    return NextResponse.json(
      {
        text: generatedText?.trim() || thumbnailMessage,
        imageUrl:
          (mode === "9-16"
            ? outputs.reel916?.transformedUrl
            : outputs.thumbnail169?.transformedUrl) || base,
        images: uploadedUrls,
        outputs,
        thumbnailData: {
          mode,
          aspectRatios:
            mode === "both"
              ? ["16:9", "9:16"]
              : [mode === "16-9" ? "16:9" : "9:16"],
          optimizedFor:
            mode === "both"
              ? ["YouTube Videos", "YouTube Shorts", "Instagram Reels"]
              : mode === "16-9"
              ? ["YouTube Videos"]
              : ["YouTube Shorts", "Instagram Reels", "TikTok"],
        },
        message:
          "🎨 Your professional thumbnails are ready for download and use!",
        success: true,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Thumbnail generation error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Thumbnail generation failed";
    return NextResponse.json(
      {
        error: errorMessage,
        message:
          "Failed to generate thumbnails. Please try again with different images or description.",
        success: false,
      },
      { status: 500 }
    );
  }
}
