import jwt from 'jsonwebtoken';

export async function onRequestGet(context) {
    try {
        const authHeader = context.request.headers.get('Authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return new Response(JSON.stringify({ message: "Unauthorized" }), {
                status: 401,
                headers: { "Content-Type": "application/json" }
            });
        }

        const token = authHeader.substring(7);
        jwt.verify(token, context.env.JWT_SECRET);

        const db2 = context.env.DATABASE2;
        const url = new URL(context.request.url);
        const tourId = url.searchParams.get("tourId");

        if (!tourId) {
            return new Response(JSON.stringify({ message: "Missing tourId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const row = await db2.prepare("SELECT tour_ID FROM Published WHERE tour_ID = ?")
            .bind(parseInt(tourId))
            .first();

        return new Response(JSON.stringify({ published: !!row }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ message: "Internal server error" }), {
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
