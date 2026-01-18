import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || '';
const IMAGEKIT_ACCOUNT_ID = process.env.IMAGEKIT_ACCOUNT_ID || '';

interface UploadBody {
  file: string; // base64 string
  fileName: string;
  folder: string;
  tags?: string[];
}

export async function POST(request: NextRequest) {
  try {
    const body: UploadBody = await request.json();
    const { file, fileName, folder, tags = ['gatepass', 'visitor'] } = body;

    if (!file || !fileName) {
      return NextResponse.json(
        { success: false, error: 'Missing file or fileName' },
        { status: 400 }
      );
    }

    if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_ACCOUNT_ID) {
      return NextResponse.json(
        { success: false, error: 'ImageKit credentials not configured' },
        { status: 500 }
      );
    }

    // Create timestamp and signature for ImageKit authentication
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `${IMAGEKIT_ACCOUNT_ID}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', IMAGEKIT_PRIVATE_KEY)
      .update(signatureString)
      .digest('hex');

    // Prepare FormData for ImageKit API
    const formData = new FormData();
    
    // Convert base64 to blob
    const base64Data = file.split(',')[1] || file;
    const binaryString = Buffer.from(base64Data, 'base64').toString('binary');
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'image/jpeg' });

    formData.append('file', blob);
    formData.append('fileName', fileName);
    formData.append('folder', folder);
    formData.append('useUniqueFileName', 'true');
    formData.append('tags', tags.join(','));
    formData.append('publicKey', IMAGEKIT_PUBLIC_KEY);
    formData.append('timestamp', String(timestamp));
    formData.append('signature', signature);
    formData.append('expire', String(timestamp + 600)); // 10 minutes expiration

    // Upload to ImageKit
    const uploadResponse = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.text();
      console.error('[v0] ImageKit upload failed:', errorData);
      return NextResponse.json(
        { success: false, error: `ImageKit upload failed: ${uploadResponse.statusText}` },
        { status: uploadResponse.status }
      );
    }

    const data = await uploadResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        fileId: data.fileId,
        name: data.name,
        url: data.url,
        filePath: data.filePath,
        size: data.size,
      },
    });
  } catch (error) {
    console.error('[v0] ImageKit upload error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
