import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Ticket,
  Users,
  FolderTree,
  Settings,
  FileText,
  Shield,
  LogOut,
  Menu,
  X,
  Bell,
  User,
  Building2,
  Database,
  BarChart3,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { store } from '../lib/store';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const company = store.getCompany();

  const isAdmin = user?.role === 'Sistem Yöneticisi';
  const isTechnician = user?.role === 'IT Destek Personeli';
  const isStaff = isAdmin || isTechnician;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Kontrol Paneli', roles: ['Sistem Yöneticisi', 'IT Destek Personeli', 'Firma Kullanıcısı'] },
    { path: '/tickets', icon: Ticket, label: 'Taleplerim', roles: ['Firma Kullanıcısı'] },
    { path: '/tickets/all', icon: Ticket, label: 'Tüm Talepler', roles: ['Sistem Yöneticisi', 'IT Destek Personeli'] },
    { path: '/tickets/new', icon: HelpCircle, label: 'Yeni Talep', roles: ['Firma Kullanıcısı'] },
    { path: '/users', icon: Users, label: 'Kullanıcı Yönetimi', roles: ['Sistem Yöneticisi'] },
    { path: '/categories', icon: FolderTree, label: 'Kategoriler', roles: ['Sistem Yöneticisi', 'IT Destek Personeli'] },
    { path: '/reports', icon: BarChart3, label: 'Raporlar', roles: ['Sistem Yöneticisi', 'IT Destek Personeli'] },
    { path: '/audit', icon: FileText, label: 'Denetim Günlükleri', roles: ['Sistem Yöneticisi'] },
    { path: '/backup', icon: Database, label: 'Yedekleme', roles: ['Sistem Yöneticisi'] },
    { path: '/notifications', icon: Bell, label: 'Bildirimler', roles: ['Sistem Yöneticisi'] },
    { path: '/license', icon: Shield, label: 'Lisans', roles: ['Sistem Yöneticisi'] },
    { path: '/company', icon: Building2, label: 'Firma Ayarları', roles: ['Sistem Yöneticisi'] },
    { path: '/settings', icon: Settings, label: 'Ayarlar', roles: ['Sistem Yöneticisi', 'IT Destek Personeli', 'Firma Kullanıcısı'] },
  ].filter(item => item.roles.includes(user?.role || 'Firma Kullanıcısı'));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b" style={{ backgroundColor: company.primary_color }}>
          {company.logo_url ? (
            <img src={company.logo_url} alt={company.company_name} className="h-8" />
          ) : (
            <span className="text-white font-bold text-lg">{company.company_name}</span>
          )}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:bg-white/10 p-1 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold" style={{ backgroundColor: company.primary_color }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 truncate">
                {user?.first_name} {user?.last_name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.role}</p>
            </div>
          </div>
        </div>

        <nav className="px-4 pb-4 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
                style={isActive ? { backgroundColor: company.primary_color } : {}}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-4 border-t mt-4">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-sm font-medium">Çıkış Yap</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8 sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-4">
            <Link to="/profile" className="flex items-center space-x-2 hover:bg-gray-100 p-2 rounded-lg transition-colors">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ backgroundColor: company.primary_color }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </div>
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
