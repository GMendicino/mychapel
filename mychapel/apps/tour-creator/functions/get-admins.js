export async function onRequestGet(context) {
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

        // Only superadmins can list all admins
        if (!decoded.isSuperAdmin) {
            return new Response(JSON.stringify({ message: "Forbidden" }), { 
                status: 403,
                headers: { "Content-Type": "application/json" }
            });
        }

        const db = context.env.DATABASE;
        const { results } = await db.prepare("SELECT admin_ID, username FROM admins").all();

        return new Response(JSON.stringify({ admins: results }), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        return new Response(JSON.stringify({ message: "Internal server error" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
