import { NextRequest, NextResponse } from "next/server";
import { StorageService } from "@/services/storage.service";
import { AuthService } from "@/services/auth.service";

export async function POST(request: NextRequest) {
  try {
    // Check if user is logged in
    const role = await AuthService.getUserRole();
    if (!role) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const bucket = formData.get("bucket") as string;
    const path = formData.get("path") as string;

    if (!file || !bucket || !path) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Map string bucket name to StorageBucket type
    const storageBucket = (bucket === "product-images" || bucket === "products") ? "products" : 
                         (bucket === "banners") ? "banners" : "profiles" as const;

    const url = await StorageService.upload(storageBucket, path, file);
    return NextResponse.json({ success: true, url });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
