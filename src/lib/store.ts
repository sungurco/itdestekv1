import { Ticket, User, Category, TicketComment, AuditLog, CompanySettings, License, Backup, NotificationSettings, SmtpSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Default categories (required for system to work)
export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat-1', name: 'Donanım', description: 'Donanım sorunları', color: '#ef4444', sort_order: 1, is_active: true },
  { id: 'cat-2', name: 'Yazılım', description: 'Yazılım sorunları', color: '#3b82f6', sort_order: 2, is_active: true },
  { id: 'cat-3', name: 'Ağ', description: 'Ağ bağlantı sorunları', color: '#10b981', sort_order: 3, is_active: true },
  { id: 'cat-4', name: 'E-posta', description: 'E-posta sorunları', color: '#f59e0b', sort_order: 4, is_active: true },
  { id: 'cat-5', name: 'Siber Güvenlik', description: 'Güvenlik sorunları', color: '#8b5cf6', sort_order: 5, is_active: true },
  { id: 'cat-6', name: 'Kullanıcı Hesabı', description: 'Hesap yönetimi', color: '#ec4899', sort_order: 6, is_active: true },
  { id: 'cat-7', name: 'Diğer', description: 'Diğer sorunlar', color: '#6b7280', sort_order: 7, is_active: true },
];

// Empty default data
export const DEFAULT_USERS: User[] = [];

export const generateTicketNumber = (): string => {
  const now = new Date();
  const yearMonth = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const random = String(Math.floor(Math.random() * 99999)).padStart(5, '0');
  return `TKT-${yearMonth}-${random}`;
};

export const DEFAULT_TICKETS: Ticket[] = [];

export const DEFAULT_COMMENTS: TicketComment[] = [];

export const DEFAULT_COMPANY: CompanySettings = {
  id: 'company-1',
  company_name: 'Şirket Adı',
  primary_color: '#1e40af',
  secondary_color: '#3b82f6',
};

export const DEFAULT_LICENSE: License = {
  id: 'license-1',
  license_key: '',
  company_name: '',
  contact_email: '',
  max_users: 50,
  max_admins: 5,
  expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
  is_active: false,
  features: { reports: true, notifications: true, backup: true },
  created_at: new Date().toISOString(),
};

export const DEFAULT_NOTIFICATIONS: NotificationSettings = {
  email_on_ticket_created: false,
  email_on_ticket_assigned: false,
  email_on_status_changed: false,
  email_on_new_message: false,
  email_on_ticket_closed: false,
  telegram_enabled: false,
  whatsapp_enabled: false,
};

export const DEFAULT_SMTP: SmtpSettings = {
  host: '',
  port: 587,
  from_name: 'IT Destek Sistemi',
  use_tls: true,
  is_configured: false,
};

// Local storage helpers
const STORAGE_KEYS = {
  TICKETS: 'it_helpdesk_tickets',
  USERS: 'it_helpdesk_users',
  CATEGORIES: 'it_helpdesk_categories',
  COMMENTS: 'it_helpdesk_comments',
  COMPANY: 'it_helpdesk_company',
  LICENSE: 'it_helpdesk_license',
  AUDIT_LOGS: 'it_helpdesk_audit',
  BACKUPS: 'it_helpdesk_backups',
  NOTIFICATIONS: 'it_helpdesk_notifications',
  SMTP: 'it_helpdesk_smtp',
};

// Initialize with defaults if not exists
function initializeStorage() {
  if (!localStorage.getItem(STORAGE_KEYS.TICKETS)) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(DEFAULT_TICKETS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(DEFAULT_USERS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(DEFAULT_CATEGORIES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMMENTS)) {
    localStorage.setItem(STORAGE_KEYS.COMMENTS, JSON.stringify(DEFAULT_COMMENTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPANY)) {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(DEFAULT_COMPANY));
  }
  if (!localStorage.getItem(STORAGE_KEYS.LICENSE)) {
    localStorage.setItem(STORAGE_KEYS.LICENSE, JSON.stringify(DEFAULT_LICENSE));
  }
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(DEFAULT_NOTIFICATIONS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SMTP)) {
    localStorage.setItem(STORAGE_KEYS.SMTP, JSON.stringify(DEFAULT_SMTP));
  }
}

// Call init
initializeStorage();

// Generic CRUD operations
function getItems<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setItems<T>(key: string, items: T[]): void {
  localStorage.setItem(key, JSON.stringify(items));
}

function addItem<T extends { id: string }>(key: string, item: T): T {
  const items = getItems<T>(key);
  items.push(item);
  setItems(key, items);
  return item;
}

function updateItem<T extends { id: string }>(key: string, id: string, updates: Partial<T>): T | null {
  const items = getItems<T>(key);
  const index = items.findIndex((item: T) => (item as { id: string }).id === id);
  if (index === -1) return null;
  items[index] = { ...items[index], ...updates } as T;
  setItems(key, items);
  return items[index];
}

function deleteItem<T extends { id: string }>(key: string, id: string): boolean {
  const items = getItems<T>(key);
  const newItems = items.filter((item: T) => (item as { id: string }).id !== id);
  if (newItems.length === items.length) return false;
  setItems(key, newItems);
  return true;
}

// Reset all data
function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEYS.TICKETS);
  localStorage.removeItem(STORAGE_KEYS.USERS);
  localStorage.removeItem(STORAGE_KEYS.COMMENTS);
  localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
  localStorage.removeItem(STORAGE_KEYS.BACKUPS);
  initializeStorage();
}

// Export API
export const store = {
  // Reset
  resetAllData,

  // Tickets
  getTickets: () => getItems<Ticket>(STORAGE_KEYS.TICKETS),
  getTicket: (id: string) => getItems<Ticket>(STORAGE_KEYS.TICKETS).find(t => t.id === id),
  addTicket: (ticket: Omit<Ticket, 'id' | 'ticket_number' | 'created_at' | 'updated_at'>) => {
    const newTicket: Ticket = {
      ...ticket,
      id: uuidv4(),
      ticket_number: generateTicketNumber(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    return addItem(STORAGE_KEYS.TICKETS, newTicket);
  },
  updateTicket: (id: string, updates: Partial<Ticket>) => {
    updates.updated_at = new Date().toISOString();
    return updateItem<Ticket>(STORAGE_KEYS.TICKETS, id, updates);
  },
  deleteTicket: (id: string) => deleteItem<Ticket>(STORAGE_KEYS.TICKETS, id),

  // Users
  getUsers: () => getItems<User>(STORAGE_KEYS.USERS),
  getUser: (id: string) => getItems<User>(STORAGE_KEYS.USERS).find(u => u.id === id),
  addUser: (user: Omit<User, 'id' | 'created_at'>) => {
    const newUser: User = {
      ...user,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    return addItem(STORAGE_KEYS.USERS, newUser);
  },
  updateUser: (id: string, updates: Partial<User>) => updateItem<User>(STORAGE_KEYS.USERS, id, updates),
  deleteUser: (id: string) => deleteItem<User>(STORAGE_KEYS.USERS, id),

  // Categories
  getCategories: () => getItems<Category>(STORAGE_KEYS.CATEGORIES),
  getCategory: (id: string) => getItems<Category>(STORAGE_KEYS.CATEGORIES).find(c => c.id === id),
  addCategory: (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: uuidv4() };
    return addItem(STORAGE_KEYS.CATEGORIES, newCategory);
  },
  updateCategory: (id: string, updates: Partial<Category>) => updateItem<Category>(STORAGE_KEYS.CATEGORIES, id, updates),
  deleteCategory: (id: string) => deleteItem<Category>(STORAGE_KEYS.CATEGORIES, id),

  // Comments
  getComments: (ticketId?: string) => {
    const comments = getItems<TicketComment>(STORAGE_KEYS.COMMENTS);
    return ticketId ? comments.filter(c => c.ticket_id === ticketId) : comments;
  },
  addComment: (comment: Omit<TicketComment, 'id' | 'created_at'>) => {
    const newComment: TicketComment = {
      ...comment,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    return addItem(STORAGE_KEYS.COMMENTS, newComment);
  },

  // Company
  getCompany: () => getItems<CompanySettings>(STORAGE_KEYS.COMPANY)[0] || DEFAULT_COMPANY,
  updateCompany: (updates: Partial<CompanySettings>) => {
    const company = store.getCompany();
    const updated = { ...company, ...updates };
    setItems(STORAGE_KEYS.COMPANY, [updated]);
    return updated;
  },

  // License
  getLicense: () => getItems<License>(STORAGE_KEYS.LICENSE)[0] || DEFAULT_LICENSE,
  updateLicense: (updates: Partial<License>) => {
    const license = store.getLicense();
    const updated = { ...license, ...updates };
    setItems(STORAGE_KEYS.LICENSE, [updated]);
    return updated;
  },

  // Audit Logs
  getAuditLogs: () => getItems<AuditLog>(STORAGE_KEYS.AUDIT_LOGS),
  addAuditLog: (log: Omit<AuditLog, 'id' | 'created_at'>) => {
    const newLog: AuditLog = {
      ...log,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    return addItem(STORAGE_KEYS.AUDIT_LOGS, newLog);
  },

  // Backups
  getBackups: () => getItems<Backup>(STORAGE_KEYS.BACKUPS),
  addBackup: (backup: Omit<Backup, 'id' | 'created_at'>) => {
    const newBackup: Backup = {
      ...backup,
      id: uuidv4(),
      created_at: new Date().toISOString(),
    };
    return addItem(STORAGE_KEYS.BACKUPS, newBackup);
  },
  deleteBackup: (id: string) => deleteItem<Backup>(STORAGE_KEYS.BACKUPS, id),

  // Notifications
  getNotificationSettings: () => getItems<NotificationSettings & { id: string }>(STORAGE_KEYS.NOTIFICATIONS)[0] || DEFAULT_NOTIFICATIONS,
  updateNotificationSettings: (settings: Partial<NotificationSettings>) => {
    const current = store.getNotificationSettings();
    const updated = { ...current, ...settings, id: 'settings-1' };
    setItems(STORAGE_KEYS.NOTIFICATIONS, [updated]);
    return updated;
  },

  // SMTP
  getSmtpSettings: () => getItems<SmtpSettings & { id: string }>(STORAGE_KEYS.SMTP)[0] || DEFAULT_SMTP,
  updateSmtpSettings: (settings: Partial<SmtpSettings>) => {
    const current = store.getSmtpSettings();
    const updated = { ...current, ...settings, id: 'smtp-1' };
    setItems(STORAGE_KEYS.SMTP, [updated]);
    return updated;
  },

  // Stats
  getStats: () => {
    const tickets = store.getTickets();
    const users = store.getUsers();
    const categories = store.getCategories();

    const openStatuses = ['Yeni', 'Atandı', 'İşlemde', 'Kullanıcıdan Bilgi Bekleniyor', 'Çözüm Uygulandı', 'Onay Bekliyor'];

    const openTickets = tickets.filter(t => openStatuses.includes(t.status));
    const closedTickets = tickets.filter(t => t.status === 'Kapatıldı');
    const pendingTickets = tickets.filter(t => ['Kullanıcıdan Bilgi Bekleniyor', 'Onay Bekliyor'].includes(t.status));

    const technicians = users.filter(u => u.role === 'IT Destek Personeli' || u.role === 'Sistem Yöneticisi');
    const technicianPerformance = technicians.map(tech => {
      const assigned = tickets.filter(t => t.assigned_to === tech.id);
      const resolved = assigned.filter(t => t.resolved_at);
      return {
        technician: tech,
        assigned: assigned.length,
        resolved: resolved.length,
        avgTime: '-',
      };
    });

    return {
      totalTickets: tickets.length,
      openTickets: openTickets.length,
      closedTickets: closedTickets.length,
      pendingTickets: pendingTickets.length,
      avgResolutionTime: '-',
      ticketsByStatus: openStatuses.map(status => ({ status: status as any, count: tickets.filter(t => t.status === status).length })),
      ticketsByCategory: categories.map(cat => ({ category: cat.name, count: tickets.filter(t => t.category_id === cat.id).length })),
      ticketsByPriority: ['Düşük', 'Normal', 'Yüksek', 'Kritik'].map(priority => ({ priority: priority as any, count: tickets.filter(t => t.priority === priority).length })),
      technicianPerformance,
    };
  },
};
