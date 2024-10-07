'use client'
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useState } from "react";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationPicker({ setLatitude, setLongitude }: { setLatitude: any, setLongitude: any }) {
  const [position, setPosition] = useState(null);

  const map = useMapEvents({
    click(e: any) {
      const { lat, lng } = e.latlng;
      setPosition(e.latlng);
      setLatitude(lat);
      setLongitude(lng);
    },
  });

  return position === null ? null : <Marker position={position} icon={markerIcon}></Marker>;
}

function MapInput({ setLatitude, setLongitude }: { setLatitude: any, setLongitude: any }) {
  return (
    <div>
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "400px", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <LocationPicker setLatitude={setLatitude} setLongitude={setLongitude} />
      </MapContainer>
    </div>
  );
}

export default function Home() {
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [notificationTime, setNotificationTime] = useState("exact");
  const [status, setStatus] = useState<'pending' | 'success' | 'error' | null>(null);
  const [responseData, setResponseData] = useState(null);

  const StatusModal = () => {
    if (status === 'pending') {
      return <div className="modal">Request is pending...</div>;
    } else if (status === 'success') {
      return <div className="modal">Request succeeded! Data: {JSON.stringify(responseData)}</div>;
    } else if (status === 'error') {
      return <div className="modal">Request failed. Please try again.</div>;
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('pending');

    const data = {
      latitude,
      longitude,
      notificationTime,
    };

    try {
      const response = await fetch("/api/notify_me", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setResponseData(result);
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Satellite Notification Service</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="latitude" className="block font-medium mb-2">
            Latitude
          </label>
          <input
            id="latitude"
            type="text"
            value={latitude}
            onChange={(e) => setLatitude(e.target.value)}
            className="border border-gray-300 p-2 w-full"
            placeholder="Enter Latitude"
            required
          />
        </div>
        <div>
          <label htmlFor="longitude" className="block font-medium mb-2">
            Longitude
          </label>
          <input
            id="longitude"
            type="text"
            value={longitude}
            onChange={(e) => setLongitude(e.target.value)}
            className="border border-gray-300 p-2 w-full"
            placeholder="Enter Longitude"
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-2">Notify Me</label>
          <select
            value={notificationTime}
            onChange={(e) => setNotificationTime(e.target.value)}
            className="border border-gray-300 p-2 w-full"
          >
            <option value="exact">At pass time</option>
            <option value="1_hour_before">1 hour before</option>
            <option value="6_hours_before">6 hours before</option>
            <option value="1_day_before">1 day before</option>
          </select>
        </div>
        <MapInput setLatitude={setLatitude} setLongitude={setLongitude} />
        <div>
          <p>Selected Latitude: {latitude}</p>
          <p>Selected Longitude: {longitude}</p>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white p-2 rounded mt-4 hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
      {status && <StatusModal />}
    </div>
  );
}
