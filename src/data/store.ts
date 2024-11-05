export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  clientId: string;
  amount: number;
  status: 'draft' | 'sent' | 'paid';
  date: string;
  dueDate: string;
  items: {
    description: string;
    quantity: number;
    price: number;
  }[];
}

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
}

export interface AppData {
  clients: Client[];
  invoices: Invoice[];
  projects: Project[];
  businessInfo: {
    profession: string;
    lastUpdated: string;
  };
}

export const initialData: AppData = {
  clients: [],
  invoices: [],
  projects: [],
  businessInfo: {
    profession: 'Développeur Web',
    lastUpdated: new Date().toISOString(),
  },
};

export function loadData(): AppData {
  if (typeof window === 'undefined') return initialData;
  
  const stored = localStorage.getItem('zeipilote-data');
  if (!stored) return initialData;
  
  try {
    return JSON.parse(stored);
  } catch {
    return initialData;
  }
}

export function saveData(data: AppData): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('zeipilote-data', JSON.stringify(data));
}

export function updateProfession(profession: string): void {
  const data = loadData();
  data.businessInfo.profession = profession;
  data.businessInfo.lastUpdated = new Date().toISOString();
  saveData(data);
}

export function exportDataToJson(): void {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `zeipilote-export-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportInvoiceToPdf(invoice: Invoice): void {
  const data = loadData();
  const client = data.clients.find(c => c.id === invoice.clientId);
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Facture ${invoice.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { margin-bottom: 40px; }
        .invoice-details { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .total { text-align: right; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FACTURE</h1>
        <p>Date: ${new Date(invoice.date).toLocaleDateString('fr-FR')}</p>
        <p>Échéance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}</p>
      </div>
      
      <div class="invoice-details">
        <h2>Client</h2>
        <p>${client?.name || 'Client inconnu'}</p>
        ${client?.address ? `<p>${client.address}</p>` : ''}
        ${client?.email ? `<p>${client.email}</p>` : ''}
        ${client?.phone ? `<p>${client.phone}</p>` : ''}
      </div>

      <table>
        <thead>
          <tr>
            <th>Description</th>
            <th>Quantité</th>
            <th>Prix unitaire</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.items.map(item => `
            <tr>
              <td>${item.description}</td>
              <td>${item.quantity}</td>
              <td>${formatCurrency(item.price)}</td>
              <td>${formatCurrency(item.quantity * item.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="total">
        <p>Total: ${formatCurrency(invoice.amount)}</p>
      </div>
    </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  }
}

export function importData(jsonString: string): boolean {
  try {
    const data = JSON.parse(jsonString) as AppData;
    // Validate data structure
    if (!data.clients || !data.invoices || !data.projects || !data.businessInfo) {
      return false;
    }
    saveData(data);
    return true;
  } catch {
    return false;
  }
}

export function deleteClient(clientId: string): void {
  const data = loadData();
  data.clients = data.clients.filter(client => client.id !== clientId);
  // Also delete related projects and invoices
  data.projects = data.projects.filter(project => project.clientId !== clientId);
  data.invoices = data.invoices.filter(invoice => invoice.clientId !== clientId);
  saveData(data);
}

export function deleteProject(projectId: string): void {
  const data = loadData();
  data.projects = data.projects.filter(project => project.id !== projectId);
  saveData(data);
}

export function deleteInvoice(invoiceId: string): void {
  const data = loadData();
  data.invoices = data.invoices.filter(invoice => invoice.id !== invoiceId);
  saveData(data);
}

export function getRevenueTotal(invoices: Invoice[]): number {
  return invoices.reduce((total, invoice) => {
    return invoice.status === 'paid' ? total + invoice.amount : total;
  }, 0);
}

export function getClientById(clients: Client[], id: string): Client | undefined {
  return clients.find(client => client.id === id);
}

export function getProjectsByClientId(projects: Project[], clientId: string): Project[] {
  return projects.filter(project => project.clientId === clientId);
}

export function getInvoicesByClientId(invoices: Invoice[], clientId: string): Invoice[] {
  return invoices.filter(invoice => invoice.clientId === clientId);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
