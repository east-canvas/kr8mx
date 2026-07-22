import { cookies } from "next/headers";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";

/**
 * Client-upload token endpoint for product images. Authorizes only signed-in
 * admins and restricts to JPG / PNG / WEBP. The browser uploads straight to
 * Vercel Blob under products/{category}/{flavor}/… so files stay organized.
 */
export async function POST(request: Request): Promise<Response> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const store = await cookies();
        if (!isAuthed(store.get(ADMIN_COOKIE)?.value)) {
          throw new Error("Not authorized");
        }
        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "image/webp",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 10 * 1024 * 1024,
        };
      },
      onUploadCompleted: async () => {},
    });
    return Response.json(json);
  } catch (err) {
    return Response.json({ error: (err as Error).message }, { status: 400 });
  }
}
