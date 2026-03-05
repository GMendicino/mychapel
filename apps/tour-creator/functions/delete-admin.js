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

    // Only superadmins can delete users
    if (!decoded.isSuperAdmin) {
      return new Response(JSON.stringify({ message: "Forbidden: Superadmin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const db = context.env.DATABASE;
    const { adminId } = await context.request.json();

    if (!adminId) {
      return new Response(JSON.stringify({ message: "Missing adminId" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Check if the admin being deleted is a superadmin
    const target = await db.prepare("SELECT is_superadmin FROM admins WHERE admin_ID = ?")
        .bind(adminId)
        .first();

    if (!target) {
      return new Response(JSON.stringify({ message: "Admin not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    if (target.is_superadmin) {
      return new Response(JSON.stringify({ message: "Cannot delete a superadmin (Contact operator)" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { results: existing } = await db.prepare("SELECT * FROM tours WHERE admin_ID = ?")
        .bind(adminId)
        .all();

    if (existing.length !== 0) {
        return new Response(JSON.stringify({ message: "Admin has tours assigned." }), {
                status: 409,
                headers: { "Content-Type": "application/json" }
            });
    } else {
        await db.prepare("DELETE FROM admins WHERE admin_ID = ?")
            .bind(adminId)
            .run();
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