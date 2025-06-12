import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          title: "Social Media Search",
          searchPlaceholder: "Enter name to search",
          locationPlaceholder:
            "Enter location (e.g., Antananarivo, France, etc.)",
          selectSites: "Select sites to search",
          searchButton: "Search",
          loading: "Loading search results...",
          noResults: "No results found for",
          resultsFound: "Results found",
          from: "From",
        },
      },
      fr: {
        translation: {
          title: "Recherche sur les réseaux sociaux",
          searchPlaceholder: "Entrez le nom à rechercher",
          locationPlaceholder:
            "Entrez la localisation (ex : Antananarivo, France, etc.)",
          selectSites: "Sélectionnez les sites à rechercher",
          searchButton: "Rechercher",
          loading: "Chargement des résultats de recherche...",
          noResults: "Aucun résultat trouvé pour",
          resultsFound: "Résultats trouvés",
          from: "De",
        },
      },
    },
    fallbackLng: "en", // Langue par défaut si la langue de l'utilisateur n'est pas détectée
    debug: true, // Aide au débogage (désactive en production)
    interpolation: {
      escapeValue: false, // React gère déjà l'échappement
    },
  });

export default i18n;
