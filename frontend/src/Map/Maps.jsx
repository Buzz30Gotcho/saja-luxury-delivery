// src/components/Map.js
import React, { useMemo } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = { lat: 48.8566, lng: 2.3522 }; // Paris par défaut

const Maps = ({ shops = [], userLocation: externalUserLocation = null }) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script-shops",
    googleMapsApiKey: googleMapsApiKey || "",
  });

  const userLocation = externalUserLocation;

  const safeShops = useMemo(
    () =>
      (shops || []).filter(
        (shop) =>
          Number.isFinite(Number(shop?.latitude)) &&
          Number.isFinite(Number(shop?.longitude))
      ),
    [shops]
  );

  if (!googleMapsApiKey) {
    return (
      <div className="w-full h-[400px] bg-card border border-border flex items-center justify-center p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-light">
          Carte indisponible : ajoutez <strong>VITE_GOOGLE_MAPS_API_KEY</strong> dans le fichier <strong>frontend/.env</strong>.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="w-full h-[400px] bg-card border border-border flex items-center justify-center p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-light">
          Carte indisponible : chargement Google Maps bloqué (clé API invalide, quotas, ou bloqueur de contenu).
        </p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] bg-card border border-border flex items-center justify-center p-6 text-center">
        <p className="text-[11px] uppercase tracking-[0.2em] text-text-light">Chargement de la carte…</p>
      </div>
    );
  }

  return (
    <>
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
              url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            }}
          />
        )}
      </GoogleMap>
    </>
  );
};

export default Maps;
