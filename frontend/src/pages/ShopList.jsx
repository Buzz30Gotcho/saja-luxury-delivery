import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useShops } from '../hooks/useShops';
import LoadingSpinner from '../components/LoadingSpinner';
import { motion } from 'framer-motion';
import Maps from '../Map/Maps';
import dripSwiftLogo from '/dripswift.png';

const ALLOWED_SHOP_CITIES = ['Bordeaux', 'Paris', 'Cannes'];

const normalizeShopCity = (value = '') => {
  const raw = String(value || '').trim().toLowerCase();
  if (!raw) return null;
  if (raw.includes('bordeaux')) return 'Bordeaux';
  if (raw.includes('paris')) return 'Paris';
  if (raw.includes('cannes')) return 'Cannes';
  return null;
};

const toRad = (value) => (value * Math.PI) / 180;

const haversineDistanceKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const estimateEtaMinutes = (distanceKm) => {
  // Estimation simple : vitesse moyenne urbaine + temps fixe de préparation
  const averageSpeedKmh = 25;
  const prepMinutes = 8;
  const travelMinutes = (distanceKm / averageSpeedKmh) * 60;
  return Math.max(10, Math.round(prepMinutes + travelMinutes));
};

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const ShopList = () => {
  const { shops, loading, error } = useShops();
  const [userLocation, setUserLocation] = useState(null);
  const [geoStatus, setGeoStatus] = useState('idle');

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported');
      return;
    }

    setGeoStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setGeoStatus('granted');
      },
      () => {
        setGeoStatus('denied');
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10 * 60 * 1000,
      }
    );
  };

  const shopsWithDistanceAndEta = useMemo(() => {
    if (!shops || shops.length === 0) return [];

    const enrichedShops = shops.map((shop) => {
      const normalizedCity =
        normalizeShopCity(shop?.city) ||
        normalizeShopCity(shop?.location) ||
        normalizeShopCity(shop?.address);

      const latitude = Number(shop?.latitude);
      const longitude = Number(shop?.longitude);
      const hasCoordinates = Number.isFinite(latitude) && Number.isFinite(longitude);

      if (!userLocation || !hasCoordinates) {
        return {
          ...shop,
          normalizedCity,
          distanceKm: null,
          etaMin: null,
        };
      }

      const distanceKmRaw = haversineDistanceKm(
        userLocation.latitude,
        userLocation.longitude,
        latitude,
        longitude
      );

      const distanceKm = Number(distanceKmRaw.toFixed(1));

      return {
        ...shop,
        normalizedCity,
        distanceKm,
        etaMin: estimateEtaMinutes(distanceKmRaw),
      };
    });

    return enrichedShops.sort((a, b) => {
      const aDistance = a.distanceKm;
      const bDistance = b.distanceKm;

      if (aDistance == null && bDistance == null) return 0;
      if (aDistance == null) return 1;
      if (bDistance == null) return -1;
      return aDistance - bDistance;
    });
  }, [shops, userLocation]);

  const shopsWithCoordinates = (shops || []).filter(
    (shop) => Number.isFinite(Number(shop?.latitude)) && Number.isFinite(Number(shop?.longitude))
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div className="text-center">
          <div className="text-5xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-text-dark mb-4">Erreur</h2>
          <p className="text-text-medium">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-28 md:pt-32 pb-20">
      {/* Header Section */}
      <section className="container mx-auto px-6 md:px-12">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-3xl mx-auto text-center mb-12 md:mb-20"
        >
          <motion.div variants={fadeUp} custom={0} className="mb-4 md:mb-6">
            <span className="text-text-light text-[9px] md:text-xs font-bold tracking-[0.25em] md:tracking-[0.35em] uppercase">Partenaires</span>
          </motion.div>
          <motion.h1 variants={fadeUp} custom={1} className="text-3xl md:text-4xl font-serif text-text-dark mb-4 md:mb-6 tracking-tight">
            L'Écosystème Local
          </motion.h1>
          <motion.div variants={fadeUp} className="w-10 md:w-12 h-[1px] bg-green mx-auto mb-6 md:mb-8" />
          <motion.p variants={fadeUp} custom={2} className="text-[10px] md:text-sm uppercase tracking-wide text-text-medium max-w-xl mx-auto leading-relaxed font-medium px-4 md:px-0">
            Découvrez les maisons indépendantes sélectionnées pour leur excellence et leur savoir-faire unique.
          </motion.p>
          <motion.p variants={fadeUp} custom={3} className="text-[9px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.18em] text-text-light mt-4 px-4 md:px-0">
            Villes partenaires : {ALLOWED_SHOP_CITIES.join(' • ')}
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 md:mb-16"
        >
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between px-2 md:px-0">
            <h2 className="text-xl md:text-2xl font-serif text-text-dark">Carte des boutiques</h2>
            <div className="flex items-center justify-between md:justify-end gap-3">
              <p className="text-[9px] md:text-xs uppercase tracking-[0.15em] md:tracking-[0.18em] text-text-light font-bold">
                {shopsWithCoordinates.length} boutique(s)
              </p>
              {geoStatus !== 'granted' && (
                <button
                  type="button"
                  onClick={requestUserLocation}
                  className="rounded border border-border px-3 py-1.5 text-[9px] md:text-xs uppercase tracking-[0.18em] text-text-dark hover:bg-card transition-colors"
                >
                  {geoStatus === 'loading' ? 'Localisation…' : 'Ma position'}
                </button>
              )}
            </div>
          </div>

          {shopsWithCoordinates.length > 0 ? (
            <div className="rounded-xl overflow-hidden shadow-sm border border-border">
              <Maps
                shops={shopsWithCoordinates}
                userLocation={
                  userLocation
                    ? { lat: userLocation.latitude, lng: userLocation.longitude }
                    : null
                }
              />
            </div>
          ) : (
            <div className="w-full h-[200px] bg-card border border-border flex items-center justify-center p-6 text-center rounded-xl">
              <p className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-text-light">
                Aucune boutique n&apos;a encore de coordonnées GPS.
              </p>
            </div>
          )}

          {(geoStatus === 'idle' || geoStatus === 'unsupported' || geoStatus === 'denied') && (
            <p className="mt-4 text-[10px] md:text-xs uppercase tracking-[0.18em] text-text-light">
              Position non active. Cliquez sur « Activer ma position » pour afficher distance et ETA.
            </p>
          )}
        </motion.div>

        {/* Shops Grid */}
        {shops && shops.length > 0 ? (
          <>
          {geoStatus === 'granted' && (
            <p className="mb-6 text-[10px] md:text-xs uppercase tracking-[0.18em] text-text-light font-bold">
              Boutiques triées par distance
            </p>
          )}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16"
          >
            {shopsWithDistanceAndEta.map((shop, i) => (
              <motion.div key={shop.id} variants={fadeUp} custom={i}>
                <Link to={`/shop/${shop.id}`} className="group block">
                  <div className="relative aspect-[16/10] overflow-hidden bg-white mb-6 shadow-sm rounded-sm">
                    <img
                      src={shop.image || dripSwiftLogo}
                      alt={shop.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-500" />
                    <div className="absolute top-4 left-4">
                       <span className="bg-white/90 backdrop-blur-sm px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-text-dark shadow-sm">
                         {shop.category}
                       </span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 px-1">
                    <h3 className="text-lg md:text-xl font-serif text-text-dark group-hover:text-black transition-colors duration-300">
                      {shop.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] md:text-xs text-text-light uppercase tracking-[0.18em] font-bold">
                         📍 {shop.distanceKm != null ? `${shop.distanceKm} km • ~${shop.etaMin} min` : (shop.normalizedCity || 'Ville partenaire')}
                      </p>
                      <span className="text-[10px] md:text-xs text-text-dark uppercase font-bold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Visiter
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-24 border border-dashed border-border rounded-xl"
          >
             <p className="text-xs md:text-sm uppercase tracking-wider text-text-light">Aucune boutique disponible pour le moment.</p>
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default ShopList;
