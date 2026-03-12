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

        const { tourId, adminId, tourData } = await context.request.json();

        const tourJson = JSON.stringify(tourData);

        if (tourId && tourId !== "new") {
            // Update existing, only allows if user is superadmin or owns the tour
            let result;
            if (decoded.isSuperAdmin) {
                result = await db.prepare("UPDATE tours SET tour = ? WHERE tour_ID = ?")
                    .bind(tourJson, tourId)
                    .run();
            } else {
                result = await db.prepare("UPDATE tours SET tour = ? WHERE tour_ID = ? AND admin_ID = ?")
                    .bind(tourJson, tourId, decoded.userId)
                    .run();
            }

            if (result.meta.changes === 0) {
                return new Response(JSON.stringify({ message: "Tour not found or access denied" }), {
                    status: 403,
                    headers: { "Content-Type": "application/json" }
                });
            }
        } else {
            const finalAdminId = decoded.isSuperAdmin ? adminId : decoded.userId;
            
            const result = await db.prepare("INSERT INTO tours (admin_ID, tour) VALUES (?, ?)")
                .bind(finalAdminId, tourJson)
                .run();
            
            return new Response(JSON.stringify({ 
                success: true, 
                tourId: result.meta.last_row_id 
            }), {
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
