export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");
  const sites = [
    "linkedin.com",
    "twitter.com",
    "youtube.com",
    "facebook.com",
    "instagram.com",
    "tiktok.com",
    "pinterest.com",
  ];
  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  try {
    const searchPromises = sites.map(async (site) => {
      const query = `site:${site} ${name}`;
      const url = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${cx}&q=${encodeURIComponent(
        query
      )}`;
      const response = await fetch(url);
      const data = await response.json();
      return data.items ? data.items.map((item) => ({ ...item, site })) : [];
    });

    const results = await Promise.all(searchPromises);
    const flattenedResults = results.flat();
    return new Response(JSON.stringify(flattenedResults), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Erreur lors de la recherche" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
