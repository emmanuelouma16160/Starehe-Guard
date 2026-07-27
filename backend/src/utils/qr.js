import QRCode from 'qrcode';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

export const generateQRCodeData = (admissionNumber) => {
  const timestamp = Date.now();
  const secret = process.env.JWT_SECRET || 'school_qr_secret';
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(`${admissionNumber}:${timestamp}`)
    .digest('hex')
    .substring(0, 16);

  return `STU-${admissionNumber}-${hash}`;
};

export const generateQRCodeImage = async (qrData) => {
  try {
    const qrImageUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#0F1A1A',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H',
    });
    return qrImageUrl;
  } catch (error) {
    throw new Error('Failed to generate QR code image');
  }
};

export const verifyQRCode = (qrData) => {
  try {
    const parts = qrData.split('-');
    if (parts.length !== 3 || parts[0] !== 'STU') {
      return { valid: false, admissionNumber: null };
    }
    
    const admissionNumber = parts[1];
    const hash = parts[2];
    
    const secret = process.env.JWT_SECRET || 'school_qr_secret';
    const expectedHash = crypto
      .createHmac('sha256', secret)
      .update(`${admissionNumber}`)
      .digest('hex')
      .substring(0, 16);
    
    if (hash !== expectedHash) {
      return { valid: false, admissionNumber: null };
    }
    
    return { valid: true, admissionNumber };
  } catch (error) {
    return { valid: false, admissionNumber: null };
  }
};