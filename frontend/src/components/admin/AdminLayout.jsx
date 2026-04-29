import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore.js';
import { 
  LayoutDashboard, 
  UtensilsCrossed, 
  Grid2X2, 
  Users, 
  LogOut, 
  ChefHat, 
  Tags,
  ChevronRight,
  UserCircle,
  TrendingUp
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, roles: ['admin', 'receptionist'] },
    { name: 'Tables', path: '/admin/tables', icon: Grid2X2, roles: ['admin'] },
    { name: 'Categories', path: '/admin/categories', icon: Tags, roles: ['admin'] },
    { name: 'Menu Items', path: '/admin/menu', icon: ChefHat, roles: ['admin'] },
    { name: 'Staff Management', path: '/admin/users', icon: Users, roles: ['admin'] },
    { name: 'Finance & Reports', path: '/admin/reports', icon: TrendingUp, roles: ['admin'] },
  ];

  const activeItem = navItems.find(i => location.pathname.startsWith(i.path));

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm hidden md:flex">
        <div className="h-20 flex items-center px-8 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="bg-orange-600 p-2 rounded-lg shadow-md shadow-orange-200">
              <UtensilsCrossed className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-xl tracking-tight">Smart Resto</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-4">
            Main Menu
          </div>
          <nav className="space-y-1.5">
            {navItems.filter(item => item.roles.includes(user?.role)).map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive 
                      ? 'bg-orange-50 text-orange-600 shadow-sm shadow-orange-100' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-5 w-5 ${isActive ? 'text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                    <span className="font-medium text-[15px]">{item.name}</span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4" />}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-6 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-10 w-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm">
              <UserCircle className="h-6 w-6" />
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || 'Staff Member'}</p>
              <p className="text-xs text-slate-500 capitalize">{user?.role || 'User'}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all duration-200 shadow-sm"
          >
            <LogOut className="h-4 w-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">
              {activeItem?.name || 'Management'}
            </h2>
          </div>

          <div className="flex items-center gap-4">
             {/* Live Clock Section */}
             <div className="hidden sm:flex items-center gap-4 border-l border-slate-100 pl-4">
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">Current Time</p>
                  <p className="text-sm font-black text-slate-700 tabular-nums">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                </div>
                <div className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-2 border border-orange-100/50">
                  <div className="h-1.5 w-1.5 bg-orange-600 rounded-full animate-pulse"></div>
                  LIVE
                </div>
             </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-10">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
