const UNSPLASH_RANDOM_URL = "https://api.unsplash.com/photos/random";

async function fetchUnsplashImage(query) {
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    return "";
  }

  const params = new URLSearchParams({
    query,
    orientation: "landscape",
    content_filter: "high",
    sig: `${Date.now()}-${Math.random()}`
  });

  const response = await fetch(`${UNSPLASH_RANDOM_URL}?${params.toString()}`, {
    headers: {
      Authorization: `Client-ID ${process.env.UNSPLASH_ACCESS_KEY}`
    }
  });

  if (!response.ok) {
    return "";
  }

  const data = await response.json();
  return data.urls?.regular || "";
}

export async function generateItineraryImages({ destination, days }) {
  const baseQuery = destination && destination !== "Upcoming trip" ? destination : "travel";
  const heroImageUrl = await fetchUnsplashImage(baseQuery);

  const dayImages = await Promise.all(
    (days || []).map((day, index) => {
      const dayQuery = [baseQuery, day?.title, `travel day ${index + 1}`].filter(Boolean).join(" ");
      return fetchUnsplashImage(dayQuery);
    })
  );

  return {
    heroImageUrl,
    dayImages
  };
}
