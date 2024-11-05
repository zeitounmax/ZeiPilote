'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadData, formatCurrency, getRevenueTotal, deleteInvoice, exportInvoiceToPdf, type Invoice } from '../../../data/store';
import Modal from '../../../components/ui/Modal';
import InvoiceForm from '../../../components/forms/InvoiceForm';

export default function InvoicesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return now.toLocaleDateString('fr-FR');
  });
  const [currentTime, setCurrentTime] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  });
  const [data, setData] = useState(() => loadData());
  const [revenue, setRevenue] = useState(() => getRevenueTotal(loadData().invoices));

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('fr-FR'));
      setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };

    const interval = setInterval(updateDateTime, 60000); 
    return () => clearInterval(interval);
  }, []);

  const refreshData = () => {
    const newData = loadData();
    setData(newData);
    setRevenue(getRevenueTotal(newData.invoices));
  };

  const handleAddInvoice = () => {
    setSelectedInvoice(undefined);
    setIsModalOpen(true);
  };

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    setInvoiceToDelete(invoice);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.id);
      setShowDeleteConfirm(false);
      setInvoiceToDelete(null);
      refreshData();
    }
  };

  const handleExportPdf = (e: React.MouseEvent, invoice: Invoice) => {
    e.stopPropagation();
    exportInvoiceToPdf(invoice);
  };

  const handleSubmitInvoice = (invoice: Invoice) => {
    setIsModalOpen(false);
    refreshData();
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Factures</h1>
        <div className="flex items-center space-x-4 text-gray-400">
          <span>{currentDate}</span>
          <span>{currentTime}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#e7f3e7] rounded-lg flex items-center justify-center">
              <span className="text-2xl text-green-600">€</span>
            </div>
            <div>
              <p className="text-gray-400">Chiffre d&apos;affaires</p>
              <p className="text-2xl text-white font-semibold">{formatCurrency(revenue)}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-[#f8e7ff] rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
            </div>
            <div>
              <p className="text-gray-400">Factures</p>
              <p className="text-2xl text-white font-semibold">{data.invoices.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Liste des Factures</h2>
          <button 
            onClick={handleAddInvoice}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Nouvelle Facture
          </button>
        </div>

        {data.invoices.length === 0 ? (
          <div className="bg-[#1a1f2e] rounded-lg p-6">
            <p className="text-gray-400 text-center">Aucune facture à afficher</p>
          </div>
        ) : (
          <div className="bg-[#1a1f2e] rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Client
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {data.invoices.map((invoice) => {
                  const client = data.clients.find(c => c.id === invoice.clientId);
                  return (
                    <tr 
                      key={invoice.id} 
                      className="hover:bg-[#1d2235]"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {client?.name || 'Client inconnu'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {formatCurrency(invoice.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                          ${invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                            invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' : 
                            'bg-gray-100 text-gray-800'}`}>
                          {invoice.status === 'paid' ? 'Payée' :
                           invoice.status === 'sent' ? 'Envoyée' : 'Brouillon'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(invoice.date).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => handleExportPdf(e, invoice)}
                          className="text-gray-400 hover:text-white transition-colors mr-4"
                          title="Exporter en PDF"
                        >
                          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice)}
                          className="text-gray-400 hover:text-white transition-colors mr-4"
                        >
                          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, invoice)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedInvoice ? 'Modifier la facture' : 'Nouvelle facture'}
      >
        <InvoiceForm
          onSubmit={handleSubmitInvoice}
          onCancel={() => setIsModalOpen(false)}
          initialData={selectedInvoice}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setInvoiceToDelete(null);
        }}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-white">
            Êtes-vous sûr de vouloir supprimer cette facture ?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setInvoiceToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none"
            >
              Annuler
            </button>
            <button
              onClick={handleConfirmDelete}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Supprimer
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
