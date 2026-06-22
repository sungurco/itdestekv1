import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { store } from '../lib/store';
import { TicketPriority } from '../types';

export function NewTicketPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const company = store.getCompany();
  const categories = store.getCategories().filter(c => c.is_active);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Normal');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const PRIORITY_OPTIONS: TicketPriority[] = ['Düşük', 'Normal', 'Yüksek', 'Kritik'];

  const getPriorityColor = (p: TicketPriority) => {
    const colors: Record<TicketPriority, string> = {
      'Düşük': 'bg-gray-100 text-gray-700 border-gray-300',
      'Normal': 'bg-blue-100 text-blue-700 border-blue-300',
      'Yüksek': 'bg-orange-100 text-orange-700 border-orange-300',
      'Kritik': 'bg-red-100 text-red-700 border-red-300',
    };
    return colors[p];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) {
      setError('Lütfen bir başlık girin');
      return;
    }
    if (!description.trim()) {
      setError('Lütfen açıklama girin');
      return;
    }
    if (!categoryId) {
      setError('Lütfen bir kategori seçin');
      return;
    }
    if (!user) {
      setError('Oturum açmanız gerekiyor');
      return;
    }

    setLoading(true);

    try {
      const ticket = store.addTicket({
        title: title.trim(),
        description: description.trim(),
        category_id: categoryId,
        priority,
        status: 'Yeni',
        requester_id: user.id,
      });

      store.addAuditLog({
        user_id: user.id,
        action: 'Yeni talep oluşturuldu',
        entity_type: 'ticket',
        entity_id: ticket.id,
        details: { ticket_number: ticket.ticket_number },
      });

      navigate('/tickets');
    } catch (err) {
      setError('Talep oluşturulurken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          to={-1 as unknown as string}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Destek Talebi</h1>
          <p className="text-gray-500 mt-1">IT desteğe ihtiyacınız varsa formu doldurun</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Talep Başlığı *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Kısa ve açıklayıcı bir başlık yazın"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none transition-all"
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">{title.length}/200 karakter</p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoryId(cat.id)}
                  className={`p-3 rounded-lg border-2 text-center transition-all ${
                    categoryId === cat.id
                      ? 'border-current'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  style={categoryId === cat.id ? { borderColor: cat.color, color: cat.color } : {}}
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-sm font-medium">{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Öncelik *
            </label>
            <div className="flex flex-wrap gap-3">
              {PRIORITY_OPTIONS.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                    priority === p ? getPriorityColor(p) : 'bg-gray-50 text-gray-600 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Düşük: Küçük sorunlar | Normal: Standart talepler | Yüksek: Acil ihtiyaçlar | Kritik: İş durması
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Detaylı Açıklama *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Sorununuzu detaylı şekilde açıklayın. Ne zaman başladı, ne yaptınız, ne oldu?"
              rows={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none transition-all"
            />
            <p className="text-xs text-gray-500 mt-1">Ne kadar detay verirseniz o kadar hızlı çözüm alırsınız</p>
          </div>

          {/* Attachments (UI only for now) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ek Dosyalar (İsteğe bağlı)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
              <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                Dosyaları sürükleyin veya <span className="font-medium" style={{ color: company.primary_color }}>tıklayarak seçin</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG, PDF, DOC (max. 10MB)</p>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end space-x-4">
          <Link
            to={-1 as unknown as string}
            className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
            style={{ backgroundColor: company.primary_color }}
          >
            {loading ? (
              <span>Gönderiliyor...</span>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Talebi Gönder</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
