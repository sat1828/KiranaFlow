'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import dynamic from 'next/dynamic';

const TrackingMap = dynamic(() => import('@/components/TrackingMap'), { ssr: false });

interface OrderData {
  orderNumber: string;
  status: string;
  items: Array<{ name: string; qty: number; unit?: string; price?: number }>;
  totalAmount: number;
  paymentMethod: string;
  estimatedDeliveryAt: string | null;
  storeName: string;
  storePhone: string;
  customerName: string;
  driverName: string | null;
  vehicleType: string | null;
  driverLocation: { lat: number; lng: number } | null;
}

const STATUS_STEPS = ['pending', 'confirmed', 'picked_up', 'in_transit', 'delivered'];
const STATUS_LABELS: Record<string, string> = {
  pending: 'Order Received',
  confirmed: 'Confirmed',
  picked_up: 'Picked Up',
  in_transit: 'On the Way',
  delivered: 'Delivered',
};
const STATUS_ICONS: Record<string, string> = {
  pending: '📋',
  confirmed: '✅',
  picked_up: '📦',
  in_transit: '🛵',
  delivered: '🎉',
};

export default function TrackPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [driverPos, setDriverPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const t = document.documentElement.getAttribute('data-theme') as 'light' | 'dark' || 'light';
    setTheme(t);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch {}
  };

  useEffect(() => {
    if (!orderId) return;

    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    fetch(`${API_BASE}/api/track/${orderId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Order not found');
        return res.json();
      })
      .then((data) => {
        setOrder(data.order);
        if (data.order.driverLocation?.lat != null && data.order.driverLocation?.lng != null) {
          setDriverPos({
            lat: data.order.driverLocation.lat,
            lng: data.order.driverLocation.lng,
          });
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    if (!orderId) return;

    let socket: any = null;
    try {
      const { io } = require('socket.io-client');
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      socket = io(API_BASE, { transports: ['websocket', 'polling'] });

      socket.on('connect', () => {
        socket.emit('subscribe:order', orderId);
      });

      socket.on('driver_moved', (data: { lat: number; lng: number; heading: number; speed: number }) => {
        setDriverPos({ lat: data.lat, lng: data.lng });
      });

      socket.on('order_status', (data: { status: string }) => {
        setOrder((prev) => prev ? { ...prev, status: data.status } : prev);
      });
    } catch {}

    return () => {
      if (socket) {
        socket.emit('unsubscribe:order', orderId);
        socket.disconnect();
      }
    };
  }, [orderId]);

  const currentStep = order ? STATUS_STEPS.indexOf(order.status) : 0;
  const isDelivered = order?.status === 'delivered';
  const isCancelled = order?.status === 'cancelled';

  function formatTime(minutes: number): string {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h} hour${h > 1 ? 's' : ''}`;
  }

  if (loading) {
    return (
      <div className="tracking-container">
        <div className="orb-bg"><div className="orb"/><div className="orb"/><div className="orb"/></div>
        <div className="glass-card" style={{ padding: 24 }}>
          <div className="skeleton" style={{ height: 64, width: 64, borderRadius: 18, margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ height: 24, width: '60%', margin: '0 auto 12px' }} />
          <div className="skeleton" style={{ height: 16, width: '40%', margin: '0 auto' }} />
          <div className="skeleton" style={{ height: 80, marginTop: 20 }} />
          <div className="skeleton" style={{ height: 240, marginTop: 16 }} />
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="tracking-container">
        <div className="orb-bg"><div className="orb"/><div className="orb"/><div className="orb"/></div>
        <div className="glass-card error-state">
          <div className="error-icon">😕</div>
          <h2>Order Not Found</h2>
          <p>We couldn&apos;t find this order. Please check the tracking link or contact the store.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>Try Again</button>
        </div>
      </div>
    );
  }

  const defaultStorePos = { lat: 20.5937, lng: 78.9629 };
  const defaultCustomerPos = { lat: 20.6037, lng: 78.9729 };

  return (
    <div className="tracking-container">
      <div className="orb-bg"><div className="orb"/><div className="orb"/><div className="orb"/></div>

      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Store Header */}
      <div className="glass-card store-header">
        <div className="logo">KF</div>
        <h1>{order.storeName}</h1>
        <div className="order-num">{order.orderNumber}</div>
        <div style={{ marginTop: 8 }}>
          <span className={`status-badge ${order.status}`}>
            {STATUS_ICONS[order.status] || '📋'} {STATUS_LABELS[order.status] || order.status}
          </span>
        </div>
      </div>

      {/* Status Timeline - hide if cancelled */}
      {!isCancelled && (
        <div className="glass-card status-timeline">
          <div className="timeline-steps">
            {STATUS_STEPS.filter((s) => s !== 'cancelled').map((step, idx) => {
              const stepIdx = STATUS_STEPS.indexOf(step);
              const isCompleted = idx < currentStep;
              const isActive = idx === currentStep;
              return (
                <div key={step} className={`step ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                  <div className="step-icon">{isCompleted ? '✓' : STATUS_ICONS[step]}</div>
                  <div className="step-label">{STATUS_LABELS[step]}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="glass-card" style={{ padding: 24, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚫</div>
          <h3 style={{ color: 'var(--danger)', marginBottom: 8 }}>Order Cancelled</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>This order has been cancelled.</p>
        </div>
      )}

      {/* ETA */}
      {!isDelivered && !isCancelled && (
        <div className="glass-card eta-section">
          <div className="eta-number">
            {order.status === 'in_transit' ? 'Arriving Soon' : order.estimatedDeliveryAt
              ? formatTime(Math.round((new Date(order.estimatedDeliveryAt).getTime() - Date.now()) / 60000))
              : '~15 min'}
          </div>
          <div className="eta-label">
            {order.status === 'in_transit' ? 'Estimated arrival' : order.status === 'picked_up' ? 'Out for delivery' : 'Preparing your order'}
          </div>
          {order.driverName && (
            <div className="eta-sub">
              {order.driverName} is on the way with your order
            </div>
          )}
        </div>
      )}

      {/* Delivered state */}
      {isDelivered && (
        <div className="glass-card eta-section">
          <div style={{ fontSize: 48, marginBottom: 8 }}>🎉</div>
          <div className="eta-label" style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>
            Delivered Successfully!
          </div>
          <div className="eta-sub">Thank you for ordering from {order.storeName}</div>
        </div>
      )}

      {/* Map */}
      <div className="glass-card map-section">
        <TrackingMap
          storeLocation={defaultStorePos}
          customerLocation={defaultCustomerPos}
          driverLocation={driverPos}
        />
      </div>

      {/* Order Summary */}
      <div className="glass-card order-summary">
        <h3>📋 Order Summary</h3>
        {order.items.map((item, idx) => (
          <div key={idx} className="order-item">
            <span className="item-name">{item.name}</span>
            <span className="item-qty">{item.qty} {item.unit || ''}</span>
            {item.price && <span className="item-price">₹{item.price * item.qty}</span>}
          </div>
        ))}
        <div className="order-total">
          <span>Total</span>
          <span>₹{Number(order.totalAmount).toFixed(2)}</span>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: 'var(--text-muted)' }}>
          Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod?.toUpperCase() || 'COD'}
        </div>
      </div>

      {/* Driver Info */}
      {order.driverName && (
        <div className="glass-card driver-section">
          <div className="driver-avatar">
            {order.driverName.charAt(0).toUpperCase()}
          </div>
          <div className="driver-info">
            <h4>{order.driverName}</h4>
            <p>
              {order.vehicleType === 'motorcycle' ? '🛵' : order.vehicleType === 'bicycle' ? '🚲' : '🚗'}
              {' '}{order.vehicleType || 'motorcycle'}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="action-buttons">
        <a href={`tel:${order.storePhone}`} className="btn btn-primary" style={{ textDecoration: 'none' }}>
          📞 Call Store
        </a>
        <button
          className="btn btn-secondary"
          onClick={() => {
            const url = `https://wa.me/${order.storePhone.replace('+', '')}?text=Hi, I have a question about order ${order.orderNumber}`;
            window.open(url, '_blank');
          }}
        >
          💬 WhatsApp
        </button>
      </div>
    </div>
  );
}
