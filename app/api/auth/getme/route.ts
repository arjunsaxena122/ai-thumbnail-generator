import { connectDB } from "@/db/db";
import { Auth } from "@/models/auth.model";
import { verifyJWTAccessToken } from "@/utils/auth.util";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  await connectDB();
  try {
    const decodedId = verifyJWTAccessToken(req);

    const user = await Auth.findById(decodedId).select("-password");

    if (!user) {
      return NextResponse.json(
        {
          message: "user not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        data: user,
        message: `${user?.email} data fetched`,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server failed";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
