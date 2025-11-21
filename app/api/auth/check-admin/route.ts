import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Cek apakah ada admin di database
    const adminExists = await prisma.user.findFirst({
      where: { role: 'admin' },
    });

    return NextResponse.json(
      { hasAdmin: !!adminExists },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat mengecek admin' },
      { status: 500 }
    );
  }
}
