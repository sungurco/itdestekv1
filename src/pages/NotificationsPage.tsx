import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Send, Save, AlertCircle, Check } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';

export function NotificationsPage() {
  const { user } = useAuth();
  const company = store.getCompany();
  const notificationSettings = store.getNotificationSettings();
  const smtpSettings = store.getSmtpSettings();

  const [settings, setSettings] = useState({
    email_on_ticket_created: notificationSettings.email_on_ticket_created,
    email_on_ticket_assigned: notificationSettings.email_on_ticket_assigned,
    email_on_status_changed: notificationSettings.email_on_status_changed,
    email_on_new_message: notificationSettings.email_on_new_message,
    email_on_ticket_closed: notificationSettings.email_on_ticket_closed,
    telegram_enabled: notificationSettings.telegram_enabled,
    telegram_bot_token: notificationSettings.telegram_bot_token || '',
    whatsapp_enabled: notificationSettings.whatsapp_enabled,
    whatsapp_api_key: notificationSettings.whatsapp_api_key || '',
  });

  const [smtp, setSmtp] = useState({
    host: smtpSettings.host || '',
    port: smtpSettings.port,
    username: smtpSettings.username || '',
    password: smtpSettings.password || '',
    from_email: smtpSettings.from_email || '',
    from_name: smtpSettings.from_name,
    use_tls: smtpSettings.use_tls,
  });

  const [saved, setSaved] = useState(false);

  const handleSaveNotifications = () => {
    store.updateNotificationSettings(settings);
    store.addAuditLog({
      user_id: user!.id,
      action: 'Bildirim ayarları güncellendi',
      entity_type: 'settings',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSaveSmtp = () => {
    store.updateSmtpSettings({
      ...smtp,
      is_configured: !!(smtp.host && smtp.username && smtp.from_email),
    });
    store.addAuditLog({
      user_id: user!.id,
      action: 'SMTP ayarları güncellendi',
      entity_type: 'settings',
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    setSettings({ ...settings, [key]: !settings[key as keyof typeof settings] });
  };

  const EMAIL_NOTIFICATIONS = [
    { key: 'email_on_ticket_created', label: 'Yeni Talep Oluşturulduğunda', description: 'Her yeni talep oluşturulduğunda e-posta bildirimi' },
    { key: 'email_on_ticket_assigned', label: 'Personel Atandığında', description: 'Talebe personel atandığında e-posta bildirimi' },
    { key: 'email_on_status_changed', label: 'Durum Değiştiğinde', description: 'Talep durumu değiştiğinde e-posta bildirimi' },
    { key: 'email_on_new_message', label: 'Yeni Mesaj Geldiğinde', description: 'Yeni yorum/mesaj geldiğinde e-posta bildirimi' },
    { key: 'email_on_ticket_closed', label: 'Talep Kapatıldığında', description: 'Talep kapatıldığında e-posta bildirimi' },
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bildirim Ayarları</h1>
        <p className="text-gray-500 mt-1">E-posta ve bildirim tercihlerini yönetin</p>
      </div>

      {/* Email Notifications */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">E-posta Bildirimleri</h2>
          </div>
        </div>
        <div className="p-6 space-y-4">
          {EMAIL_NOTIFICATIONS.map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500 mt-0.5">{item.description}</p>
              </div>
              <button
                onClick={() => toggleSetting(item.key as keyof typeof settings)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  settings[item.key as keyof typeof settings]
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {settings[item.key as keyof typeof settings] ? 'Açık' : 'Kapalı'}
              </button>
            </div>
          ))}
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button
            onClick={handleSaveNotifications}
            className="px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90"
            style={{ backgroundColor: company.primary_color }}
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            <span>{saved ? 'Kaydedildi' : 'Kaydet'}</span>
          </button>
        </div>
      </div>

      {/* SMTP Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <Send className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">SMTP Sunucu Ayarları</h2>
          </div>
          <p className="text-sm text-gray-500 mt-1">E-posta gönderimi için SMTP sunucu yapılandırması</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SMTP Sunucu</label>
              <input
                type="text"
                value={smtp.host}
                onChange={(e) => setSmtp({ ...smtp, host: e.target.value })}
                placeholder="smtp.example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
              <input
                type="number"
                value={smtp.port}
                onChange={(e) => setSmtp({ ...smtp, port: parseInt(e.target.value) || 587 })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kullanıcı Adı</label>
              <input
                type="text"
                value={smtp.username}
                onChange={(e) => setSmtp({ ...smtp, username: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <input
                type="password"
                value={smtp.password}
                onChange={(e) => setSmtp({ ...smtp, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gönderen E-posta</label>
              <input
                type="email"
                value={smtp.from_email}
                onChange={(e) => setSmtp({ ...smtp, from_email: e.target.value })}
                placeholder="noreply@example.com"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gönderen Adı</label>
              <input
                type="text"
                value={smtp.from_name}
                onChange={(e) => setSmtp({ ...smtp, from_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          </div>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={smtp.use_tls}
              onChange={(e) => setSmtp({ ...smtp, use_tls: e.target.checked })}
              className="w-4 h-4 rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">TLS kullan</span>
          </label>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${smtpSettings.is_configured ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-gray-500">
              {smtpSettings.is_configured ? 'Yapılandırılmış' : 'Yapılandırılmamış'}
            </span>
          </div>
          <button
            onClick={handleSaveSmtp}
            className="px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90"
            style={{ backgroundColor: company.primary_color }}
          >
            <Save className="w-4 h-4" />
            <span>SMTP Kaydet</span>
          </button>
        </div>
      </div>

      {/* Telegram Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">Telegram Entegrasyonu</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Sadece Bildirim</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">Kullanıcılar Telegram üzerinden bildirim alabilir (yanıt veremezler)</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">Telegram Bildirimleri</p>
              <p className="text-sm text-gray-500">Telegram bot üzerinden bildirim gönder</p>
            </div>
            <button
              onClick={() => toggleSetting('telegram_enabled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.telegram_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {settings.telegram_enabled ? 'Açık' : 'Kapalı'}
            </button>
          </div>
          {settings.telegram_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bot Token</label>
              <input
                type="text"
                value={settings.telegram_bot_token}
                onChange={(e) => setSettings({ ...settings, telegram_bot_token: e.target.value })}
                placeholder="123456789:ABC..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* WhatsApp Integration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <MessageSquare className="w-5 h-5 text-gray-400" />
            <h2 className="font-semibold text-gray-900">WhatsApp Entegrasyonu</h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Sadece Bildirim</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">WhatsApp Business API üzerinden bildirim gönder (yanıt alınamaz)</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-900">WhatsApp Bildirimleri</p>
              <p className="text-sm text-gray-500">WhatsApp üzerinden bildirim gönder</p>
            </div>
            <button
              onClick={() => toggleSetting('whatsapp_enabled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                settings.whatsapp_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {settings.whatsapp_enabled ? 'Açık' : 'Kapalı'}
            </button>
          </div>
          {settings.whatsapp_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp API Anahtarı</label>
              <input
                type="text"
                value={settings.whatsapp_api_key}
                onChange={(e) => setSettings({ ...settings, whatsapp_api_key: e.target.value })}
                placeholder="API anahtarı"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
