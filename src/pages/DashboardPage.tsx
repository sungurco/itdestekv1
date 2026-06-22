import React from 'react';
import { Link } from 'react-router-dom';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { store } from '../lib/store';
import { TicketStatus, TicketPriority } from '../types';

export function DashboardPage() {
  const { user } = useAuth();
  const stats = store.getStats();
  const company = store.getCompany();
  const tickets = store.getTickets();
  const categories = store.getCategories();
  const users = store.getUsers();

  const isAdmin = user?.role === 'Sistem Yöneticisi';
  const isTechnician = user?.role === 'IT Destek Personeli';
  const isStaff = isAdmin || isTechnician;

  // Get user's tickets
  const myTickets = isStaff
    ? tickets.filter(t => t.assigned_to === user?.id)
    : tickets.filter(t => t.requester_id === user?.id);

  const recentTickets = myTickets
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const getStatusColor = (status: TicketStatus) => {
    const colors: Record<TicketStatus, string> = {
      'Yeni': 'bg-blue-100 text-blue-800',
      'Atandı': 'bg-indigo-100 text-indigo-800',
      'İşlemde': 'bg-yellow-100 text-yellow-800',
      'Kullanıcıdan Bilgi Bekleniyor': 'bg-orange-100 text-orange-800',
      'Çözüm Uygulandı': 'bg-green-100 text-green-800',
      'Onay Bekliyor': 'bg-purple-100 text-purple-800',
      'Kapatıldı': 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: TicketPriority) => {
    const colors: Record<TicketPriority, string> = {
      'Düşük': 'text-gray-500',
      'Normal': 'text-blue-500',
      'Yüksek': 'text-orange-500',
      'Kritik': 'text-red-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  const getCategoryName = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Diğer';
  };

  const getRequesterName = (requesterId: string) => {
    const requester = users.find(u => u.id === requesterId);
    return requester ? `${requester.first_name} ${requester.last_name}` : 'Bilinmiyor';
  };

  if (!isStaff) {
    // User Dashboard
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hoş Geldiniz, {user?.first_name}</h1>
            <p className="text-gray-500 mt-1">IT destek taleplerinizi görüntüleyebilir ve yeni talep oluşturabilirsiniz.</p>
          </div>
          <Link
            to="/tickets/new"
            className="px-6 py-3 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: company.primary_color }}
          >
            <Ticket className="w-5 h-5" />
            <span>Yeni Talep Oluştur</span>
          </Link>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-blue-100">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {myTickets.filter(t => !['Kapatıldı'].includes(t.status)).length}
                </p>
                <p className="text-sm text-gray-500">Aktif Taleplerim</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {myTickets.filter(t => t.status === 'Kapatıldı').length}
                </p>
                <p className="text-sm text-gray-500">Çözülen Talepler</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-yellow-100">
                <AlertTriangle className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {myTickets.filter(t => t.status === 'Kullanıcıdan Bilgi Bekleniyor').length}
                </p>
                <p className="text-sm text-gray-500">Bilgi Bekleyen</p>
              </div>
            </div>
          </div>
        </div>

        {/* My Tickets */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Taleplerim</h2>
            <Link to="/tickets" className="text-sm hover:underline" style={{ color: company.primary_color }}>
              Tümünü Gör
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {recentTickets.length === 0 ? (
              <div className="px-6 py-12 text-center text-gray-500">
                <Ticket className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Henüz bir talebiniz bulunmuyor.</p>
                <Link to="/tickets/new" className="mt-4 inline-block text-sm hover:underline" style={{ color: company.primary_color }}>
                  Yeni talep oluştur
                </Link>
              </div>
            ) : (
              recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block px-6 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 font-mono">{ticket.ticket_number}</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                          {ticket.status}
                        </span>
                        <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </div>
                      <h3 className="mt-1 font-medium text-gray-900 truncate">{ticket.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{getCategoryName(ticket.category_id)}</p>
                    </div>
                    <div className="text-right text-sm text-gray-500">
                      <p>{new Date(ticket.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // Staff Dashboard
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kontrol Paneli</h1>
          <p className="text-gray-500 mt-1">IT destek taleplerine genel bakış</p>
        </div>
        <div className="flex space-x-3">
          <Link
            to="/tickets/all"
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium flex items-center space-x-2 hover:bg-gray-50 transition-colors"
          >
            <Ticket className="w-4 h-4" />
            <span>Tüm Talepler</span>
          </Link>
          <Link
            to="/reports"
            className="px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
            style={{ backgroundColor: company.primary_color }}
          >
            <BarChart3 className="w-4 h-4" />
            <span>Raporlar</span>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Toplam Talepler</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.totalTickets}</p>
            </div>
            <div className="p-3 rounded-lg" style={{ backgroundColor: `${company.primary_color}15` }}>
              <Ticket className="w-6 h-6" style={{ color: company.primary_color }} />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm text-green-600">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Bu ay +{Math.floor(Math.random() * 10) + 5} yeni</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Açık Talepler</p>
              <p className="text-3xl font-bold text-blue-600 mt-1">{stats.openTickets}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-100">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            {stats.pendingTickets} bekleyen
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Kapatılan</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{stats.closedTickets}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            Çözüm oranı: %{Math.round((stats.closedTickets / Math.max(stats.totalTickets, 1)) * 100)}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Ort. Çözüm Süresi</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.avgResolutionTime}</p>
            </div>
            <div className="p-3 rounded-lg bg-indigo-100">
              <TrendingUp className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">Son 30 gün</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Tickets */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Son Talepler</h2>
            <Link to="/tickets/all" className="text-sm hover:underline flex items-center space-x-1" style={{ color: company.primary_color }}>
              <span>Tümünü Gör</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-100">
            {tickets.slice(0, 6).map(ticket => (
              <Link
                key={ticket.id}
                to={`/tickets/${ticket.id}`}
                className="block px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                      <span className="text-xs text-gray-500 font-mono">{ticket.ticket_number}</span>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                      <span className={`text-xs font-medium ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <h3 className="mt-1 font-medium text-gray-900 truncate">{ticket.title}</h3>
                    <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                      <span>{getCategoryName(ticket.category_id)}</span>
                      <span>•</span>
                      <span>{getRequesterName(ticket.requester_id)}</span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    <p>{new Date(ticket.created_at).toLocaleDateString('tr-TR')}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Statistics */}
        <div className="space-y-6">
          {/* By Category */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Kategori Dağılımı</h3>
            <div className="space-y-3">
              {stats.ticketsByCategory.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: categories.find(c => c.name === item.category)?.color || '#6b7280' }}
                    />
                    <span className="text-sm text-gray-600">{item.category}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* By Priority */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">Öncelik Dağılımı</h3>
            <div className="space-y-3">
              {stats.ticketsByPriority.map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className={`text-sm ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                  <span className="text-sm font-medium text-gray-900">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technician Performance */}
          {stats.technicianPerformance.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4">Teknisyen Performansı</h3>
              <div className="space-y-4">
                {stats.technicianPerformance.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                      style={{ backgroundColor: company.primary_color }}
                    >
                      {item.technician.first_name[0]}{item.technician.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {item.technician.first_name} {item.technician.last_name}
                      </p>
                      <p className="text-xs text-gray-500">{item.resolved} çözülen / {item.assigned} atanan</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
