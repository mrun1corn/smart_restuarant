import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosClient } from '../../api/axiosClient';
import { useCartStore } from '../../store/cartStore';
import { useSocket } from '../../hooks/useSocket';
import toast from 'react-hot-toast';
import { ShoppingCart, Plus, Minus, X, UtensilsCrossed, Bell } from 'lucide-react';

const MenuPage = () => {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tableInfo, setTableInfo] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orderNote, setOrderNote] = useState('');
  const [placingOrder, setPlacingOrder] = useState(false);
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  
  const { items, addItem, removeItem, updateQuantity, getTotalPrice, clearCart } = useCartStore();
  const socket = useSocket(tableId, true);

  useEffect(() => {
    if (!socket) return;

    socket.on('order:ready', (data) => {
      toast.success(`Order for Table #${tableInfo?.tableNumber} is ready! Please collect it from the counter.`, {
        duration: 10000,
        icon: '🔔',
      });
    });

    socket.on('waiter:responding', () => {
      toast.success('A waiter is on their way!', { icon: '🏃' });
    });

    return () => {
      socket.off('order:ready');
      socket.off('waiter:responding');
    };
  }, [socket, tableInfo]);

  useEffect(() => {
    const fetchMenuAndTable = async () => {
      try {
        // First verify table
        const tableRes = await axiosClient.get(`/tables/${tableId}`);
        setTableInfo(tableRes.data);
        
        // Then fetch menu and categories
        const [menuRes, catRes] = await Promise.all([
          axiosClient.get('/menu'),
          axiosClient.get('/categories')
        ]);
        
        setMenuItems(menuRes.data.filter(item => item.isAvailable));
        setCategories([{ id: 'all', name: 'All' }, ...catRes.data.sort((a,b) => a.sortOrder - b.sortOrder)]);
      } catch (error) {
        toast.error('Failed to load menu or invalid table');
      } finally {
        setLoading(false);
      }
    };
    fetchMenuAndTable();
  }, [tableId]);

  const handleCallWaiter = () => {
    if (!socket || !tableInfo) return;
    setIsCallingWaiter(true);
    socket.emit('waiter:call', { 
      tableId: tableInfo.id, 
      tableNumber: tableInfo.tableNumber 
    });
    toast.success('Waiter called. Please wait.');
    setTimeout(() => setIsCallingWaiter(false), 30000); // Prevent spamming
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setPlacingOrder(true);
    try {
      const { data } = await axiosClient.post('/orders', {
        table_id: tableId,
        note: orderNote,
        items: items
      });
      clearCart();
      setIsCartOpen(false);
      navigate('/order/success', { state: { orderId: data.order_id, tableId } });
    } catch (error) {
      toast.error('Failed to place order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const filteredItems = activeCategory === 'all' 
    ? menuItems 
    : menuItems.filter(item => item.categoryId === activeCategory);

  if (loading) return <div className="p-8 text-center">Loading menu...</div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-800">Our Menu</h1>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleCallWaiter}
              disabled={isCallingWaiter}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                isCallingWaiter 
                ? 'bg-orange-100 text-orange-600' 
                : 'bg-gray-100 text-gray-600 hover:bg-orange-50 hover:text-orange-600'
              }`}
            >
              <Bell size={18} className={isCallingWaiter ? 'animate-bounce' : ''} />
              <span className="hidden sm:inline">{isCallingWaiter ? 'Calling...' : 'Call Waiter'}</span>
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-600 hover:text-blue-600"
            >
              <ShoppingCart size={24} />
              {items.length > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {items.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="flex overflow-x-auto hide-scrollbar border-t border-gray-100">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-3 whitespace-nowrap font-medium text-sm transition-colors ${
                activeCategory === cat.id 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </header>

      {/* Menu Grid */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-sm p-4 flex gap-4">
              {item.imageUrl ? (
                <div className="w-24 h-24 rounded-lg bg-gray-200 overflow-hidden flex-shrink-0">
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400">
                  <UtensilsCrossed size={32} />
                </div>
              )}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-800">{item.name}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1">{item.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-bold text-blue-600">${parseFloat(item.price).toFixed(2)}</span>
                  <button 
                    onClick={() => {
                      addItem(item);
                      toast.success(`Added ${item.name} to cart`);
                    }}
                    className="bg-gray-100 hover:bg-blue-50 text-blue-600 p-2 rounded-full transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-50">
          <div className="w-full max-w-md bg-white h-full shadow-xl flex flex-col animate-slide-left">
            <div className="flex justify-between items-center p-4 border-b border-gray-100">
              <h2 className="text-lg font-bold">Your Order</h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="text-center text-gray-500 py-12">Your cart is empty</div>
              ) : (
                items.map(item => (
                  <div key={item.menu_item_id} className="flex flex-col border-b border-gray-50 pb-4">
                    <div className="flex justify-between font-medium">
                      <span>{item.name}</span>
                      <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center space-x-3 bg-gray-100 rounded-lg p-1">
                        <button onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)} className="p-1 rounded bg-white shadow-sm text-gray-600">
                          <Minus size={14} />
                        </button>
                        <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)} className="p-1 rounded bg-white shadow-sm text-gray-600">
                          <Plus size={14} />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item.menu_item_id)} className="text-xs text-red-500 hover:underline">Remove</button>
                    </div>
                  </div>
                ))
              )}
              
              {items.length > 0 && (
                <div className="pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order Note (Optional)</label>
                  <textarea 
                    className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                    rows="2"
                    placeholder="Any allergies or special requests?"
                    value={orderNote}
                    onChange={(e) => setOrderNote(e.target.value)}
                  ></textarea>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <div className="flex justify-between items-center font-bold text-lg mb-4">
                <span>Total</span>
                <span>${getTotalPrice().toFixed(2)}</span>
              </div>
              <button 
                onClick={handlePlaceOrder}
                disabled={items.length === 0 || placingOrder}
                className={`w-full py-3 rounded-lg font-bold text-white transition-colors ${
                  items.length === 0 || placingOrder ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {placingOrder ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
