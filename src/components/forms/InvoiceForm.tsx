'use client';

import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { loadData, saveData, type Invoice, formatCurrency } from '../../data/store';

interface InvoiceFormProps {
  onSubmit: (invoice: Invoice) => void;
  onCancel: () => void;
  initialData?: Invoice;
}

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
}

interface InvoiceFormData {
  clientId: string;
  date: string;
  dueDate: string;
  status: Invoice['status'];
  items: InvoiceItem[];
}

export default function InvoiceForm({ onSubmit, onCancel, initialData }: InvoiceFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormData>({
    defaultValues: initialData || {
      clientId: '',
      date: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'draft',
      items: [{ description: '', quantity: 1, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items',
  });

  const data = loadData();
  const watchItems = watch('items');

  const calculateTotal = (items: InvoiceItem[]) => {
    return items.reduce((total, item) => total + (item.quantity * item.price), 0);
  };

  const onSubmitForm = async (formData: InvoiceFormData) => {
    const appData = loadData();
    
    const newInvoice: Invoice = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      amount: calculateTotal(formData.items),
      date: new Date(formData.date).toISOString(),
      dueDate: new Date(formData.dueDate).toISOString(),
    };

    if (initialData) {
      const index = appData.invoices.findIndex(i => i.id === initialData.id);
      if (index !== -1) {
        appData.invoices[index] = newInvoice;
      }
    } else {
      appData.invoices.push(newInvoice);
    }

    saveData(appData);
    onSubmit(newInvoice);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label htmlFor="clientId" className="block text-sm font-medium text-white">
          Client
        </label>
        <select
          id="clientId"
          {...register('clientId', { required: 'Le client est requis' })}
          className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Sélectionner un client</option>
          {data.clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
        {errors.clientId && (
          <p className="mt-1 text-sm text-red-500">{errors.clientId.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-white">
            Date de facturation
          </label>
          <input
            type="date"
            id="date"
            {...register('date', { required: 'La date est requise' })}
            className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="dueDate" className="block text-sm font-medium text-white">
            Date d&apos;échéance
          </label>
          <input
            type="date"
            id="dueDate"
            {...register('dueDate', { required: 'La date d\'échéance est requise' })}
            className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.dueDate && (
            <p className="mt-1 text-sm text-red-500">{errors.dueDate.message}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="status" className="block text-sm font-medium text-white">
          Statut
        </label>
        <select
          id="status"
          {...register('status')}
          className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="draft">Brouillon</option>
          <option value="sent">Envoyée</option>
          <option value="paid">Payée</option>
        </select>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium text-white">Articles</h3>
          <button
            type="button"
            onClick={() => append({ description: '', quantity: 1, price: 0 })}
            className="text-sm text-blue-500 hover:text-blue-400"
          >
            + Ajouter un article
          </button>
        </div>

        {fields.map((field, index) => (
          <div key={field.id} className="grid grid-cols-12 gap-4">
            <div className="col-span-6">
              <input
                {...register(`items.${index}.description` as const, {
                  required: 'La description est requise',
                })}
                placeholder="Description"
                className="w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-2">
              <input
                type="number"
                {...register(`items.${index}.quantity` as const, {
                  required: 'La quantité est requise',
                  min: { value: 1, message: 'Minimum 1' },
                })}
                placeholder="Quantité"
                className="w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-3">
              <input
                type="number"
                step="0.01"
                {...register(`items.${index}.price` as const, {
                  required: 'Le prix est requis',
                  min: { value: 0, message: 'Le prix doit être positif' },
                })}
                placeholder="Prix unitaire"
                className="w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="col-span-1 flex items-center justify-center">
              {index > 0 && (
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="text-red-500 hover:text-red-400"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-end pt-4 border-t border-gray-700">
          <p className="text-lg text-white">
            Total: {formatCurrency(calculateTotal(watchItems))}
          </p>
        </div>
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
