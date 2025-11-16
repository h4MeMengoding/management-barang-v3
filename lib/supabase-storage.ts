// Supabase Storage Helper Functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabaseStorage = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_NAME = 'image';
const PROFILE_FOLDER = 'public/profile-picture';

/**
 * Upload profile picture to Supabase Storage
 * @param file - File object to upload
 * @param userId - User ID for unique filename
 * @returns Public URL of uploaded image
 */
export async function uploadProfilePicture(
  file: File,
  userId: string
): Promise<{ url: string; error?: string }> {
  try {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return { url: '', error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' };
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return { url: '', error: 'Ukuran file terlalu besar. Maksimal 2MB.' };
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${timestamp}.${fileExt}`;
    const filePath = `${PROFILE_FOLDER}/${fileName}`;

    // Delete old profile picture if exists
    await deleteOldProfilePicture(userId);

    // Upload file to Supabase Storage
    const { data, error } = await supabaseStorage.storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return { url: '', error: `Gagal upload: ${error.message}` };
    }

    // Get public URL
    const { data: publicUrlData } = supabaseStorage.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return { url: publicUrlData.publicUrl };
  } catch (error) {
    console.error('Upload error:', error);
    return { url: '', error: 'Terjadi kesalahan saat upload foto profil.' };
  }
}

/**
 * Delete old profile pictures for a user
 * @param userId - User ID
 */
export async function deleteOldProfilePicture(userId: string): Promise<void> {
  try {
    // List all files in user's profile folder
    const { data: files, error: listError } = await supabaseStorage.storage
      .from(BUCKET_NAME)
      .list(PROFILE_FOLDER, {
        search: userId,
      });

    if (listError || !files || files.length === 0) {
      return;
    }

    // Delete all old files
    const filesToDelete = files.map((file) => `${PROFILE_FOLDER}/${file.name}`);
    
    const { error: deleteError } = await supabaseStorage.storage
      .from(BUCKET_NAME)
      .remove(filesToDelete);

    if (deleteError) {
      console.error('Delete error:', deleteError);
    }
  } catch (error) {
    console.error('Error deleting old profile picture:', error);
  }
}

/**
 * Delete specific profile picture by URL
 * @param url - Public URL of the image
 */
export async function deleteProfilePictureByUrl(url: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabaseStorage.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting profile picture:', error);
    return false;
  }
}

/**
 * Get profile picture URL from storage
 * @param userId - User ID
 * @returns Public URL or null
 */
export async function getProfilePictureUrl(userId: string): Promise<string | null> {
  try {
    const { data: files, error } = await supabaseStorage.storage
      .from(BUCKET_NAME)
      .list(PROFILE_FOLDER, {
        search: userId,
        sortBy: { column: 'created_at', order: 'desc' },
        limit: 1,
      });

    if (error || !files || files.length === 0) {
      return null;
    }

    const filePath = `${PROFILE_FOLDER}/${files[0].name}`;
    const { data: publicUrlData } = supabaseStorage.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return null;
  }
}
