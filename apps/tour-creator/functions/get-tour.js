export async function onRequestGet(context) {
    try {
        // User authetication
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
        


        // Return all tours if superadmin, otherwise only tours assigned to this admin
        const query = decoded.isSuperAdmin 
            ? "SELECT * FROM tours"
            : "SELECT * FROM tours WHERE admin_ID = ?";
        
        const stmt = decoded.isSuperAdmin 
            ? db.prepare(query)
            : db.prepare(query).bind(decoded.userId);
            
        const { results } = await stmt.all();

        // Return tour JSON
        const tours = results.map(row => ({
            tourId: row.tour_ID,
            adminId: row.admin_ID,
            tourData: JSON.parse(row.tour) 
        }));

        return new Response(JSON.stringify({ tours }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ message: "Internal server error" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
