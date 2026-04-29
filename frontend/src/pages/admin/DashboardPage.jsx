import React, { useEffect, useState, useCallback } from 'react';
import { axiosClient } from '../../api/axiosClient.js';
import toast from 'react-hot-toast';
import { 
  Clock, 
  Check, 
  ChefHat, 
  Utensils, 
  CreditCard, 
  XCircle, 
  AlertCircle,
  Hash,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  ShoppingBag,
  CheckCircle2,
  MoreVertical,
  Bell
} from 'lucide-react';
import { useSocket } from '../../hooks/useSocket.js';

const DashboardPage = () => {
  const [orders, setOrders] = useState([]);
  const [waiterRequests, setWaiterRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newOrderPopup, setNewOrderPopup] = useState(null);
  const socket = useSocket('dashboard');

  const fetchOrders = useCallback(async () => {
    try {
      const response = await axiosClient.get('/orders');
      setOrders(response.data);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    if (!socket) return;

    const playNotification = () => {
      const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
      audio.play().catch(e => console.error('Audio play failed:', e));
    };

    socket.on('order:new', (data) => {
      toast.success(`New order for Table ${data.table.tableNumber}`, {
        duration: 5000,
        icon: '🔔',
      });
      setNewOrderPopup(data);
      playNotification();
      setOrders(prev => [data.order, ...prev]);
    });

    socket.on('waiter:request', (data) => {
      toast(`Table ${data.tableNumber} needs assistance!`, {
        icon: '🔔',
        duration: 10000,
      });
      playNotification();
      setWaiterRequests(prev => [...prev, { ...data, id: Date.now() }]);
    });

    socket.on('order:updated', (data) => {
      setOrders(prev => prev.map(o => o.id === data.order_id ? { ...o, status: data.status } : o));
    });

    socket.on('order:cancelled', (data) => {
      setOrders(prev => prev.map(o => o.id === data.order_id ? { ...o, status: 'cancelled' } : o));
    });

    return () => {
      socket.off('order:new');
      socket.off('waiter:request');
      socket.off('order:updated');
      socket.off('order:cancelled');
    };
  }, [socket]);

  const dismissRequest = (id) => {
    setWaiterRequests(prev => prev.filter(r => r.id !== id));
  };

  const respondToRequest = (request) => {
    if (socket) {
      socket.emit('waiter:responding', { tableId: request.tableId });
      toast.success(`Responding to Table ${request.tableNumber}`);
      dismissRequest(request.id);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await axiosClient.patch(`/orders/${orderId}/status`, { status });
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white rounded-2xl p-6 h-64 shadow-sm border border-slate-100 animate-pulse">
            <div className="flex justify-between items-center mb-6">
              <div className="h-6 w-24 bg-slate-100 rounded-lg"></div>
              <div className="h-6 w-16 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="space-y-3">
              <div className="h-4 w-full bg-slate-50 rounded"></div>
              <div className="h-4 w-3/4 bg-slate-50 rounded"></div>
              <div className="h-4 w-1/2 bg-slate-50 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const activeOrders = orders.filter(o => !['paid', 'cancelled'].includes(o.status));
  
  // Simple stats calculation
  const totalActive = activeOrders.length;
  const pendingCount = activeOrders.filter(o => o.status === 'pending').length;
  const preparingCount = activeOrders.filter(o => o.status === 'preparing').length;

  return (
    <div className="space-y-10">
      {/* Waiter Requests Section */}
      {waiterRequests.length > 0 && (
        <section className="animate-in slide-in-from-top duration-500">
          <div className="flex items-center gap-3 mb-4">
            <Bell className="h-5 w-5 text-orange-600 animate-swing" />
            <h3 className="text-lg font-bold text-slate-800">Assistance Requests</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {waiterRequests.map(request => (
              <div key={request.id} className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center justify-between shadow-sm shadow-orange-100/50">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-orange-600/20">
                    {request.tableNumber}
                  </div>
                  <div>
                    <p className="font-bold text-orange-900 text-sm">Table #{request.tableNumber}</p>
                    <p className="text-orange-600 text-[10px] font-medium uppercase tracking-wider">
                      Needs Help • <TimeAgo date={request.timestamp} />
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => respondToRequest(request)}
                    className="p-2 bg-white text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                    title="Respond"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => dismissRequest(request.id)}
                    className="p-2 text-orange-400 hover:text-orange-600 transition-colors"
                    title="Dismiss"
                  >
                    <XCircle size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* New Order Modal Popup */}
      {newOrderPopup && (
        <NewOrderModal 
          data={newOrderPopup} 
          onClose={() => setNewOrderPopup(null)} 
        />
      )}

      {/* Quick Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard 
          label="Active Orders" 
          value={totalActive} 
          icon={ShoppingBag} 
          color="blue"
          trend="Live now"
        />
        <StatCard 
          label="Pending Approval" 
          value={pendingCount} 
          icon={AlertCircle} 
          color="orange"
          trend={`${Math.round((pendingCount/totalActive || 0) * 100)}% of total`}
        />
        <StatCard 
          label="In Kitchen" 
          value={preparingCount} 
          icon={ChefHat} 
          color="purple"
          trend="Cooking..."
        />
        <StatCard 
          label="Ready to Serve" 
          value={activeOrders.filter(o => o.status === 'served').length} 
          icon={CheckCircle2} 
          color="emerald"
          trend="Ready"
        />
      </section>

      {/* Orders Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Live Orders Pipeline
            <span className="inline-flex items-center justify-center w-6 h-6 bg-slate-100 text-slate-500 rounded-full text-xs font-bold">
              {activeOrders.length}
            </span>
          </h3>
          <div className="flex gap-2">
            <select className="bg-white border border-slate-200 text-slate-600 text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500/50">
              <option>All Tables</option>
            </select>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-20 bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
            <Utensils className="h-12 w-12 mb-4 opacity-20" />
            <p className="text-lg font-medium">Kitchen is quiet. No active orders.</p>
            <p className="text-sm">Incoming orders will appear here in real-time.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
            {activeOrders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onStatusUpdate={updateStatus} 
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, trend }) => {
  const colors = {
    orange: "bg-orange-50 text-orange-600 border-orange-100 shadow-orange-100/20",
    blue: "bg-blue-50 text-blue-600 border-blue-100 shadow-blue-100/20",
    purple: "bg-purple-50 text-purple-600 border-purple-100 shadow-purple-100/20",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100 shadow-emerald-100/20",
  };

  return (
    <div className={`p-6 rounded-3xl border bg-white shadow-sm flex flex-col`}>
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-2xl ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
          {trend}
        </div>
      </div>
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
        <h4 className="text-3xl font-bold text-slate-900">{value}</h4>
      </div>
    </div>
  );
};

const formatTimeAgo = (date) => {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return new Date(date).toLocaleDateString();
};

const TimeAgo = ({ date }) => {
  const [display, setDisplay] = useState(formatTimeAgo(date));

  useEffect(() => {
    const timer = setInterval(() => {
      setDisplay(formatTimeAgo(date));
    }, 60000); // Update every minute
    return () => clearInterval(timer);
  }, [date]);

  return <span>{display}</span>;
};

const OrderCard = ({ order, onStatusUpdate }) => {
  const statusStyles = {
    pending: "bg-orange-50 text-orange-600 border-orange-100",
    confirmed: "bg-blue-50 text-blue-600 border-blue-100",
    preparing: "bg-purple-50 text-purple-600 border-purple-100",
    served: "bg-emerald-50 text-emerald-600 border-emerald-100",
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="h-3.5 w-3.5" />;
      case 'confirmed': return <Check className="h-3.5 w-3.5" />;
      case 'preparing': return <ChefHat className="h-3.5 w-3.5" />;
      default: return <Utensils className="h-3.5 w-3.5" />;
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1">
      {/* Header */}
      <div className="p-5 flex justify-between items-start bg-white border-b border-slate-50">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-slate-200">
            <span className="text-[10px] uppercase font-bold opacity-70">Tbl</span>
            <span className="text-lg font-black leading-none">{order.table.tableNumber}</span>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase border ${statusStyles[order.status] || "bg-slate-50 text-slate-600"}`}>
                {getStatusIcon(order.status)}
                {order.status}
              </span>
            </div>
            <div className="flex items-center text-[11px] text-slate-400 font-medium">
              <Clock className="h-3 w-3 mr-1" />
              <TimeAgo date={order.createdAt} />
            </div>
          </div>
        </div>
        <button className="text-slate-300 hover:text-slate-500 transition-colors p-1">
          <MoreVertical className="h-5 w-5" />
        </button>
      </div>

      {/* Items List */}
      <div className="p-5 flex-1 max-h-60 overflow-y-auto custom-scrollbar">
        <div className="space-y-4">
          {order.items.map(item => (
            <div key={item.id} className="flex justify-between items-start gap-4">
              <div className="flex gap-3">
                <div className="h-6 w-6 bg-slate-50 border border-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600">
                  {item.quantity}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700 leading-tight">
                    {item.menuItem?.name || 'Deleted Item'}
                  </p>
                  {item.note && (
                    <div className="flex items-center gap-1.5 mt-1 text-orange-600">
                      <MessageSquare className="h-3 w-3" />
                      <span className="text-[10px] font-medium leading-none">{item.note}</span>
                    </div>
                  )}
                </div>
              </div>
              <span className="text-sm font-mono font-medium text-slate-400">
                ${(parseFloat(item.unitPrice) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Total */}
      <div className="px-5 py-4 bg-slate-50/50 border-t border-slate-100">
        {order.note && !order.items.some(i => i.note) && (
           <div className="mb-4 p-3 bg-white border border-orange-100 rounded-xl flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-600 italic">"{order.note}"</p>
           </div>
        )}
        
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Grand Total</span>
          <span className="text-xl font-black text-slate-900">
            ${parseFloat(order.totalPrice || 0).toFixed(2)}
          </span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <ActionButton order={order} onUpdate={onStatusUpdate} />
          <button 
            onClick={() => onStatusUpdate(order.id, 'cancelled')}
            className="flex items-center justify-center p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
            title="Cancel Order"
          >
            <XCircle className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const ActionButton = ({ order, onUpdate }) => {
  if (order.status === 'pending') {
    return (
      <button 
        onClick={() => onUpdate(order.id, 'confirmed')} 
        className="flex-1 bg-orange-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
      >
        <Check className="h-4 w-4" />
        <span>Confirm Order</span>
      </button>
    );
  }
  
  if (order.status === 'confirmed') {
    return (
      <button 
        onClick={() => onUpdate(order.id, 'preparing')} 
        className="flex-1 bg-purple-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-purple-600/20 hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
      >
        <ChefHat className="h-4 w-4" />
        <span>Start Preparing</span>
      </button>
    );
  }
  
  if (order.status === 'preparing') {
    return (
      <button 
        onClick={() => onUpdate(order.id, 'served')} 
        className="flex-1 bg-emerald-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
      >
        <Utensils className="h-4 w-4" />
        <span>Mark Served</span>
      </button>
    );
  }
  
  if (order.status === 'served') {
    return (
      <button 
        onClick={() => onUpdate(order.id, 'paid')} 
        className="flex-1 bg-slate-900 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-slate-900/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        <CreditCard className="h-4 w-4" />
        <span>Complete Payment</span>
      </button>
    );
  }

  return null;
};

const NewOrderModal = ({ data, onClose }) => {
  const { order, table } = data;
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden">
        {/* Decorative background */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-orange-100 rounded-full opacity-50 blur-3xl"></div>
        
        <div className="relative">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-16 w-16 bg-orange-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-orange-600/30">
              <ShoppingBag size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 leading-tight">New Order!</h2>
              <p className="text-slate-500 font-medium">Table {table.tableNumber} just placed an order</p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-orange-600 bg-orange-50 w-6 h-6 rounded flex items-center justify-center text-xs">
                      {item.quantity}x
                    </span>
                    <span className="font-semibold text-slate-700">{item.menuItem?.name}</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Value</span>
              <span className="text-xl font-black text-slate-900">${parseFloat(order.totalPrice).toFixed(2)}</span>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-xl shadow-slate-900/20 hover:bg-slate-800 transition-all transform active:scale-[0.98]"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
