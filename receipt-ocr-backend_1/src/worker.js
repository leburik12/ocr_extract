import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import fs from 'fs';
import path from 'path';
import { extractTextFromImage } from './services/ocrService.js';
import { parseReceiptData } from './utils/receiptParser.js';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const connection = new IORedis({
     maxRetriesPerRequest: null,
    }
);

const worker = new Worker('ocrQueue', async job => {
  const { filePath } = job.data;

  console.log('Processing OCR job for:', filePath);

  try {
    const imageBuffer = fs.readFileSync(filePath);
    const rawText = await extractTextFromImage(imageBuffer);
    const parsedData = parseReceiptData(rawText);

    // Save to DB
    const receipt = await prisma.receipt.create({
      data: {
        storeName: parsedData.storeName || 'Unknown',
        purchaseDate: parsedData.purchaseDate
          ? new Date(parsedData.purchaseDate)
          : new Date(),
        totalAmount: parsedData.totalAmount || 0.0,
        imageUrl: `/uploads/${path.basename(filePath)}`,
        items: {
          create: parsedData.items.map(item => ({
            name: item.name,
            quantity: item.quantity,
          })),
        },
      },
      include: { items: true },
    });

    console.log('OCR job completed and saved receipt:', receipt.id);
  } catch (error) {
    console.error('Error processing OCR job:', error);
  }
}, { connection });

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err);
});