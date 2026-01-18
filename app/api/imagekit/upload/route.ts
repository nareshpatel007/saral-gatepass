import { NextResponse } from 'next/server';
import ImageKit from "imagekit";

// Define Imagekit credentials
const IMAGEKIT_PRIVATE_KEY = "private_Rkbc8Y5gpAClpVIseCe2ixKlbxE=";
const IMAGEKIT_PUBLIC_KEY = "public_WQXlFO8L3C3B6LXZKgPTMJVNjsw=";
const IMAGEKIT_ACCOUNT_ID = "rxvy7dxn5";

// Initialize ImageKit instance
const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: `https://ik.imagekit.io/${IMAGEKIT_ACCOUNT_ID}`,
})

export async function POST(req: Request) {
    // Parse the incoming form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    // Validate the file
    if (!file) {
        return NextResponse.json({ error: "No file" }, { status: 400 })
    }

    // Upload the file to ImageKit
    const buffer = Buffer.from(await file.arrayBuffer());

    // Perform the upload
    const result = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: "/saral_revanta/selfies",
    })

    // Return the uploaded file URL
    return NextResponse.json({ url: result.url });
}