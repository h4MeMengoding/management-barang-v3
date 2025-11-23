import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST - Reset all user data (delete all lockers, categories, items)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Delete all user data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete all items first (has foreign keys)
      await tx.item.deleteMany({
        where: { userId },
      });

      // Delete all lockers
      await tx.locker.deleteMany({
        where: { userId },
      });

      // Delete all categories
      await tx.category.deleteMany({
        where: { userId },
      });
    });

    return NextResponse.json(
      {
        message: 'Data berhasil direset',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Reset data error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat reset data' },
      { status: 500 }
    );
  }
}
