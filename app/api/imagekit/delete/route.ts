import { NextRequest, NextResponse } from 'next/server';

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || '';

interface DeleteBody {
  fileId: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: DeleteBody = await request.json();
    const { fileId } = body;

    if (!fileId) {
      return NextResponse.json(
        { success: false, error: 'Missing fileId' },
        { status: 400 }
      );
    }

    if (!IMAGEKIT_PRIVATE_KEY) {
      return NextResponse.json(
        { success: false, error: 'ImageKit credentials not configured' },
        { status: 500 }
      );
    }

    // Delete from ImageKit using Basic Auth (private key)
    const auth = Buffer.from(`${IMAGEKIT_PRIVATE_KEY}:`).toString('base64');

    const deleteResponse = await fetch(`https://api.imagekit.io/v1/files/${fileId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${auth}`,
      },
    });

    if (!deleteResponse.ok && deleteResponse.status !== 204) {
      const errorData = await deleteResponse.text();
      console.error('[v0] ImageKit delete failed:', errorData);
      return NextResponse.json(
        { success: false, error: `ImageKit delete failed: ${deleteResponse.statusText}` },
        { status: deleteResponse.status }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully',
    });
  } catch (error) {
    console.error('[v0] ImageKit delete error:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Delete failed' },
      { status: 500 }
    );
  }
}
