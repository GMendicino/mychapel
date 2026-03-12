import jwt from 'jsonwebtoken';

export async function onRequestPost(context) {
    try {
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
        const { tourId, tourData } = await context.request.json();

        if (!tourId || !tourData) {
            return new Response(JSON.stringify({ message: "Missing tourId or tourData" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        const tour = await db.prepare("SELECT admin_ID FROM tours WHERE tour_ID = ?")
            .bind(tourId)
            .first();

        if (!tour) {
            return new Response(JSON.stringify({ message: "Tour not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Check if the user is a superadmin or owns the tour
        if (!decoded.isSuperAdmin && tour.admin_ID !== decoded.userId) {
            return new Response(JSON.stringify({ message: "Access denied" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        const tourJson = JSON.stringify(tourData);
        const adminId = tour.admin_ID;

        // Insert into Published table
        const db2 = context.env.DATABASE2;
        await db2.prepare(
            "INSERT OR REPLACE INTO Published (tour_ID, admin_ID, tour) VALUES (?, ?, ?)"
        ).bind(parseInt(tourId), adminId, tourJson).run();

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
