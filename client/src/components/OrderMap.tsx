import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useOrderStore } from '../store/orderStore';
import { Order } from '../types/order';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export const OrderMap: React.FC = () => {
  const { orders } = useOrderStore();
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    const handleZoomToOrder = (event: CustomEvent) => {
      const { coordinates } = event.detail;
      if (mapRef.current) {
        mapRef.current.setView(coordinates, 15);
      }
    };

    window.addEventListener('zoomToOrder', handleZoomToOrder as EventListener);
    return () => {
      window.removeEventListener('zoomToOrder', handleZoomToOrder as EventListener);
    };
  }, []);

  // Filter orders that have delivery coordinates
  const deliverableOrders = orders.filter(order => 
    order.delivery && order.delivery.coordinates
  );

  if (deliverableOrders.length === 0) {
    return (
      <div>
        <p>No deliverable orders to display on map</p>
      </div>
    );
  }

  // Calculate center point from first order
  const center = deliverableOrders[0].delivery!.coordinates;

  return (
    <div className="map-container">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100vh', width: '100%' }}
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {deliverableOrders.map(order => (
          <Marker
            key={order.id}
            position={order.delivery!.coordinates}
          >
            <Popup>
              <div>
                <h3>{order.title}</h3>
                <p>{order.delivery!.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}; 