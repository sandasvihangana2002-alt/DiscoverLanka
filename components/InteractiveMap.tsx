"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useState } from "react";
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
};

const sriLankaCenter: [number, number] = [7.8731, 80.7718];

const resultIcon = L.divIcon({
  className: "discover-map-pin",
  html: '<span class="discover-map-pin-core"></span><span class="discover-map-pin-pulse"></span>',
  iconSize: [42, 42],
  iconAnchor: [21, 21],
});

function MapFocus({ place }: { place: SearchPlace | null }) {
  const map = useMap();

  useEffect(() => {
    if (!place) return;
    map.flyTo([place.lat, place.lon], 13, { duration: 1.15 });
  }, [map, place]);

  return null;
}

export default function InteractiveMap({ destinations }: { destinations: Destination[] }) {
  const [query, setQuery] = useState("");
  const [searchedPlace, setSearchedPlace] = useState<SearchPlace | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const localPlaces = useMemo(
    () =>
      destinations.filter(
        (d) =>
          typeof d.latitude === "number" &&
          typeof d.longitude === "number" &&
          Number.isFinite(d.latitude) &&
          Number.isFinite(d.longitude)
      ),
    [destinations]
  );

  async function searchLocation(rawQuery: string) {
    const term = rawQuery.trim();
    if (!term) return;

    setLoading(true);
    setMessage("");
    setSearchedPlace(null);

    try {
      const localMatch = localPlaces.find(
        (d) =>
          d.name.toLowerCase() === term.toLowerCase() ||
          d.region.toLowerCase() === term.toLowerCase() ||
          d.name.toLowerCase().includes(term.toLowerCase())
      );

      if (localMatch) {
        setSearchedPlace({
          name: localMatch.name,
          displayName: localMatch.region ? `${localMatch.name}, ${localMatch.region}, Sri Lanka` : `${localMatch.name}, Sri Lanka`,
          lat: localMatch.latitude as number,
          lon: localMatch.longitude as number,
          type: "destination",
        });
        return;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=1&countrycodes=lk&q=${encodeURIComponent(term)}`,
        {
          headers: {
            Accept: "application/json",
          },
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
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapFocus place={searchedPlace} />
        {searchedPlace && (
          <Marker position={[searchedPlace.lat, searchedPlace.lon]} icon={resultIcon}>
            <Popup closeButton={false} className="discover-location-popup" offset={[0, -6]}>
              <div className="discover-location-card">
                <div className="discover-location-kicker">LOCATION FOUND</div>
                <div className="discover-location-title">{searchedPlace.name}</div>
                <div className="discover-location-address">{searchedPlace.displayName}</div>
                <div className="discover-location-actions">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${searchedPlace.lat},${searchedPlace.lon}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="discover-location-google"
                  >
                    Open in Google Maps ↗
                  </a>
                  <button type="button" onClick={resetMap} className="discover-location-reset">
                    Reset
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
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
              className="h-11 min-w-0 flex-1 bg-transparent px-1 text-sm font-semibold text-[#10251f] caret-[#9b762f] outline-none placeholder:text-[#547066]"
            />

            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="rounded-full bg-[#10251f] px-4 py-2.5 text-[9px] font-black uppercase tracking-[.16em] text-white transition hover:bg-[#18392f] disabled:cursor-not-allowed disabled:opacity-45 sm:px-5"
            >
              {loading ? "Finding…" : "Search"}
            </button>
          </form>

          {message && (
            <p className="px-3 pb-1 pt-2 text-[11px] text-[#8a5d44]">{message}</p>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-[500] sm:bottom-5 sm:left-5">
        <div className="rounded-[1.4rem] border border-white/20 bg-[#0b1c15]/90 p-4 text-white shadow-[0_18px_55px_rgba(0,0,0,.20)] backdrop-blur-xl">
          <p className="text-[9px] font-black uppercase tracking-[.22em] text-[#d9b972]">Explore the island</p>
          <p className="mt-1 max-w-[280px] text-xs leading-5 text-white/55">
            Search a place to reveal its exact point on the map.
          </p>

          {searchedPlace && <p className="mt-3 border-t border-white/10 pt-3 text-[10px] font-semibold text-white/45">Location pinned on the map.</p>}
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
        <div className="rounded-full border border-white/15 bg-[#0b1c15]/88 px-3 py-2 text-[9px] font-black uppercase tracking-[.15em] text-white/55 shadow-lg backdrop-blur-xl">
          Search to locate
        </div>
      </div>
    </div>
  );
}
