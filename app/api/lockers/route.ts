import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

// Force dynamic rendering (no static optimization)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// Generate unique locker code
function generateLockerCode(): string {
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 000-999
  return `${suffix}${numbers}`;
}

// Generate QR code as data URL
async function generateQRCode(code: string): Promise<string> {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(code, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
    return qrCodeDataUrl;
  } catch (error) {
    console.error('QR Code generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

// GET - Get all lockers or single locker
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lockerId = searchParams.get('id');
    const userId = searchParams.get('userId');
    const code = searchParams.get('code');

    // Get single locker by ID
    if (lockerId) {
      const locker = await prisma.locker.findUnique({
        where: { id: lockerId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!locker) {
        return NextResponse.json(
          { error: 'Locker tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({ locker }, { status: 200 });
    }

    // Get locker by code
    if (code) {
      const locker = await prisma.locker.findUnique({
        where: { code },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (!locker) {
        return NextResponse.json(
          { error: 'Locker tidak ditemukan' },
          { status: 404 }
        );
      }

      return NextResponse.json({ locker }, { status: 200 });
    }

    // Get all lockers by user
    if (userId) {
      const lockers = await prisma.locker.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            select: { id: true },
          },
        },
      });

      // Transform to include item count
      const lockersWithCount = lockers.map((locker: any) => ({
        ...locker,
        itemCount: locker.items.length,
        items: undefined, // Remove items array from response
      }));

      return NextResponse.json({ lockers: lockersWithCount }, { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      });
    }

    // Get all lockers
    const lockers = await prisma.locker.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ lockers }, { status: 200 });
  } catch (error) {
    console.error('Get lockers error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengambil data locker' },
      { status: 500 }
    );
  }
}

// POST - Create new locker
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, userId, code } = body;

    // Validasi
    if (!name || !userId) {
      return NextResponse.json(
        { error: 'Nama locker dan User ID harus diisi' },
        { status: 400 }
      );
    }

    // Generate unique code
    let lockerCode = code;
    if (!lockerCode) {
      let isUnique = false;
      while (!isUnique) {
        lockerCode = generateLockerCode();
        const existing = await prisma.locker.findUnique({
          where: { code: lockerCode },
        });
        if (!existing) {
          isUnique = true;
        }
      }
    }

    // Check if code already exists
    const existingLocker = await prisma.locker.findUnique({
      where: { code: lockerCode },
    });

    if (existingLocker) {
      return NextResponse.json(
        { error: 'Kode locker sudah digunakan' },
        { status: 400 }
      );
    }

    // Generate QR Code
    const qrCodeUrl = await generateQRCode(lockerCode);

    // Create locker
    const locker = await prisma.locker.create({
      data: {
        code: lockerCode,
        name,
        description: description || null,
        qrCodeUrl,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Locker berhasil dibuat',
        locker,
      },
      { 
        status: 201,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    );
  } catch (error) {
    console.error('Create locker error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat membuat locker' },
      { status: 500 }
    );
  }
}

// PUT - Update locker
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Locker ID diperlukan' },
        { status: 400 }
      );
    }

    const locker = await prisma.locker.findUnique({
      where: { id },
    });

    if (!locker) {
      return NextResponse.json(
        { error: 'Locker tidak ditemukan' },
        { status: 404 }
      );
    }

    const updatedLocker = await prisma.locker.update({
      where: { id },
      data: {
        name: name || locker.name,
        description: description !== undefined ? description : locker.description,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        message: 'Locker berhasil diperbarui',
        locker: updatedLocker,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Update locker error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat memperbarui locker' },
      { status: 500 }
    );
  }
}

// DELETE - Delete locker
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Locker ID diperlukan' },
        { status: 400 }
      );
    }

    const locker = await prisma.locker.findUnique({
      where: { id },
    });

    if (!locker) {
      return NextResponse.json(
        { error: 'Locker tidak ditemukan' },
        { status: 404 }
      );
    }

    await prisma.locker.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Locker berhasil dihapus' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete locker error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus locker' },
      { status: 500 }
    );
  }
}
