import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function onRequestPost(context) {
  try {
    const db = context.env.DATABASE;
    const { username, password } = await context.request.json();

    if (!username || !password) {
      return new Response(JSON.stringify({ message: "Missing username or password" }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Get user from username in database
    const { results } = await db.prepare("SELECT * FROM admins WHERE username = ?")
      .bind(username)
      .all();

    // Check if user was found
    if (results.length === 0) {
      return new Response(JSON.stringify({ message: "Invalid username or password" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    const user = results[0];

    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return new Response(JSON.stringify({ message: "Invalid username or password" }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.admin_ID, 
        username: user.username,
        isSuperAdmin: user.is_superadmin === 1
      },
      context.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return new Response(JSON.stringify({ 
      success: true, 
      token: token,
      isSuperAdmin: user.is_superadmin === 1,
      username: user.username
    }), {
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ message: "Internal server error" }) , { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
