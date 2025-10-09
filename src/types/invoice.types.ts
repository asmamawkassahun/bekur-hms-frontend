// Invoice Types

export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number; // quantity * unitPrice
}

export interface Invoice {
  id: string;
  propertyId?: string;
  reservationId?: string;
  guestId?: string;
  number: string; // INV-00123
  currency: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInvoiceData {
  propertyId?: string;
  reservationId?: string;
  guestId?: string;
  currency: string;
  issueDate: string;
  dueDate: string;
  items: Omit<InvoiceItem, 'id' | 'total'>[];
  taxRate?: number;
  notes?: string;
}

export interface UpdateInvoiceData {
  currency?: string;
  issueDate?: string;
  dueDate?: string;
  items?: Omit<InvoiceItem, 'id' | 'total'>[];
  taxRate?: number;
  notes?: string;
  status?: InvoiceStatus;
}

export interface SendInvoiceData {
  toEmail: string;
  message?: string;
}


