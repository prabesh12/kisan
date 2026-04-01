import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { X, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      if (map && routingControl) {
        try {
          // Set waypoints to empty to cancel pending requests
          routingControl.setWaypoints([]);
          map.removeControl(routingControl);
        } catch (e) {
          console.warn('Routing cleanup error:', e);
        }
      }
    };
  }, [map, buyerLat, buyerLng, sellerLat, sellerLng]);

  return null;
};

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, lat, lng, title, locationName, buyerLat, buyerLng }) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col h-[85vh] max-h-[900px]">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-primary-50 rounded-2xl text-primary-600">
              <MapPin size={24} />
            </div>
            <div>
              <h3 className="font-black text-gray-900 leading-tight text-xl">{title}</h3>
              {locationName && <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">{locationName}</p>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-3 hover:bg-gray-100 rounded-2xl transition-colors transition-transform active:scale-90 bg-gray-50"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        <div className="flex-1 w-full bg-gray-100 relative min-h-0">
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
                {title} ({t('product.seller') || 'Seller'})
              </Popup>
            </Marker>
            
            {buyerLat && buyerLng && (
              <Marker position={[buyerLat, buyerLng]}>
                <Popup className="font-bold font-sans">
                  {t('product.yourLocation')}
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
        
        <div className="p-6 bg-white border-t border-gray-100 flex items-center justify-between gap-4 shrink-0">
          <a
            href={
              buyerLat && buyerLng
                ? `https://www.google.com/maps/dir/?api=1&origin=${buyerLat},${buyerLng}&destination=${lat},${lng}`
                : `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-3 bg-primary-600 text-white font-black px-8 py-4 rounded-2xl shadow-xl shadow-primary-200 hover:bg-primary-700 transition-all active:scale-95 flex-1 text-lg"
          >
            <MapPin size={20} />
            <span>{t('product.navigateMaps')}</span>
          </a>
          <button 
            onClick={onClose}
            className="bg-gray-100 text-gray-700 font-bold px-10 py-4 rounded-2xl hover:bg-gray-200 transition-all active:scale-95"
          >
            {t('product.close')}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default MapModal;
