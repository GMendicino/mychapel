export async function onRequest(context) {
    const API_KEY = context.env.TRIPADVISOR_API_KEY;
    const LOCATION_ID = "214007"; // King's College Chapel, Aberdeen
    
    if (!API_KEY) {
        return new Response(JSON.stringify({ error: "API key not configured" }), { 
            status: 500,
            headers: { "Content-Type": "application/json" }
        });
    }

    const url = `https://api.content.tripadvisor.com/api/v1/location/${LOCATION_ID}/reviews?key=${API_KEY}&language=en`;

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
