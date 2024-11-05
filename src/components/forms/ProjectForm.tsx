'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { loadData, saveData, type Project } from '../../data/store';

interface ProjectFormProps {
  onSubmit: (project: Project) => void;
  onCancel: () => void;
  initialData?: Project;
}

interface ProjectFormData {
  name: string;
  description: string;
  clientId: string;
  status: Project['status'];
  startDate: string;
  endDate?: string;
}

export default function ProjectForm({ onSubmit, onCancel, initialData }: ProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormData>({
    defaultValues: initialData || {
      name: '',
      description: '',
      clientId: '',
      status: 'active',
      startDate: new Date().toISOString().split('T')[0],
      endDate: '',
    },
  });

  const data = loadData();

  const onSubmitForm = async (formData: ProjectFormData) => {
    const appData = loadData();
    
    const newProject: Project = {
      id: initialData?.id || crypto.randomUUID(),
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
    };

    if (initialData) {
      const index = appData.projects.findIndex((p: Project) => p.id === initialData.id);
      if (index !== -1) {
        appData.projects[index] = newProject;
      }
    } else {
      appData.projects.push(newProject);
    }

    saveData(appData);
    onSubmit(newProject);
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-white">
          Nom du projet
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

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-white">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register('description', { required: 'La description est requise' })}
          className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
        )}
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
          <option value="active">En cours</option>
          <option value="completed">Terminé</option>
          <option value="on-hold">En pause</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="startDate" className="block text-sm font-medium text-white">
            Date de début
          </label>
          <input
            type="date"
            id="startDate"
            {...register('startDate', { required: 'La date de début est requise' })}
            className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-500">{errors.startDate.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-white">
            Date de fin (optionnelle)
          </label>
          <input
            type="date"
            id="endDate"
            {...register('endDate')}
            className="mt-1 block w-full rounded-md bg-[#1a1f2e] border border-gray-700 text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
