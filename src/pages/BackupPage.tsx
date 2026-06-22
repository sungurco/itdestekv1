import React, { useState } from 'react';
import { Download, Trash2, Clock, HardDrive, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { store } from '../lib/store';
import { useAuth } from '../lib/auth-context';
import { Backup } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function BackupPage() {
  const { user } = useAuth();
  const company = store.getCompany();
  const backups = store.getBackups();

  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);

    // Simulate backup creation
    await new Promise(resolve => setTimeout(resolve, 2000));

    const now = new Date();
    const backup: Omit<Backup, 'id' | 'created_at'> = {
      file_name: `yedek_${format(now, 'yyyyMMdd_HHmmss')}.sql`,
      file_path: `/backups/yedek_${format(now, 'yyyyMMdd_HHmmss')}.sql`,
      file_size: Math.floor(Math.random() * 5000000) + 1000000,
      backup_type: 'manuel',
      status: 'completed',
      created_by: user?.id,
    };

    store.addBackup(backup);
    setIsCreatingBackup(false);
    window.location.reload();
  };

  const handleDeleteBackup = (backupId: string) => {
    store.deleteBackup(backupId);
    setShowDeleteConfirm(null);
    window.location.reload();
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Bilinmiyor';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yedekleme Yönetimi</h1>
          <p className="text-gray-500 mt-1">{backups.length} yedek dosyası</p>
        </div>
        <button
          onClick={handleCreateBackup}
          disabled={isCreatingBackup}
          className="px-6 py-2.5 rounded-lg text-white font-medium flex items-center space-x-2 hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{ backgroundColor: company.primary_color }}
        >
          {isCreatingBackup ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Yedekleniyor...</span>
            </>
          ) : (
            <>
              <Database className="w-5 h-5" />
              <span>Yedek Al</span>
            </>
          )}
        </button>
      </div>

      {/* Storage Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <HardDrive className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Toplam Yedekler</p>
              <p className="text-2xl font-bold text-gray-900">{backups.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Toplam Boyut</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatFileSize(backups.reduce((acc, b) => acc + (b.file_size || 0), 0))}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Son Yedekleme</p>
              <p className="text-lg font-bold text-gray-900">
                {backups.length > 0
                  ? format(new Date(backups[backups.length - 1].created_at), 'dd.MM.yyyy HH:mm')
                  : 'Henüz yok'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Backup Schedule (UI only) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Otomatik Yedekleme Ayarları</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Yedekleme Sıklığı</label>
            <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none">
              <option value="daily">Her Gün</option>
              <option value="weekly">Her Hafta</option>
              <option value="monthly">Her Ay</option>
              <option value="disabled">Kapalı</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Yedekleme Saati</label>
            <input
              type="time"
              defaultValue="02:00"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none"
            />
          </div>
        </div>
        <div className="mt-4 flex items-center justify-end space-x-3">
          <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            Sıfırla
          </button>
          <button
            className="px-4 py-2 rounded-lg text-white font-medium hover:opacity-90"
            style={{ backgroundColor: company.primary_color }}
          >
            Kaydet
          </button>
        </div>
      </div>

      {/* Backups List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Yedek Dosyaları</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {backups.length === 0 ? (
            <div className="px-6 py-12 text-center text-gray-500">
              <Database className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Henüz yedek dosyası yok</p>
              <p className="text-sm mt-1">Yedek al butonuna tıklayarak ilk yedeğinizi oluşturun</p>
            </div>
          ) : (
            backups.map(backup => (
              <div key={backup.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="p-2 rounded-lg bg-gray-100">
                    <HardDrive className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{backup.file_name}</p>
                    <div className="flex items-center space-x-3 mt-1 text-sm text-gray-500">
                      <span>{formatFileSize(backup.file_size)}</span>
                      <span>•</span>
                      <span>{format(new Date(backup.created_at), 'dd.MM.yyyy HH:mm')}</span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${backup.backup_type === 'otomatik' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'}`}>
                        {backup.backup_type}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="İndir"
                  >
                    <Download className="w-4 h-4 text-gray-500" />
                  </button>
                  <button
                    onClick={() => setShowDeleteConfirm(backup.id)}
                    className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 text-red-600 mb-4">
              <AlertCircle className="w-6 h-6" />
              <h3 className="text-lg font-semibold">Yedeği Sil</h3>
            </div>
            <p className="text-gray-600 mb-6">Bu yedek dosyasını silmek istediğinize emin misiniz?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                İptal
              </button>
              <button
                onClick={() => handleDeleteBackup(showDeleteConfirm)}
                className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
