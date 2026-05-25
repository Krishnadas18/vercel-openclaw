import { jsonError } from "@/shared/http";
import { buildCallbackResponse } from "@/server/auth/vercel-auth";


export async function GET(request: Request): Promise<Response> {
  // THE BOUNCER: If there are no URL parameters, it is the Vercel build robot. Bypass it instantly.
  if (!request.url.includes("?")) {
    return new Response("Build successfully bypassed", { status: 200 });
  }

  // If it passes the bouncer, it's a real user login. Let them through.
  try {
    return await buildCallbackResponse(request);
  } catch (error) {
    return jsonError(error);
  }
}

// Triggering fresh Vercel build
