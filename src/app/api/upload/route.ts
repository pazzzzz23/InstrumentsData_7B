import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: "Falta configurar Vercel Blob." }, { status: 503 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
        maximumSizeInBytes: 5_000_000,
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => undefined,
    });

    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "No se pudo preparar la carga de la foto." }, { status: 400 });
  }
}