import React, { useState } from 'react';
import { Search, Filter, Calendar, User, Activity, Download } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import { AuditLog } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function AuditLogsPage() {
  const { user } = useAuth();
  const company = store.getCompany();
  const logs = store.getAuditLogs();
  const users = store.getUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const ACTION_TYPES = [
    { value: 'all', label: 'Tüm İşlemler' },
    { value: 'giriş', label: 'Kullanıcı Girişi' },
    { value: 'oluşturuldu', label: 'Oluşturma İşlemleri' },
    { value: 'değiştirildi', label: 'Değişiklik İşlemleri' },
    { value: 'silindi', label: 'Silme İşlemleri' },
    { value: 'atandı', label: 'Atama İşlemleri' },
  ];

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.entity_type?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());
    const logDate = new Date(log.created_at);
    const matchesStartDate = !startDate || logDate >= new Date(startDate);
    const matchesEndDate = !endDate || logDate <= new Date(endDate + 'T23:59:59');
    return matchesSearch && matchesAction && matchesStartDate && matchesEndDate;
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  const getUserName = (userId?: string) => {
    if (!userId) return 'Sistem';
    const u = users.find(u => u.id === userId);
    return u ? `${u.first_name} ${u.last_name}` : 'Bilinmiyor';
  };

  const getActionIcon = (action: string) => {
    if (action.includes('giriş')) return 'bg-blue-100 text-blue-600';
    if (action.includes('oluşturuldu')) return 'bg-green-100 text-green-600';
    if (action.includes('değiştirildi') || action.includes('atandı')) return 'bg-yellow-100 text-yellow-600';
    if (action.includes('silindi')) return 'bg-red-100 text-red-600';
    return 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Denetim Günlükleri</h1>
          <p className="text-gray-500 mt-1">{filteredLogs.length} kayıt listeleniyor</p>
        </div>
        <button
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium flex items-center space-x-2 hover:bg-gray-50"
        >
          <Download className="w-5 h-5" />
          <span>Dışa Aktar</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
          >
            {ACTION_TYPES.map(action => (
              <option key={action.value} value={action.value}>{action.label}</option>
            ))}
          </select>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            placeholder="Başlangıç"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            placeholder="Bitiş"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Zaman</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">İşlem</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tür</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Detaylar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p>Kayıt bulunamadı</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">
                          {format(new Date(log.created_at), 'dd.MM.yyyy HH:mm:ss')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-medium"
                          style={{ backgroundColor: log.user_id ? company.primary_color : '#6b7280' }}
                        >
                          {log.user_id ? getUserName(log.user_id).split(' ').map(n => n[0]).join('').slice(0, 2) : 'S'}
                        </div>
                        <span className="text-sm text-gray-900">{getUserName(log.user_id)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getActionIcon(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.entity_type || '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.details ? JSON.stringify(log.details).slice(0, 50) + '...' : '-'}
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
