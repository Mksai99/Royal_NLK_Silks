import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET_PRODUCTS = process.env.NEXT_PUBLIC_STORAGE_BUCKET_PRODUCTS ?? "product-images";
const BUCKET_BANNERS = process.env.NEXT_PUBLIC_STORAGE_BUCKET_BANNERS ?? "banners";
const BUCKET_PROFILES = process.env.NEXT_PUBLIC_STORAGE_BUCKET_PROFILES ?? "profile-images";

export type StorageBucket = "products" | "banners" | "profiles";

function getBucketName(bucket: StorageBucket): string {
  const map: Record<StorageBucket, string> = {
    products: BUCKET_PRODUCTS,
    banners: BUCKET_BANNERS,
    profiles: BUCKET_PROFILES,
  };
  return map[bucket];
}

export const StorageService = {

  /**
   * Upload a file to Supabase Storage.
   * Returns the public URL.
   */
  async upload(
    bucket: StorageBucket,
    path: string,
    file: File | Blob | Buffer,
    contentType?: string
  ): Promise<string> {
    const admin = createAdminClient();
    const bucketName = getBucketName(bucket);

    const { error } = await admin.storage
      .from(bucketName)
      .upload(path, file, {
        contentType,
        upsert: true,
      });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    return StorageService.getPublicUrl(bucket, path);
  },

  /**
   * Get the public URL for a stored file.
   */
  getPublicUrl(bucket: StorageBucket, path: string): string {
    const admin = createAdminClient();
    const bucketName = getBucketName(bucket);
    const { data } = admin.storage.from(bucketName).getPublicUrl(path);
    return data.publicUrl;
  },

  /**
   * Delete a file from storage.
   */
  async delete(bucket: StorageBucket, path: string): Promise<void> {
    const admin = createAdminClient();
    const bucketName = getBucketName(bucket);
    const { error } = await admin.storage.from(bucketName).remove([path]);
    if (error) throw new Error(`Storage delete failed: ${error.message}`);
  },

  /**
   * Delete multiple files.
   */
  async deleteMany(bucket: StorageBucket, paths: string[]): Promise<void> {
    if (paths.length === 0) return;
    const admin = createAdminClient();
    const bucketName = getBucketName(bucket);
    const { error } = await admin.storage.from(bucketName).remove(paths);
    if (error) throw new Error(`Storage delete failed: ${error.message}`);
  },

  /**
   * Extract storage path from a public URL.
   * Useful for deleting files when you only have the URL.
   */
  extractPath(publicUrl: string, bucket: StorageBucket): string {
    const admin = createAdminClient();
    const bucketName = getBucketName(bucket);
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const prefix = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;
    return publicUrl.replace(prefix, "");
  },

  /**
   * List all files in a bucket folder.
   */
  async list(bucket: StorageBucket, folder = "") {
    const admin = createAdminClient();
    const bucketName = getBucketName(bucket);
    const { data, error } = await admin.storage.from(bucketName).list(folder);
    if (error) throw new Error(error.message);
    return data;
  },
};
