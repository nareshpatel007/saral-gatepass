// Upload image to ImageKit
export async function uploadBlobToImageKit(blob: Blob): Promise<string> {
    // Create a File from the Blob
    const file = new File([blob], `selfie_${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
    });

    // Prepare form data
    const formData = new FormData();
    formData.append("file", file);

    // Send the file to the upload API route
    const res = await fetch("/api/imagekit/upload", {
        method: "POST",
        body: formData,
    });

    // Handle response
    if (!res.ok) {
        throw new Error("Image upload failed")
    }

    // Extract the URL from the response
    const data = await res.json();

    // Return the URL
    return data.url || "";
}