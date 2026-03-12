export async function onRequest(context) {
    const API_KEY = context.env.TRIPADVISOR_API_KEY;
    
    const { searchParams } = new URL(context.request.url);
    const locationId = searchParams.get("locationId") || "214007"; // Default to King's College Chapel if not provided

    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "API key not configured" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    const url = `https://api.content.tripadvisor.com/api/v1/location/${locationId}/reviews?key=${API_KEY}&language=en`;

    try {
        const response = await fetch(url, {
            headers: { "accept": "application/json" }
        });

        if (!response.ok) {
            const errorData = await response.json();
            return new Response(JSON.stringify({ error: "TripAdvisor API error", details: errorData }), { 
                status: response.status,
                headers: { "Content-Type": "application/json" }
            });
        }

        const data = await response.json();
        return new Response(JSON.stringify(data), {
            headers: { "Content-Type": "application/json" }
        });
    } catch (err) {
        return new Response(JSON.stringify({ error: "Failed to fetch reviews", message: err.message }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }
}
