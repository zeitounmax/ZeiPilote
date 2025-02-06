'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { loadData, AppData, updateProfession } from '../../data/store';
import Navbar from '@/components/ui/Navbar';

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
  const [data, setData] = useState<AppData>(() => loadData());
  const [isEditingProfession, setIsEditingProfession] = useState(false);
  const [profession, setProfession] = useState(() => {
    const initialData = loadData();
    return initialData.businessInfo.profession;
  });

  const handleProfessionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfession(profession);
    setData(loadData());
    setIsEditingProfession(false);
  };

  return (
    <div className="min-h-screen bg-[#111827]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </div>
    </div>
  );
}
