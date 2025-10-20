'use client';

import { useState } from 'react';

interface Invoice {
  id: string;
  data: Record<string, unknown>;
  status: string;
  createdAt: string;
}

interface InvoicePreviewProps {
  invoice: Invoice;
  onBack: () => void;
  onAccept: () => void;
}

export default function InvoicePreview({ invoice, onBack, onAccept }: InvoicePreviewProps) {
  const [editedData, setEditedData] = useState(invoice.data);
  const [isEditing, setIsEditing] = useState(false);

  const handleFieldChange = (field: string, value: string) => {
    setEditedData((prev: Record<string, unknown>) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePositionChange = (index: number, field: string, value: string) => {
    setEditedData((prev: Record<string, unknown>) => ({
      ...prev,
      positions: (prev.positions as unknown[]).map((pos: unknown, i: number) =>
        i === index ? { ...(pos as Record<string, unknown>), [field]: value } : pos
      ),
    }));
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  const handleAccept = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/accept-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
          invoiceData: editedData,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Invoice accepted and sent to Fakturownia successfully!');
        // Update the invoice with edited data
        invoice.data = editedData;
        onAccept();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Accept error:', error);
      alert('Network error occurred');
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Invoice Preview</h2>
        <div className="space-x-2">
          <button
            onClick={toggleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            {isEditing ? 'Stop Editing' : 'Edit Invoice'}
          </button>
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Invoice Header */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Seller Information</h3>
            <div className="space-y-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Name:</span> {String(editedData.seller_name || '')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Address:</span> {String(editedData.seller_street || '')}, {String(editedData.seller_post_code || '')} {String(editedData.seller_city || '')}, {String(editedData.seller_country || '')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Tax No:</span> {String(editedData.seller_tax_no || '')}
            </p>
            <p className="text-sm text-gray-600">
              <span className="font-medium">Email:</span> {String(editedData.seller_email || '')}
            </p>
          </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Details</h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Issue Date:</span>{' '}
                {isEditing ? (
                  <input
                    type="date"
                    value={String(editedData.issue_date || '')}
                    onChange={(e) => handleFieldChange('issue_date', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  String(editedData.issue_date || '')
                )}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Sell Date:</span>{' '}
                {isEditing ? (
                  <input
                    type="date"
                    value={String(editedData.sell_date || '')}
                    onChange={(e) => handleFieldChange('sell_date', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  String(editedData.sell_date || '')
                )}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Payment To:</span>{' '}
                {isEditing ? (
                  <input
                    type="text"
                    value={String(editedData.payment_to_kind || '')}
                    onChange={(e) => handleFieldChange('payment_to_kind', e.target.value)}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  />
                ) : (
                  String(editedData.payment_to_kind || '')
                )}
              </p>
              <p className="text-sm text-gray-600">
                <span className="font-medium">Currency:</span> {String(editedData.currency || '')}
              </p>
            </div>
          </div>
        </div>

        {/* Buyer Information */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Buyer Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Name:</span>{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      value={String(editedData.buyer_name || '')}
                      onChange={(e) => handleFieldChange('buyer_name', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    String(editedData.buyer_name || '')
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Tax No:</span>{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      value={String(editedData.buyer_tax_no || '')}
                      onChange={(e) => handleFieldChange('buyer_tax_no', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    String(editedData.buyer_tax_no || 'N/A')
                  )}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Address:</span>{' '}
                  {isEditing ? (
                    <input
                      type="text"
                      value={String(editedData.buyer_street || '')}
                      onChange={(e) => handleFieldChange('buyer_street', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    String(editedData.buyer_street || '')
                  )}
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Email:</span>{' '}
                  {isEditing ? (
                    <input
                      type="email"
                      value={String(editedData.buyer_email || '')}
                      onChange={(e) => handleFieldChange('buyer_email', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                    />
                  ) : (
                    String(editedData.buyer_email || '')
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Positions */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tax Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gross
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {(editedData.positions as unknown[])?.map((position: unknown, index: number) => {
                  const pos = position as Record<string, unknown>;
                  return (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={String(pos.name || '')}
                            onChange={(e) => handlePositionChange(index, 'name', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-full"
                          />
                        ) : (
                          String(pos.name || '')
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="number"
                            value={String(pos.quantity || '')}
                            onChange={(e) => handlePositionChange(index, 'quantity', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
                          />
                        ) : (
                          String(pos.quantity || '')
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {String(pos.tax || '')}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {isEditing ? (
                          <input
                            type="text"
                            value={String(pos.total_price_gross || '')}
                            onChange={(e) => handlePositionChange(index, 'total_price_gross', e.target.value)}
                            className="border border-gray-300 rounded px-2 py-1 text-sm w-32"
                          />
                        ) : (
                          String(pos.total_price_gross || '')
                        )} {String(editedData.currency || '')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {isEditing ? (
              <textarea
                value={String(editedData.description || '')}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-700">{String(editedData.description || '')}</p>
            )}
          </div>
        </div>

        {/* Accept Button */}
        <div className="flex justify-end">
          <button
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-md text-lg font-medium"
          >
            Accept and Send to Fakturownia
          </button>
        </div>
      </div>
    </div>
  );
}