import { type NextRequest, NextResponse } from "next/server"
import { GoogleGenAI, type GenerateContentResponse } from "@google/genai"
import axios from "axios"
import ImageKit from "imagekit"
import { makeMimeType } from "@/utils/makeMimeType"
import { env } from "@/config/config"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)

  if (!body) {
    return NextResponse.json({ message: "body is undefined" }, { status: 429 })
  }

  const { query, uploadResponse } = body || {}
  if (!query || !uploadResponse) {
    return NextResponse.json({ message: "query or uploadResponse don't have" }, { status: 400 })
  }

  const { name, url, fileType } = uploadResponse || {}
  const mimeType = makeMimeType(name, fileType)

  if (!["image/png", "image/jpeg", "image/webp"].includes(mimeType)) {
    return NextResponse.json({ message: "Could you please upload image in png, jpeg, webp format" }, { status: 415 })
  }

  try {
    // ImageKit client for saving generated images
    const imagekit = new ImageKit({
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
      privateKey: env.IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: env.IMAGEKIT_URL_ENDPOINT,
    })

    // Prepare prompt for Gemini
    const ai = new GoogleGenAI({})
    const { data } = await axios.get(url, { responseType: "arraybuffer" })
    const base64Image = Buffer.from(data).toString("base64")

    const prompt = [
      { text: query },
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    })

    if (!response || !response.candidates?.length) {
      return NextResponse.json({ message: "Google AI response are not generating" }, { status: 400 })
    }

    const texts: string[] = []
    const images: string[] = []

    for (const part of response.candidates[0]?.content?.parts ?? []) {
      if ((part as any).text) {
        texts.push((part as any).text as string)
      } else if ((part as any).inlineData?.data) {
        // Save generated image to ImageKit, return hosted URL
        const imageBase64 = (part as any).inlineData.data as string
        const prefixedBase64 = `data:${mimeType};base64,${imageBase64}`
        const saved = await imagekit.upload({
          file: prefixedBase64,
          fileName: `generatedImage-${name}`,
          folder: "generated/images",
        })
        if (saved?.url) images.push(saved.url)
      }
    }

    return NextResponse.json(
      {
        text: texts.join("\n\n").trim() || "Here is the result based on your image and prompt.",
        imageUrl: images[0], // ChatUI checks imageUrl/url
        images, // also return all in case you need multiple
        message: "Your image generated successfully",
      },
      { status: 200 },
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Internal Server Error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
