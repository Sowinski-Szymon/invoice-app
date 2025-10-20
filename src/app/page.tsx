'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import InvoicePreview from '@/components/InvoicePreview';

interface Invoice {
  id: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
}

export default function HomePage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetchInvoices();
  }, [router]);

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/webhook', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setInvoices(data.pendingInvoices || []);
      } else if (response.status === 401) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900">Invoice Preview App</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {selectedInvoice ? (
            <InvoicePreview
              invoice={selectedInvoice}
              onBack={() => setSelectedInvoice(null)}
              onAccept={async () => {
                // TODO: Implement accept functionality
                alert('Accept functionality to be implemented');
              }}
            />
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Pending Invoices</h2>
              {invoices.length === 0 ? (
                <p className="text-gray-500">No pending invoices.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {invoices.map((invoice) => (
                    <div
                      key={invoice.id}
                      className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => setSelectedInvoice(invoice)}
                    >
                      <div className="p-6">
                        <h3 className="text-lg font-medium text-gray-900">
                          Invoice #{invoice.id}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {(invoice.data.buyer_name as string) || 'Unknown Buyer'}
                        </p>
                        <p className="text-sm text-gray-500">
                          Created: {new Date(invoice.createdAt).toLocaleDateString()}
                        </p>
                        <div className="mt-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            {invoice.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
