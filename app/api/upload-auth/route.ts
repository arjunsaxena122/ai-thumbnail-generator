import { env } from "@/config/config";
import { getUploadAuthParams } from "@imagekit/next/server";

export async function GET() {
  try {
    if (!env.IMAGEKIT_PRIVATE_KEY || !env.IMAGEKIT_PUBLIC_KEY) {
      throw Response.json(
        {
          message: "Imagekit keys are not found",
        },
        { status: 400 }
      );
    }

    const { token, expire, signature } = getUploadAuthParams({
      privateKey: env.IMAGEKIT_PRIVATE_KEY as string,
      publicKey: env.IMAGEKIT_PUBLIC_KEY as string,
    });

    if (!token || !expire || !signature) {
      return Response.json(
        {
          message: "token or expire or signature are not found",
        },
        { status: 400 }
      );
    }

    return Response.json({
      token,
      expire,
      signature,
      publicKey: env.IMAGEKIT_PUBLIC_KEY,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";

    return Response.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
