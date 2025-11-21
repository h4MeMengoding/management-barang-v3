// Supabase Storage Helper Functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const BUCKET_NAME = 'image';
const PROFILE_FOLDER = 'public/profile-picture';

/**
 * Get authenticated Supabase client with user session
 * This function should be called from client-side with user's auth token
 */
function getAuthenticatedClient(accessToken?: string) {
  const client = createClient(supabaseUrl, supabaseAnonKey);
  
  if (accessToken) {
    // Set auth header with access token
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: ''
    } as any);
  }
  
  return client;
}

/**
 * Upload profile picture to Supabase Storage
 * @param file - File object to upload
 * @param userId - User ID for unique filename
 * @param accessToken - Optional access token for authentication
 * @returns Public URL of uploaded image
 */
export async function uploadProfilePicture(
  file: File,
  userId: string,
  accessToken?: string
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

    // Get authenticated client
    const supabaseClient = getAuthenticatedClient(accessToken);

    // Delete old profile picture if exists
    await deleteOldProfilePicture(userId, accessToken);

    // Upload file to Supabase Storage
    const { data, error } = await supabaseClient.storage
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
    const { data: publicUrlData } = supabaseClient.storage
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
 * @param accessToken - Optional access token for authentication
 */
export async function deleteOldProfilePicture(userId: string, accessToken?: string): Promise<void> {
  try {
    const supabaseClient = getAuthenticatedClient(accessToken);
    
    // List all files in user's profile folder
    const { data: files, error: listError } = await supabaseClient.storage
      .from(BUCKET_NAME)
      .list(PROFILE_FOLDER, {
        search: userId,
      });

    if (listError || !files || files.length === 0) {
      return;
    }

    // Delete all old files
    const filesToDelete = files.map((file) => `${PROFILE_FOLDER}/${file.name}`);
    
    const { error: deleteError } = await supabaseClient.storage
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
 * @param accessToken - Optional access token for authentication
 */
export async function deleteProfilePictureByUrl(url: string, accessToken?: string): Promise<boolean> {
  try {
    const supabaseClient = getAuthenticatedClient(accessToken);
    
    // Extract file path from URL
    const urlParts = url.split(`${BUCKET_NAME}/`);
    if (urlParts.length < 2) {
      return false;
    }

    const filePath = urlParts[1];

    const { error } = await supabaseClient.storage
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
 * @param accessToken - Optional access token for authentication
 * @returns Public URL or null
 */
export async function getProfilePictureUrl(userId: string, accessToken?: string): Promise<string | null> {
  try {
    const supabaseClient = getAuthenticatedClient(accessToken);
    
    const { data: files, error } = await supabaseClient.storage
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
    const { data: publicUrlData } = supabaseClient.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error getting profile picture:', error);
    return null;
  }
}
