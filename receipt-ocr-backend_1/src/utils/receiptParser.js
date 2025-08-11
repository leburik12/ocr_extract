/**
 * @description Parses raw text from a receipt image to extract structured data.
 * @param {string} text - The raw text output from the OCR service.
 * @returns {object} An object containing the parsed receipt data.
 */
export function parseReceiptData(text) {
  const lines = text.split('\n').filter(line => line.trim() !== '');

  const parsedData = {
    storeName: null,
    purchaseDate: null,
    totalAmount: null,
    items: [],
  };

  // A list of common store names to search for. This can be expanded.
  const storeNames = ['Walmart', 'Target', 'Safeway', 'Kroger', 'Starbucks', 'McDonalds'];

  // ---  Find Total Amount ---
  const totalRegex = /(TOTAL|AMOUNT|BALANCE|SUBTOTAL)\s*[\$£€]?\s*(\d+\.\d{2})/i;
  for (const line of lines) {
    const match = line.match(totalRegex);
    if (match) {
      parsedData.totalAmount = parseFloat(match[2]);
      break;
    }
  }

  // --- Find Date ---
  // more comprehensive regex for common date formats
  const dateRegex = /(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/;
  for (const line of lines) {
    const match = line.match(dateRegex);
    if (match) {
      // Normalize date format for consistency
      parsedData.purchaseDate = new Date(match[1]).toISOString();
      break;
    }}

  // --- Find Store Name ---
  // Prioritize searching for known store names first, otherwise default to the first non-empty line
  for (const line of lines) {
    const foundStore = storeNames.find(store => line.toLowerCase().includes(store.toLowerCase()));
    if (foundStore) {
      parsedData.storeName = foundStore;
      break;
    }}
  if (!parsedData.storeName && lines.length > 0) {
    parsedData.storeName = lines[0].trim();}

  // --- Find Items ---
  // Look for lines that contain a price-like number but are not the total.
  const itemPriceRegex = /(\b\d+\s+)?([A-Z].*?)\s+(\d+\.\d{2})/i;
  for (const line of lines) {
    // Skip lines that look like totals
    if (line.match(totalRegex)) continue;
    const match = line.match(itemPriceRegex);
    if (match) {
      const quantity = match[1] ? parseInt(match[1].trim()) : 1;
      const name = match[2].trim();
      parsedData.items.push({ name, quantity });}}

  return parsedData;
}