import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

/**
 * Upload a file to Supabase Storage
 * @param {string} bucket   - Storage bucket name
 * @param {string} path     - File path inside the bucket (e.g. "photos/abc123.jpg")
 * @param {Buffer} buffer   - File buffer
 * @param {string} mimetype - MIME type (e.g. "image/jpeg")
 * @returns {string} Public URL of the uploaded file
 */
export const uploadFile = async (bucket, path, buffer, mimetype) => {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: mimetype,
      upsert: true,
    });

  if (error) throw new Error(`Supabase upload failed: ${error.message}`);

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

/**
 * Delete a file from Supabase Storage
 * @param {string} bucket - Storage bucket name
 * @param {string} path   - File path inside the bucket
 */
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(`Supabase delete failed: ${error.message}`);
};

export default supabase;
