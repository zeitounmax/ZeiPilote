'use client';

import { useState, useEffect } from 'react';
import { loadData, updateProfile, updateSettings } from '@/data/store';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Chart } from 'chart.js/auto';
import type { AppData } from '@/types';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: '',
    profession: '',
    currency: 'EUR',
    currencyFormat: 'fr-FR'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });

  useEffect(() => {
    const data = loadData();
    setFormData({
      name: data.businessInfo.name,
      profession: data.businessInfo.profession,
      currency: data.settings?.currency || 'EUR',
      currencyFormat: data.settings?.currencyFormat || 'fr-FR'
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', content: '' });

    try {
      await updateProfile({
        name: formData.name,
        profession: formData.profession,
        lastUpdated: new Date().toISOString()
      });

      await updateSettings({
        currency: formData.currency,
        currencyFormat: formData.currencyFormat
      });

      setMessage({
        type: 'success',
        content: 'Paramètres sauvegardés avec succès'
      });
    } catch (error) {
      setMessage({
        type: 'error',
        content: 'Erreur lors de la sauvegarde des paramètres'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthlyReport = (data: any) => {
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

  const generateRevenueChart = async (data: any, currency: string) => {
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
    chart.destroy(); // Nettoyer le graphique

    return imageData;
  };

  const handleExportPDF = async () => {
    const data = loadData();
    const { currentMonthInvoices, monthlyStats } = generateMonthlyReport(data);
    const doc = new jsPDF();
    const currency = data.settings?.currency || 'EUR';
    const currencySymbol = currency === 'EUR' ? '€' : currency === 'USD' ? '$' : '£';

    const formatAmount = (amount: number) => {
      return new Intl.NumberFormat(data.settings?.currencyFormat || 'fr-FR', {
        style: 'currency',
        currency: currency
      }).format(amount);
    };

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
          20, // x
          30, // y
          170, // largeur
          85  // hauteur
        );
      }
    } catch (error) {
      console.error('Erreur lors de la génération du graphique:', error);
    }

    const pageCount = doc.internal.pages.length - 1;
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

  const handleExportJSON = () => {
    const data = loadData();
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zeipilote-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white mb-8">Paramètres</h1>

      {message.content && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <p className="text-white">{message.content}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#1a1f2e] rounded-lg p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-white mb-2">Nom</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full bg-[#232937] text-white rounded-lg p-2 border border-gray-700"
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Profession</label>
            <input
              type="text"
              value={formData.profession}
              onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
              className="w-full bg-[#232937] text-white rounded-lg p-2 border border-gray-700"
              placeholder="Votre profession"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Devise</label>
            <select
              value={formData.currency}
              onChange={(e) => {
                const currency = e.target.value;
                let currencyFormat = 'fr-FR';
                if (currency === 'USD') currencyFormat = 'en-US';
                if (currency === 'GBP') currencyFormat = 'en-GB';
                setFormData(prev => ({ ...prev, currency, currencyFormat }));
              }}
              className="w-full bg-[#232937] text-white rounded-lg p-2 border border-gray-700"
            >
              <option value="EUR">Euro (€)</option>
              <option value="USD">Dollar ($)</option>
              <option value="GBP">Livre Sterling (£)</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
          >
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder'}
          </button>
        </div>
      </form>

      <div className="bg-[#1a1f2e] rounded-lg p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white mb-4">Exportation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleExportPDF}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exporter en PDF</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>Exporter en JSON</span>
          </button>
        </div>
      </div>
    </div>
  );
} 