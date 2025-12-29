import QRCode from 'qrcode';

/**
 * Generate QR code data URL for a table
 */
export async function generateTableQR(
  locationId: string,
  tableId: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
): Promise<string> {
  const tableUrl = `${baseUrl}/t/${locationId}/${tableId}`;
  
  try {
    const qrDataUrl = await QRCode.toDataURL(tableUrl, {
      width: 300,
      margin: 2,
      color: {
        dark: '#171717',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    });
    return qrDataUrl;
  } catch (error) {
    console.error('Failed to generate QR code:', error);
    throw error;
  }
}

/**
 * Generate printable QR code with table info
 */
export async function generatePrintableQR(
  locationId: string,
  tableId: string,
  tableName: string,
  locationName: string,
  baseUrl?: string
): Promise<{ qrDataUrl: string; tableUrl: string }> {
  const url = baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
  const tableUrl = `${url}/t/${locationId}/${tableId}`;
  const qrDataUrl = await generateTableQR(locationId, tableId, url);
  
  return { qrDataUrl, tableUrl };
}

/**
 * Get table URL without QR image
 */
export function getTableUrl(
  locationId: string,
  tableId: string,
  baseUrl: string = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
): string {
  return `${baseUrl}/t/${locationId}/${tableId}`;
}
