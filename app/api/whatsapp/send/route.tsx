import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        // Extract data from the request body
        const { phone, name, purpose, house } = await req.json();

        // Send WhatsApp message via Facebook Graph API
        const response = await fetch(
            `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${process.env.WHATSAPP_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    messaging_product: "whatsapp",
                    to: phone,
                    type: "template",
                    template: {
                        name: "gatepass_alert",
                        language: { code: "en_US" },
                        components: [
                            {
                                type: "body",
                                parameters: [
                                    { type: "text", text: name },
                                    { type: "text", text: purpose },
                                    { type: "text", text: house },
                                ],
                            },
                        ],
                    },
                }),
            }
        )

        // Handle response from WhatsApp API
        const data = await response.json();

        // Return success response
        return NextResponse.json({
            success: true,
            data
        });
    } catch (error) {
        // Return error response
        return NextResponse.json(
            { success: false, message: "Failed to send WhatsApp message" },
            { status: 500 }
        );
    }
}