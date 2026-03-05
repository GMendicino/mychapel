interface Env {
  DATABASE: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { DATABASE } = context.env;

  try {
    const { results } = await DATABASE.prepare(
      "SELECT tour_ID, tour FROM Tours WHERE is_published = 1"
    ).all();

    const publicTours = results.map((row: any) => {
      const data = JSON.parse(row.tour);
      return {
        id: row.tour_ID,
        title: data.mainPage?.title || "Untitled Tour",
        description: data.mainPage?.description || "",
        logo: data.mainPage?.logo || ""
      };
    });

    return new Response(JSON.stringify(publicTours), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};