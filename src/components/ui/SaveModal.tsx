'use client';

import { useState } from 'react';
import { loadData } from '@/data/store';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function SaveModal({ isOpen, onClose, onConfirm }: SaveModalProps) {
  if (!isOpen) return null;

  const handleSave = () => {
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
    onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6 shadow-xl">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            Sauvegarder vos données ?
          </h3>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Voulez-vous sauvegarder vos données avant de quitter ? Cela vous permettra de les réimporter plus tard.
          </p>
          
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Quitter sans sauvegarder
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Sauvegarder et quitter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 