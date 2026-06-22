import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Shield, UserCheck, UserX, MoreVertical, AlertCircle } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import { User, UserRole } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function UsersPage() {
  const { user } = useAuth();
  const company = store.getCompany();
  const allUsers = store.getUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.last_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.department?.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: UserRole) => {
    const colors: Record<UserRole, string> = {
      'Sistem Yöneticisi': 'bg-red-100 text-red-800',
      'IT Destek Personeli': 'bg-blue-100 text-blue-800',
      'Firma Kullanıcısı': 'bg-gray-100 text-gray-800',
    };
    return colors[role];
  };

  const handleDelete = (userId: string) => {
    if (userId === user?.id) return;
    store.deleteUser(userId);
    setShowDeleteConfirm(null);
    window.location.reload();
  };

  const handleToggleActive = (userToToggle: User) => {
    store.updateUser(userToToggle.id, { is_active: !userToToggle.is_active });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
          <p className="text-gray-500 mt-1">{filteredUsers.length} kullanıcı listeleniyor</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setShowModal(true); }}
          className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: company.primary_color }}
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Kullanıcı</span>
        </button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Kullanıcı ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as UserRole | 'all')}
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
          >
            <option value="all">Tüm Roller</option>
            <option value="Sistem Yöneticisi">Sistem Yöneticisi</option>
            <option value="IT Destek Personeli">IT Destek Personeli</option>
            <option value="Firma Kullanıcısı">Firma Kullanıcısı</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kullanıcı</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Rol</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Departman</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Durum</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Kayıt Tarihi</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map(u => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: company.primary_color }}
                      >
                        {u.first_name[0]}{u.last_name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{u.first_name} {u.last_name}</p>
                        <p className="text-sm text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(u.role)}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.department || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {u.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {format(new Date(u.created_at), 'dd.MM.yyyy')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end space-x-2">
                      {u.id !== user?.id && (
                        <>
                          <button
                            onClick={() => handleToggleActive(u)}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title={u.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                          >
                            {u.is_active ? <UserX className="w-4 h-4 text-gray-500" /> : <UserCheck className="w-4 h-4 text-green-500" />}
                          </button>
                          <button
                            onClick={() => { setEditingUser(u); setShowModal(true); }}
                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4 text-gray-500" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(u.id)}
                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                            title="Sil"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Kullanıcıyı Sil</h3>
            </div>
            <p className="text-gray-600 mb-6">Bu kullanıcıyı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDelete(showDeleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit User Modal */}
      {showModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowModal(false)}
          onSave={(userData) => {
            if (editingUser) {
              store.updateUser(editingUser.id, userData);
            } else {
              store.addUser({ ...userData, is_active: true } as Omit<User, 'id' | 'created_at'>);
            }
            setShowModal(false);
            window.location.reload();
          }}
          companyColor={company.primary_color}
        />
      )}
    </div>
  );
}

function UserModal({
  user,
  onClose,
  onSave,
  companyColor,
}: {
  user: User | null;
  onClose: () => void;
  onSave: (data: Partial<User>) => void;
  companyColor: string;
}) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    department: user?.department || '',
    position: user?.position || '',
    employee_id: user?.employee_id || '',
    role: user?.role || 'Firma Kullanıcısı' as UserRole,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const ROLES: UserRole[] = ['Sistem Yöneticisi', 'IT Destek Personeli', 'Firma Kullanıcısı'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">{user ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ad</label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Soyad</label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as UserRole })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            >
              {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Departman</label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pozisyon</label>
              <input
                type="text"
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sicil No</label>
              <input
                type="text"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
              style={{ backgroundColor: companyColor }}
            >
              {user ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
