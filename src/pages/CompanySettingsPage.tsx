import React, { useState } from 'react';
import { Building2, Upload, Save, Image, Palette, Check } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';

export function CompanySettingsPage() {
  const { user } = useAuth();
  const company = store.getCompany();

  const [settings, setSettings] = useState({
    company_name: company.company_name,
    logo_url: company.logo_url || '',
    address: company.address || '',
    phone: company.phone || '',
    email: company.email || '',
    website: company.website || '',
    primary_color: company.primary_color,
    secondary_color: company.secondary_color,
  });

  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'genel' | 'tema'>('genel');

  const handleSave = () => {
    store.updateCompany(settings);
    store.addAuditLog({
      user_id: user!.id,
      action: 'Firma ayarları güncellendi',
      entity_type: 'company_settings',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const PRESET_COLORS = [
    { primary: '#1e40af', secondary: '#3b82f6', name: 'Mavi' },
    { primary: '#065f46', secondary: '#10b981', name: 'Yeşil' },
    { primary: '#991b1b', secondary: '#ef4444', name: 'Kırmızı' },
    { primary: '#92400e', secondary: '#f59e0b', name: 'Turuncu' },
    { primary: '#374151', secondary: '#6b7280', name: 'Gri' },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Firma Ayarları</h1>
        <p className="text-gray-500 mt-1">Şirket bilgilerinizi ve görünümü özelleştirin</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg inline-flex">
        {[
          { key: 'genel', label: 'Genel Bilgiler', icon: Building2 },
          { key: 'tema', label: 'Tema & Görünüm', icon: Palette },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
              activeTab === tab.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* General Settings */}
      {activeTab === 'genel' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Logosu</label>
            <div className="flex items-center space-x-6">
              {settings.logo_url ? (
                <div className="w-32 h-20 border border-gray-200 rounded-lg flex items-center justify-center overflow-hidden bg-white">
                  <img src={settings.logo_url} alt="Logo" className="max-w-full max-h-full object-contain" />
                </div>
              ) : (
                <div
                  className="w-32 h-20 rounded-lg flex items-center justify-center text-white text-2xl font-bold"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  {settings.company_name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Logo Yükle</span>
                </button>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG veya SVG (max. 2MB)</p>
              </div>
            </div>
            <input
              type="text"
              value={settings.logo_url}
              onChange={(e) => setSettings({ ...settings, logo_url: e.target.value })}
              placeholder="Logo URL (opsiyonel)"
              className="mt-3 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none text-sm"
            />
          </div>

          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Şirket Adı</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Adres</label>
            <textarea
              value={settings.address}
              onChange={(e) => setSettings({ ...settings, address: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={settings.phone}
                onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Web Sitesi</label>
            <input
              type="url"
              value={settings.website}
              onChange={(e) => setSettings({ ...settings, website: e.target.value })}
              placeholder="https://"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>
        </div>
      )}

      {/* Theme Settings */}
      {activeTab === 'tema' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
          {/* Preset Themes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Hazır Temalar</label>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {PRESET_COLORS.map((theme, index) => (
                <button
                  key={index}
                  onClick={() => setSettings({ ...settings, primary_color: theme.primary, secondary_color: theme.secondary })}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    settings.primary_color === theme.primary ? 'border-gray-400' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.primary }} />
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: theme.secondary }} />
                  </div>
                  <p className="text-xs text-gray-700">{theme.name}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Custom Colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ana Renk</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={settings.primary_color}
                  onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none font-mono text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">İkincil Renk</label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="w-12 h-12 rounded-lg cursor-pointer border-0"
                />
                <input
                  type="text"
                  value={settings.secondary_color}
                  onChange={(e) => setSettings({ ...settings, secondary_color: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Önizleme</label>
            <div className="p-6 border border-gray-200 rounded-lg space-y-4">
              <div
                className="h-12 rounded-lg flex items-center px-4 text-white font-semibold"
                style={{ backgroundColor: settings.primary_color }}
              >
                {settings.company_name}
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: settings.primary_color }}
                >
                  Ana Buton
                </button>
                <button
                  className="px-4 py-2 rounded-lg text-white font-medium"
                  style={{ backgroundColor: settings.secondary_color }}
                >
                  İkincil Buton
                </button>
              </div>
              <div className="flex items-center space-x-4 text-sm">
                <span style={{ color: settings.primary_color }} className="font-medium">Link Örneği</span>
                <span className="text-gray-500">Normal metin</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90"
          style={{ backgroundColor: settings.primary_color }}
        >
          {saved ? <Check className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          <span>{saved ? 'Kaydedildi' : 'Değişiklikleri Kaydet'}</span>
        </button>
      </div>
    </div>
  );
}
