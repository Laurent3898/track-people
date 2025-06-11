import { allowedSites } from "@/utils/sites";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const name = searchParams.get("name");

  let sites = allowedSites;
  const sitesParam = searchParams.get("sites");
  if (sitesParam) {
    const requestedSites = sitesParam.split(",");
    sites = requestedSites.filter((site) => allowedSites.includes(site));
  }

  const apiKey = process.env.GOOGLE_API_KEY;
  const cx = process.env.GOOGLE_CX;

  try {
    const searchPromises = sites.map(async (site) => {
      // Revert to the initial query format: site:${site} ${name}
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
    let errorMessage = "Erreur lors de la recherche";
    if (error.message.includes("API key"))
      errorMessage = "Invalid or missing Google API key";
    else if (error.message.includes("network"))
      errorMessage = "Network error. Please check your connection.";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
