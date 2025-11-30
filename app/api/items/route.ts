import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Get items
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');
    const lockerId = searchParams.get('lockerId');
    const categoryId = searchParams.get('categoryId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get specific item by ID
    if (id) {
      const item = await prisma.item.findFirst({
        where: {
          id,
          userId,
        },
        include: {
          category: true,
          locker: true,
        },
      });

      if (!item) {
        return NextResponse.json(
          { error: 'Item not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ item });
    }

    // Build where clause
    const where: any = { userId };
    if (lockerId) where.lockerId = lockerId;
    if (categoryId) where.categoryId = categoryId;

    // Get all items for user with filters
    const items = await prisma.item.findMany({
      where,
      include: {
        category: true,
        locker: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items' },
      { status: 500 }
    );
  }
}

// POST - Create new item
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, categoryId, quantity, lockerId, description, userId } = body;

    if (!name || !categoryId || !lockerId || !userId) {
      return NextResponse.json(
        { error: 'Name, categoryId, lockerId, and userId are required' },
        { status: 400 }
      );
    }

    if (quantity !== undefined && (quantity < 0 || !Number.isInteger(quantity))) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative integer' },
        { status: 400 }
      );
    }

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }

    // Verify locker belongs to user
    const locker = await prisma.locker.findFirst({
      where: { id: lockerId, userId },
    });

    if (!locker) {
      return NextResponse.json(
        { error: 'Locker not found' },
        { status: 404 }
      );
    }

    const item = await prisma.item.create({
      data: {
        name,
        categoryId,
        quantity: quantity || 0,
        lockerId,
        description: description || null,
        userId,
      },
      include: {
        category: true,
        locker: true,
      },
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error('Error creating item:', error);
    return NextResponse.json(
      { error: 'Failed to create item' },
      { status: 500 }
    );
  }
}

// PUT - Update item
export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const bulkMove = searchParams.get('bulkMove');
    const body = await request.json();

    // Bulk move items from one or more lockers to another
    if (bulkMove === 'true') {
      const { fromLockerIds, toLockerId, userId } = body;

      if (!fromLockerIds || !Array.isArray(fromLockerIds) || !toLockerId || !userId) {
        return NextResponse.json(
          { error: 'fromLockerIds (array), toLockerId, and userId are required for bulk move' },
          { status: 400 }
        );
      }

      // Verify target locker exists and belongs to user
      const targetLocker = await prisma.locker.findFirst({
        where: { id: toLockerId, userId },
      });

      if (!targetLocker) {
        return NextResponse.json(
          { error: 'Target locker not found' },
          { status: 404 }
        );
      }

      // Move all items from source lockers to target locker
      const result = await prisma.item.updateMany({
        where: {
          lockerId: { in: fromLockerIds },
          userId,
        },
        data: {
          lockerId: toLockerId,
        },
      });

      return NextResponse.json(
        {
          message: `${result.count} items moved successfully`,
          count: result.count,
        },
        { status: 200 }
      );
    }

    // Single item update
    const { name, categoryId, quantity, lockerId, description, userId } = body;

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Item ID and userId are required' },
        { status: 400 }
      );
    }

    if (quantity !== undefined && (quantity < 0 || !Number.isInteger(quantity))) {
      return NextResponse.json(
        { error: 'Quantity must be a non-negative integer' },
        { status: 400 }
      );
    }

    // Verify item belongs to user
    const existingItem = await prisma.item.findFirst({
      where: { id, userId },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    // Verify category belongs to user if changing
    if (categoryId && categoryId !== existingItem.categoryId) {
      const category = await prisma.category.findFirst({
        where: { id: categoryId, userId },
      });

      if (!category) {
        return NextResponse.json(
          { error: 'Category not found' },
          { status: 404 }
        );
      }
    }

    // Verify locker belongs to user if changing
    if (lockerId && lockerId !== existingItem.lockerId) {
      const locker = await prisma.locker.findFirst({
        where: { id: lockerId, userId },
      });

      if (!locker) {
        return NextResponse.json(
          { error: 'Locker not found' },
          { status: 404 }
        );
      }
    }

    const item = await prisma.item.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(categoryId && { categoryId }),
        ...(quantity !== undefined && { quantity }),
        ...(lockerId && { lockerId }),
        description: description !== undefined ? description : existingItem.description,
      },
      include: {
        category: true,
        locker: true,
      },
    });

    return NextResponse.json({ item });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { error: 'Failed to update item' },
      { status: 500 }
    );
  }
}

// DELETE - Delete item
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    const userId = searchParams.get('userId');

    if (!id || !userId) {
      return NextResponse.json(
        { error: 'Item ID and userId are required' },
        { status: 400 }
      );
    }

    // Verify item belongs to user
    const item = await prisma.item.findFirst({
      where: { id, userId },
    });

    if (!item) {
      return NextResponse.json(
        { error: 'Item not found' },
        { status: 404 }
      );
    }

    await prisma.item.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    );
  }
}
