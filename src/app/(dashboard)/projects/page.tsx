'use client';

import React, { useState } from 'react';
import { loadData, deleteProject, type Project, getClientById } from '@/data/store';
import Modal from '@/components/ui/Modal';
import ProjectForm from '@/components/forms/ProjectForm';

export default function ProjectsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | undefined>(undefined);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const data = loadData();

  const handleAddProject = () => {
    setSelectedProject(undefined);
    setIsModalOpen(true);
  };

  const handleEditProject = (project: Project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
    e.stopPropagation();
    setProjectToDelete(project);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (projectToDelete) {
      deleteProject(projectToDelete.id);
      setShowDeleteConfirm(false);
      setProjectToDelete(null);
      window.location.reload();
    }
  };

  const handleSubmitProject = (project: Project) => {
    setIsModalOpen(false);
   
    window.location.reload(); 
  };

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'on-hold':
        return 'En pause';
      default:
        return status;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-white">Projets</h1>
        <button
          onClick={handleAddProject}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Nouveau Projet
        </button>
      </div>

      {data.projects.length === 0 ? (
        <div className="bg-[#1a1f2e] rounded-lg p-6">
          <p className="text-gray-400 text-center">Aucun projet à afficher</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.projects.map((project) => {
            const client = getClientById(data.clients, project.clientId);
            return (
              <div
                key={project.id}
                className="bg-[#1a1f2e] rounded-lg p-6 hover:bg-[#1d2235] transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-medium text-white">{project.name}</h3>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditProject(project)}
                      className="p-2 text-gray-400 hover:text-white transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => handleDeleteClick(e, project)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-gray-400">
                    Client: {client?.name || 'Client inconnu'}
                  </p>
                  <p className="text-sm text-gray-400">
                    Début: {new Date(project.startDate).toLocaleDateString('fr-FR')}
                  </p>
                  {project.endDate && (
                    <p className="text-sm text-gray-400">
                      Fin: {new Date(project.endDate).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-400 line-clamp-2">
                    {project.description}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">
                      {project.endDate ? 'Durée:' : 'En cours depuis:'}
                    </span>
                    <span className="text-white">
                      {(() => {
                        const start = new Date(project.startDate);
                        const end = project.endDate ? new Date(project.endDate) : new Date();
                        const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                        return `${days} jour${days > 1 ? 's' : ''}`;
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedProject ? 'Modifier le projet' : 'Nouveau projet'}
      >
        <ProjectForm
          onSubmit={handleSubmitProject}
          onCancel={() => setIsModalOpen(false)}
          initialData={selectedProject}
        />
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        }}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p className="text-white">
            Êtes-vous sûr de vouloir supprimer ce projet ?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setProjectToDelete(null);
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
