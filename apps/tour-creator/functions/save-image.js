export async function onRequestPost(context) {
    try {
        const jwt = require('jsonwebtoken');
        const authHeader = context.request.headers.get('Authorization');
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), { 
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const token = authHeader.substring(7);
        jwt.verify(token, context.env.JWT_SECRET);

        const bucket = context.env.BUCKET; 
        const formData = await context.request.formData();
        const file = formData.get('image');

        if (!file) {
            return new Response(JSON.stringify({ message: "No file uploaded" }), { 
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Name generated in ImageUpload.tsx
        const uniqueFilename = file.name;

        // Upload to R2
        await bucket.put(uniqueFilename, file.stream(), {
            httpMetadata: {
                contentType: file.type || 'image/jpeg'
            }
        });

        // Return URL
        const imageUrl = `/get-image?name=${uniqueFilename}`;

        return new Response(JSON.stringify({ url: imageUrl }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error('Upload error:', err);
        return new Response(JSON.stringify({ message: "Internal server error" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
