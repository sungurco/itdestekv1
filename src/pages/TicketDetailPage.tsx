import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Clock,
  User,
  Calendar,
  Tag,
  AlertTriangle,
  MessageSquare,
  Paperclip,
  Send,
  Edit,
  CheckCircle,
  UserCheck,
  FileText,
  ChevronDown,
  Lock,
  Unlock,
} from 'lucide-react';
import { useAuth } from '../lib/auth-context';
import { store } from '../lib/store';
import { TicketStatus, TicketPriority, TicketComment } from '../types';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

export function TicketDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const company = store.getCompany();

  const ticket = store.getTicket(ticketId || '');
  const categories = store.getCategories();
  const users = store.getUsers();
  const comments = store.getComments(ticketId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  const isAdmin = user?.role === 'Sistem Yöneticisi';
  const isTechnician = user?.role === 'IT Destek Personeli';
  const isStaff = isAdmin || isTechnician;
  const isRequester = ticket?.requester_id === user?.id;

  const [newComment, setNewComment] = useState('');
  const [isInternalComment, setIsInternalComment] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssignDropdown, setShowAssignDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h1 className="text-xl font-semibold text-gray-900">Talep Bulunamadı</h1>
        <p className="text-gray-500 mt-2">Aradığınız talep mevcut değil veya erişiminiz kısıtlı.</p>
        <Link to="/tickets/all" className="mt-4 inline-block text-sm hover:underline" style={{ color: company.primary_color }}>
          Taleplere Dön
        </Link>
      </div>
    );
  }

  const STATUS_OPTIONS: TicketStatus[] = ['Yeni', 'Atandı', 'İşlemde', 'Kullanıcıdan Bilgi Bekleniyor', 'Çözüm Uygulandı', 'Onay Bekliyor', 'Kapatıldı'];
  const PRIORITY_OPTIONS: TicketPriority[] = ['Düşük', 'Normal', 'Yüksek', 'Kritik'];

  const technicians = users.filter(u => (u.role === 'IT Destek Personeli' || u.role === 'Sistem Yöneticisi') && u.is_active);

  const getCategoryName = (categoryId?: string) => categories.find(c => c.id === categoryId)?.name || 'Diğer';
  const getCategoryColor = (categoryId?: string) => categories.find(c => c.id === categoryId)?.color || '#6b7280';
  const getUserName = (userId?: string) => {
    if (!userId) return 'Atanmamış';
    const u = users.find(u => u.id === userId);
    return u ? `${u.first_name} ${u.last_name}` : 'Bilinmiyor';
  };
  const getUser = (userId: string) => users.find(u => u.id === userId);

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

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    store.addComment({
      ticket_id: ticket.id,
      user_id: user!.id,
      content: newComment.trim(),
      is_internal: isInternalComment && isStaff,
    });

    // If it's not an internal comment, update ticket status
    if (!isInternalComment) {
      store.updateTicket(ticket.id, { updated_at: new Date().toISOString() });
    }

    setNewComment('');
    setIsInternalComment(false);
    // Refresh the page to show the new comment
    window.location.reload();
  };

  const handleStatusChange = (status: TicketStatus) => {
    store.updateTicket(ticket.id, { status });
    store.addAuditLog({
      user_id: user!.id,
      action: 'Durum değiştirildi',
      entity_type: 'ticket',
      entity_id: ticket.id,
      details: { old_status: ticket.status, new_status: status },
    });
    setShowStatusDropdown(false);
    window.location.reload();
  };

  const handleAssign = (assigneeId: string | null) => {
    store.updateTicket(ticket.id, { assigned_to: assigneeId, status: assigneeId ? 'Atandı' : 'Yeni' });
    store.addAuditLog({
      user_id: user!.id,
      action: 'Personel atandı',
      entity_type: 'ticket',
      entity_id: ticket.id,
      details: { assigned_to: assigneeId },
    });
    setShowAssignDropdown(false);
    window.location.reload();
  };

  const handlePriorityChange = (priority: TicketPriority) => {
    store.updateTicket(ticket.id, { priority });
    store.addAuditLog({
      user_id: user!.id,
      action: 'Öncelik değiştirildi',
      entity_type: 'ticket',
      entity_id: ticket.id,
      details: { old_priority: ticket.priority, new_priority: priority },
    });
    setShowPriorityDropdown(false);
    window.location.reload();
  };

  const canModify = isStaff || isRequester;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 font-mono">{ticket.ticket_number}</span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                {ticket.status}
              </span>
              <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mt-2">{ticket.title}</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Açıklama</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
          </div>

          {/* Comments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Yorumlar ({comments.length})</span>
              </h2>
            </div>

            <div className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
              {comments.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p>Henüz yorum yapılmamış</p>
                </div>
              ) : (
                comments.map(comment => {
                  const commentUser = getUser(comment.user_id);
                  const isInternal = comment.is_internal;
                  return (
                    <div key={comment.id} className={`px-6 py-4 ${isInternal ? 'bg-yellow-50' : ''}`}>
                      <div className="flex items-start space-x-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                          style={{ backgroundColor: company.primary_color }}
                        >
                          {commentUser?.first_name?.[0]}{commentUser?.last_name?.[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                            <span className="font-medium text-gray-900 text-sm">
                              {commentUser?.first_name} {commentUser?.last_name}
                            </span>
                            {isInternal && (
                              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 flex items-center space-x-1">
                                <Lock className="w-3 h-3" />
                                <span>İç Not</span>
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {format(new Date(comment.created_at), 'dd.MM.yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="mt-1 text-gray-700 text-sm whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Add Comment */}
            {canModify && ['Kapatıldı'].indexOf(ticket.status) === -1 && (
              <div className="px-6 py-4 border-t border-gray-100">
                <div className="flex space-x-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0"
                    style={{ backgroundColor: company.primary_color }}
                  >
                    {user?.first_name?.[0]}{user?.last_name?.[0]}
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      placeholder="Yorumunuzu yazın..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent outline-none resize-none"
                    />
                    <div className="flex items-center justify-between mt-3">
                      {isStaff && (
                        <label className="flex items-center space-x-2 text-sm text-gray-600 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isInternalComment}
                            onChange={(e) => setIsInternalComment(e.target.checked)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                          <Lock className="w-4 h-4" />
                          <span>Sadece personel görsün (İç Not)</span>
                        </label>
                      )}
                      <button
                        onClick={handleAddComment}
                        disabled={!newComment.trim()}
                        className="px-4 py-2 rounded-lg text-white font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                        style={{ backgroundColor: company.primary_color }}
                      >
                        <Send className="w-4 h-4" />
                        <span>Gönder</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          {isStaff && ['Kapatıldı'].indexOf(ticket.status) === -1 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Hızlı İşlemler</h2>
              <div className="space-y-3">
                {/* Status */}
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm">{ticket.status}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {STATUS_OPTIONS.map(status => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Assignee */}
                <div className="relative">
                  <button
                    onClick={() => setShowAssignDropdown(!showAssignDropdown)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm">{getUserName(ticket.assigned_to)}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showAssignDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                      <button
                        onClick={() => handleAssign(null)}
                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                      >
                        Atama Kaldır
                      </button>
                      {technicians.map(tech => (
                        <button
                          key={tech.id}
                          onClick={() => handleAssign(tech.id)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50"
                        >
                          {tech.first_name} {tech.last_name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Priority */}
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-sm">{ticket.priority}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                  </button>
                  {showPriorityDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                      {PRIORITY_OPTIONS.map(priority => (
                        <button
                          key={priority}
                          onClick={() => handlePriorityChange(priority)}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {priority}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Details */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4">Talep Detayları</h2>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <User className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Talep Eden</p>
                  <p className="text-sm font-medium text-gray-900">{getUserName(ticket.requester_id)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <UserCheck className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Atanan Personel</p>
                  <p className="text-sm font-medium text-gray-900">{getUserName(ticket.assigned_to)}</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Tag className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Kategori</p>
                  <p className="text-sm font-medium text-gray-900">
                    <span
                      className="px-2 py-0.5 rounded-full text-xs"
                      style={{
                        backgroundColor: `${getCategoryColor(ticket.category_id)}15`,
                        color: getCategoryColor(ticket.category_id),
                      }}
                    >
                      {getCategoryName(ticket.category_id)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Oluşturulma Tarihi</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(ticket.created_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Son Güncelleme</p>
                  <p className="text-sm font-medium text-gray-900">
                    {format(new Date(ticket.updated_at), 'dd.MM.yyyy HH:mm')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <Paperclip className="w-5 h-5" />
              <span>Ekler</span>
            </h2>
            <p className="text-sm text-gray-500">Henüz ek dosya yok</p>
          </div>
        </div>
      </div>
    </div>
  );
}
