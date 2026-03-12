export async function onRequest(context) {
    const db2 = context.env.DATABASE2;
    const { searchParams } = new URL(context.request.url);
    const id = searchParams.get("id");

    if (!id) {
        return new Response(JSON.stringify({ message: "Missing ID" }), { status: 400 });
    }

    try {
        const row = await db2.prepare(
            "SELECT tour FROM Published WHERE tour_ID = ?"
        ).bind(parseInt(id)).first();

        if (!row) {
            return new Response(JSON.stringify({ message: "Tour not found" }), { status: 404 });
        }

        return new Response(row.tour, {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ message: err.message }), { status: 500 });
    }
}
