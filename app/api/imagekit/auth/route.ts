import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || '';
const IMAGEKIT_ACCOUNT_ID = process.env.IMAGEKIT_ACCOUNT_ID || '';

/**
 * Generate authentication token for ImageKit client-side uploads
 * This endpoint creates a secure, time-limited token without exposing the private key to the client
 */
export async function GET(request: NextRequest) {
  try {
    if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_ACCOUNT_ID) {
      return NextResponse.json(
        { success: false, error: 'ImageKit credentials not configured' },
        { status: 500 }
      );
    }

    // Generate timestamp and signature for ImageKit
    const timestamp = Math.floor(Date.now() / 1000);
    const signatureString = `${IMAGEKIT_ACCOUNT_ID}${timestamp}`;
    const signature = crypto
      .createHmac('sha256', IMAGEKIT_PRIVATE_KEY)
      .update(signatureString)
      .digest('hex');

    return NextResponse.json({
      success: true,
      token: signature,
      expire: timestamp + 600, // 10 minutes
      publicKey: IMAGEKIT_PUBLIC_KEY,
      timestamp,
    });
  } catch (error) {
    console.error('[v0] ImageKit auth error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Auth failed' },
      { status: 500 }
    );
  }
}
