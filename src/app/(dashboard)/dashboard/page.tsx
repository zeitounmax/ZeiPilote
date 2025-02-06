'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { loadData, saveData, exportDataToJson, importData } from '@/data/store';
import type { AppData } from '@/data/store';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { handleExportPDF } from '@/components/ui/PDFExport';
import { Card } from '../../../components/ui/Card';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [data, setData] = useState(() => loadData());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [revenueData, setRevenueData] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('fr-FR'));
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const data = loadData();
    const invoices = data.invoices || [];
    
    const monthlyData = invoices.reduce((acc: any, invoice: any) => {
      const date = new Date(invoice.date);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += invoice.total;
      return acc;
    }, {});

    setRevenueData({
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Chiffre d\'affaires mensuel',
          data: Object.values(monthlyData),
          fill: false,
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1
        }
      ]
    });
  }, []);

  const handleExport = () => {
    exportDataToJson();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      try {
        const jsonData = JSON.parse(content);
        localStorage.setItem('zeipilote-data', JSON.stringify(jsonData));
        setData(loadData());
        alert('Données importées avec succès');
      } catch {
        alert('Erreur lors de l\'importation des données');
      }
    };
    reader.readAsText(file);
  };

  const clientCount = data?.clients.length ?? null;
  const invoiceCount = data?.invoices.length ?? null;
  const projectCount = data?.projects.length ?? null;
  const revenue = data?.invoices.reduce((total, invoice) => 
    invoice.status === 'paid' ? total + invoice.amount : total, 0) ?? null;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">Tableau de bord</h1>
        <div className="flex items-center space-x-4 text-gray-400">
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/invoices" className="bg-[#1a1f2e] rounded-lg p-6 hover:bg-[#1d2235] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#e7f3e7] rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-600">€</span>
            </div>
            <div>
              <p className="text-gray-400">Chiffre d'affaires</p>
              <p className="text-2xl text-white font-semibold">
                {revenue === null ? '-' : `${revenue} €`}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/clients" className="bg-[#1a1f2e] rounded-lg p-6 hover:bg-[#1d2235] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#e3eeff] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400">Clients</p>
              <p className="text-2xl text-white font-semibold">
                {clientCount === null ? '-' : clientCount}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/invoices" className="bg-[#1a1f2e] rounded-lg p-6 hover:bg-[#1d2235] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#f8e7ff] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400">Factures</p>
              <p className="text-2xl text-white font-semibold">
                {invoiceCount === null ? '-' : invoiceCount}
              </p>
            </div>
          </div>
        </Link>

        <Link href="/projects" className="bg-[#1a1f2e] rounded-lg p-6 hover:bg-[#1d2235] transition-colors">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#fff2e7] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400">Projets</p>
              <p className="text-2xl text-white font-semibold">
                {projectCount === null ? '-' : projectCount}
              </p>
            </div>
          </div>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-white">Actions Rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/invoices" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg text-center transition-colors">
            Nouvelle Facture
          </Link>
          <Link href="/clients" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg text-center transition-colors">
            Ajouter un Client
          </Link>
          <Link href="/projects" className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 col-span-1 md:col-span-2 rounded-lg text-center transition-colors">
            Créer un Projet
          </Link>
        </div>
      </div>
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Activité Récente</h2>
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <p className="text-gray-400 text-center">Aucune activité récente à afficher</p>
        </div>
      </div>

      <section className="bg-[#1a1f2e] rounded-lg p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Analyse des revenus</h2>
        <div className="h-[400px]">
          {revenueData && (
            <Line
              data={revenueData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      color: 'white'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  },
                  x: {
                    ticks: {
                      color: 'white'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    }
                  }
                },
                plugins: {
                  legend: {
                    labels: {
                      color: 'white'
                    }
                  }
                }
              }}
            />
          )}
        </div>
      </section>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Gestion des données</h2>
        <div className="bg-gray-900 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800 rounded-lg flex flex-col h-[200px]">
              <div className="flex-grow">
                <h3 className="text-lg font-medium mb-3">Importer des données</h3>
                <p className="text-gray-400 mb-4">
                  Importez vos données depuis une sauvegarde JSON
                </p>
              </div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md cursor-pointer transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Importer
                <input type="file" accept=".json" onChange={handleImport} className="hidden" />
              </label>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg flex flex-col h-[200px]">
              <div className="flex-grow">
                <h3 className="text-lg font-medium mb-3">Exporter en JSON</h3>
                <p className="text-gray-400 mb-4">
                  Sauvegardez vos données dans un fichier JSON
                </p>
              </div>
              <button onClick={exportDataToJson} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Exporter JSON
              </button>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg flex flex-col h-[200px]">
              <div className="flex-grow">
                <h3 className="text-lg font-medium mb-3">Exporter en PDF</h3>
                <p className="text-gray-400 mb-4">
                  Générez un rapport mensuel au format PDF
                </p>
              </div>
              <button onClick={handleExportPDF} className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Exporter PDF
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
