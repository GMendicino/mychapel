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

        // Only superadmins can switch admins on tours
        if (!decoded.isSuperAdmin) {
            return new Response(JSON.stringify({ message: "Forbidden: Superadmin only" }), {
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        const db = context.env.DATABASE;
        const { tourId, newAdminId } = await context.request.json();

        if (!tourId || !newAdminId) {
            return new Response(JSON.stringify({ message: "Missing tourId or newAdminId" }), {
                status: 400,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Verify the target admin exists
        const admin = await db.prepare("SELECT admin_ID FROM admins WHERE admin_ID = ?")
            .bind(newAdminId)
            .first();

        if (!admin) {
            return new Response(JSON.stringify({ message: "Target admin not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

        // Reassign the tour
        const result = await db.prepare("UPDATE tours SET admin_ID = ? WHERE tour_ID = ?")
            .bind(newAdminId, tourId)
            .run();

        if (result.meta.changes === 0) {
            return new Response(JSON.stringify({ message: "Tour not found" }), {
                status: 404,
                headers: { "Content-Type": "application/json" }
            });
        }

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
