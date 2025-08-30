import { env } from "@/config/config";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";

export const hashedPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const verifiedHashedPassword = async (
  password: string,
  hashedPassword: string
) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Access Token
export const signJWTAccessToken = (id: string) => {
  return jwt.sign(id, env.ACCESS_TOKEN, {
    expiresIn: env.ACCESS_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
  });
};

export const verifyJWTAccessToken = (req: NextRequest) => {
  const accessToken = req.cookies.get("accessToken")?.value || "";

  if (!accessToken) {
    throw NextResponse.json(
      {
        message: "Unauthorised user",
      },
      { status: 401 }
    );
  }

  const decodeToken = jwt.verify(
    accessToken,
    env.ACCESS_TOKEN
  ) as jwt.JwtPayload;

  return decodeToken.id;
};

// Refresh Token
export const signJWTRefreshToken = (id: string) => {
  return jwt.sign(id, env.REFRESH_TOKEN, {
    expiresIn: env.REFRESH_TOKEN_EXPIRY as jwt.SignOptions["expiresIn"],
  });
};

export const verifyJWTRefreshToken = (req: NextRequest) => {
  const refreshToken = req.cookies.get("accessToken")?.value || "";

  if (!refreshToken) {
    throw NextResponse.json(
      {
        message: "Unauthorised user",
      },
      { status: 401 }
    );
  }

  const decodeToken = jwt.verify(
    refreshToken,
    env.REFRESH_TOKEN
  ) as jwt.JwtPayload;

  return decodeToken.id;
};
