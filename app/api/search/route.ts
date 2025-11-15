import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Search across items, lockers, and categories
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        items: [],
        lockers: [],
        categories: [],
      });
    }

    const searchTerm = query.trim();

    // Search items (with locker info)
    const items = await prisma.item.findMany({
      where: {
        userId,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      include: {
        locker: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Search lockers
    const lockers = await prisma.locker.findMany({
      where: {
        userId,
        OR: [
          {
            name: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            code: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ],
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Search categories
    const categories = await prisma.category.findMany({
      where: {
        userId,
        name: {
          contains: searchTerm,
          mode: 'insensitive',
        },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      items,
      lockers,
      categories,
    });
  } catch (error) {
    console.error('Error searching:', error);
    return NextResponse.json(
      { error: 'Failed to search' },
      { status: 500 }
    );
  }
}
