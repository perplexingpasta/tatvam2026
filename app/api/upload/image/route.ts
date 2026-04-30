import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinaryUpload";

export const maxDuration = 30; // seconds

const ALLOWED_FOLDERS = ["college-ids", "payment-proofs", "merch-payments"];
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Content-Type. Must be multipart/form-data.",
        },
        { status: 415 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json(
        { success: false, message: "File is required." },
        { status: 400 },
      );
    }

    if (!folder || !ALLOWED_FOLDERS.includes(folder)) {
      return NextResponse.json(
        { success: false, message: "Invalid or missing folder." },
        { status: 400 },
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPEG, JPG, PNG, and WebP are allowed.",
        },
        { status: 400 },
      );
    }

    const maxFileSizeMb = parseInt(
      process.env.NEXT_PUBLIC_MAX_FILE_SIZE_MB || "20",
      10,
    );
    const maxFileSizeBytes = maxFileSizeMb * 1024 * 1024;

    if (file.size > maxFileSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          message: `File size exceeds the limit of ${maxFileSizeMb}MB.`,
        },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let transformations: object[] = [];

    if (folder === "college-ids") {
      transformations = [
        { width: 1200, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ];
    } else if (folder === "payment-proofs" || folder === "merch-payments") {
      transformations = [
        { width: 2000, crop: "limit" },
        { quality: "auto:good" },
        { fetch_format: "auto" },
      ];
    }

    const uploadResult = await uploadToCloudinary(
      buffer,
      file.type,
      folder,
      transformations,
    );

    return NextResponse.json({
      success: true,
      originalUrl: uploadResult.originalUrl,
      transformedUrl: uploadResult.transformedUrl,
      folder: folder,
    });
  } catch (error) {
    console.error("Image upload error:", error);
    return NextResponse.json(
      { success: false, message: "Upload failed, please try again." },
      { status: 503 },
    );
  }
}
