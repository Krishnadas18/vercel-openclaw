import { connection } from "next/server";
import { jsonError } from "@/shared/http";
import { buildCallbackResponse } from "@/server/auth/vercel-auth";

export const dynamic = 'force-dynamic';

export async function GET(request: Request): Promise<Response> {
  // 1. Let Next.js signal dynamic rendering to the compiler out here
  await connection(); 

  // 2. Wrap only your actual request processing inside the handler safety net
  try {
    return await buildCallbackResponse(request);
  } catch (error) {
    return jsonError(error);
  }
}
