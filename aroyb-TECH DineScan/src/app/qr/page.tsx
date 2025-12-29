'use client';

import { useState, useEffect } from 'react';
import { generateTableQR, getTableUrl } from '@/lib/qr-generator';
import locationsData from '@/data/locations.json';
import { Location, Table } from '@/types';

export default function QRGeneratorPage() {
  const locations = locationsData.locations as Location[];
  const [selectedLocation, setSelectedLocation] = useState<Location>(locations[0]);
  const [selectedTable, setSelectedTable] = useState<Table>(locations[0].tables[0]);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [tableUrl, setTableUrl] = useState<string>('');

  useEffect(() => {
    generateQR();
  }, [selectedLocation, selectedTable]);

  const generateQR = async () => {
    try {
      const url = getTableUrl(selectedLocation.id, selectedTable.id);
      setTableUrl(url);
      const qr = await generateTableQR(selectedLocation.id, selectedTable.id);
      setQrDataUrl(qr);
    } catch (error) {
      console.error('Failed to generate QR:', error);
    }
  };

  const handleLocationChange = (locationId: string) => {
    const loc = locations.find(l => l.id === locationId);
    if (loc) {
      setSelectedLocation(loc);
      setSelectedTable(loc.tables[0]);
    }
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    
    const link = document.createElement('a');
    link.download = `qr-${selectedLocation.id}-${selectedTable.id}.png`;
    link.href = qrDataUrl;
    link.click();
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Demo Banner */}
      <div className="demo-banner">
        🍽️ Demo Mode — This is a preview of Aroyb DineScan
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-display font-bold text-neutral-900 mb-3">
            QR Code Generator
          </h1>
          <p className="text-neutral-600">
            Generate QR codes for any table. Print and place on tables for customers to scan.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="card">
            <h2 className="font-semibold text-lg text-neutral-900 mb-4">
              Select Table
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Location
                </label>
                <select
                  value={selectedLocation.id}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="input-field"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Table
                </label>
                <select
                  value={selectedTable.id}
                  onChange={(e) => {
                    const table = selectedLocation.tables.find(t => t.id === e.target.value);
                    if (table) setSelectedTable(table);
                  }}
                  className="input-field"
                >
                  {selectedLocation.tables.map((table) => (
                    <option key={table.id} value={table.id}>
                      {table.name} ({table.seats} seats)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* URL Preview */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              <p className="text-xs text-neutral-500 mb-1">Table URL</p>
              <p className="text-sm font-mono break-all">{tableUrl}</p>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button onClick={handleDownload} className="btn-primary flex-1">
                Download QR
              </button>
              <button
                onClick={() => window.open(tableUrl, '_blank')}
                className="btn-secondary flex-1"
              >
                Open Link
              </button>
            </div>
          </div>

          {/* QR Preview */}
          <div className="card text-center">
            <h2 className="font-semibold text-lg text-neutral-900 mb-4">
              Preview
            </h2>

            {/* QR Frame */}
            <div className="inline-block bg-white p-6 rounded-2xl border-4 border-neutral-200 mb-4">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="QR Code"
                  width={200}
                  height={200}
                  className="mx-auto"
                />
              ) : (
                <div className="w-[200px] h-[200px] bg-neutral-100 animate-pulse rounded" />
              )}
              
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <p className="font-display font-bold text-lg text-neutral-900">
                  {selectedTable.name}
                </p>
                <p className="text-sm text-neutral-500">
                  {selectedLocation.shortName}
                </p>
              </div>
            </div>

            <p className="text-sm text-neutral-500">
              Scan to order • No app needed
            </p>
          </div>
        </div>

        {/* Print All */}
        <div className="mt-10 text-center">
          <p className="text-neutral-600 mb-4">
            Need QR codes for all tables? Generate a printable sheet.
          </p>
          <button className="btn-secondary">
            Generate All Tables PDF (Coming Soon)
          </button>
        </div>
      </div>
    </div>
  );
}
