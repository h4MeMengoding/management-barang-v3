import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { prisma } from '@/lib/prisma';

// Use service role key for server-side operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const BUCKET_NAME = 'image';
const PROFILE_FOLDER = 'public/profile-picture';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json(
        { error: 'File dan userId harus diisi' },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Format file tidak didukung. Gunakan JPG, PNG, atau WebP.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Ukuran file terlalu besar. Maksimal 2MB.' },
        { status: 400 }
      );
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${timestamp}.${fileExt}`;
    const filePath = `${PROFILE_FOLDER}/${fileName}`;

    // Delete old profile pictures
    const { data: existingFiles } = await supabase.storage
      .from(BUCKET_NAME)
      .list(PROFILE_FOLDER, {
        search: userId,
      });

    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles.map(
        (f) => `${PROFILE_FOLDER}/${f.name}`
      );
      await supabase.storage.from(BUCKET_NAME).remove(filesToDelete);
    }

    // Convert File to ArrayBuffer then to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload new file
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: `Gagal upload: ${error.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    // Update user profile in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: publicUrlData.publicUrl },
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json(
      {
        message: 'Foto profil berhasil diupload',
        url: publicUrlData.publicUrl,
        user: userWithoutPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat upload foto profil' },
      { status: 500 }
    );
  }
}
