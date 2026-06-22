export type UserRole = 'Sistem Yöneticisi' | 'IT Destek Personeli' | 'Firma Kullanıcısı';

export type TicketStatus = 'Yeni' | 'Atandı' | 'İşlemde' | 'Kullanıcıdan Bilgi Bekleniyor' | 'Çözüm Uygulandı' | 'Onay Bekliyor' | 'Kapatıldı';

export type TicketPriority = 'Düşük' | 'Normal' | 'Yüksek' | 'Kritik';

export interface CompanySettings {
  id: string;
  company_name: string;
  logo_url?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  primary_color: string;
  secondary_color: string;
}

export interface User {
  id: string;
  employee_id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  department?: string;
  position?: string;
  avatar_url?: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  sort_order: number;
  is_active: boolean;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category_id?: string;
  category?: Category;
  priority: TicketPriority;
  status: TicketStatus;
  requester_id: string;
  requester?: User;
  assigned_to?: string;
  assignee?: User;
  created_at: string;
  updated_at: string;
  resolved_at?: string;
  closed_at?: string;
  resolution_notes?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

export interface TicketComment {
  id: string;
  ticket_id: string;
  user_id: string;
  user?: User;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketAttachment {
  id: string;
  ticket_id: string;
  comment_id?: string;
  file_name: string;
  file_path: string;
  file_size: number;
  file_type?: string;
  uploaded_by: string;
  created_at: string;
}

export interface TicketHistory {
  id: string;
  ticket_id: string;
  user_id: string;
  user?: User;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  ip_address?: string;
  created_at: string;
}

export interface Backup {
  id: string;
  file_name: string;
  file_path: string;
  file_size?: number;
  backup_type: 'manuel' | 'otomatik';
  status: string;
  created_by?: string;
  created_at: string;
}

export interface NotificationSettings {
  email_on_ticket_created: boolean;
  email_on_ticket_assigned: boolean;
  email_on_status_changed: boolean;
  email_on_new_message: boolean;
  email_on_ticket_closed: boolean;
  telegram_enabled: boolean;
  telegram_bot_token?: string;
  whatsapp_enabled: boolean;
  whatsapp_api_key?: string;
}

export interface SmtpSettings {
  host?: string;
  port: number;
  username?: string;
  password?: string;
  from_email?: string;
  from_name: string;
  use_tls: boolean;
  is_configured: boolean;
}

export interface License {
  id: string;
  license_key: string;
  company_name: string;
  contact_email: string;
  contact_phone?: string;
  max_users: number;
  max_admins: number;
  expires_at: string;
  is_active: boolean;
  features: Record<string, boolean>;
  created_at: string;
  activated_at?: string;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  pendingTickets: number;
  avgResolutionTime: string;
  ticketsByStatus: { status: TicketStatus; count: number }[];
  ticketsByCategory: { category: string; count: number }[];
  ticketsByPriority: { priority: TicketPriority; count: number }[];
  technicianPerformance: { technician: User; assigned: number; resolved: number; avgTime: string }[];
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  technicianId?: string;
  categoryId?: string;
  status?: TicketStatus;
}
