import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { X, MapPin } from 'lucide-react';

// Fix for default Leaflet icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
  lat: number;
  lng: number;
  title: string;
  locationName?: string;
  buyerLat?: number;
  buyerLng?: number;
}

const RoutingMachine = ({ buyerLat, buyerLng, sellerLat, sellerLng }: { buyerLat: number, buyerLng: number, sellerLat: number, sellerLng: number }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    
    // @ts-ignore - leaflet-routing-machine adds routing to L
    const plan = (L.Routing as any).plan([
      L.latLng(buyerLat, buyerLng),
      L.latLng(sellerLat, sellerLng)
    ], {
      createMarker: () => null
    });

    // @ts-ignore
    const routingControl = L.Routing.control({
      plan,
      routeWhileDragging: false,
      addWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
      lineOptions: {
        styles: [{ color: '#0ea5e9', weight: 5, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      }
    }).addTo(map);

    return () => {
      try {
        if (map && routingControl) {
          map.removeControl(routingControl);
        }
      } catch (e) {
        console.error(e);
      }
    };
  }, [map, buyerLat, buyerLng, sellerLat, sellerLng]);

  return null;
};

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, lat, lng, title, locationName, buyerLat, buyerLng }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-100 rounded-xl text-primary-600">
              <MapPin size={20} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 leading-tight">{title}</h3>
              {locationName && <p className="text-xs text-gray-500 font-medium">{locationName}</p>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors transition-transform active:scale-90"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <div className="h-[400px] w-full">
          <MapContainer
            center={buyerLat && buyerLng ? [(lat + buyerLat) / 2, (lng + buyerLng) / 2] : [lat, lng]}
            zoom={buyerLat && buyerLng ? 12 : 15}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup className="font-bold font-sans">
                {title} (Seller)
              </Popup>
            </Marker>
            
            {buyerLat && buyerLng && (
              <Marker position={[buyerLat, buyerLng]}>
                <Popup className="font-bold font-sans">
                  Your Location
                </Popup>
              </Marker>
            )}

            {buyerLat && buyerLng && (
              <RoutingMachine 
                buyerLat={buyerLat} 
                buyerLng={buyerLng} 
                sellerLat={lat} 
                sellerLng={lng} 
              />
            )}
          </MapContainer>
        </div>
        
        <div className="p-4 bg-gray-50 flex items-center justify-between gap-4">
          <a
            href={
              buyerLat && buyerLng
                ? `https://www.google.com/maps/dir/?api=1&origin=${buyerLat},${buyerLng}&destination=${lat},${lng}`
                : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 bg-white border-2 border-primary-200 text-primary-700 font-bold px-6 py-2.5 rounded-xl shadow-sm hover:bg-primary-50 transition-all active:scale-95 flex-1"
          >
            <MapPin size={18} />
            <span>Open in Google Maps</span>
          </a>
          <button 
            onClick={onClose}
            className="bg-gray-200 text-gray-700 font-bold px-8 py-2.5 rounded-xl hover:bg-gray-300 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
