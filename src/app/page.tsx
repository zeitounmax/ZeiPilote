'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Image from 'next/image';
import { loadData, saveData } from '../data/store';

interface FormData {
  profession: string;
}

export default function Home() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>();
  const [isLoading, setIsLoading] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const data = loadData();
    const storedData = typeof window !== 'undefined' ? localStorage.getItem('zeipilote-data') : null;
    setHasExistingData(!!data.businessInfo.profession && !!storedData);
  }, []);

  const onSubmit = (data: FormData) => {
    setIsLoading(true);
    const appData = loadData();
    appData.businessInfo.profession = data.profession;
    appData.businessInfo.lastUpdated = new Date().toISOString();
    
    saveData(appData);
    router.push('/invoices');
  };

  if (!isClient) {
    return null;
  }

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
            ZeiPilote,Ton co-pilote pour gerer ta boite. 
          </h1>
          
          <div className="mb-8 text-center">
            <p className="text-gray-600 dark:text-gray-300">
              {!hasExistingData ? 
                "Bienvenue dans ton espace de gestion d'entreprise. Pour commencer, merci indiquer ton activité professionnelle." :
                "Bienvenue dans ton espace de gestion d'entreprise."}
            </p>
          </div>

          {!hasExistingData && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label 
                  htmlFor="profession" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Votre Profession
                </label>
                <input
                  {...register("profession", { 
                    required: "Ce champ est requis",
                    minLength: {
                      value: 3,
                      message: "La profession doit contenir au moins 3 caractères"
                    }
                  })}
                  type="text"
                  id="profession"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Ex: Consultant, Artisan, Commerçant..."
                />
                {errors.profession && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.profession.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors
                  ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
                `}
              >
                {isLoading ? 'Chargement...' : 'Accéder au Tableau de Bord'}
              </button>
            </form>
          )}

          {hasExistingData && (
            <div className="text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
              >
                Accéder au Tableau de Bord
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
