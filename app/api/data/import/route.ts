import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import QRCode from 'qrcode';

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

// Generate unique locker code with simple random approach
async function generateUniqueLockerCode(userId: string, originalCode: string): Promise<string> {
  // First, check if original code is available GLOBALLY
  const existingWithOriginalCode = await prisma.locker.findUnique({
    where: {
      code: originalCode,
    },
  });

  // If code doesn't exist globally, we can use it
  if (!existingWithOriginalCode) {
    return originalCode;
  }

  // Code exists, generate random new code with format A000-Z999
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    // Random letter A-Z
    const randomLetter = letters[Math.floor(Math.random() * letters.length)];
    // Random number 000-999
    const randomNumber = Math.floor(Math.random() * 1000);
    const newCode = `${randomLetter}${String(randomNumber).padStart(3, '0')}`;
    
    // Check if code exists GLOBALLY
    const exists = await prisma.locker.findUnique({
      where: { code: newCode },
    });

    if (!exists) {
      return newCode;
    }
    
    attempts++;
  }

  // If still can't find after max attempts, use timestamp-based code
  const timestamp = Date.now().toString().slice(-4);
  const letter = letters[Math.floor(Math.random() * letters.length)];
  return `${letter}${timestamp}`;
}

// POST - Import data with smart code generation and dependencies
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, data } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID diperlukan' },
        { status: 400 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Data tidak valid. Pastikan file export benar.' },
        { status: 400 }
      );
    }

    const { lockers = [], categories = [], items = [] } = data;

    // Prepare locker codes and QR codes BEFORE transaction to avoid timeout
    const codeMapping: Array<{ original: string; new: string }> = [];
    const lockerPreparations: Array<{
      originalCode: string;
      newCode: string;
      qrCodeUrl: string;
      name: string;
      description: string | null;
    }> = [];

    for (const locker of lockers) {
      const newCode = await generateUniqueLockerCode(userId, locker.code);
      
      if (newCode !== locker.code) {
        codeMapping.push({ original: locker.code, new: newCode });
      }

      // Generate QR code
      const qrCodeUrl = await generateQRCode(newCode);

      lockerPreparations.push({
        originalCode: locker.code,
        newCode,
        qrCodeUrl,
        name: locker.name,
        description: locker.description,
      });
    }

    // Start transaction with increased timeout (15 seconds)
    const result = await prisma.$transaction(async (tx) => {
      // 1. Import Categories first (create mapping)
      const categoryMap = new Map<string, string>();
      let categoriesImported = 0;
      
      for (const category of categories) {
        // Check if category already exists for this user
        let existingCategory = await tx.category.findFirst({
          where: {
            userId,
            name: category.name,
          },
        });

        if (!existingCategory) {
          // Create new category
          existingCategory = await tx.category.create({
            data: {
              name: category.name,
              userId,
            },
          });
          categoriesImported++;
        }

        categoryMap.set(category.name, existingCategory.id);
      }

      // 2. Import Lockers with pre-generated codes and QR codes
      const lockerMap = new Map<string, string>();
      let lockersImported = 0;
      
      for (const prep of lockerPreparations) {
        // Create new locker with pre-generated code and QR
        const newLocker = await tx.locker.create({
          data: {
            code: prep.newCode,
            name: prep.name,
            description: prep.description,
            qrCodeUrl: prep.qrCodeUrl,
            userId,
          },
        });

        lockersImported++;
        
        // Map original code to new locker ID
        lockerMap.set(prep.originalCode, newLocker.id);
      }

      // 3. Import Items
      let itemsCreated = 0;
      let itemsUpdated = 0;
      let itemsSkipped = 0;

      for (const item of items) {
        const categoryId = categoryMap.get(item.categoryName);
        const lockerId = lockerMap.get(item.lockerCode);

        if (!categoryId || !lockerId) {
          console.warn(`Skipping item ${item.name}: category or locker not found`);
          itemsSkipped++;
          continue;
        }

        // Check if item already exists
        const existingItem = await tx.item.findFirst({
          where: {
            userId,
            name: item.name,
            lockerId,
            categoryId,
          },
        });

        if (existingItem) {
          // Update quantity if item exists
          await tx.item.update({
            where: { id: existingItem.id },
            data: {
              quantity: existingItem.quantity + item.quantity,
              description: item.description || existingItem.description,
            },
          });
          itemsUpdated++;
        } else {
          // Create new item
          await tx.item.create({
            data: {
              name: item.name,
              quantity: item.quantity,
              description: item.description,
              categoryId,
              lockerId,
              userId,
            },
          });
          itemsCreated++;
        }
      }

      return {
        categoriesImported,
        lockersImported,
        itemsCreated,
        itemsUpdated,
        itemsSkipped,
        codeMapping,
      };
    }, {
      timeout: 15000, // 15 seconds timeout
    });

    return NextResponse.json(
      {
        message: 'Data berhasil diimport',
        summary: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan saat import data' },
      { status: 500 }
    );
  }
}
