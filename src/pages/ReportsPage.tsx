import React, { useState } from 'react';
import { Calendar, Download, Filter, BarChart3, PieChart, TrendingUp, Users, Ticket } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function ReportsPage() {
  const { user } = useAuth();
  const company = store.getCompany();
  const tickets = store.getTickets();
  const users = store.getUsers();
  const categories = store.getCategories();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'technicians' | 'categories'>('general');

  // Filter tickets by date range
  const filteredTickets = tickets.filter(t => {
    const ticketDate = new Date(t.created_at);
    if (startDate && ticketDate < new Date(startDate)) return false;
    if (endDate && ticketDate > new Date(endDate + 'T23:59:59')) return false;
    return true;
  });

  const technicians = users.filter(u => u.role === 'IT Destek Personeli' || u.role === 'Sistem Yöneticisi');

  const getStatusCounts = () => {
    const statuses = ['Yeni', 'Atandı', 'İşlemde', 'Kullanıcıdan Bilgi Bekleniyor', 'Çözüm Uygulandı', 'Onay Bekliyor', 'Kapatıldı'];
    return statuses.map(status => ({
      status,
      count: filteredTickets.filter(t => t.status === status).length,
    }));
  };

  const getCategoryStats = () => {
    return categories.map(cat => ({
      name: cat.name,
      color: cat.color,
      count: filteredTickets.filter(t => t.category_id === cat.id).length,
      closed: filteredTickets.filter(t => t.category_id === cat.id && t.status === 'Kapatıldı').length,
    })).filter(c => c.count > 0);
  };

  const getTechnicianStats = () => {
    return technicians.map(tech => {
      const assigned = filteredTickets.filter(t => t.assigned_to === tech.id);
      const resolved = assigned.filter(t => t.status === 'Kapatıldı');
      const inProgress = assigned.filter(t => ['İşlemde', 'Atandı'].includes(t.status));

      return {
        name: `${tech.first_name} ${tech.last_name}`,
        assigned: assigned.length,
        resolved: resolved.length,
        inProgress: inProgress.length,
        rate: assigned.length > 0 ? Math.round((resolved.length / assigned.length) * 100) : 0,
      };
    });
  };

  const getPriorityStats = () => {
    const priorities = ['Düşük', 'Normal', 'Yüksek', 'Kritik'];
    return priorities.map(priority => ({
      priority,
      count: filteredTickets.filter(t => t.priority === priority).length,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-gray-500 mt-1">Talep ve performans raporları</p>
        </div>
        <button
          className="px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium flex items-center space-x-2 hover:bg-gray-50"
        >
          <Download className="w-5 h-5" />
          <span>PDF İndir</span>
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Başlangıç Tarihi</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Bitiş Tarihi</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>
          <button
            onClick={() => { setStartDate(''); setEndDate(''); }}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            Temizle
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg inline-flex">
        {[
          { key: 'general', label: 'Genel İstatistikler' },
          { key: 'technicians', label: 'Personel Performansı' },
          { key: 'categories', label: 'Kategori Analizi' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* General Statistics */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-blue-100">
                  <Ticket className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredTickets.length}</p>
                  <p className="text-sm text-gray-500">Toplam Talep</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-yellow-100">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredTickets.filter(t => !['Kapatıldı'].includes(t.status)).length}</p>
                  <p className="text-sm text-gray-500">Açık Talep</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-green-100">
                  <BarChart3 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{filteredTickets.filter(t => t.status === 'Kapatıldı').length}</p>
                  <p className="text-sm text-gray-500">Çözülen</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-lg bg-purple-100">
                  <PieChart className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {filteredTickets.length > 0
                      ? Math.round((filteredTickets.filter(t => t.status === 'Kapatıldı').length / filteredTickets.length) * 100)
                      : 0}%
                  </p>
                  <p className="text-sm text-gray-500">Çözüm Oranı</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Durum Dağılımı</h3>
              <div className="space-y-3">
                {getStatusCounts().map(({ status, count }) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-sm text-gray-600 w-48">{status}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${filteredTickets.length > 0 ? (count / filteredTickets.length) * 100 : 0}%`,
                            backgroundColor: company.primary_color,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Öncelik Dağılımı</h3>
              <div className="space-y-3">
                {getPriorityStats().map(({ priority, count }) => {
                  const colors: Record<string, string> = {
                    'Düşük': 'bg-gray-400',
                    'Normal': 'bg-blue-500',
                    'Yüksek': 'bg-orange-500',
                    'Kritik': 'bg-red-500',
                  };
                  return (
                    <div key={priority} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="text-sm text-gray-600 w-20">{priority}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors[priority]}`}
                            style={{ width: `${filteredTickets.length > 0 ? (count / filteredTickets.length) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Technician Performance */}
      {activeTab === 'technicians' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Personel Performans Tablosu</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Personel</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Atanan</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">İşlemde</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Çözülen</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase">Çözüm Oranı</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {getTechnicianStats().map((tech, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                          style={{ backgroundColor: company.primary_color }}
                        >
                          {tech.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <span className="font-medium text-gray-900">{tech.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center text-gray-700">{tech.assigned}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{tech.inProgress}</td>
                    <td className="px-6 py-4 text-center text-gray-700">{tech.resolved}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tech.rate >= 80 ? 'bg-green-100 text-green-800' :
                        tech.rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        %{tech.rate}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Category Analysis */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Kategori Talep Sayıları</h3>
            <div className="space-y-4">
              {getCategoryStats().map((cat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-gray-700">{cat.name}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-32 bg-gray-100 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${filteredTickets.length > 0 ? (cat.count / filteredTickets.length) * 100 : 0}%`,
                          backgroundColor: cat.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{cat.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Kategori Çözüm Oranları</h3>
            <div className="space-y-4">
              {getCategoryStats().map((cat, index) => {
                const rate = cat.count > 0 ? Math.round((cat.closed / cat.count) * 100) : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="text-gray-700">{cat.name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <span>{cat.closed}</span>
                        <span>/</span>
                        <span>{cat.count}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        rate >= 80 ? 'bg-green-100 text-green-800' :
                        rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        %{rate}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
