export async function onRequestGet(context) {
    try {
        const bucket = context.env.BUCKET;
        
        const url = new URL(context.request.url);
        const filename = url.searchParams.get('name');

        if (!filename) {
            return new Response("Missing filename", { status: 400 });
        }

        const object = await bucket.get(filename);

        if (!object) {
            return new Response("Image not found", { status: 404 });
        }

        return new Response(object.body, {
            headers: {
                "Content-Type": object.httpMetadata?.contentType || "image/jpeg",
                "Cache-Control": "public, max-age=31536000"
            }
        });

    } catch (err) {
        return new Response("Error retrieving image", { status: 500 });
    }
}
