import { connectDB } from "@/db/db";
import { Auth } from "@/models/auth.model";
import { signJWTAccessToken, verifiedHashedPassword } from "@/utils/auth.util";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json();
    const { email, password }: { email: string; password: string } = body;

    if (!email || !password) {
      return NextResponse.json(
        {
          message: "Please fill all the required fields",
        },
        { status: 400 }
      );
    }

    const user = await Auth.findOne({ email });

    if (!user) {
      return NextResponse.json(
        {
          message: "Invalid creadentional, Please registered!",
        },
        { status: 401 }
      );
    }

    const isPasswordCorrect = await verifiedHashedPassword(
      password,
      user?.password
    );

    if (!isPasswordCorrect) {
      return NextResponse.json(
        {
          message: "Invalid creadentional",
        },
        { status: 401 }
      );
    }

    const loggInUser = await Auth.findById(user?.id).select("-password");
    const accessToken = signJWTAccessToken(user?.id);
    if (!accessToken) {
      return NextResponse.json(
        {
          message: "Token isn't generated yet",
        },
        { status: 400 }
      );
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const response = NextResponse.json(
      {
        data: loggInUser,
        message: "user login successfully",
      },
      { status: 200 }
    );

    response.cookies.set("accessToken", accessToken, options);

    return response;
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
