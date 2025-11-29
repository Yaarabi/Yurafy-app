"use client";

import { useState, useEffect } from 'react';
import DeliveryCard from './DeliveryCard';
import AmeexForm from './AmeexForm';

const AMEEX_LOGO = 'https://tse2.mm.bing.net/th/id/OIP.apjcGkqQseQ8OFDewGCXVQAAAA?pid=ImgDet&w=181&h=181&c=7&o=7&rm=3';

export default function AmeexCard() {
  const [showForm, setShowForm] = useState(false);
  const [account, setAccount] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await fetch('/api/delivery/ameex/account');
        if (!mounted) return;
        if (!res.ok) {
          setAccount(null);
        } else {
          const data = await res.json();
          setAccount(data.account || null);
        }
      } catch (e) {
        if (!mounted) return;
        setAccount(null);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  function handleSaved(acc: any) {
    setAccount(acc);
  }

  return (
    <DeliveryCard title="Ameex" logo={<img src={AMEEX_LOGO} alt="Ameex" className="w-8 h-8 object-cover rounded-sm" />}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">Connect your Ameex account to auto-send shipments and receive delivery updates via webhook.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm">
            <span className={`inline-block px-2 py-1 rounded-full text-xs ${account ? 'bg-green-100 text-green-800 dark:bg-green-900/30' : 'bg-gray-100 text-gray-700 dark:bg-gray-700'}`}>
              {account ? 'Connected' : 'Not connected'}
            </span>
          </div>
          <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded bg-[var(--brand-blue)] text-white">{account ? 'Manage' : 'Connect'}</button>
        </div>
      </div>

      {showForm && <AmeexForm onClose={() => setShowForm(false)} onSaved={handleSaved} initial={account} />}
    </DeliveryCard>
  );
}
