"use client";
import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async () => {
    if (!name.trim()) {
      setError("Veuillez entrer un nom");
      return;
    }
    setError(null);

    const cached = localStorage.getItem(name);
    if (cached) {
      const { timestamp, results } = JSON.parse(cached);
      if (Date.now() - timestamp < 86400000) {
        // Cache valide pendant 1 jour
        setResults(results);
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/search?name=${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error("Erreur lors de la recherche");
      const data = await res.json();
      localStorage.setItem(
        name,
        JSON.stringify({ timestamp: Date.now(), results: data })
      );
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Recherche de nom
      </h1>
      <div className="w-full max-w-md">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Entrez un nom"
            className="flex-1 p-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleSearch}
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition"
          >
            Rechercher
          </button>
        </div>
        {error && <p className="mt-4 text-red-500">{error}</p>}
        {loading && <p className="mt-4 text-gray-600">Chargement...</p>}
        {results.length > 0 && (
          <ul className="mt-6 space-y-4">
            {results.map((result, index) => (
              <li key={index} className="p-4 bg-white rounded-md shadow">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {result.title}
                </a>{" "}
                - <strong className="text-gray-800">{result.site}</strong>
                <p className="text-gray-600 mt-1">{result.snippet}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
