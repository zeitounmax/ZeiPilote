'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { loadData, saveData, type Client } from '@/data/store';

interface ClientFormProps {
  onSubmit: (client: Client) => void;
  onCancel: () => void;
  initialData?: Client;
}

interface ClientFormData {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export default function ClientForm({ onSubmit, onCancel, initialData }: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormData>({
    defaultValues: initialData || {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  const onSubmitForm = async (data: ClientFormData) => {
    const appData = loadData();
    
    const newClient: Client = {
      id: initialData?.id || crypto.randomUUID(),
      ...data,
      createdAt: initialData?.createdAt || new Date().toISOString(),
    };

    if (initialData) {
     
      const index = appData.clients.findIndex(c => c.id === initialData.id);
      if (index !== -1) {
        appData.clients[index] = newClient;
      }
    } else {
      
      appData.clients.push(newClient);
    }

    saveData(appData);
    onSubmit(newClient);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">
          Nom
        </label>
        <input
          type="text"
          id="name"
          {...register('name', { required: 'Le nom est requis' })}
          className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-500">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-white">
          Email
        </label>
        <input
          type="email"
          id="email"
          {...register('email', {
            required: 'L\'email est requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide',
            },
          })}
          className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-white">
          Téléphone
        </label>
        <input
          type="tel"
          id="phone"
          {...register('phone')}
          className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="address" className="block text-sm font-medium text-white">
          Adresse
        </label>
        <textarea
          id="address"
          rows={3}
          {...register('address')}
          className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white focus:outline-none"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Enregistrement...' : initialData ? 'Mettre à jour' : 'Créer'}
        </button>
      </div>
    </form>
  );
}
