import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart } from 'chart.js/auto';
import { loadData } from '../../data/store';
import type { AppData, Invoice, Client, Project } from '../../types';

interface MonthlyStats {
  totalAmount: number;
  invoiceCount: number;
  averageInvoice: number;
  largestInvoice: number;
}

interface MonthlyReport {
  currentMonthInvoices: any[];
  monthlyStats: MonthlyStats;
}

const generateMonthlyReport = (data: AppData): MonthlyReport => {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const currentMonthInvoices = data.invoices.filter((invoice: any) => {
    const invoiceDate = new Date(invoice.date);
    return invoiceDate.getMonth() === currentMonth && 
           invoiceDate.getFullYear() === currentYear;
  });

  const monthlyStats = {
    totalAmount: currentMonthInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0),
    invoiceCount: currentMonthInvoices.length,
    averageInvoice: currentMonthInvoices.length > 0 
      ? currentMonthInvoices.reduce((sum: number, inv: any) => sum + inv.total, 0) / currentMonthInvoices.length 
      : 0,
    largestInvoice: currentMonthInvoices.reduce((max: number, inv: any) => Math.max(max, inv.total), 0),
  };

  return {
    currentMonthInvoices,
    monthlyStats
  };
};

const generateRevenueChart = async (data: AppData, currency: string): Promise<string | null> => {
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 400;
  const ctx = canvas.getContext('2d');

  if (!ctx) return null;

  const monthlyData = data.invoices.reduce((acc: any, invoice: any) => {
    const date = new Date(invoice.date);
    const monthYear = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    
    if (!acc[monthYear]) {
      acc[monthYear] = 0;
    }
    acc[monthYear] += invoice.total;
    return acc;
  }, {});

  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(monthlyData),
      datasets: [{
        label: 'Chiffre d\'affaires',
        data: Object.values(monthlyData),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 5
      }]
    },
    options: {
      responsive: false,
      plugins: {
        title: {
          display: true,
          text: 'Évolution du chiffre d\'affaires',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => {
              return new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: currency
              }).format(value as number);
            }
          }
        }
      }
    }
  });

  const imageData = canvas.toDataURL('image/png');
  chart.destroy();

  return imageData;
};

export const handleExportPDF = async (): Promise<void> => {
  const data = loadData();
  const { currentMonthInvoices, monthlyStats } = generateMonthlyReport(data);
  const doc = new jsPDF();
  const currency = data.settings?.currency || 'EUR';

  const titleStyle = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
  };

  const sectionTitleStyle = () => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(52, 73, 94);
  };

  const normalTextStyle = () => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat(data.settings?.currencyFormat || 'fr-FR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  titleStyle();
  doc.text('Rapport d\'activité ZeiPilote', 20, 20);
  
  normalTextStyle();
  const currentDate = new Date().toLocaleDateString('fr-FR', { 
    year: 'numeric', 
    month: 'long' 
  });
  doc.text(`Période : ${currentDate}`, 20, 30);
  doc.text(`${data.businessInfo.name} - ${data.businessInfo.profession}`, 20, 37);

  doc.setDrawColor(52, 73, 94);
  doc.line(20, 40, 190, 40);

  sectionTitleStyle();
  doc.text('Synthèse du mois', 20, 55);
  
  normalTextStyle();
  const stats = [
    `Chiffre d'affaires : ${formatAmount(monthlyStats.totalAmount)}`,
    `Nombre de factures : ${monthlyStats.invoiceCount}`,
    `Montant moyen par facture : ${formatAmount(monthlyStats.averageInvoice)}`,
    `Plus grande facture : ${formatAmount(monthlyStats.largestInvoice)}`,
    `Nombre total de clients : ${data.clients.length}`,
    `Nombre total de projets : ${data.projects.length}`,
  ];

  stats.forEach((stat, index) => {
    doc.text(stat, 30, 65 + (index * 8));
  });

  doc.addPage();
  sectionTitleStyle();
  doc.text('Liste des Clients', 20, 20);
  
  const clientsTableData = data.clients.map((client: any) => [
    client.name,
    client.email,
    client.phone || 'N/A',
    client.address || 'N/A'
  ]);

  (doc as any).autoTable({
    startY: 30,
    head: [['Nom', 'Email', 'Téléphone', 'Adresse']],
    body: clientsTableData,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    styles: { fontSize: 10 },
  });


  doc.addPage();
  sectionTitleStyle();
  doc.text('Liste des Projets', 20, 20);

  const projectsTableData = data.projects.map((project: any) => [
    project.name,
    project.client,
    project.status,
    formatAmount(project.budget || 0)
  ]);

  (doc as any).autoTable({
    startY: 30,
    head: [['Projet', 'Client', 'Statut', 'Budget']],
    body: projectsTableData,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    styles: { fontSize: 10 },
  });

  doc.addPage();
  sectionTitleStyle();
  doc.text('Factures du mois', 20, 20);

  const invoicesTableData = currentMonthInvoices.map((invoice: any) => [
    new Date(invoice.date).toLocaleDateString('fr-FR'),
    invoice.client,
    invoice.reference || 'N/A',
    formatAmount(invoice.total)
  ]);

  (doc as any).autoTable({
    startY: 30,
    head: [['Date', 'Client', 'Référence', 'Montant']],
    body: invoicesTableData,
    theme: 'grid',
    headStyles: { fillColor: [52, 73, 94], textColor: 255 },
    styles: { fontSize: 10 },
    footStyles: { fillColor: [52, 73, 94], textColor: 255 },
    foot: [['Total', '', '', formatAmount(monthlyStats.totalAmount)]],
  });

  doc.addPage();
  sectionTitleStyle();
  doc.text('Évolution du chiffre d\'affaires', 20, 20);

  try {
    const chartImage = await generateRevenueChart(data, currency);
    if (chartImage) {
      doc.addImage(
        chartImage,
        'PNG',
        20,
        30,
        170,
        85
      );
    }
  } catch (error) {
    console.error('Erreur lors de la génération du graphique:', error);
  }

  const pageCount = (doc as any).internal.getNumberOfPages();
  for(let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128);
    doc.text(
      `Page ${i} sur ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  const fileName = `zeipilote-rapport-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}; 