import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// DELETE - Delete user account and all related data
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    // Delete user and all related data in a transaction
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

      // Finally, delete the user account
      await tx.user.delete({
        where: { id: userId },
      });
    });

    return NextResponse.json(
      {
        message: 'Akun berhasil dihapus',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Delete account error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat menghapus akun' },
      { status: 500 }
    );
  }
}
