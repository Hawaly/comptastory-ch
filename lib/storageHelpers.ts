import { supabase } from './supabaseClient';

/**
 * Storage helpers for Supabase Storage
 * Works on both local and Vercel (serverless)
 */

const BUCKET_NAME = 'documents';

/**
 * Check if we're running on Vercel (serverless) or any read-only environment
 * On Vercel, we MUST use Supabase Storage since the file system is read-only
 */
function isServerless(): boolean {
  // Multiple ways to detect Vercel environment
  const isVercel = 
    process.env.VERCEL === '1' || 
    process.env.VERCEL_ENV !== undefined ||
    process.env.VERCEL_URL !== undefined ||
    process.env.NEXT_PUBLIC_VERCEL_URL !== undefined;
  
  // Also check if we're in a read-only environment (Lambda, etc.)
  const isReadOnlyFs = process.cwd().startsWith('/var/task');
  
  console.log('[Storage] Environment check:', { 
    isVercel, 
    isReadOnlyFs, 
    cwd: process.cwd(),
    VERCEL: process.env.VERCEL,
    VERCEL_ENV: process.env.VERCEL_ENV 
  });
  
  return isVercel || isReadOnlyFs;
}

/**
 * Upload a file to Supabase Storage (private bucket)
 * Returns the storage path (not a URL) - use getDownloadUrl() to get a signed URL
 */
async function uploadToSupabase(
  filePath: string,
  fileBuffer: Buffer | Uint8Array,
  contentType: string = 'application/pdf'
): Promise<string> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, fileBuffer, {
      contentType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    console.error('Supabase Storage upload error:', error);
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Return the storage path (for private bucket, we'll generate signed URLs when needed)
  return filePath;
}

/**
 * Get a signed URL for a private file
 */
async function getSignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(filePath, expiresIn);

  if (error) {
    throw new Error(`Failed to get signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Delete a file from Supabase Storage
 */
async function deleteFromSupabase(filePath: string): Promise<void> {
  // Remove leading slash if present
  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([cleanPath]);

  if (error) {
    console.warn(`Failed to delete file from storage: ${error.message}`);
  }
}

/**
 * Save a contract PDF
 */
export async function saveContract(
  contractNumber: string,
  pdfBuffer: Buffer | Uint8Array
): Promise<string> {
  const year = new Date().getFullYear().toString();
  const fileName = `${contractNumber}.pdf`;
  const filePath = `contracts/${year}/${fileName}`;

  if (isServerless()) {
    // On Vercel: use Supabase Storage
    return await uploadToSupabase(filePath, pdfBuffer);
  } else {
    // Local development: use local file system
    const { saveContractLocally } = await import('./localStorageHelpers');
    return saveContractLocally(contractNumber, pdfBuffer);
  }
}

/**
 * Save an invoice PDF
 */
export async function saveInvoice(
  invoiceNumber: string,
  pdfBuffer: Buffer | Uint8Array
): Promise<string> {
  const year = new Date().getFullYear().toString();
  const fileName = `${invoiceNumber}.pdf`;
  const filePath = `invoices/${year}/${fileName}`;

  if (isServerless()) {
    // On Vercel: use Supabase Storage
    return await uploadToSupabase(filePath, pdfBuffer);
  } else {
    // Local development: use local file system
    const { saveInvoiceLocally } = await import('./localStorageHelpers');
    return saveInvoiceLocally(invoiceNumber, pdfBuffer);
  }
}

/**
 * Save a QR-bill PDF
 */
export async function saveQrBill(
  invoiceNumber: string,
  pdfBuffer: Buffer | Uint8Array,
  oldQrBillPath?: string | null
): Promise<string> {
  const year = new Date().getFullYear().toString();
  const fileName = `QR-${invoiceNumber}.pdf`;
  const filePath = `qr-bills/${year}/${fileName}`;

  if (isServerless()) {
    // Delete old file if exists
    if (oldQrBillPath) {
      await deleteFromSupabase(oldQrBillPath);
    }
    // On Vercel: use Supabase Storage
    return await uploadToSupabase(filePath, pdfBuffer);
  } else {
    // Local development: use local file system
    const { saveQrBillLocally } = await import('./localStorageHelpers');
    return saveQrBillLocally(invoiceNumber, pdfBuffer, oldQrBillPath);
  }
}

/**
 * Save a receipt/expense attachment
 */
export async function saveReceipt(
  fileBuffer: Buffer,
  originalName: string
): Promise<string> {
  const year = new Date().getFullYear().toString();
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(7);
  const ext = originalName.split('.').pop() || 'pdf';
  const fileName = `${timestamp}-${randomString}.${ext}`;
  const filePath = `receipts/${year}/${fileName}`;

  // Determine content type
  const contentType = ext.toLowerCase() === 'pdf' 
    ? 'application/pdf' 
    : ext.match(/^(jpg|jpeg|png|gif|webp)$/i) 
      ? `image/${ext.toLowerCase()}` 
      : 'application/octet-stream';

  if (isServerless()) {
    // On Vercel: use Supabase Storage
    return await uploadToSupabase(filePath, fileBuffer, contentType);
  } else {
    // Local development: use local file system
    const { saveReceiptLocally } = await import('./localStorageHelpers');
    return saveReceiptLocally(fileBuffer, originalName);
  }
}

/**
 * Delete a QR-bill
 */
export async function deleteQrBill(qrBillPath: string | null | undefined): Promise<void> {
  if (!qrBillPath) return;

  if (isServerless()) {
    await deleteFromSupabase(qrBillPath);
  } else {
    const { deleteQrBillLocally } = await import('./localStorageHelpers');
    deleteQrBillLocally(qrBillPath);
  }
}

/**
 * Get download URL for a file
 * Returns the path as-is for local files, or a signed URL for Supabase
 */
export async function getDownloadUrl(filePath: string): Promise<string> {
  if (!filePath) {
    throw new Error('File path is required');
  }

  // If it's already a full URL (Supabase public URL), return as-is
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
    return filePath;
  }

  // If it's a local path (/uploads/...), check environment
  if (filePath.startsWith('/uploads/')) {
    if (isServerless()) {
      // On Vercel, this shouldn't happen - files should be in Supabase
      // Try to get from Supabase anyway
      const supabasePath = filePath.replace('/uploads/', '');
      return await getSignedUrl(supabasePath);
    } else {
      // Local: return as-is (served from public folder)
      return filePath;
    }
  }

  // Assume it's a Supabase path
  if (isServerless()) {
    return await getSignedUrl(filePath);
  }
  
  return filePath;
}
