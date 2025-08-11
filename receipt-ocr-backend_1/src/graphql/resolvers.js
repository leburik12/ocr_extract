import { createWriteStream, existsSync, mkdirSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GraphQLUpload } from 'graphql-upload';
import { ocrQueue } from '../queues/ocrQueue.js';  // Your BullMQ queue instance

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure uploads directory exists at module load time
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

export const resolvers = {
  Upload: GraphQLUpload,

  Query: {
    receipts: async (parent, args, context) => {
      const { storeName, startDate, endDate } = args;

      const filters = {};

      if (storeName) {
        // Case-insensitive partial match
        filters.storeName = { contains: storeName, mode: 'insensitive' };
      }

      if (startDate || endDate) {
        filters.purchaseDate = {};
        if (startDate) filters.purchaseDate.gte = new Date(startDate);
        if (endDate) filters.purchaseDate.lte = new Date(endDate);
      }

      return context.prisma.receipt.findMany({
        where: filters,
        include: { items: true },
        orderBy: { purchaseDate: 'desc' },
      });
    },
  },

  Mutation: {
    uploadReceipt: async (_, { file }, { prisma }) => {
      if (!file) throw new Error('No file provided.');

      const { createReadStream, filename, mimetype } = await file;

      // Validate file type
      const allowedTypes = ['image/png', 'image/jpeg', 'image/webp'];
      if (!allowedTypes.includes(mimetype)) {
        throw new Error(`Invalid file type: ${mimetype}. Allowed types: ${allowedTypes.join(', ')}`);
      }

      // Save file to disk
      const filepath = path.join(UPLOAD_DIR, filename);
      await new Promise((resolve, reject) => {
        createReadStream()
          .on('error', reject)
          .pipe(createWriteStream(filepath))
          .on('finish', resolve)
          .on('error', reject);
      });

      // Instead of running OCR here, enqueue a job for background processing
      await ocrQueue.add('processReceipt', { filePath: filepath, filename });

      // Return a placeholder receipt so frontend can show progress
      return {
        id: 'pending',
        storeName: 'Processing...',
        purchaseDate: new Date().toISOString(),
        totalAmount: 0,
        items: [],
        imageUrl: `/uploads/${filename}`,
        createdAt: new Date().toISOString(),
      };
    },

    uploadFile: async (_, { file }) => {
      const { createReadStream, filename, mimetype, encoding } = await file;

      const filepath = path.join(UPLOAD_DIR, filename);
      await new Promise((resolve, reject) => {
        createReadStream()
          .on('error', reject)
          .pipe(createWriteStream(filepath))
          .on('finish', resolve)
          .on('error', reject);
      });

      return { filename, mimetype, encoding };
    },
  },
};
