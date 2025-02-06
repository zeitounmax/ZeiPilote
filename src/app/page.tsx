'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { loadData, updateProfile } from '@/data/store';

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    profession: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNewProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!formData.name.trim() || !formData.profession.trim()) {
        throw new Error('Veuillez remplir tous les champs');
      }
      
      await updateProfile({
        name: formData.name,
        profession: formData.profession
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsLoading(true);
    setError('');

    try {
      const file = e.target.files?.[0];
      if (!file) {
        throw new Error('Aucun fichier sélectionné');
      }

      const fileContent = await file.text();
      const jsonData = JSON.parse(fileContent);

      if (!jsonData.businessInfo?.name || !jsonData.businessInfo?.profession || !jsonData.clients || !jsonData.projects || !jsonData.invoices) {
        throw new Error('Format de fichier invalide');
      }

      localStorage.setItem('zeipilote-data', JSON.stringify(jsonData));
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'importation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex justify-center mb-8">
            <Image
              src="/logo.png"
              alt="Zeipilote Logo"
              width={200}
              height={200}
              style={{ width: 'auto', height: 'auto' }}
              priority
            />
          </div>

          <h1 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8">
            ZeiPilote, Ton co-pilote pour gérer ta boîte
          </h1>

          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-100 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Nouveau Profil
              </h2>
              <form onSubmit={handleNewProfile} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Votre nom
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Jean Dupont"
                  />
                </div>
                <div>
                  <label htmlFor="profession" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Votre profession
                  </label>
                  <input
                    type="text"
                    id="profession"
                    value={formData.profession}
                    onChange={(e) => setFormData(prev => ({ ...prev, profession: e.target.value }))}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Ex: Développeur freelance"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Création...' : 'Créer un nouveau profil'}
                </button>
              </form>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">OU</span>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-200">
                Importer des Données Existantes
              </h2>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleImport}
                  accept=".json"
                  className="hidden"
                  id="file-import"
                  disabled={isLoading}
                />
                <label
                  htmlFor="file-import"
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  <span className="text-gray-700 dark:text-gray-200">
                    {isLoading ? 'Importation...' : 'Sélectionner un fichier JSON'}
                  </span>
                </label>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Importez vos données sauvegardées au format JSON
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
