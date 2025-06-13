"use client";

import { useState, useMemo, useEffect } from "react";
import debounce from "lodash.debounce";
import SiteSelector from "@/components/SiteSelector";
import useSearch from "@/hooks/useSearch";
import { ClipLoader } from "react-spinners";
import { allowedSites } from "@/utils/sites";
import dynamic from "next/dynamic";
import { useTranslation } from "react-i18next";
import "../i18n";

const MapSelector = dynamic(() => import("@/components/MapSelector"), {
  ssr: false,
});

const ChartStat = dynamic(() => import("@/components/ChartStat"), {
  ssr: false,
});

export default function Home() {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [sites, setSites] = useState(null);
  const [localError, setLocalError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const { results, error: apiError, loading, search } = useSearch();
  const { t, i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedSites = localStorage.getItem("selectedSites");
      setSites(
        savedSites
          ? JSON.parse(savedSites)
          : allowedSites.map((domain) => ({ domain, selected: true }))
      );
    }
  }, []);

  useEffect(() => {
    if (sites) {
      localStorage.setItem("selectedSites", JSON.stringify(sites));
    }
  }, [sites]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          )
            .then((res) => res.json())
            .then((data) => {
              const locationName =
                data.address.city ||
                data.address.town ||
                data.address.village ||
                data.address.country;
              setLocation(locationName);
            })
            .catch((err) => console.error("Erreur avec Nominatim :", err));
        },
        (err) => console.error("Erreur de géolocalisation :", err)
      );
    }
  }, []);

  const debouncedHandleSearch = useMemo(() => {
    return debounce(() => {
      setLocalError("");
      setHasSearched(true);
      if (!name.trim()) {
        setLocalError(t("searchPlaceholder") + " is required");
        return;
      }
      const selectedSites = sites
        .filter((site) => site.selected)
        .map((site) => site.domain);
      if (selectedSites.length === 0) {
        setLocalError(t("selectSites"));
        return;
      }
      search(name, selectedSites, location);
    }, 300);
  }, [name, location, sites, search, t]);

  useEffect(() => {
    return () => debouncedHandleSearch.cancel();
  }, [debouncedHandleSearch]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const resultCounts = results.reduce((acc, result) => {
    acc[result.site] = (acc[result.site] || 0) + 1;
    return acc;
  }, {});

  const ready = mounted && i18n.isInitialized && sites;

  if (!ready) {
    return <p>Loading...</p>;
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">{t("title")}</h1>
        <div className="relative inline-block text-left">
          <select
            onChange={(e) => changeLanguage(e.target.value)}
            value={i18n.language || "en"}
            aria-label={t("selectLanguage")}
            className="border p-2 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 text-gray-700 bg-white"
          >
            <option value="en">English 🌐</option>
            <option value="fr">Français 🌐</option>
          </select>
        </div>
      </div>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t("searchPlaceholder")}
        className="border p-3 mb-6 w-full rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 border-gray-300 text-gray-700"
        aria-label={t("searchPlaceholder")}
      />

      <SiteSelector sites={sites} onSelectionChange={setSites} />

      <MapSelector onLocationSelect={setLocation} />
      <input
        type="text"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        placeholder={t("locationPlaceholder")}
        className="border p-3 mb-6 w-full rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 placeholder-gray-400 border-gray-300 text-gray-700"
        aria-label={t("locationPlaceholder")}
      />

      <button
        onClick={debouncedHandleSearch}
        disabled={loading}
        className="bg-green-500 text-white px-6 py-2 rounded-lg shadow hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
        aria-label={t("searchButton")}
      >
        {t("searchButton")}
      </button>

      {loading && (
        <div className="mt-4 flex justify-center" aria-live="polite">
          <ClipLoader color="#36d7b7" size={40} />
          <span className="sr-only">{t("loading")}</span>
        </div>
      )}

      {(localError || apiError) && (
        <p className="text-red-500 mt-4" role="alert">
          {localError || apiError}
        </p>
      )}

      {hasSearched && results.length > 0 ? (
        <div className="mt-6" aria-live="polite">
          <p className="mb-4 text-gray-600">
            {t("resultsFound")}:{" "}
            {Object.entries(resultCounts)
              .map(([site, count]) => `${count} on ${site}`)
              .join(", ")}
          </p>
          <ChartStat data={resultCounts} />
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
                  {t("from")}: {result.site}
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
        <p className="mt-6 text-gray-600" aria-live="polite">
          {`${t("noResults")} "${name}"`}
        </p>
      ) : null}
    </div>
  );
}
