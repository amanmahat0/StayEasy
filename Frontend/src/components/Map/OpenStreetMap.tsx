import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default marker icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface Props {
  onLocationSelect?: (lat: number, lng: number) => void;
}

// 👇 This handles map click
const LocationPicker = ({ setLat, setLng }: any) => {
  useMapEvents({
    click(e) {
      setLat(e.latlng.lat);
      setLng(e.latlng.lng);
    },
  });

  return null;
};

const PropertyMapPicker = ({ onLocationSelect }: Props) => {
  const [latitude, setLatitude] = useState(27.7172); // default Kathmandu
  const [longitude, setLongitude] = useState(85.324);

  // whenever location changes → send to parent
  const updateLocation = (lat: number, lng: number) => {
    setLatitude(lat);
    setLongitude(lng);

    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <MapContainer
        center={[latitude, longitude]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* OpenStreetMap tiles */}
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Click handler */}
        <LocationPicker setLat={(lat: number) => updateLocation(lat, longitude)} setLng={(lng: number) => updateLocation(latitude, lng)} />

        {/* Marker */}
        <Marker position={[latitude, longitude]} />
      </MapContainer>

      {/* Show selected coordinates */}
      <div style={{ marginTop: "10px" }}>
        <strong>Selected Location:</strong>
        <div>Lat: {latitude.toFixed(6)}</div>
        <div>Lng: {longitude.toFixed(6)}</div>
      </div>
    </div>
  );
};

export default PropertyMapPicker;