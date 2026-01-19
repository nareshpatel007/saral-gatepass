import { NextResponse } from "next/server"

export async function POST(req: Request) {
    // Get base url
    const domainUrl: any = new URL(req.url);

    // Make API request
    const body = await req.json().catch(() => ({}));
    const res = await fetch(`https://saral.sandboxtechnology.in/api/v1/nextjs/gate_entry/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Requested-Domain": domainUrl
        },
        body: JSON.stringify(body)
    })

    // Check response
    const text = await res.text();
    let parsed: any | null = null
    try {
        parsed = JSON.parse(text);
    } catch {
        parsed = null;
    }

    // Return response
    const nextRes = new NextResponse(text, {
        status: res.status,
        headers: { "Content-Type": res.headers.get("Content-Type") || "application/json" },
    });

    // Return response
    return nextRes;
}