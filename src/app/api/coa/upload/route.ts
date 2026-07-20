import { cookies } from "next/headers";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { ADMIN_COOKIE, isAuthed } from "@/lib/admin/auth";

/**
 * Client-upload token endpoint for COA files. Authorizes only signed-in admins,
 * restricts to PDF / JPG / PNG, and lets the browser upload straight to Vercel
 * Blob (handles large PDFs without passing through a server function). The file
 * is stored under coa/{category}/… so uploads land in the right folder.
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
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
          ],
          addRandomSuffix: true,
          maximumSizeInBytes: 25 * 1024 * 1024,
        };
      },
      // Fires server-side on Vercel after upload; the DB row is written by the
      // recordCoaUpload action so the flow also works in local dev.
      onUploadCompleted: async () => {},
    });
    return Response.json(json);
  } catch (err) {
    return Response.json(
      { error: (err as Error).message },
      { status: 400 },
    );
  }
}
