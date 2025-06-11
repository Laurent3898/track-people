"use client";

import { useState, useCallback, useEffect } from "react";
import debounce from "lodash.debounce";
import SiteSelector from "@/components/SiteSelector";
import useSearch from "@/hooks/useSearch";
import { ClipLoader } from "react-spinners";
import { allowedSites } from "@/utils/sites";

export default function Home() {
  const [name, setName] = useState("");
  const [sites, setSites] = useState(
    allowedSites.map((domain) => ({ domain, selected: true }))
  );
  const [localError, setLocalError] = useState("");
  const [hasSearched, setHasSearched] = useState(false); // Track search initiation
  const { results, error: apiError, loading, search } = useSearch();

  const debouncedHandleSearch = useCallback(
    debounce(() => {
      setLocalError("");
      setHasSearched(true); // Mark search as initiated
      if (!name.trim()) {
        setLocalError("Please enter a name to search");
        return;
      }
      const selectedSites = sites
        .filter((site) => site.selected)
        .map((site) => site.domain);
      if (selectedSites.length === 0) {
        setLocalError("Please select at least one site");
        return;
      }
      search(name, selectedSites);
    }, 300),
    [name, sites, search]
  );

  useEffect(() => {
    return () => debouncedHandleSearch.cancel(); // Cleanup debounce
  }, [debouncedHandleSearch]);

  const resultCounts = results.reduce((acc, result) => {
    acc[result.site] = (acc[result.site] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Social Media Search
      </h1>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter name to search"
        className="border p-3 mb-6 w-full rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="Enter name to search"
      />

      <SiteSelector sites={sites} onSelectionChange={setSites} />

      <button
        onClick={debouncedHandleSearch}
        disabled={loading}
        className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        aria-label="Search for the name on selected social media sites"
      >
        Search
      </button>

      {loading && (
        <div className="mt-4 flex justify-center" aria-live="polite">
          <ClipLoader color="#36d7b7" size={40} />
          <span className="sr-only">Loading search results...</span>
        </div>
      )}

      {(localError || apiError) && (
        <p className="text-red-500 mt-4">{localError || apiError}</p>
      )}

      {hasSearched && results.length > 0 ? (
        <div className="mt-6">
          <p className="mb-4 text-gray-600">
            Results found:{" "}
            {Object.entries(resultCounts)
              .map(([site, count]) => `${count} on ${site}`)
              .join(", ")}
          </p>
          <ul className="space-y-4">
            {results.map((result, index) => (
              <li key={index} className="p-4 bg-white shadow rounded-lg">
                <a
                  href={result.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline text-lg font-medium"
                >
                  {result.title}
                </a>
                <p className="mt-2 text-gray-600">{result.snippet}</p>
                <p className="mt-1 text-sm text-gray-500">
                  From: {result.site}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : hasSearched &&
        results.length === 0 &&
        !loading &&
        !localError &&
        !apiError ? (
        <p className="mt-6 text-gray-600">
          No results found for {'"'}
          {name}
          {'"'}
        </p>
      ) : null}
    </div>
  );
}
