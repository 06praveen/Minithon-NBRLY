import React, { useEffect, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { HelpRequest, User } from '../../types';
import { RequestPopup } from './RequestPopup';
import { MapLegend } from './MapLegend';
import { Compass } from 'lucide-react';

interface HelpMapProps {
  requests: HelpRequest[];
  currentUser?: User;
  selectedRequestId?: string | null;
  onSelectRequest?: (requestId: string) => void;
  className?: string;
}

// ─── Custom DivIcons for NBRLY ──────────────────────────────

function createRequestMarkerIcon(request: HelpRequest, isSelected: boolean) {
  let bgColor = '#C7F36B'; // NBRLY Lime for FLEXIBLE
  let borderColor = '#171717';
  let innerDotColor = '#171717';

  if (request.urgency === 'URGENT') {
    bgColor = '#FF5C5C'; // Urgent Red
    borderColor = '#171717';
    innerDotColor = '#FFFFFF';
  } else if (request.urgency === 'TODAY') {
    bgColor = '#FBBF24'; // Amber
    borderColor = '#171717';
    innerDotColor = '#171717';
  }

  const selectedClass = isSelected ? 'scale-125 z-50 ring-4 ring-charcoal shadow-lifted' : 'shadow-subtle hover:scale-110';

  const html = `
    <div class="relative flex items-center justify-center transition-all duration-200 ${selectedClass}" style="width: 32px; height: 32px;">
      <div style="
        background-color: ${bgColor};
        border: 2px solid ${borderColor};
        width: 28px;
        height: 28px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.18);
      ">
        <div style="
          width: 8px;
          height: 8px;
          background-color: ${innerDotColor};
          border-radius: 9999px;
        "></div>
      </div>
      <div style="
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 5px solid ${borderColor};
      "></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'nbrly-custom-marker',
    iconSize: [32, 36],
    iconAnchor: [16, 36],
    popupAnchor: [0, -36],
  });
}

const userLocationIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center" style="width: 36px; height: 36px;">
      <div class="absolute w-8 h-8 rounded-full bg-lime/40 animate-ping"></div>
      <div style="
        background-color: #171717;
        border: 2px solid #C7F36B;
        width: 22px;
        height: 22px;
        border-radius: 9999px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      ">
        <div style="width: 6px; height: 6px; background-color: #C7F36B; border-radius: 9999px;"></div>
      </div>
    </div>
  `,
  className: 'nbrly-user-marker',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18],
});

// ─── Sub-component: Bounds Fitting & Camera Controller ───────

interface ControllerProps {
  requests: HelpRequest[];
  userLat?: number | null;
  userLng?: number | null;
  selectedRequestId?: string | null;
}

const MapController: React.FC<ControllerProps> = ({
  requests,
  userLat,
  userLng,
  selectedRequestId,
}) => {
  const map = useMap();
  const initialFitDone = useRef(false);

  // Invalidate size on mount & resize
  useEffect(() => {
    map.invalidateSize();
  }, [map]);

  // Handle selected request focus
  useEffect(() => {
    if (selectedRequestId) {
      const target = requests.find((r) => r.id === selectedRequestId);
      const lat = target?.latitude ?? target?.requester?.latitude;
      const lng = target?.longitude ?? target?.requester?.longitude;
      if (lat && lng) {
        map.flyTo([lat, lng], 15, { duration: 0.8 });
      }
    }
  }, [selectedRequestId, requests, map]);

  // Initial bounds fit on load / filter change
  useEffect(() => {
    const validCoords: [number, number][] = [];

    // Include user location in bounds
    if (userLat && userLng) {
      validCoords.push([userLat, userLng]);
    }

    // Include request coordinates
    requests.forEach((req) => {
      const lat = req.latitude ?? req.requester?.latitude;
      const lng = req.longitude ?? req.requester?.longitude;
      if (lat && lng) {
        validCoords.push([lat, lng]);
      }
    });

    if (validCoords.length > 1 && (!initialFitDone.current || !selectedRequestId)) {
      try {
        const bounds = L.latLngBounds(validCoords);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        initialFitDone.current = true;
      } catch {
        // Fallback
      }
    } else if (validCoords.length === 1 && !selectedRequestId) {
      map.setView(validCoords[0], 14);
      initialFitDone.current = true;
    }
  }, [requests, userLat, userLng, map, selectedRequestId]);

  return null;
};

// ─── Main HelpMap Component ─────────────────────────────────

export const HelpMap: React.FC<HelpMapProps> = ({
  requests,
  currentUser,
  selectedRequestId,
  onSelectRequest,
  className = '',
}) => {
  const mapRef = useRef<L.Map | null>(null);

  // Filter requests with valid coordinates
  const mappableRequests = useMemo(() => {
    return requests.filter((r) => {
      const lat = r.latitude ?? r.requester?.latitude;
      const lng = r.longitude ?? r.requester?.longitude;
      return lat !== undefined && lat !== null && lng !== undefined && lng !== null;
    });
  }, [requests]);

  // User coordinates
  const userLat = currentUser?.latitude;
  const userLng = currentUser?.longitude;

  // Initial Center: user coords > first request coords > Bandra West default
  const defaultCenter: [number, number] = useMemo(() => {
    if (userLat && userLng) return [userLat, userLng];
    if (mappableRequests.length > 0) {
      const first = mappableRequests[0];
      const lat = first.latitude ?? first.requester?.latitude;
      const lng = first.longitude ?? first.requester?.longitude;
      if (lat && lng) return [lat, lng];
    }
    return [19.0596, 72.8295]; // Bandra West center
  }, [userLat, userLng, mappableRequests]);

  const handleRecenter = () => {
    if (mapRef.current) {
      if (userLat && userLng) {
        mapRef.current.flyTo([userLat, userLng], 14, { duration: 0.6 });
      } else if (mappableRequests.length > 0) {
        const coords: [number, number][] = mappableRequests.map((r) => [
          (r.latitude ?? r.requester?.latitude)!,
          (r.longitude ?? r.requester?.longitude)!,
        ]);
        mapRef.current.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
      }
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[380px] bg-paper rounded-panel border border-nbrly-border overflow-hidden shadow-subtle ${className}`}>
      
      {/* Recenter & Quick Action Button */}
      <div className="absolute top-3 right-3 z-20 flex items-center gap-2">
        <button
          onClick={handleRecenter}
          title="Recenter Map"
          className="p-2 bg-white hover:bg-paper text-charcoal border border-nbrly-border rounded-button shadow-subtle transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
        >
          <Compass className="w-4 h-4 text-charcoal" />
          <span className="hidden sm:inline">Recenter</span>
        </button>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-20">
        <MapLegend />
      </div>

      {/* Leaflet Map Container */}
      <MapContainer
        center={defaultCenter}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
        ref={mapRef}
      >
        {/* OpenStreetMap Tile Layer with clean attribution */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Dynamic Camera & Bounds Controller */}
        <MapController
          requests={mappableRequests}
          userLat={userLat}
          userLng={userLng}
          selectedRequestId={selectedRequestId}
        />

        {/* User Location Marker */}
        {userLat && userLng && (
          <Marker
            position={[userLat, userLng]}
            icon={userLocationIcon}
          >
            <Popup>
              <div className="p-3 text-center space-y-1 font-sans">
                <p className="text-xs font-bold font-heading text-charcoal uppercase">YOU ARE HERE</p>
                <p className="text-[11px] text-muted-gray">{currentUser?.locationName || currentUser?.neighborhood || 'Your neighborhood'}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Request Location Markers */}
        {mappableRequests.map((req) => {
          const lat = req.latitude ?? req.requester?.latitude;
          const lng = req.longitude ?? req.requester?.longitude;
          if (!lat || !lng) return null;

          const isSelected = selectedRequestId === req.id;
          const icon = createRequestMarkerIcon(req, isSelected);

          return (
            <Marker
              key={req.id}
              position={[lat, lng]}
              icon={icon}
              eventHandlers={{
                click: () => onSelectRequest?.(req.id),
              }}
            >
              <Popup>
                <RequestPopup request={req} />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
