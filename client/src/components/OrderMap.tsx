import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useOrderStore } from '../store/orderStore';
import { Order } from '../types/order';

// Fix for default marker icons in react-leaflet
import L from 'leaflet';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export const OrderMap: React.FC = () => {
  const { orders } = useOrderStore();

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
    <div>
      <div style={{ height: '100vh', width: '100%' }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ height: '100%', width: '100%' }}
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
    </div>
  );
}; 