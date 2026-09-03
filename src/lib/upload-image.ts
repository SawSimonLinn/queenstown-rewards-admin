import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

/** Uploads an image to the shared public-images bucket, returning its public URL, or null if no file was provided. */
export async function uploadImageIfPresent(
  supabase: SupabaseClient,
  file: File | null,
  folder: "campaigns" | "specials"
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from("public-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from("public-images").getPublicUrl(path);
  return data.publicUrl;
}
