import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default markers in React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to fit map bounds to show all markers
function FitBounds({ markers }) {
  const map = useMap();
  
  useEffect(() => {
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, map]);
  
  return null;
}

const FreeMap = ({ userLocation, requests = [], height = '400px' }) => {
  const defaultCenter = userLocation || { lat: 23.8103, lng: 90.4125 }; // Default to Dhaka
  
  // Prepare markers
  const markers = [];
  
  if (userLocation) {
    markers.push({
      lat: userLocation.lat,
      lng: userLocation.lng,
      type: 'user',
      title: 'Your Location',
      address: userLocation.address || 'You are here'
    });
  }
  
  requests.forEach(request => {
    if (request.elderly?.location?.coordinates) {
      const [lng, lat] = request.elderly.location.coordinates;
      markers.push({
        lat,
        lng,
        type: 'request',
        title: request.taskType,
        address: request.elderly.location.address,
        request: request
      });
    }
  });

  return (
    <MapContainer 
      center={[defaultCenter.lat, defaultCenter.lng]} 
      zoom={13} 
      style={{ height, width: '100%', borderRadius: '12px', zIndex: 1 }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      
      <FitBounds markers={markers} />
      
      {markers.map((marker, index) => (
        <Marker 
          key={index} 
          position={[marker.lat, marker.lng]}
        >
          <Popup>
            <div className="p-2">
              <strong>{marker.type === 'user' ? '📍 Your Location' : marker.title}</strong>
              <p className="text-sm mt-1">{marker.address}</p>
              {marker.request && (
                <>
                  <p className="text-sm mt-1">From: {marker.request.elderly?.name}</p>
                  <p className="text-sm">{marker.request.description?.substring(0, 50)}...</p>
                </>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default FreeMap;