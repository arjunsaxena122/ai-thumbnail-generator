import { NextRequest, NextResponse } from "next/server";
import { type GenerateContentResponse, GoogleGenAI } from "@google/genai";
import * as fs from "fs";
import axios from "axios";

export async function POST(req: NextRequest) {
  const { query, filename, fileType, url } = await req.json();
  console.log(query, filename, fileType, url);

  if (!query || !filename || !fileType || !url) {
    throw NextResponse.json(
      {
        message: "prompt or file not found",
      },
      { status: 404 }
    );
  }

  if (!["image/png", "image/jpg", "image/jpeg"].includes(fileType)) {
    throw NextResponse.json(
      {
        message: "Could you please upload image in png, jpeg, jpg format",
      },
      { status: 415 }
    );
  }

  console.log("query and file", query, filename, fileType, url);

  try {
    const ai = new GoogleGenAI({});
    const { data } = await axios.get(url, { responseType: "arraybuffer" });
    // const arrayBuffer = await data.arrayBuffer();
    const base64Image = Buffer.from(data).toString("base64");
    console.log(fileType.trim());
    const prompt = [
      {
        text: query,
      },

      {
        inlineData: {
          data: base64Image,
          mimeType: fileType,
        },
      },
    ];

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });
    console.log("before Response from the google image generation", response);

    if (!response || !response.candidates || response.candidates.length === 0) {
      throw NextResponse.json(
        {
          message: "Google AI response are not generating",
        },
        { status: 400 }
      );
    }

    console.log("after Response from the google image generation", response);

    for (const part of response?.candidates[0]?.content?.parts ?? []) {
      if (part.text) {
        console.log(part.text);
      } else if (part.inlineData?.data) {
        console.log("Received image data from Gemini");
        const imageBase64 = part.inlineData.data;
        const buffer = Buffer.from(imageBase64, "base64");
        fs.writeFileSync("gemini-native-image.png", buffer);
        console.log("Image saved as gemini-native-image.png");
      }
    }

    return NextResponse.json(
      {
        message: "Your image generated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.log(`Error comes from the chat api cause of ${error}`);
    process.exit(1);
  }
}
