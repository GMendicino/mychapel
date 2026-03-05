interface Env {
  DATABASE: D1Database;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { DATABASE } = context.env;
  const { searchParams } = new URL(context.request.url);
  const id = searchParams.get('id');

  if (!id) return new Response("Missing ID", { status: 400 });

  try {
    const tourBlob = await DATABASE.prepare(
      "SELECT tour FROM Tours WHERE tour_ID = ?"
    ).bind(id).first("tour");

    return new Response(tourBlob as string, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(err.message, { status: 500 });
  }
};