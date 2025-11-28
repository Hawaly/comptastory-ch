// Types de la base de données Supabase

export type ClientType = 'oneshot' | 'mensuel';
export type ClientStatus = 'actif' | 'pause' | 'termine' | 'potentiel';
export type MandatStatus = 'en_cours' | 'termine' | 'annule';
export type InvoiceStatus = 'brouillon' | 'envoyee' | 'payee' | 'annulee';
export type ExpenseType = 'client_mandat' | 'yourstory';
export type RecurrenceType = 'oneshot' | 'mensuel';
export type TaskStatus = 'a_faire' | 'en_cours' | 'terminee';
export type TaskType = 'contenu' | 'video' | 'reunion' | 'reporting' | 'autre';

// Interface Client
export interface Client {
  id: number;
  name: string;
  type: ClientType;
  status: ClientStatus;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  address: string | null;
  zip_code: string | null;
  locality: string | null;
  represented_by: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Interface CompanySettings
export interface CompanySettings {
  id: number;
  agency_name: string;
  address: string | null;
  zip_code: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  email: string | null;
  tva_number: string | null;
  represented_by: string | null;
  iban: string | null;
  qr_iban: string | null;
}

// Type pour créer un client (sans id, created_at, updated_at)
export type ClientInsert = Omit<Client, 'id' | 'created_at' | 'updated_at'>;

// Type pour mettre à jour un client (tous les champs optionnels sauf id)
export type ClientUpdate = Partial<Omit<Client, 'id' | 'created_at' | 'updated_at'>>;

// Interface Mandat
export interface Mandat {
  id: number;
  client_id: number;
  title: string;
  description: string | null;
  mandat_type: string | null;
  status: MandatStatus;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

// Type pour créer un mandat
export type MandatInsert = Omit<Mandat, 'id' | 'created_at' | 'updated_at'>;

// Type pour mettre à jour un mandat
export type MandatUpdate = Partial<Omit<Mandat, 'id' | 'created_at' | 'updated_at'>>;

// Interface MandatTask
export interface MandatTask {
  id: number;
  mandat_id: number;
  title: string;
  details: string | null;
  type: TaskType;
  status: TaskStatus;
  due_date: string | null;
  created_at: string;
  updated_at: string;
}

// Type pour créer une tâche
export type MandatTaskInsert = Omit<MandatTask, 'id' | 'created_at' | 'updated_at'>;

// Type pour mettre à jour une tâche
export type MandatTaskUpdate = Partial<Omit<MandatTask, 'id' | 'created_at' | 'updated_at'>>;

// Labels pour les statuts de mandat
export const MANDAT_STATUS_LABELS: Record<MandatStatus, string> = {
  en_cours: 'En cours',
  termine: 'Terminé',
  annule: 'Annulé',
};

// Couleurs pour les statuts de mandat
export const MANDAT_STATUS_COLORS: Record<MandatStatus, string> = {
  en_cours: 'bg-white text-black font-black border-[3px] border-blue-600 shadow-sm',
  termine: 'bg-white text-black font-black border-[3px] border-green-600 shadow-sm',
  annule: 'bg-white text-black font-black border-[3px] border-red-600 shadow-sm',
};

// Labels pour les types de tâche
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  contenu: 'Contenu',
  video: 'Vidéo',
  reunion: 'Réunion',
  reporting: 'Reporting',
  autre: 'Autre',
};

// Labels pour les statuts de tâche
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  a_faire: 'À faire',
  en_cours: 'En cours',
  terminee: 'Terminée',
};

// Couleurs pour les statuts de tâche
export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  a_faire: 'bg-white text-black font-black border-[3px] border-gray-600 shadow-sm',
  en_cours: 'bg-white text-black font-black border-[3px] border-blue-600 shadow-sm',
  terminee: 'bg-white text-black font-black border-[3px] border-green-600 shadow-sm',
};

// Interface Invoice
export interface Invoice {
  id: number;
  client_id: number;
  mandat_id: number | null;
  invoice_number: string;
  issue_date: string;
  due_date: string | null;
  total_ht: number;
  total_tva: number;
  total_ttc: number;
  status: InvoiceStatus;
  pdf_path: string | null;
  qr_additional_info: string | null;
  created_at: string;
  updated_at: string;
}

// Type pour créer une facture
export type InvoiceInsert = Omit<Invoice, 'id' | 'created_at' | 'updated_at'>;

// Type pour mettre à jour une facture
export type InvoiceUpdate = Partial<Omit<Invoice, 'id' | 'created_at' | 'updated_at'>>;

// Interface InvoiceItem
export interface InvoiceItem {
  id: number;
  invoice_id: number;
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

// Type pour créer un item de facture
export type InvoiceItemInsert = Omit<InvoiceItem, 'id'>;

// Labels pour les statuts de facture
export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  brouillon: 'Brouillon',
  envoyee: 'Envoyée',
  payee: 'Payée',
  annulee: 'Annulée',
};

// Couleurs pour les statuts de facture
export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  brouillon: 'bg-white text-black font-black border-[3px] border-gray-600 shadow-sm',
  envoyee: 'bg-white text-black font-black border-[3px] border-orange-600 shadow-sm',
  payee: 'bg-white text-black font-black border-[3px] border-green-600 shadow-sm',
  annulee: 'bg-white text-black font-black border-[3px] border-red-600 shadow-sm',
};

// Interface Contrat
export interface Contrat {
  id: number;
  client_id: number;
  mandat_id: number | null;
  contrat_number: string;
  file_path: string;
  signed_date: string | null;
  created_at: string;
}

// Type pour créer un contrat
export type ContratInsert = Omit<Contrat, 'id' | 'created_at'>;

// Interface ExpenseCategory
export interface ExpenseCategory {
  id: number;
  name: string;
  is_recurring: boolean;
}

// Interface Expense
export interface Expense {
  id: number;
  type: ExpenseType;
  mandat_id: number | null;
  client_id: number | null;
  category_id: number | null;
  label: string;
  amount: number;
  date: string;
  is_recurring: RecurrenceType;
  notes: string | null;
  receipt_path: string | null;
  created_at: string;
}

// Type pour créer une dépense
export type ExpenseInsert = Omit<Expense, 'id' | 'created_at'>;

// Type pour mettre à jour une dépense
export type ExpenseUpdate = Partial<Omit<Expense, 'id' | 'created_at'>>;

// Labels pour les types de dépense
export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  client_mandat: 'Client/Mandat',
  yourstory: 'YourStory',
};

// Couleurs pour les types de dépense
export const EXPENSE_TYPE_COLORS: Record<ExpenseType, string> = {
  client_mandat: 'bg-white text-black font-black border-[3px] border-purple-600 shadow-sm',
  yourstory: 'bg-white text-black font-black border-[3px] border-blue-600 shadow-sm',
};

// Labels pour la récurrence
export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  oneshot: 'Ponctuelle',
  mensuel: 'Mensuelle',
};

// Labels pour les enums
export const CLIENT_TYPE_LABELS: Record<ClientType, string> = {
  oneshot: 'One-shot',
  mensuel: 'Mensuel',
};

export const CLIENT_STATUS_LABELS: Record<ClientStatus, string> = {
  actif: 'Actif',
  pause: 'Pause',
  termine: 'Terminé',
  potentiel: 'Potentiel',
};

// Couleurs pour les status (texte NOIR sur fond BLANC)
export const CLIENT_STATUS_COLORS: Record<ClientStatus, string> = {
  actif: 'bg-white text-black font-black border-[3px] border-green-600 shadow-sm',
  pause: 'bg-white text-black font-black border-[3px] border-orange-500 shadow-sm',
  termine: 'bg-white text-black font-black border-[3px] border-gray-600 shadow-sm',
  potentiel: 'bg-white text-black font-black border-[3px] border-blue-600 shadow-sm',
};

export const CLIENT_TYPE_COLORS: Record<ClientType, string> = {
  oneshot: 'bg-white text-black font-black border-[3px] border-purple-600 shadow-sm',
  mensuel: 'bg-white text-black font-black border-[3px] border-indigo-600 shadow-sm',
};

