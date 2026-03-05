interface Env {
  TRIPADVISOR_API_KEY: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
  const { TRIPADVISOR_API_KEY } = context.env;
  const { searchParams, origin } = new URL(context.request.url);
  const locationId = searchParams.get('locationId');

  if (!locationId) {
    return new Response(JSON.stringify({ error: "Missing locationId" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Check the Edge Cache first
  const cache = caches.default;
  const cacheKey = context.request;
  let cachedResponse = await cache.match(cacheKey);
  
  // Don't use cache if we are in a local dev environment (optional, but helpful)
  if (cachedResponse && !origin.includes('localhost')) {
    return cachedResponse;
  }

  // TripAdvisor Content API URL for location details
  const url = `https://api.tripadvisor.com/api/v1/location/${locationId}/details?key=${TRIPADVISOR_API_KEY || 'MOCK_KEY'}&currency=USD&lang=en_US`;

  try {
    let data;
    
    // If we're missing an API key or it's a known test ID, provide mock data
    if ((!TRIPADVISOR_API_KEY && !origin.includes('pages.dev')) || locationId === "212130") {
      data = {
        rating: "4.5",
        num_reviews: "482",
        web_url: "https://www.tripadvisor.com/Attraction_Review-g186487-d212130-Reviews-Edinburgh_Castle-Edinburgh_Scotland.html",
        rating_image_url: "https://www.tripadvisor.com/img/cdsi/img2/ratings/traveler/4.5-66827-5.svg",
        name: "Edinburgh Castle (Mock for Testing)"
      };
    } else {
      const response = await fetch(url, {
        headers: { 'Accept': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`TripAdvisor API error: ${response.status}`);
      }
      data = await response.json();
    }
    
    const result = {
      rating: data.rating,
      num_reviews: data.num_reviews,
      web_url: data.web_url,
      rating_image_url: data.rating_image_url, 
      name: data.name
    };

    // 2. Construct the response with a 4-hour (14400s) cache header
    const response = new Response(JSON.stringify(result), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=14400", // 4 hours in seconds
        "Cloudflare-CDN-Cache-Control": "max-age=14400"
      },
    });

    // 3. Store in the Edge Cache for other users
    if (TRIPADVISOR_API_KEY) {
      context.waitUntil(cache.put(cacheKey, response.clone()));
    }

    return response;
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { 
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
