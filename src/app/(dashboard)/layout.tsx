'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { loadData, AppData, updateProfession } from '../../data/store';

const navigation = [
  { name: 'Tableau de Bord', href: '/dashboard' },
  { name: 'Clients', href: '/clients' },
  { name: 'Projets', href: '/projects' },
  { name: 'Factures', href: '/invoices' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [data, setData] = useState<AppData | null>(null);
  const [isEditingProfession, setIsEditingProfession] = useState(false);
  const [profession, setProfession] = useState('');

  useEffect(() => {
    const appData = loadData();
    setData(appData);
    setProfession(appData.businessInfo.profession);
  }, []);

  const handleProfessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfession(profession);
    setData(loadData());
    setIsEditingProfession(false);
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <nav className="bg-[#1a1f2e] border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between py-4">
            <div className="w-full sm:w-auto flex flex-col sm:flex-row items-center justify-center sm:justify-start space-y-4 sm:space-y-0">
              <Link href="/dashboard" className="flex-shrink-0 flex items-center justify-center w-full sm:w-auto mb-4 sm:mb-0">
                <div className="relative w-[500px] h-[125px]">
                  <Image
                    src="/logo.png"
                    alt="ZeiPilote"
                    fill
                    style={{ objectFit: 'contain', objectPosition: 'center' }}
                    className="hover:scale-105 transition-transform duration-200"
                    priority
                  />
                </div>
              </Link>
              <div className="hidden sm:flex sm:space-x-8 sm:ml-8">
                {navigation.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                        isActive
                          ? 'text-white border-b-2 border-blue-500'
                          : 'text-gray-300 hover:text-white hover:border-b-2 hover:border-gray-300'
                      }`}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center mt-4 sm:mt-0">
              {isEditingProfession ? (
                <form onSubmit={handleProfessionSubmit} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={profession}
                    onChange={(e) => setProfession(e.target.value)}
                    className="px-3 py-2 text-sm bg-[#1d2235] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Votre profession"
                  />
                  <button
                    type="submit"
                    className="text-green-500 hover:text-green-400 p-2 rounded-full hover:bg-[#232937]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfession(false);
                      setProfession(data?.businessInfo.profession || '');
                    }}
                    className="text-red-500 hover:text-red-400 p-2 rounded-full hover:bg-[#232937]"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </form>
              ) : (
                <div className="flex items-center space-x-2 bg-[#232937] rounded-lg px-4 py-2">
                  <span className="text-sm text-gray-300">{data?.businessInfo.profession}</span>
                  <button
                    onClick={() => setIsEditingProfession(true)}
                    className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-[#2a3241]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive
                      ? 'text-white bg-gray-900'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
