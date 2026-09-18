"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";

type Destination = {
  id: string;
  name: string;
  region: string;
  summary: string;
  latitude?: number;
  longitude?: number;
  slug: string;
};

type SearchPlace = {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  type?: string;
  slug?: string;
};

type MapCategory = "All" | "Beaches" | "Culture" | "Mountains" | "Wildlife" | "Nature";

const categories: MapCategory[] = ["All", "Beaches", "Culture", "Mountains", "Wildlife", "Nature"];

const sriLankaCenter: [number, number] = [7.8731, 80.7718];

const resultIcon = L.divIcon({
  className: "discover-map-pin",
  html: '<span class="discover-map-pin-core"></span><span class="discover-map-pin-pulse"></span>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function getDestinationCategories(destination: Destination): MapCategory[] {
  const haystack = `${destination.slug} ${destination.name} ${destination.region}`.toLowerCase();
  const result: MapCategory[] = [];

  if (/mirissa|galle|hikkaduwa|bentota|trinco|nilaveli|pasikuda|arugam-bay|kalpitiya|batticaloa|mannar|delft-island/.test(haystack)) {
    result.push("Beaches");
  }
  if (/kandy|sigiriya|dambulla|anuradhapura|polonnaruwa|mihintale|yapahuwa|jaffna/.test(haystack)) {
    result.push("Culture");
  }
  if (/ella|nuwara-eliya|horton-plains|adams-peak|haputale|knuckles|riverston|kitulgala/.test(haystack)) {
    result.push("Mountains");
  }
  if (/yala|udawalawe|wilpattu|sinharaja/.test(haystack)) {
    result.push("Wildlife");
  }
  if (!result.length || /sinharaja|knuckles|horton-plains|kitulgala|riverston/.test(haystack)) {
    result.push("Nature");
  }

  return Array.from(new Set(result));
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadius = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function LocationCard({
  title,
  address,
  kicker = "LOCATION FOUND",
  slug,
  onReset,
}: {
  title: string;
  address: string;
  kicker?: string;
  slug?: string;
  onReset?: () => void;
}) {
  const router = useRouter();

  return (
    <div
      className={`discover-location-card ${slug ? "discover-location-card-clickable" : ""}`}
      onClick={() => {
        if (slug) router.push(`/destinations/${slug}`);
      }}
      role={slug ? "link" : undefined}
      tabIndex={slug ? 0 : undefined}
      onKeyDown={(event) => {
        if (slug && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          router.push(`/destinations/${slug}`);
        }
      }}
    >
      <div className="discover-location-kicker">{kicker}</div>
      <div className="discover-location-title">{title}</div>
      <div className="discover-location-address">{address}</div>
      <div className="discover-location-actions">
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`}
          target="_blank"
          rel="noreferrer"
          className="discover-location-google"
          onClick={(event) => event.stopPropagation()}
        >
          Open in Google Maps ↗
        </a>
        {onReset && (
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onReset();
            }}
            className="discover-location-reset"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

function SearchResultMarker({ place, onReset }: { place: SearchPlace; onReset: () => void }) {
  const markerRef = useRef<L.Marker | null>(null);
  const map = useMap();

  useEffect(() => {
    map.flyTo([place.lat, place.lon], 13, { duration: 1.15 });
    const timer = window.setTimeout(() => markerRef.current?.openPopup(), 850);
    return () => window.clearTimeout(timer);
  }, [map, place]);

  return (
    <Marker ref={markerRef} position={[place.lat, place.lon]} icon={resultIcon}>
      <Popup closeButton={false} className="discover-location-popup" offset={[0, -6]}>
        <LocationCard
          title={place.name}
          address={place.displayName}
          onReset={onReset}
        />
      </Popup>
    </Marker>
  );
}

function DestinationMarker({ destination, distance }: { destination: Destination; distance?: number }) {
  return (
    <Marker position={[destination.latitude as number, destination.longitude as number]} icon={resultIcon}>
      <Popup closeButton={false} className="discover-location-popup" offset={[0, -6]}>
        <LocationCard
          title={destination.name}
          address={`${destination.region}, Sri Lanka${typeof distance === "number" ? ` · ${distance.toFixed(1)} km away` : ""}`}
          kicker="DISCOVERLANKA PLACE"
          slug={destination.slug}
        />
      </Popup>
    </Marker>
  );
}

export default function InteractiveMap({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");
  const [searchedPlace, setSearchedPlace] = useState<SearchPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<MapCategory>("All");

  const localPlaces = useMemo(
    () =>
      destinations.filter(
        (destination) =>
          typeof destination.latitude === "number" &&
          typeof destination.longitude === "number" &&
          Number.isFinite(destination.latitude) &&
          Number.isFinite(destination.longitude)
      ),
    [destinations]
  );

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    return localPlaces
      .map((destination) => ({ destination, categories: getDestinationCategories(destination) }))
      .filter(({ destination, categories: destinationCategories }) => {
        const matchesText =
          destination.name.toLowerCase().includes(term) ||
          destination.region.toLowerCase().includes(term);
        const matchesCategory = selectedCategory === "All" || destinationCategories.includes(selectedCategory);
        return matchesText && matchesCategory;
      })
      .sort((a, b) => {
        const aExact = a.destination.name.toLowerCase() === term ? 0 : 1;
        const bExact = b.destination.name.toLowerCase() === term ? 0 : 1;
        return aExact - bExact;
      })
      .slice(0, 6);
  }, [localPlaces, query, selectedCategory]);

  const nearbyPlaces = useMemo(() => {
    if (!searchedPlace) return [];

    return localPlaces
      .map((destination) => ({
        destination,
        distance: distanceKm(
          searchedPlace.lat,
          searchedPlace.lon,
          destination.latitude as number,
          destination.longitude as number
        ),
        categories: getDestinationCategories(destination),
      }))
      .filter(({ destination, distance, categories: destinationCategories }) => {
        const notSamePlace = destination.slug !== searchedPlace.slug;
        const withinRange = distance <= 70;
        const matchesCategory =
          selectedCategory === "All" || destinationCategories.includes(selectedCategory);
        return notSamePlace && withinRange && matchesCategory;
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6);
  }, [localPlaces, searchedPlace, selectedCategory]);

  async function searchLocation(rawQuery: string) {
    const term = rawQuery.trim();
    if (!term) return;

    setLoading(true);
    setMessage("");
    setSearchedPlace(null);

    try {
      const localMatch = localPlaces.find(
        (destination) =>
          destination.name.toLowerCase() === term.toLowerCase() ||
          destination.region.toLowerCase() === term.toLowerCase() ||
          destination.name.toLowerCase().includes(term.toLowerCase())
      );

      if (localMatch) {
        setSearchedPlace({
          name: localMatch.name,
          displayName: localMatch.region
            ? `${localMatch.name}, ${localMatch.region}, Sri Lanka`
            : `${localMatch.name}, Sri Lanka`,
          lat: localMatch.latitude as number,
          lon: localMatch.longitude as number,
          type: "destination",
          slug: localMatch.slug,
        });
        return;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=lk&q=${encodeURIComponent(term)}`,
        {
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) throw new Error("Search request failed.");

      const results = (await response.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
        type?: string;
      }>;

      if (!results.length) {
        setMessage(`No Sri Lankan location found for “${term}”.`);
        return;
      }

      const result = results[0];
      setSearchedPlace({
        name: term,
        displayName: result.display_name,
        lat: Number(result.lat),
        lon: Number(result.lon),
        type: result.type,
      });
    } catch {
      setMessage("We couldn't search that location right now. Try the place name again.");
    } finally {
      setLoading(false);
    }
  }

  function resetMap() {
    setQuery("");
    setSearchedPlace(null);
    setMessage("");
    setSelectedCategory("All");
  }

  return (
    <div className="luxury-map relative min-h-[650px] w-full overflow-hidden bg-[#e8e1d4]">
      <MapContainer
        center={sriLankaCenter}
        zoom={8}
        minZoom={7}
        maxZoom={17}
        scrollWheelZoom
        zoomControl={false}
        className="absolute inset-0 h-full w-full"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {searchedPlace && <SearchResultMarker place={searchedPlace} onReset={resetMap} />}

        {nearbyPlaces.map(({ destination, distance }) => (
          <DestinationMarker
            key={destination.id}
            destination={destination}
            distance={distance}
          />
        ))}
      </MapContainer>

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(7,18,14,.05),transparent_38%,rgba(7,18,14,.10))]" />

      <div className="absolute inset-x-4 top-4 z-[500] sm:inset-x-5 sm:top-5">
        <div className="mx-auto max-w-3xl rounded-[1.35rem] border border-white/75 bg-[#fbf8f1]/95 p-2 shadow-[0_16px_50px_rgba(30,36,29,.14)] backdrop-blur-xl">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void searchLocation(query);
            }}
            className="flex items-center gap-2"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#10251f] text-[#e4c57f]">
              <span className="text-lg">⌕</span>
            </div>

            <input
              aria-label="Search a location in Sri Lanka"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search a location in Sri Lanka..."
              className="luxury-map-search-input h-11 min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold outline-none"
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-full bg-[#10251f] px-4 py-2.5 text-[9px] font-black uppercase tracking-[.16em] text-white transition hover:bg-[#18392f] disabled:cursor-not-allowed disabled:opacity-45 sm:px-5"
            >
              {loading ? "Finding…" : "Search"}
            </button>
          </form>

          {query.trim() && suggestions.length > 0 && !searchedPlace && (
            <div className="discover-map-suggestions mt-2 border-t border-[#10251f]/10 pt-2">
              <p className="px-2 pb-1 text-[8px] font-black uppercase tracking-[.2em] text-[#8a6b35]">
                Suggested destinations
              </p>
              <div className="grid gap-1 sm:grid-cols-2">
                {suggestions.map(({ destination }) => (
                  <button
                    key={destination.id}
                    type="button"
                    className="discover-map-suggestion"
                    onClick={() => {
                      setQuery(destination.name);
                      void searchLocation(destination.name);
                    }}
                  >
                    <span>
                      <strong>{destination.name}</strong>
                      <small>{destination.region}</small>
                    </span>
                    <span>↗</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="discover-map-filters mt-2 flex gap-1.5 overflow-x-auto border-t border-[#10251f]/10 pt-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`discover-map-filter ${selectedCategory === category ? "is-active" : ""}`}
              >
                {category}
              </button>
            ))}
          </div>

          {message && <p className="px-3 pb-1 pt-2 text-[11px] text-[#8a5d44]">{message}</p>}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] max-w-[min(100%-2rem,560px)] sm:bottom-5 sm:left-5">
        <div className="rounded-[1.4rem] border border-white/20 bg-[#0b1c15]/90 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,.20)] backdrop-blur-xl">
          <div className="flex items-center justify-between gap-5">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[.22em] text-[#d9b972]">
                {searchedPlace ? "Nearby discoveries" : "Explore the island"}
              </p>
              <p className="mt-1 max-w-[300px] text-xs leading-5 text-white/55">
                {searchedPlace
                  ? `Places within 70 km of ${searchedPlace.name}.`
                  : "Search a place to reveal its exact point and nearby destinations."}
              </p>
            </div>
            {searchedPlace && (
              <button
                type="button"
                onClick={resetMap}
                className="shrink-0 rounded-full border border-white/15 px-3 py-2 text-[8px] font-black uppercase tracking-[.15em] text-white/65 hover:bg-white/10"
              >
                Clear
              </button>
            )}
          </div>

          {searchedPlace && (
            <div className="discover-nearby-list mt-3 flex max-w-full gap-2 overflow-x-auto pb-1">
              {nearbyPlaces.length ? (
                nearbyPlaces.map(({ destination, distance }) => (
                  <a
                    key={destination.id}
                    href={`/destinations/${destination.slug}`}
                    className="discover-nearby-card"
                  >
                    <span className="discover-nearby-distance">{distance.toFixed(1)} km</span>
                    <strong>{destination.name}</strong>
                    <small>{destination.region}</small>
                  </a>
                ))
              ) : (
                <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-[10px] text-white/50">
                  No nearby destinations match this filter yet.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 z-[500] flex flex-col gap-2 sm:bottom-5 sm:right-5">
        <button
          type="button"
          onClick={resetMap}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#0b1c15]/88 text-white shadow-lg backdrop-blur-xl"
          aria-label="Reset map search"
          title="Reset map search"
        >
          ↺
        </button>
        <div className="hidden rounded-full border border-white/15 bg-[#0b1c15]/88 px-3 py-2 text-[9px] font-black uppercase tracking-[.15em] text-white/55 shadow-lg backdrop-blur-xl sm:block">
          {selectedCategory === "All" ? "Search to locate" : selectedCategory}
        </div>
      </div>
    </div>
  );
}
