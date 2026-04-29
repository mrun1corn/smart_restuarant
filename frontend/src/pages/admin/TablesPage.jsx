import React, { useEffect, useState } from 'react';
import { axiosClient } from '../../api/axiosClient.js';
import toast from 'react-hot-toast';
import { 
  Plus, 
  Download, 
  Trash2, 
  RefreshCw, 
  QrCode, 
  MoreHorizontal, 
  Search,
  LayoutGrid,
  List,
  ExternalLink,
  Loader2,
  AlertCircle
} from 'lucide-react';

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newTableNum, setNewTableNum] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchTables = async () => {
    try {
      const response = await axiosClient.get('/tables');
      setTables(response.data);
    } catch (error) {
      toast.error('Failed to load tables');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async (e) => {
    e.preventDefault();
    if (!newTableNum || isNaN(newTableNum)) {
      toast.error('Please enter a valid table number');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await axiosClient.post('/tables', { tableNumber: parseInt(newTableNum) });
      toast.success('Table added successfully');
      setShowModal(false);
      setNewTableNum('');
      fetchTables();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to add table');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table? All associated data will be removed.')) return;
    try {
      await axiosClient.delete(`/tables/${id}`);
      toast.success('Table removed');
      fetchTables();
    } catch (error) {
      toast.error('Failed to delete table');
    }
  };

  const handleRegenerateQR = async (id) => {
    const loadingToast = toast.loading('Generating new QR Code...');
    try {
      await axiosClient.post(`/tables/${id}/regenerate-qr`);
      toast.success('QR Code updated', { id: loadingToast });
      fetchTables();
    } catch (error) {
      toast.error('Failed to regenerate QR', { id: loadingToast });
    }
  };

  const toggleStatus = async (table) => {
    const newStatus = table.status === 'available' ? 'occupied' : 'available';
    try {
      await axiosClient.put(`/tables/${table.id}`, { status: newStatus });
      toast.success(`Table ${table.tableNumber} is now ${newStatus}`);
      fetchTables();
    } catch (error) {
      toast.error('Failed to update table status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-orange-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Fetching table data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tables Management</h1>
          <p className="text-slate-500 text-sm mt-1">Configure restaurant tables and digital menu access.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-slate-200 rounded-lg p-1 shadow-sm">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={18} />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={18} />
            </button>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-semibold shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]"
          >
            <Plus size={20} />
            <span>Add Table</span>
          </button>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables.length === 0 ? (
            <EmptyState onAdd={() => setShowModal(true)} />
          ) : (
            tables.map(table => (
              <TableCard 
                key={table.id} 
                table={table} 
                onDelete={handleDelete} 
                onRegenerate={handleRegenerateQR}
                onToggleStatus={() => toggleStatus(table)}
              />
            ))
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && tables.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Table</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">QR Access</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {tables.map(table => (
                <tr key={table.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-bold">
                        {table.tableNumber}
                      </div>
                      <span className="font-semibold text-slate-700">Table #{table.tableNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={table.status} onClick={() => toggleStatus(table)} />
                  </td>
                  <td className="px-6 py-4">
                    {table.qrCodeUrl ? (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <QrCode size={16} className="text-orange-500" />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <span className="text-slate-300 text-sm italic">Pending...</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleRegenerateQR(table.id)} className="p-2 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg" title="Regenerate QR">
                        <RefreshCw size={18} />
                      </button>
                      <button onClick={() => handleDelete(table.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
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

      {/* Add Table Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Add New Table</h2>
            <p className="text-slate-500 text-sm mb-6">Enter a table number to generate a new QR access point.</p>
            
            <form onSubmit={handleAddTable} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Table Number</label>
                <input 
                  type="number"
                  autoFocus
                  required
                  value={newTableNum}
                  onChange={(e) => setNewTableNum(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all"
                  placeholder="e.g. 12"
                />
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
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TableCard = ({ table, onDelete, onRegenerate, onToggleStatus }) => {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/40 hover:-translate-y-1">
      <div className="p-6 flex-1 flex flex-col items-center text-center">
        <div className="h-16 w-16 bg-slate-900 rounded-2xl flex flex-col items-center justify-center text-white shadow-lg shadow-slate-200 mb-4 group-hover:scale-110 transition-transform">
          <span className="text-[10px] uppercase font-bold opacity-70">Tbl</span>
          <span className="text-2xl font-black leading-none">{table.tableNumber}</span>
        </div>
        
        <h3 className="font-bold text-slate-800 mb-1">Table #{table.tableNumber}</h3>
        <StatusBadge status={table.status} onClick={onToggleStatus} />
        
        <div className="mt-6 w-full flex flex-col gap-3">
          <a 
            href={`/menu/table/${table.id}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-50 text-slate-600 text-sm font-semibold rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-100"
          >
            <ExternalLink size={16} />
            <span>View Menu</span>
          </a>
          
          {table.qrCodeUrl ? (
            <a 
              href={table.qrCodeUrl} 
              download={`table-${table.tableNumber}-qr.png`}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Download size={16} />
              <span>Download QR</span>
            </a>
          ) : (
            <button 
              onClick={() => onRegenerate(table.id)}
              className="flex items-center justify-center gap-2 w-full py-2.5 bg-white border border-slate-200 text-slate-400 text-sm font-semibold rounded-xl"
            >
              <Loader2 size={16} className="animate-spin" />
              <span>Generating...</span>
            </button>
          )}
        </div>
      </div>
      
      <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
        <button 
          onClick={() => onRegenerate(table.id)}
          className="text-slate-400 hover:text-orange-600 transition-colors p-1"
          title="Regenerate QR"
        >
          <RefreshCw size={18} />
        </button>
        <button 
          onClick={() => onDelete(table.id)}
          className="text-slate-400 hover:text-red-500 transition-colors p-1"
          title="Delete Table"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </div>
  );
};

const StatusBadge = ({ status, onClick }) => {
  const styles = {
    available: "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100",
    occupied: "bg-orange-50 text-orange-600 border-orange-100 hover:bg-orange-100",
    reserved: "bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100",
  };

  return (
    <button 
      onClick={onClick}
      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border transition-colors cursor-pointer ${styles[status] || "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </button>
  );
};

const EmptyState = ({ onAdd }) => (
  <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border-2 border-dashed border-slate-100 text-slate-400">
    <QrCode className="h-16 w-16 mb-4 opacity-10" />
    <p className="text-xl font-bold text-slate-800">No Tables Configured</p>
    <p className="text-slate-500 mt-1 mb-6 text-center max-w-xs">Start by adding your first table to generate a QR code for your customers.</p>
    <button 
      onClick={onAdd}
      className="bg-orange-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-orange-600/20 hover:bg-orange-700 transition-all"
    >
      Add First Table
    </button>
  </div>
);

export default TablesPage;
