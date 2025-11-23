import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering (no static optimization)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Total lockers now
    const totalNow = await prisma.locker.count({ where: { userId } });

    // Compute start of today (server local timezone) and use to get yesterday's total
    const now = new Date();
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);
    // Total lockers as of end of yesterday (created before today)
    const totalYesterday = await prisma.locker.count({
      where: {
        userId,
        createdAt: { lt: startOfToday },
      },
    });

    // Total items now (sum of quantities)
    const aggNowItems = await prisma.item.aggregate({
      _sum: { quantity: true },
      where: { userId },
    });
    const totalItemsNow = aggNowItems._sum.quantity ?? 0;

    // Total items as of end of yesterday (items created before today)
    const aggYesterdayItems = await prisma.item.aggregate({
      _sum: { quantity: true },
      where: {
        userId,
        createdAt: { lt: startOfToday },
      },
    });
    const totalItemsYesterday = aggYesterdayItems._sum.quantity ?? 0;

    // Total categories now
    const totalCategoriesNow = await prisma.category.count({ where: { userId } });

    // Total categories as of end of yesterday
    const totalCategoriesYesterday = await prisma.category.count({
      where: {
        userId,
        createdAt: { lt: startOfToday },
      },
    });

    // Monthly items aggregation for current year
    const currentYear = now.getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);

    // Fetch items for the year and aggregate in JS by month
    const itemsThisYear = await prisma.item.findMany({
      where: {
        userId,
        createdAt: {
          gte: startOfYear,
          lt: startOfNextYear,
        },
      },
      select: { quantity: true, createdAt: true },
    });

    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthlyTotals = new Array(12).fill(0);
    itemsThisYear.forEach((it: any) => {
      const d = new Date(it.createdAt);
      const m = d.getMonth();
      monthlyTotals[m] += it.quantity ?? 0;
    });

    const itemsMonthly = months.map((name, idx) => ({ name, value: monthlyTotals[idx] }));

    // Locker distribution: sum quantity per locker
    const lockerSums = await prisma.item.groupBy({
      by: ['lockerId'],
      _sum: { quantity: true },
      where: { userId },
    });

    const lockerIds = lockerSums.map((ls: any) => ls.lockerId).filter(Boolean);
    const lockers = lockerIds.length > 0 ? await prisma.locker.findMany({
      where: { id: { in: lockerIds } },
      select: { id: true, name: true, code: true },
    }) : [];

    const lockerMap = new Map<string, any>();
    lockers.forEach((l: any) => lockerMap.set(l.id, l));

    const lockerDistribution = lockerSums.map((ls: any) => {
      const locker = lockerMap.get(ls.lockerId) || {};
      const code = locker.code ?? null;
      const name = locker.name ?? null;
      const label = code ? `${code} - ${name ?? code}` : (name ?? ls.lockerId);
      return {
        lockerId: ls.lockerId,
        code,
        name,
        label,
        value: ls._sum?.quantity ?? 0,
      };
    });

    return NextResponse.json({
      totalNow,
      totalYesterday,
      totalItemsNow,
      totalItemsYesterday,
      totalCategoriesNow,
      totalCategoriesYesterday,
      itemsMonthly,
      lockerDistribution,
    }, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch stats',
      details: error?.message || 'Unknown error'
    }, { status: 500 });
  }
}
