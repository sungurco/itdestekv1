import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, Plus, Eye, MessageSquare, MoreVertical, ChevronDown, X } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { store } from '../lib/store';
import { TicketStatus, TicketPriority, Ticket } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function TicketListPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const company = store.getCompany();
  const allTickets = store.getTickets();
  const categories = store.getCategories();
  const users = store.getUsers();

  const isAdmin = user?.role === 'Sistem Yöneticisi';
  const isTechnician = user?.role === 'IT Destek Personeli';
  const isStaff = isAdmin || isTechnician;

  // Filter tickets based on user role
  const tickets = isStaff
    ? allTickets
    : allTickets.filter(t => t.requester_id === user?.id);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TicketStatus | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TicketPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  const STATUS_OPTIONS: TicketStatus[] = ['Yeni', 'Atandı', 'İşlemde', 'Kullanıcıdan Bilgi Bekleniyor', 'Çözüm Uygulandı', 'Onay Bekliyor', 'Kapatıldı'];
  const PRIORITY_OPTIONS: TicketPriority[] = ['Düşük', 'Normal', 'Yüksek', 'Kritik'];

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    const matchesCategory = categoryFilter === 'all' || ticket.category_id === categoryFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesCategory;
  });

  const getStatusColor = (status: TicketStatus) => {
    const colors: Record<TicketStatus, string> = {
      'Yeni': 'bg-blue-100 text-blue-800 border-blue-200',
      'Atandı': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'İşlemde': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Kullanıcıdan Bilgi Bekleniyor': 'bg-orange-100 text-orange-800 border-orange-200',
      'Çözüm Uygulandı': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Onay Bekliyor': 'bg-purple-100 text-purple-800 border-purple-200',
      'Kapatıldı': 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: TicketPriority) => {
    const colors: Record<TicketPriority, string> = {
      'Düşük': 'bg-gray-50 text-gray-600 border-gray-200',
      'Normal': 'bg-blue-50 text-blue-600 border-blue-200',
      'Yüksek': 'bg-orange-50 text-orange-600 border-orange-200',
      'Kritik': 'bg-red-50 text-red-600 border-red-200',
    };
    return colors[priority] || 'bg-gray-50 text-gray-600';
  };

  const getCategoryName = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Diğer';
  };

  const getCategoryColor = (categoryId?: string) => {
    return categories.find(c => c.id === categoryId)?.color || '#6b7280';
  };

  const getRequesterName = (requesterId: string) => {
    const requester = users.find(u => u.id === requesterId);
    return requester ? `${requester.first_name} ${requester.last_name}` : 'Bilinmiyor';
  };

  const getAssigneeName = (assigneeId?: string) => {
    if (!assigneeId) return 'Atanmamış';
    const assignee = users.find(u => u.id === assigneeId);
    return assignee ? `${assignee.first_name} ${assignee.last_name}` : 'Bilinmiyor';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setCategoryFilter('all');
  };

  const hasActiveFilters = searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isStaff ? 'Tüm Talepler' : 'Taleplerim'}
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredTickets.length} talep listeleniyor
          </p>
        </div>
        <Link
          to="/tickets/new"
          className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center justify-center space-x-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: company.primary_color }}
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Talep</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Talep ara... (başlık, numara, açıklama)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-lg border flex items-center space-x-2 transition-colors ${showFilters ? 'border-gray-300 bg-gray-50' : 'border-gray-300 hover:bg-gray-50'}`}
          >
            <Filter className="w-5 h-5 text-gray-500" />
            <span>Filtreler</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: company.primary_color }} />
            )}
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Durum</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              >
                <option value="all">Tüm Durumlar</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Öncelik</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              >
                <option value="all">Tüm Öncelikler</option>
                {PRIORITY_OPTIONS.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Filtreleri Temizle</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Talep</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Kategori</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Öncelik</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Talep Eden</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Atanan</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tarih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="text-gray-500">
                      <p className="text-lg font-medium">Talep bulunamadı</p>
                      <p className="text-sm mt-1">Arama kriterlerinizi değiştirin veya yeni talep oluşturun.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTickets.map(ticket => (
                  <tr
                    key={ticket.id}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-start space-x-3">
                        <div>
                          <p className="text-xs text-gray-500 font-mono">{ticket.ticket_number}</p>
                          <p className="font-medium text-gray-900 mt-0.5">{ticket.title}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${getCategoryColor(ticket.category_id)}15`,
                          color: getCategoryColor(ticket.category_id),
                        }}
                      >
                        {getCategoryName(ticket.category_id)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getRequesterName(ticket.requester_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getAssigneeName(ticket.assigned_to)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {format(new Date(ticket.created_at), 'dd.MM.yyyy')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
