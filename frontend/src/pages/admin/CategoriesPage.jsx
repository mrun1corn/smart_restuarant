import React, { useEffect, useState } from "react";
import { axiosClient } from "../../api/axiosClient.js";
import toast from "react-hot-toast";
import { 
  Plus, 
  Trash2, 
  Edit2, 
  Tags, 
  ArrowUpDown, 
  Loader2, 
  MoreVertical,
  ChevronRight,
  GripVertical
} from "lucide-react";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", sortOrder: "0" });
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const response = await axiosClient.get("/categories");
      setCategories(response.data.sort((a, b) => a.sortOrder - b.sortOrder));
    } catch (error) {
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingId) {
        await axiosClient.put(`/categories/${editingId}`, {
          ...formData,
          sortOrder: parseInt(formData.sortOrder)
        });
        toast.success("Category updated");
      } else {
        await axiosClient.post("/categories", {
          ...formData,
          sortOrder: parseInt(formData.sortOrder)
        });
        toast.success("Category created");
      }
      setShowModal(false);
      resetForm();
      fetchCategories();
    } catch (error) {
      toast.error("Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", sortOrder: "0" });
    setEditingId(null);
  };

  const handleEdit = (cat) => {
    setEditingId(cat.id);
    setFormData({ name: cat.name, sortOrder: cat.sortOrder.toString() });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete category? Items in this category will become uncategorized.")) return;
    try {
      await axiosClient.delete(`/categories/${id}`);
      toast.success("Category deleted");
      fetchCategories();
    } catch (error) {
      toast.error("Delete failed");
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Loading categories...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Menu Categories</h1>
          <p className="text-slate-500 text-sm mt-1">Organize your menu items into logical groups.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setShowModal(true); }} 
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]"
        >
          <Plus size={20} />
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Content */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-slate-400">
            <Tags className="h-12 w-12 mb-4 opacity-10" />
            <p className="text-lg font-medium text-slate-800">No Categories Found</p>
            <p className="text-sm mt-1">Create categories to start organizing your menu.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest w-16 text-center">Order</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Category Name</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Linked Items</th>
                  <th className="px-8 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {categories.map((cat, index) => (
                  <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                         <div className="h-8 w-8 bg-slate-50 rounded-lg flex items-center justify-center text-xs font-bold text-slate-400 border border-slate-100">
                           {cat.sortOrder}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                          <Tags size={20} />
                        </div>
                        <span className="font-bold text-slate-700">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-slate-500 text-sm">
                      <span className="bg-slate-100 px-2.5 py-1 rounded-full text-xs font-medium">
                        {cat.items?.length || 0} items
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Category Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              {editingId ? "Edit Category" : "Add New Category"}
            </h2>
            <p className="text-slate-500 text-sm mb-6">
              Organize your menu by grouping related items together.
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Category Name</label>
                <input 
                  type="text" 
                  required 
                  autoFocus
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="e.g. Starters" 
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <ArrowUpDown size={14} className="text-slate-400" />
                  Sort Order
                </label>
                <input 
                  type="number" 
                  value={formData.sortOrder} 
                  onChange={e => setFormData({...formData, sortOrder: e.target.value})} 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="0"
                />
                <p className="text-[10px] text-slate-400 mt-2 italic px-1">Lower numbers appear first in the customer menu.</p>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowModal(false)} 
                  className="flex-1 py-3 px-4 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 bg-orange-600 text-white font-semibold rounded-xl shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : (editingId ? "Update" : "Create")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
