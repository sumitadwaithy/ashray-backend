
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, TrendingUp, TrendingDown, Calendar, FileText, Save, Home, Upload, MapPin, Building2, Landmark, Globe, Users, Shield } from 'lucide-react';
import { dbService } from '../services/db';
import { Property, PropertyMarketUpdate, PlotType } from '../types';

interface PropertyMarketUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PropertyMarketUpdateModal: React.FC<PropertyMarketUpdateModalProps> = ({ isOpen, onClose }) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [kissans, setKissans] = useState<any[]>([]);
  const [selectedType, setSelectedType] = useState<PlotType | 'Agricultural Land' | ''>('');
  const [formData, setFormData] = useState<Partial<PropertyMarketUpdate>>({
    propertyId: '',
    date: new Date().toISOString().split('T')[0],
    updateType: 'Appreciation',
    description: '',
    valueModifier: 1.05, // Default 5% up
    attachments: [],
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const propertyTypes = [
    { id: 'Residential Plot', label: 'Residential Plot', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Commercial', label: 'Commercial', icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
    { id: 'Industrial Plot', label: 'Industrial Plot', icon: Landmark, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Agricultural Land', label: 'Agricultural Land', icon: Globe, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { id: 'Layout', label: 'Layout / Township', icon: Users, color: 'text-rose-600', bg: 'bg-rose-50' },
    { id: 'Villa', label: 'Villa / Raw House', icon: Shield, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Apartment', label: 'Apartment / Flat', icon: Building2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  ];

  useEffect(() => {
    if (isOpen) {
      dbService.getProperties().then(setProperties);
      dbService.getKissans().then(setKissans);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyId) {
      alert("Please select a property");
      return;
    }

    let attachments: string[] = [];
    if (selectedFiles.length > 0) {
      try {
        attachments = await Promise.all(selectedFiles.map(file => convertToBase64(file)));
      } catch (err) {
        console.error("Error converting files to base64", err);
      }
    }

    await dbService.savePropertyMarketUpdate({
      ...formData,
      id: 'pmu' + Date.now(),
      attachments,
    } as PropertyMarketUpdate);

    alert("Market Update Saved!");
    onClose();
    // Reset form
    setFormData({
      propertyId: '',
      date: new Date().toISOString().split('T')[0],
      updateType: 'Appreciation',
      description: '',
      valueModifier: 1.05,
      attachments: [],
    });
    setSelectedType('');
    setSelectedFiles([]);
  };

  if (!isOpen) return null;

  const filteredProperties = properties.filter(p => !selectedType || selectedType === 'Agricultural Land' || p.type === selectedType);
  const filteredKissans = selectedType === 'Agricultural Land' || !selectedType ? kissans : [];

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
        <div className="bg-orange-600 p-4 flex justify-between items-center">
          <h2 className="text-white font-bold flex items-center">
            <TrendingUp size={18} className="mr-2 text-brand-400" /> Add Market Update
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[85vh]">
          {/* Property Type Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-3 flex items-center">
              1. Select Property Classification
            </label>
            <div className="grid grid-cols-4 gap-2">
              {propertyTypes.map((type) => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => {
                    setSelectedType(type.id as any);
                    setFormData({ ...formData, propertyId: '' });
                  }}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl border-2 transition-all ${
                    selectedType === type.id 
                    ? 'border-brand-500 bg-brand-50 shadow-sm' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
                >
                  <type.icon size={18} className={type.color} />
                  <span className="text-[9px] font-bold mt-1 text-slate-700 leading-tight text-center">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Property Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
              2. Target Property / Project / Land
            </label>
            <select
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 text-sm font-medium disabled:opacity-50"
              value={formData.propertyId}
              onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
            >
              <option value="">{selectedType ? `Select ${selectedType}...` : 'Select Property Classification first...'}</option>
              {filteredProperties.length > 0 && (
                <optgroup label="Real Estate Projects">
                  {filteredProperties.map(p => (
                    <option key={p.id} value={p.id}>{p.title} - {p.locality}</option>
                  ))}
                </optgroup>
              )}
              {filteredKissans.length > 0 && (
                <optgroup label="Agricultural Land">
                  {kissans.map(k => (
                    <option key={k.id} value={`kissan_${k.id}`}>{k.landName} ({k.village})</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
                <Calendar size={14} className="mr-1" /> Date of Update
              </label>
              <input
                type="date"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center font-mono">
                Value Multiplier
              </label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900 font-mono"
                value={formData.valueModifier}
                onChange={(e) => setFormData({ ...formData, valueModifier: Number(e.target.value) })}
              />
              <p className="text-[10px] text-slate-400 mt-1 italic">1.10 = +10%, 0.90 = -10%</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
              Update Category
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${formData.updateType === 'Appreciation' ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                onClick={() => setFormData({ ...formData, updateType: 'Appreciation', valueModifier: 1.10 })}
              >
                Appreciation
              </button>
              <button
                type="button"
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold border transition-all ${formData.updateType === 'Depreciation' ? 'bg-red-50 border-red-500 text-red-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-600'}`}
                onClick={() => setFormData({ ...formData, updateType: 'Depreciation', valueModifier: 0.90 })}
              >
                Depreciation
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
              <FileText size={14} className="mr-1" /> Description & Impact Analysis
            </label>
            <textarea
              className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-brand-500 outline-none bg-white text-slate-900"
              rows={2}
              placeholder="Explain the reason for this market valuation change..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 flex items-center">
              <Upload size={14} className="mr-1" /> Document Evidence (Paper Cuttings, etc.)
            </label>
            <div 
              onClick={() => document.getElementById('update-docs')?.click()}
              className="border-2 border-dashed border-slate-300 rounded-lg px-4 py-4 flex flex-col items-center justify-center text-slate-500 hover:bg-slate-50 cursor-pointer bg-slate-50/50"
            >
              <Upload size={20} className="mb-1 text-slate-400" />
              <span className="text-[10px] font-bold">CLICK TO UPLOAD EVIDENCE</span>
              <input 
                id="update-docs"
                type="file" 
                className="hidden" 
                multiple 
                onChange={handleFileChange}
                accept=".pdf,.jpg,.jpeg,.png"
              />
            </div>
            {selectedFiles.length > 0 && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {selectedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-1.5 bg-slate-100 rounded border border-slate-200 overflow-hidden">
                    <span className="text-[9px] font-bold text-slate-700 truncate flex-1 mr-1">{file.name}</span>
                    <button type="button" onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}>
                      <X size={12} className="text-slate-400 hover:text-red-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Save size={18} /> Apply Market Update
          </button>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
