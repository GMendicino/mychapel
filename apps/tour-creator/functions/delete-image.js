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
        const decoded = jwt.verify(token, context.env.JWT_SECRET);

        const db = context.env.DATABASE;
        const bucket = context.env.BUCKET;
        const { imageUrl, tourId } = await context.request.json();

        if (!imageUrl || typeof imageUrl !== 'string') {
            return new Response(JSON.stringify({ message: "Missing image URL" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Only superadmins or the admin who owns the tour can delete
        let tour;
        if (decoded.isSuperAdmin) {
            tour = await db.prepare("SELECT tour FROM tours WHERE tour_ID = ?")
                .bind(tourId)
                .first();
        } else {
            tour = await db.prepare("SELECT tour FROM tours WHERE tour_ID = ? AND admin_ID = ?")
                .bind(tourId, decoded.userId)
                .first();
        }

        if (!tour) {
            return new Response(JSON.stringify({ message: "Tour not found or access denied" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        const match = imageUrl.match(/name=([^&]+)/);
        if (!match) {
            return new Response(JSON.stringify({ message: "Invalid image URL" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const filename = match[1];
        await bucket.delete(filename);

        return new Response(JSON.stringify({ success: true }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ message: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
