import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Cek apakah sudah ada admin
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    if (adminExists) {
      return NextResponse.json(
        { error: 'Admin sudah ada' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { email, password, name } = body;

    // Validasi input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama harus diisi' },
        { status: 400 }
      );
    }

    // Validasi email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validasi password minimal 6 karakter
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password minimal 6 karakter' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat admin pertama
    const admin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'admin',
      },
    });

    // Return user data (tanpa password)
    const { password: _, ...adminWithoutPassword } = admin;

    return NextResponse.json(
      {
        message: 'Admin berhasil dibuat',
        user: adminWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Setup admin error:', error);
    
    // Handle unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat admin' },
      { status: 500 }
    );
  }
}
