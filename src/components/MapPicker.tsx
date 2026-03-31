import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';

// Fix for default Leaflet icon issue with Vite/Webpack
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
  initialCenter: { lat: number; lng: number };
  onLocationSelect: (lat: number, lng: number) => void;
}

const LocationMarker = ({ position, setPosition, onLocationSelect }: any) => {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });

  return position ? <Marker position={position} /> : null;
};

const ChangeView = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

const MapPicker: React.FC<MapPickerProps> = ({ initialCenter, onLocationSelect }) => {
  const [position, setPosition] = useState<[number, number]>([initialCenter.lat, initialCenter.lng]);

  return (
    <div className="h-[300px] w-full rounded-2xl overflow-hidden border-2 border-gray-100 shadow-inner relative z-10">
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={[initialCenter.lat, initialCenter.lng]} />
        <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
      </MapContainer>
      <div className="absolute bottom-2 left-2 z-[1000] bg-white/80 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold text-gray-500 pointer-events-none">
        Click on map to set location
      </div>
    </div>
  );
};

export default MapPicker;
