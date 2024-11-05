'use client';

import React, { useState, useEffect } from 'react';
import { loadData, saveData, deleteClient, type Client, formatCurrency } from '@/data/store';
import Modal from '@/components/ui/Modal';
import ClientForm from '@/components/forms/ClientForm';

export default function ClientsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [data, setData] = useState<ReturnType<typeof loadData> | null>(null);

  useEffect(() => {
    setData(loadData());
  }, []);

  const handleAddClient = () => {
    setSelectedClient(undefined);
    setIsModalOpen(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, client: Client) => {
    e.stopPropagation();
    setClientToDelete(client);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (clientToDelete) {
      deleteClient(clientToDelete.id);
      setShowDeleteConfirm(false);
      setClientToDelete(null);
      setData(loadData());
    }
  };

  const handleSubmitClient = (client: Client) => {
    setIsModalOpen(false);
    setData(loadData());
  };

  const getClientRevenue = (clientId: string) => {
    if (!data) return 0;
    return data.invoices
      .filter(invoice => invoice.clientId === clientId && invoice.status === 'paid')
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getClientProjectCount = (clientId: string) => {
    if (!data) return 0;
    return data.projects.filter(project => project.clientId === clientId).length;
  };

  if (!data) {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-white">Clients</h1>
        </div>
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <p className="text-gray-400 text-center">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Clients</h1>
        <button
          onClick={handleAddClient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Nouveau Client
        </button>
      </div>

      {data.clients.length === 0 ? (
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <p className="text-gray-400 text-center">Aucun client à afficher</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.clients.map((client) => (
            <div
              key={client.id}
              className="bg-[#1a1f2e] rounded-lg p-6 hover:bg-[#1d2235] transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">{client.name}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditClient(client)}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClick(e, client)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="space-y-2">
                <p className="text-sm text-gray-400">{client.email}</p>
                {client.phone && (
                  <p className="text-sm text-gray-400">{client.phone}</p>
                )}
                {client.address && (
                  <p className="text-sm text-gray-400">{client.address}</p>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-400">Projets</p>
                    <p className="text-lg text-white font-medium">
                      {getClientProjectCount(client.id)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Chiffre d&apos;affaires</p>
                    <p className="text-lg text-white font-medium">
                      {formatCurrency(getClientRevenue(client.id))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedClient ? 'Modifier le client' : 'Nouveau client'}
      >
        <ClientForm
          onSubmit={handleSubmitClient}
          onCancel={() => setIsModalOpen(false)}
          initialData={selectedClient}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setClientToDelete(null);
        }}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-white">
            Êtes-vous sûr de vouloir supprimer ce client ? Cette action supprimera également tous les projets et factures associés.
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setClientToDelete(null);
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
