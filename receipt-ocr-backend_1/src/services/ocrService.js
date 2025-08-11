import Tesseract from 'tesseract.js';
import fs from 'fs';
import path from 'path';


export async function extractTextFromImage(image) {
  try {
    console.log('Starting OCR process...');
    const { data: { text } } = await Tesseract.recognize(
      image,
      'eng', // the english language model
      {
        //  logging to see Tesseract's progress
        logger: m => console.log(m.status),
      }
    );
    console.log('OCR process completed successfully.');
    return text;
  } catch (error) {
    console.error('Error during OCR process:', error);
    throw new Error('Failed to extract text from image.');
  }
}
