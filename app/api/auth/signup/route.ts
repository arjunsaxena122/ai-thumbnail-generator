import { connectDB } from "@/db/db";
import { Auth } from "@/models/auth.model";
import { hashedPassword } from "@/utils/auth.util";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  await connectDB();
  try {
    const body = await req.json();
    const {
      username,
      email,
      password,
    }: { username: string; email: string; password: string } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        {
          message: "Please fill all the required fields",
        },
        { status: 400 }
      );
    }

    const existedUser = await Auth.findOne({
      $or: [{ username }, { email }],
    });

    if (existedUser) {
      return NextResponse.json(
        {
          message: "user already register, Please login!",
        },
        { status: 409 }
      );
    }

    const user = await Auth.create({
      username,
      email,
      password: await hashedPassword(password),
    });

    const createdUser = await Auth.findById(user?.id).select("-password");

    if (!createdUser) {
      return NextResponse.json(
        {
          message:
            "Internal server error, user not registered, Please try again!",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        data: createdUser,
        message: "user registered successfully",
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      {
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
