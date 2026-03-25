// src/components/Map.js
import React, { useState, useEffect, useMemo } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris par défaut

const Maps = ({ shops = [] }) => {
  const [userLocation, setUserLocation] = useState(null);
  const [geoError, setGeoError] = useState(false);
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  const safeShops = useMemo(
    () =>
      (shops || []).filter(
        (shop) =>
          Number.isFinite(Number(shop?.latitude)) &&
          Number.isFinite(Number(shop?.longitude))
      ),
    [shops]
  );

  // 1️⃣ Récupérer la localisation de l'utilisateur
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          setGeoError(true);
        }
      );
    }
  }, []);

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-[400px] bg-card border border-border flex items-center justify-center p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-light">
          Carte indisponible : ajoutez <strong>VITE_GOOGLE_MAPS_API_KEY</strong> dans le fichier <strong>frontend/.env</strong>.
        </p>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={googleMapsApiKey}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={userLocation || defaultCenter}
        zoom={13}
      >
        {/* Marqueurs des shops */}
        {safeShops.map((shop) => (
          <Marker
            key={shop.id}
            position={{ lat: Number(shop.latitude), lng: Number(shop.longitude) }}
            title={shop.name}
          />
        ))}

        {/* Marqueur de l'utilisateur */}
        {userLocation && (
          <Marker
            position={userLocation}
            title="Vous êtes ici"
            icon={{
              url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}
      </GoogleMap>
      {geoError && (
        <p className="mt-2 text-[10px] uppercase tracking-[0.2em] text-text-light">
          Position non disponible, affichage centré sur Paris.
        </p>
      )}
    </LoadScript>
  );
};

export default Maps;
