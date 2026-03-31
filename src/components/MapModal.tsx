import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
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
}

const MapModal: React.FC<MapModalProps> = ({ isOpen, onClose, lat, lng, title, locationName }) => {
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
            center={[lat, lng]}
            zoom={15}
            scrollWheelZoom={true}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
              <Popup className="font-bold font-sans">
                {title}
              </Popup>
            </Marker>
          </MapContainer>
        </div>
        
        <div className="p-4 bg-gray-50 text-center">
          <button 
            onClick={onClose}
            className="bg-primary-600 text-white font-bold px-8 py-2.5 rounded-xl shadow-lg hover:bg-primary-700 transition-all active:scale-95"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
