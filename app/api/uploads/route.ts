import { NextResponse } from "next/server";

import { getSession } from "@/features/auth/session";
import { UploadValidationError, uploadFile } from "@/services/uploadService";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ success: false, error: "Unauthenticated" }, { status: 401 });
  }

  const formData = await request.formData().catch(() => null);
  const file = formData?.get("file");
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadFile({
      buffer,
      filename: file.name,
      contentType: file.type,
    });
    return NextResponse.json({ success: true, url: result.url });
  } catch (error) {
    if (error instanceof UploadValidationError) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }
    throw error;
  }
}
