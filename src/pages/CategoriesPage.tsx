import React, { useState } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, AlertCircle, Tag } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import { Category } from '../types';

export function CategoriesPage() {
  const { user } = useAuth();
  const company = store.getCompany();
  const categories = store.getCategories();

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const tickets = store.getTickets();

  const getCategoryUsage = (categoryId: string) => {
    return tickets.filter(t => t.category_id === categoryId).length;
  };

  const handleDelete = (categoryId: string) => {
    store.deleteCategory(categoryId);
    setShowDeleteConfirm(null);
    window.location.reload();
  };

  const handleToggleActive = (category: Category) => {
    store.updateCategory(category.id, { is_active: !category.is_active });
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kategori Yönetimi</h1>
          <p className="text-gray-500 mt-1">{categories.length} kategori listeleniyor</p>
        </div>
        <button
          onClick={() => { setEditingCategory(null); setShowModal(true); }}
          className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity"
          style={{ backgroundColor: company.primary_color }}
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Kategori</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(category => {
          const usage = getCategoryUsage(category.id);
          return (
            <div
              key={category.id}
              className={`bg-white rounded-xl shadow-sm border overflow-hidden transition-opacity ${!category.is_active ? 'opacity-60' : ''}`}
              style={{ borderColor: category.color }}
            >
              <div className="h-2" style={{ backgroundColor: category.color }} />
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${category.color}20` }}
                    >
                      <Tag className="w-5 h-5" style={{ color: category.color }} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{usage} talep</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                    {category.is_active ? 'Aktif' : 'Pasif'}
                  </span>
                </div>

                {category.description && (
                  <p className="text-sm text-gray-600 mt-3">{category.description}</p>
                )}

                <div className="flex items-center justify-end space-x-2 mt-4 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleToggleActive(category)}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title={category.is_active ? 'Pasif Yap' : 'Aktif Yap'}
                  >
                    {category.is_active ? <EyeOff className="w-4 h-4 text-gray-500" /> : <Eye className="w-4 h-4 text-green-500" />}
                  </button>
                  <button
                    onClick={() => { setEditingCategory(category); setShowModal(true); }}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4 text-gray-500" />
                  </button>
                  {usage === 0 && (
                    <button
                      onClick={() => setShowDeleteConfirm(category.id)}
                      className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Kategoriyi Sil</h3>
            </div>
            <p className="text-gray-600 mb-6">Bu kategoriyi silmek istediğinize emin misiniz?</p>
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

      {/* Add/Edit Category Modal */}
      {showModal && (
        <CategoryModal
          category={editingCategory}
          onClose={() => setShowModal(false)}
          onSave={(data) => {
            if (editingCategory) {
              store.updateCategory(editingCategory.id, data);
            } else {
              store.addCategory({ ...data, is_active: true, sort_order: categories.length + 1 });
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

function CategoryModal({
  category,
  onClose,
  onSave,
  companyColor,
}: {
  category: Category | null;
  onClose: () => void;
  onSave: (data: Partial<Category>) => void;
  companyColor: string;
}) {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    color: category?.color || '#3b82f6',
  });

  const PRESET_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4',
    '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6',
    '#a855f7', '#d946ef', '#ec4899', '#f43f5e',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold">{category ? 'Kategori Düzenle' : 'Yeni Kategori'}</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Adı</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-transform ${formData.color === color ? 'ring-2 ring-offset-2 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: color, ringColor: color }}
                >
                  {formData.color === color && <span className="text-white text-xs">✓</span>}
                </button>
              ))}
              <input
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-8 h-8 rounded-lg cursor-pointer"
              />
            </div>
          </div>

          {/* Preview */}
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: formData.color }}
            >
              <Tag className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-900">{formData.name || 'Kategori Adı'}</span>
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
              {category ? 'Güncelle' : 'Oluştur'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
