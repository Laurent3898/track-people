import { useState } from "react";

export default function useSearch() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async (name, selectedSites, location) => {
    const cacheKey = `search_${name}_${location}_${selectedSites.join(",")}`;
    const cachedResults = localStorage.getItem(cacheKey);

    if (cachedResults) {
      setResults(JSON.parse(cachedResults));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    const controller = new AbortController();

    try {
      const res = await fetch(
        `/api/search?name=${encodeURIComponent(
          name
        )}&sites=${encodeURIComponent(
          selectedSites.join(",")
        )}&location=${encodeURIComponent(location)}`,
        { signal: controller.signal }
      );
      const data = await res.json();
      if (res.ok) {
        setResults(data);
        localStorage.setItem(cacheKey, JSON.stringify(data)); // Sauvegarde dans le cache
      } else {
        if (res.status === 429)
          setError("Rate limit exceeded. Please try again later.");
        else setError(data.error || "Something went wrong");
      }
    } catch (err) {
      if (err.name === "AbortError") console.log("Fetch aborted");
      else setError("Failed to fetch results. Please check your connection.");
    } finally {
      setLoading(false);
    }

    return () => controller.abort();
  };

  return { results, error, loading, search };
}
