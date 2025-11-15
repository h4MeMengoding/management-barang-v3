import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Generate unique locker code
function generateLockerCode(): string {
  const suffix = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const numbers = Math.floor(Math.random() * 1000).toString().padStart(3, '0'); // 000-999
  return `${suffix}${numbers}`;
}

export async function GET() {
  try {
    let code: string;
    let isUnique = false;

    // Generate unique code
    while (!isUnique) {
      code = generateLockerCode();
      const existing = await prisma.locker.findUnique({
        where: { code },
      });
      if (!existing) {
        return NextResponse.json({ code }, { status: 200 });
      }
    }

    return NextResponse.json(
      { error: 'Gagal generate kode unik' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Generate code error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat generate kode' },
      { status: 500 }
    );
  }
}
