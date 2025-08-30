import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("accessToken")?.value || "";

    if (!accessToken) {
      return NextResponse.json(
        {
          message: "Unauthorised user, Token isn't exist",
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json(
      {
        message: "Logout successfully",
      },
      { status: 200 }
    );

    response.cookies.delete("token");
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
