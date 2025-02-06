export interface BusinessInfo {
  name: string;
  profession: string;
  lastUpdated: string;
}

export interface Invoice {
  id: string;
  date: string;
  client: string;
  clientId: string;
  reference?: string;
  total: number;
  items: Array<{
    description: string;
    quantity: number;
    price: number;
  }>;
  status: 'draft' | 'sent' | 'paid';
  dueDate: string;
  amount: number;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  clientId: string;
  status: string;
  budget?: number;
  createdAt: string;
}

export interface Settings {
  currency: string;
  currencyFormat: string;
}

export interface AppData {
  clients: Client[];
  invoices: Invoice[];
  projects: Project[];
  businessInfo: BusinessInfo;
  settings?: Settings;
} 