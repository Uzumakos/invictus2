import { supabase } from "./supabaseClient";

/**
 * Uploads a receipt screenshot to the 'payment-receipts' bucket in Supabase Storage.
 * @param file The file object (File or Blob) to upload.
 * @param fileName The name to store the file under.
 * @returns The public URL of the uploaded file.
 */
export async function uploadReceiptScreenshot(
  file: File | Blob,
  fileName: string
): Promise<string> {
  // Ensure the file is stored in a clean directory structure (e.g. year/month/filename)
  const date = new Date();
  const folder = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}`;
  const filePath = `${folder}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("payment-receipts")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

  if (error) {
    console.error("Error uploading to Supabase Storage:", error);
    throw new Error(error.message);
  }

  // Get the public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from("payment-receipts")
    .getPublicUrl(data.path);

  if (!publicUrlData || !publicUrlData.publicUrl) {
    throw new Error("Failed to generate public URL for uploaded receipt.");
  }

  return publicUrlData.publicUrl;
}

/**
 * Deletes a receipt file from the storage bucket.
 * @param fileUrl The full public URL of the file.
 */
export async function deleteReceiptScreenshot(fileUrl: string): Promise<void> {
  try {
    const urlObj = new URL(fileUrl);
    // Path looks like: /storage/v1/object/public/payment-receipts/2026/07/filename.jpg
    const parts = urlObj.pathname.split("/payment-receipts/");
    if (parts.length < 2) return;
    
    const filePath = parts[1];
    const { error } = await supabase.storage
      .from("payment-receipts")
      .remove([filePath]);

    if (error) {
      console.error("Error deleting from Supabase Storage:", error.message);
    }
  } catch (err) {
    console.error("Failed to parse file URL for deletion:", err);
  }
}
