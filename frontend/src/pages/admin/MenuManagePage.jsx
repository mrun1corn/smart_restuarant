import React, { useEffect, useState } from 'react';
import { axiosClient } from '../../api/axiosClient.js';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ChefHat, 
  Search, 
  Filter, 
  Image as ImageIcon,
  Loader2,
  DollarSign,
  Check,
  X,
  MoreVertical,
  ExternalLink
} from 'lucide-react';

const MenuManagePage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    imageUrl: '',
    isAvailable: true
  });

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        axiosClient.get('/menu'),
        axiosClient.get('/categories')
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
    } catch (error) {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price)
      };

      if (editingId) {
        await axiosClient.put(`/menu/${editingId}`, payload);
        toast.success('Item updated');
      } else {
        await axiosClient.post('/menu', payload);
        toast.success('Item created');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      imageUrl: '',
      isAvailable: true
    });
    setEditingId(null);
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      categoryId: item.categoryId || '',
      imageUrl: item.imageUrl || '',
      isAvailable: item.isAvailable
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await axiosClient.delete(`/menu/${id}`);
      toast.success('Item deleted');
      fetchData();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await axiosClient.put(`/menu/${item.id}`, {
        ...item,
        price: parseFloat(item.price),
        isAvailable: !item.isAvailable
      });
      setItems(items.map(i => i.id === item.id ? { ...i, isAvailable: !item.isAvailable } : i));
      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
    } catch (error) {
      toast.error('Failed to update availability');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.categoryId === filterCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading your menu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Menu Management</h1>
          <p className="text-slate-500 text-sm mt-1">Add, edit, and organize your delicious offerings.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-5 w-5" />
          <input 
            type="text" 
            placeholder="Search items by name..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all shadow-sm"
          />
        </div>
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-2xl px-4 py-2 shadow-sm shrink-0">
          <Filter className="text-slate-400 h-4 w-4" />
          <select 
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-transparent text-sm font-semibold text-slate-600 outline-none pr-4"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.length === 0 ? (
          <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
            <ChefHat className="h-12 w-12 mb-4 opacity-10" />
            <p className="text-lg font-medium text-slate-800">No items found</p>
            <p className="text-sm mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredItems.map(item => (
            <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1">
              {/* Image Placeholder/Thumbnail */}
              <div className="h-40 bg-slate-50 relative flex items-center justify-center overflow-hidden border-b border-slate-50">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="flex flex-col items-center text-slate-300">
                    <ImageIcon size={40} className="mb-2 opacity-20" />
                    <span className="text-[10px] uppercase font-bold tracking-widest">No Image</span>
                  </div>
                )}
                
                <div className="absolute top-3 left-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase backdrop-blur-md border ${
                    item.isAvailable ? 'bg-emerald-50/80 text-emerald-600 border-emerald-100/50' : 'bg-red-50/80 text-red-600 border-red-100/50'
                  }`}>
                    {item.isAvailable ? 'Available' : 'Sold Out'}
                  </span>
                </div>
                
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex gap-1.5">
                    <button onClick={() => handleEdit(item)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-slate-600 hover:text-orange-600 transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-white/90 backdrop-blur rounded-lg shadow-sm text-slate-600 hover:text-red-600 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2 gap-2">
                  <h3 className="font-bold text-slate-800 leading-tight">{item.name}</h3>
                  <span className="text-orange-600 font-mono font-black text-lg">
                    ${parseFloat(item.price).toFixed(2)}
                  </span>
                </div>
                
                <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">
                  {item.description || 'No description provided.'}
                </p>
                
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {item.category?.name || 'Uncategorized'}
                  </span>
                  
                  <button 
                    onClick={() => toggleAvailability(item)}
                    className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                      item.isAvailable ? 'text-slate-400 hover:text-red-500 hover:bg-red-50' : 'text-emerald-600 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    {item.isAvailable ? <X size={12} /> : <Check size={12} />}
                    {item.isAvailable ? 'Mark Sold Out' : 'Mark Available'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Item Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {editingId ? "Edit Item" : "Create New Item"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Details for your menu item. Images can be added via URL.
            </p>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Name</label>
                <input 
                  type="text" required autoFocus
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="e.g. Wagyu Beef Burger"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Price ($)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                  <input 
                    type="number" step="0.01" required
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                <select 
                  required
                  value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all appearance-none"
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Image URL</label>
                <input 
                  type="url"
                  value={formData.imageUrl} onChange={e => setFormData({...formData, imageUrl: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea 
                  rows="3"
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all resize-none"
                  placeholder="Tell customers about this dish..."
                />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2 px-1">
                <input 
                  type="checkbox" id="isAvailable"
                  checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})}
                  className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-slate-600">Mark as currently available</label>
              </div>
              
              <div className="sm:col-span-2 flex gap-3 mt-2">
                <button 
                  type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? "Save Changes" : "Add to Menu")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagePage;
