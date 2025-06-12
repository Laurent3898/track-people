import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapSelector({ onLocationSelect }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) {
      // Initialisation de la carte (Paris par défaut)
      mapRef.current = L.map("map").setView([-18.8792, 47.5079], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(mapRef.current);

      // Événement de clic sur la carte
      mapRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(mapRef.current);
        }
        // Récupérer le nom de la localisation avec Nominatim
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        )
          .then((response) => response.json())
          .then((data) => {
            const locationName =
              data.address.city ||
              data.address.town ||
              data.address.village ||
              data.address.country;
            onLocationSelect(locationName); // Met à jour le champ location
          })
          .catch((error) => console.error("Erreur avec Nominatim :", error));
      });
    }
  }, [onLocationSelect]);

  return <div id="map" style={{ height: "400px", marginBottom: "20px" }}></div>;
}
