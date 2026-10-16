import { brand } from '../../../src/shared/config/brand.js';

// GNR-15: the original handler is an open relay (no auth, any recipient, unescaped HTML).
// It stays disabled unless MAIL_ENABLED=true; the hardened rebuild is tracked in the mail sprint.
export async function onRequestPost(context) {
    if (context.env?.MAIL_ENABLED !== 'true') {
        return new Response(JSON.stringify({ error: 'Email sending is disabled.' }), {
            status: 501,
            headers: { 'Content-Type': 'application/json' },
        });
    }
    try {
        // 1. Extract the environment variables and the request payload
        const { request, env } = context;
        const body = await request.json();
        const { to, brandData, pdfAttachment } = body;

        // 2. Clean the Base64 PDF string
        // Resend needs pure base64 data, so we split off the "data:application/pdf;base64," prefix
        const base64Data = pdfAttachment.split('base64,')[1];

        if (!base64Data) {
            throw new Error("Invalid PDF attachment format.");
        }

        // 3. Construct the HTML Email Summary
        const htmlContent = `
            <div style="font-family: monospace; background-color: #050505; color: #eeeeee; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; border: 1px solid ${brandData.primary}; background-color: #0a0a0a; padding: 30px;">
                    
                    <h2 style="color: ${brandData.primary}; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 0;">
                        > BRAND_MATRIX_COMPILED: ${brandData.name}
                    </h2>
                    
                    <p style="color: #ccc; font-size: 14px;">
                        The automated compilation of your brand identity system is complete. The high-resolution PDF document is attached to this transmission.
                    </p>

                    <div style="margin: 30px 0; padding: 15px; background-color: #111; border-left: 4px solid ${brandData.secondary};">
                        <h3 style="color: ${brandData.secondary}; font-size: 14px; margin-top: 0;">SYS_SUMMARY:</h3>
                        <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 13px; color: #aaa;">
                            <li style="margin-bottom: 8px;"><strong style="color: #fff;">Slogan:</strong> ${brandData.slogan}</li>
                            <li style="margin-bottom: 8px;"><strong style="color: #fff;">Primary Font:</strong> ${brandData.typography}</li>
                            <li style="margin-bottom: 8px;"><strong style="color: #fff;">Primary Hex:</strong> ${brandData.primary}</li>
                            <li><strong style="color: #fff;">Voice:</strong> ${brandData.voiceKeywords}</li>
                        </ul>
                    </div>

                    <p style="color: #666; font-size: 11px; margin-bottom: 0;">
                        Generated securely via ${brand.name} Infrastructure.
                    </p>
                </div>
            </div>
        `;

        // 4. Send the payload to Resend's API
        const resendRequest = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${env.RESEND_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: `${brand.name} <onboarding@resend.dev>`, // Resend's default testing email
                to: [to],
                subject: `SYS_FILE: ${brandData.name} Brand Book`,
                html: htmlContent,
                attachments: [
                    {
                        filename: `${brandData.name.replace(/\s+/g, '_')}_BrandBook.pdf`,
                        content: base64Data
                    }
                ]
            })
        });

        const resendResponse = await resendRequest.json();

        if (!resendRequest.ok) {
            throw new Error(JSON.stringify(resendResponse));
        }

        // 5. Return success to React
        return new Response(JSON.stringify({ success: true, id: resendResponse.id }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error("Transmission Error:", error.message);
        return new Response(JSON.stringify({ success: false, error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}