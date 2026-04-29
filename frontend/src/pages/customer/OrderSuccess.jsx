import React, { useEffect, useState } from 'react';
import { CheckCircle2, Clock, ChefHat, Utensils, Check, XCircle } from 'lucide-react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const OrderSuccess = () => {
  const [orderStatus, setOrderStatus] = useState('pending');
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      setConnected(true);
      console.log('Connected to order tracking');
    });

    socket.on('order:updated', (data) => {
      // In a real app, we'd check if data.order_id matches the current order
      // For this prototype, we'll update the status for demonstration
      setOrderStatus(data.status);
    });

    socket.on('order:cancelled', () => {
      setOrderStatus('cancelled');
    });

    return () => socket.disconnect();
  }, []);

  const getStatusDetails = () => {
    switch (orderStatus) {
      case 'pending':
        return {
          icon: Clock,
          color: 'text-orange-500',
          bg: 'bg-orange-100',
          title: 'Order Received',
          desc: 'Waiting for the kitchen to confirm your order.'
        };
      case 'confirmed':
        return {
          icon: Check,
          color: 'text-blue-500',
          bg: 'bg-blue-100',
          title: 'Confirmed',
          desc: 'The kitchen has accepted your order!'
        };
      case 'preparing':
        return {
          icon: ChefHat,
          color: 'text-purple-500',
          bg: 'bg-purple-100',
          title: 'Preparing',
          desc: 'Our chefs are cooking your meal now.'
        };
      case 'served':
        return {
          icon: Utensils,
          color: 'text-emerald-500',
          bg: 'bg-emerald-100',
          title: 'Served',
          desc: 'Enjoy your meal! It should be at your table.'
        };
      case 'paid':
        return {
          icon: CheckCircle2,
          color: 'text-slate-900',
          bg: 'bg-slate-100',
          title: 'Completed',
          desc: 'Thank you for dining with us!'
        };
      case 'cancelled':
        return {
          icon: XCircle,
          color: 'text-red-500',
          bg: 'bg-red-100',
          title: 'Cancelled',
          desc: 'Your order has been cancelled. Please see staff.'
        };
      default:
        return {
          icon: Clock,
          color: 'text-gray-500',
          bg: 'bg-gray-100',
          title: 'Processing',
          desc: 'Updating your order status...'
        };
    }
  };

  const status = getStatusDetails();
  const StatusIcon = status.icon;

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[32px] shadow-2xl shadow-slate-200/50 p-10 text-center relative overflow-hidden">
        {/* Animated pulse for connection */}
        <div className={`absolute top-4 right-4 flex items-center gap-1.5`}>
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            {connected ? 'Live Tracking' : 'Connecting...'}
          </span>
        </div>

        <div className={`w-20 h-20 ${status.bg} ${status.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner`}>
          <StatusIcon size={40} />
        </div>

        <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{status.title}</h2>
        <p className="text-slate-500 font-medium leading-relaxed mb-10">
          {status.desc}
        </p>

        {/* Progress Tracker */}
        <div className="flex justify-between items-center relative px-2">
          <div className="absolute left-0 right-0 h-0.5 bg-slate-100 -z-10 top-1/2 -translate-y-1/2"></div>
          <Step active={['pending', 'confirmed', 'preparing', 'served', 'paid'].includes(orderStatus)} />
          <Step active={['confirmed', 'preparing', 'served', 'paid'].includes(orderStatus)} />
          <Step active={['preparing', 'served', 'paid'].includes(orderStatus)} />
          <Step active={['served', 'paid'].includes(orderStatus)} />
        </div>

        <div className="mt-12 pt-8 border-t border-slate-50">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-2">Need help?</p>
          <button className="text-sm font-bold text-slate-900 hover:text-orange-600 transition-colors">
            Call a Waiter
          </button>
        </div>
      </div>
    </div>
  );
};

const Step = ({ active }) => (
  <div className={`w-3 h-3 rounded-full border-2 border-white ring-4 ${active ? 'bg-orange-600 ring-orange-100' : 'bg-slate-200 ring-slate-50'} transition-all duration-500`}></div>
);

export default OrderSuccess;
