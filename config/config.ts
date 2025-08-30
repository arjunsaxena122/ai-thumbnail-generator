import "dotenv/config";
import { NextResponse } from "next/server";
import { z } from "zod";

const envSchema = z.object({
  MONGO_URI: z.string(),
  NODE_ENV: z.string(),
  ACCESS_TOKEN: z.string(),
  ACCESS_TOKEN_EXPIRY: z.string(),
  REFRESH_TOKEN: z.string(),
  REFRESH_TOKEN_EXPIRY: z.string(),
});

const createEnv = (env: NodeJS.ProcessEnv) => {
  const resultValidation = envSchema.safeParse(env);

  if (resultValidation.error) {
    throw NextResponse.json({
      message: `Enviroment validation failed ${env} cause of ${resultValidation.error}`,
    });
  }

  return resultValidation?.data;
};

export const env = createEnv(process.env);
