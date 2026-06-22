import React, { useState } from 'react';
import { Shield, Calendar, Users, CheckCircle, AlertTriangle, Key, Building2, Clock } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import { format, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

export function LicensePage() {
  const { user } = useAuth();
  const company = store.getCompany();
  const license = store.getLicense();

  const [licenseKey, setLicenseKey] = useState(license.license_key);
  const [showActivateModal, setShowActivateModal] = useState(false);

  const daysRemaining = differenceInDays(new Date(license.expires_at), new Date());
  const isExpiringSoon = daysRemaining <= 30 && daysRemaining > 0;
  const isExpired = daysRemaining <= 0;

  const getStatusBadge = () => {
    if (isExpired) {
      return { text: 'Süresi Dolmuş', color: 'bg-red-100 text-red-800', icon: AlertTriangle };
    }
    if (isExpiringSoon) {
      return { text: 'Yakında Dolacak', color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle };
    }
    return { text: 'Aktif', color: 'bg-green-100 text-green-800', icon: CheckCircle };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  const features = [
    { key: 'reports', label: 'Raporlama Modülü', enabled: true },
    { key: 'notifications', label: 'E-posta Bildirimleri', enabled: true },
    { key: 'backup', label: 'Otomatik Yedekleme', enabled: true },
    { key: 'api', label: 'API Erişimi', enabled: true },
  ];

  const users = store.getUsers();
  const userCount = users.filter(u => u.role === 'Firma Kullanıcısı').length;
  const adminCount = users.filter(u => u.role !== 'Firma Kullanıcısı').length;
  const userLimitPercent = Math.min((userCount / (license.max_users || 50)) * 100, 100);
  const adminLimitPercent = Math.min((adminCount / (license.max_admins || 5)) * 100, 100);

  const handleActivate = () => {
    store.updateLicense({
      license_key: licenseKey,
      is_active: true,
      activated_at: new Date().toISOString(),
    });
    setShowActivateModal(false);
    window.location.reload();
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lisans Yönetimi</h1>
        <p className="text-gray-500 mt-1">Lisans bilgilerinizi görüntüleyin ve yönetin</p>
      </div>

      {/* License Status Card */}
      <div className={`rounded-xl border p-6 ${isExpired ? 'bg-red-50 border-red-200' : isExpiringSoon ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-100'}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className={`p-3 rounded-lg ${isExpired ? 'bg-red-100' : isExpiringSoon ? 'bg-yellow-100' : 'bg-blue-100'}`}>
              <Shield className={`w-6 h-6 ${isExpired ? 'text-red-600' : isExpiringSoon ? 'text-yellow-600' : 'text-blue-600'}`} />
            </div>
            <div>
              <div className="flex items-center space-x-3">
                <h2 className="text-lg font-semibold text-gray-900">Lisans Durumu</h2>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${status.color}`}>
                  <StatusIcon className="w-3 h-3" />
                  <span>{status.text}</span>
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {isExpired
                  ? 'Lisans süreniz dolmuştur. Lütfen lisansınızı yenileyin.'
                  : isExpiringSoon
                    ? `Lisans süreniz ${daysRemaining} gün içinde dolacak.`
                    : `Lisans aktif - ${daysRemaining} gün kaldı`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowActivateModal(true)}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium"
          >
            Lisans Güncelle
          </button>
        </div>
      </div>

      {/* License Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Key className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Lisans Anahtarı</p>
              <p className="font-mono text-sm text-gray-900 mt-1">{license.license_key}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Building2 className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Lisans Sahibi</p>
              <p className="font-medium text-gray-900 mt-1">{license.company_name}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm text-gray-500">Son Kullanım Tarihi</p>
              <p className="font-medium text-gray-900 mt-1">{format(new Date(license.expires_at), 'dd.MM.yyyy')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Limits */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Kullanıcı Limitleri</h2>
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Kullanıcı Sayısı</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {userCount} / {license.max_users || 50}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${userLimitPercent >= 90 ? 'bg-red-500' : userLimitPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${userLimitPercent}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Yönetici Sayısı</span>
              </div>
              <span className="text-sm font-medium text-gray-900">
                {adminCount} / {license.max_admins || 5}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full ${adminLimitPercent >= 90 ? 'bg-red-500' : adminLimitPercent >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
                style={{ width: `${adminLimitPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Lisans Özellikleri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {features.map(feature => (
            <div key={feature.key} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${feature.enabled ? 'bg-green-100' : 'bg-gray-100'}`}>
                <CheckCircle className={`w-4 h-4 ${feature.enabled ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <span className={feature.enabled ? 'text-gray-900' : 'text-gray-500'}>{feature.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* License Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Lisans Bilgileri</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">İletişim E-posta</p>
            <p className="font-medium text-gray-900">{license.contact_email}</p>
          </div>
          {license.contact_phone && (
            <div>
              <p className="text-gray-500">İletişim Telefonu</p>
              <p className="font-medium text-gray-900">{license.contact_phone}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Oluşturulma Tarihi</p>
            <p className="font-medium text-gray-900">{format(new Date(license.created_at), 'dd.MM.yyyy')}</p>
          </div>
          {license.activated_at && (
            <div>
              <p className="text-gray-500">Aktivasyon Tarihi</p>
              <p className="font-medium text-gray-900">{format(new Date(license.activated_at), 'dd.MM.yyyy HH:mm')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Activate Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">Lisans Anahtarı Güncelle</h3>
            </div>
            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Yeni Lisans Anahtarı</label>
              <input
                type="text"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none font-mono"
              />
              <p className="text-xs text-gray-500 mt-2">
                Yeni lisans anahtarını girerek lisans süresini ve kullanıcı limitlerini güncelleyebilirsiniz.
              </p>
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={() => setShowActivateModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={handleActivate}
                className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
                style={{ backgroundColor: company.primary_color }}
              >
                Etkinleştir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
