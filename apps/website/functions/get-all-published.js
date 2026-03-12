export async function onRequest(context) {
    const db2 = context.env.DATABASE2;

    try {
        const { results } = await db2.prepare(
            "SELECT tour_ID, tour FROM Published"
        ).all();

        const publicTours = results.map((row) => {
            const data = JSON.parse(row.tour);
            return {
                id: row.tour_ID,
                title: data.tour?.mainPage?.title || data.name || "Untitled Tour",
                description: data.tour?.mainPage?.description || "",
                logo: data.tour?.mainPage?.logo || ""
            };
        });

        return new Response(JSON.stringify(publicTours), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(JSON.stringify({ message: err.message }), { status: 500 });
    }
}
