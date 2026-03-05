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

    // Only superadmins can create users
    if (!decoded.isSuperAdmin) {
      return new Response(JSON.stringify({ message: "Forbidden: Superadmin only" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }

    const db = context.env.DATABASE;
    const { username, password, is_superadmin } = await context.request.json();

    // Basic validation
    if (!username || !password) {
      return new Response(JSON.stringify({ message: "Missing username or password" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const { results: existing } = await db.prepare("SELECT admin_ID FROM admins WHERE username = ?")
      .bind(username)
      .all();

    if (existing.length !== 0) {
      return new Response(JSON.stringify({ message: "User already exists" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }


    // Hash the password with bcrypt
    const bcrypt = require('bcryptjs');
    const password_hash = await bcrypt.hash(password, 12);

    // Insert into D1
    await db.prepare("INSERT INTO admins (username, password, is_superadmin) VALUES (?, ?, ?)")
      .bind(username, password_hash, is_superadmin || 0)
      .run();

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
