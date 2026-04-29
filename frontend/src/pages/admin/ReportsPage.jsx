import React, { useEffect, useState } from 'react';
import { axiosClient } from '../../api/axiosClient.js';
import toast from 'react-hot-toast';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Target,
  Calendar,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

const ReportsPage = () => {
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [salesRes, invRes] = await Promise.all([
        axiosClient.get('/reports/sales'),
        axiosClient.get('/reports/inventory')
      ]);
      setSalesData(salesRes.data);
      setInventoryData(invRes.data);
    } catch (error) {
      toast.error('Failed to load financial reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Generating financial insights...</p>
      </div>
    );
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#10b981'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance & Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Detailed overview of your restaurant's financial performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ReportCard 
          label="Total Revenue" 
          value={`$${salesData?.summary.totalRevenue.toLocaleString()}`} 
          icon={DollarSign} 
          color="blue"
        />
        <ReportCard 
          label="Total Orders" 
          value={salesData?.summary.totalOrders} 
          icon={ShoppingBag} 
          color="purple"
        />
        <ReportCard 
          label="Avg. Order Value" 
          value={`$${salesData?.summary.averageOrderValue}`} 
          icon={Target} 
          color="emerald"
        />
        <ReportCard 
          label="Growth" 
          value="+12.5%" 
          icon={TrendingUp} 
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue Trend Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Revenue Trend (Daily)</h3>
            <Calendar className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={salesData?.trends.daily}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Line 
                  type="monotone" 
                  dataKey="amount" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Items Chart */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-800">Best Selling Items</h3>
            <ArrowUpRight className="h-5 w-5 text-slate-400" />
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={inventoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="name" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#64748b', fontSize: 12, fontWeight: 600}}
                  width={120}
                />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                />
                <Bar dataKey="quantity" radius={[0, 8, 8, 0]} barSize={20}>
                  {inventoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportCard = ({ label, value, icon: Icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 rounded-2xl ${colors[color]} border`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">{label}</p>
        <h4 className="text-xl font-black text-slate-900 mt-0.5">{value}</h4>
      </div>
    </div>
  );
};

export default ReportsPage;
