import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Export user data with smart dependencies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeLockers = searchParams.get('lockers') === 'true';
    const includeCategories = searchParams.get('categories') === 'true';
    const includeItems = searchParams.get('items') === 'true';

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    let lockers: any[] = [];
    let categories: any[] = [];
    let items: any[] = [];

    // Smart Dependencies: If items are selected, auto-include related lockers and categories
    if (includeItems) {
      // Fetch items with their relations
      const fetchedItems = await prisma.item.findMany({
        where: { userId },
        include: {
          category: {
            select: {
              name: true,
            },
          },
          locker: {
            select: {
              code: true,
              name: true,
              description: true,
            },
          },
        },
      });

      // Transform items
      items = fetchedItems.map(item => ({
        name: item.name,
        quantity: item.quantity,
        description: item.description,
        categoryName: item.category.name,
        lockerCode: item.locker.code,
      }));

      // Auto-include unique lockers and categories used by items
      const uniqueLockerCodes = new Set<string>();
      const uniqueCategoryNames = new Set<string>();

      fetchedItems.forEach(item => {
        uniqueLockerCodes.add(item.locker.code);
        uniqueCategoryNames.add(item.category.name);
      });

      // Fetch full locker and category details
      lockers = await prisma.locker.findMany({
        where: {
          userId,
          code: { in: Array.from(uniqueLockerCodes) },
        },
        select: {
          code: true,
          name: true,
          description: true,
          qrCodeUrl: true,
        },
      });

      categories = await prisma.category.findMany({
        where: {
          userId,
          name: { in: Array.from(uniqueCategoryNames) },
        },
        select: {
          name: true,
        },
      });
    } else {
      // Export only selected data types without items
      if (includeLockers) {
        lockers = await prisma.locker.findMany({
          where: { userId },
          select: {
            code: true,
            name: true,
            description: true,
            qrCodeUrl: true,
          },
        });
      }

      if (includeCategories) {
        categories = await prisma.category.findMany({
          where: { userId },
          select: {
            name: true,
          },
        });
      }
    }

    const exportData = {
      version: '2.0',
      exportDate: new Date().toISOString(),
      exportedBy: userId,
      data: {
        lockers,
        categories,
        items,
      },
    };

    return NextResponse.json(exportData, { status: 200 });
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat export data' },
      { status: 500 }
    );
  }
}
