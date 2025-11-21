import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// GET - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            items: true,
            lockers: true,
            categories: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data user' },
      { status: 500 }
    );
  }
}

// POST - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, role } = body;

    // Validasi input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, dan nama harus diisi' },
        { status: 400 }
      );
    }

    // Validasi role
    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
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

    // Buat user baru
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'user',
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { message: 'User berhasil dibuat', user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Create user error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat user' },
      { status: 500 }
    );
  }
}

// PUT - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, email, name, role, password } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID harus diisi' },
        { status: 400 }
      );
    }

    // Validasi role jika ada
    if (role && !['admin', 'user'].includes(role)) {
      return NextResponse.json(
        { error: 'Role tidak valid' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (email) updateData.email = email;
    if (name) updateData.name = name;
    if (role) updateData.role = role;
    
    // Hash password baru jika ada
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { error: 'Password minimal 6 karakter' },
          { status: 400 }
        );
      }
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      { message: 'User berhasil diperbarui', user },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Update user error:', error);

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email sudah digunakan oleh user lain' },
        { status: 400 }
      );
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui user' },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID harus diisi' },
        { status: 400 }
      );
    }

    // Cek apakah user yang akan dihapus adalah admin terakhir
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user?.role === 'admin') {
      const adminCount = await prisma.user.count({
        where: { role: 'admin' },
      });

      if (adminCount <= 1) {
        return NextResponse.json(
          { error: 'Tidak dapat menghapus admin terakhir' },
          { status: 400 }
        );
      }
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    return NextResponse.json(
      { message: 'User berhasil dihapus' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Delete user error:', error);

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'User tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus user' },
      { status: 500 }
    );
  }
}
