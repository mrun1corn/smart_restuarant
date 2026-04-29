import QRCode from 'qrcode';

export const generateTableQRCode = async (tableId) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  const url = `${frontendUrl}/menu/table/${tableId}`;
  
  try {
    // For MVP, we'll return a data URL (base64)
    // In production, this would be uploaded to Cloudinary
    const qrDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    return qrDataUrl;
  } catch (error) {
    console.error('QR Generation error:', error);
    throw new Error('Failed to generate QR code');
  }
};
