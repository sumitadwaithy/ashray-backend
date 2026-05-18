
import React, { useState, useEffect } from 'react';
import { X, FileText, Globe, User, Building, Landmark, Users, ChevronRight, Check } from 'lucide-react';
import { dbService } from '../services/db';
import { Client, Property, Loan, AppSettings } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { AgreementPreview } from './AgreementTemplates';

interface NOCGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

type NOCStep = 'TYPE' | 'LANGUAGE' | 'FORM' | 'PREVIEW';
type NOCType = 'PRE_SALE' | 'POST_SALE' | 'LOAN' | 'POST_JOB';
type NOCLanguage = 'en' | 'hi' | 'mr';

export const NOCGenerator: React.FC<NOCGeneratorProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<NOCStep>('TYPE');
  const [nocType, setNocType] = useState<NOCType | null>(null);
  const [language, setLanguage] = useState<NOCLanguage>('en');
  
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedBorrowerId, setSelectedBorrowerId] = useState<string>('');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [formData, setFormData] = useState({
    staffDetails: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    const [allClients, allProperties, allLoans, allStaff, allSettings] = await Promise.all([
      dbService.getClients(),
      dbService.getProperties(),
      dbService.getLoans(),
      dbService.getStaff(),
      dbService.getSettings()
    ]);
    setClients(allClients);
    setProperties(allProperties);
    setLoans(allLoans);
    setStaff(allStaff);
    setSettings(allSettings);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  const selectedBorrower = loans.find(l => l.id === selectedBorrowerId);
  const selectedStaff = staff.find(s => s.id === selectedStaffId);
  const selectedLoan = loans.find(l => l.id === selectedLoanId);

  // Robustly find all units purchased by the selected client
  const clientPurchases = properties.flatMap(p => 
    (p.inventory || [])
      .filter(unit => unit.buyerPhone === selectedClient?.phone)
      .map(unit => ({
        property: p,
        unit: unit,
        label: `${p.title} - Plot ${unit.plotNumber}`
      }))
  );

  // When a specific purchase is selected, we combine property and unit info
  const selectedPurchase = selectedPropertyId ? clientPurchases.find(cp => `${cp.property.id}-${cp.unit.id}` === selectedPropertyId) : null;
  const selectedProperty = selectedPurchase?.property;

  // Filter loans for the selected client or borrower
  const clientLoans = loans.filter(l => l.phone === (selectedClient?.phone || selectedBorrower?.phone));

  const handleTypeSelect = (type: NOCType) => {
    setNocType(type);
    setStep('LANGUAGE');
  };

  const handleLanguageSelect = (lang: NOCLanguage) => {
    setLanguage(lang);
    setStep('FORM');
  };

  const getAgreementData = () => {
    const baseData = {
      nocType,
      formData,
      settings,
      company: settings
    };

    if (nocType === 'POST_JOB') {
      return {
        ...baseData,
        staff: selectedStaff,
        client: selectedStaff, // For fullName helper
        name: selectedStaff?.name,
        title: selectedStaff?.title || 'Mr./Ms.'
      };
    }

    if (nocType === 'LOAN') {
      const borrower = selectedBorrower || selectedClient;
      return {
        ...baseData,
        loan: selectedLoan,
        client: borrower,
        name: borrower?.name || selectedLoan?.borrowerName,
        title: borrower?.title || 'Mr./Ms.',
        property: selectedPurchase?.property,
        plotNumber: selectedPurchase?.unit.plotNumber,
        projectName: selectedPurchase?.property.title,
        locality: selectedPurchase?.property.locality,
        selectedProperty: selectedPurchase ? {
          ...selectedPurchase.property,
          plotNo: selectedPurchase.unit.plotNumber,
          name: selectedPurchase.property.title
        } : null
      };
    }

    // Default for PRE_SALE / POST_SALE
    return {
      ...baseData,
      client: selectedClient,
      name: selectedClient?.name,
      title: selectedClient?.title,
      property: selectedPurchase?.property,
      plotNumber: selectedPurchase?.unit.plotNumber,
      projectName: selectedPurchase?.property.title,
      locality: selectedPurchase?.property.locality,
      selectedProperty: selectedPurchase ? {
        ...selectedPurchase.property,
        plotNo: selectedPurchase.unit.plotNumber,
        name: selectedPurchase.property.title
      } : null
    };
  };

  const reset = () => {
    setStep('TYPE');
    setNocType(null);
    setLanguage('en');
    setSelectedClientId('');
    setSelectedBorrowerId('');
    setSelectedStaffId('');
    setSelectedPropertyId('');
    setSelectedLoanId('');
    setShowPreview(false);
    setSearchTerm('');
    setFormData({
      staffDetails: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const isLoanNOC = nocType === 'LOAN';
  const isPostJobNOC = nocType === 'POST_JOB';
  
  const filteredList = isLoanNOC 
    ? loans.filter(l => 
        (l.borrowerName || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
        (l.id || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      )
    : isPostJobNOC
    ? staff.filter(s =>
        (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
        (s.id || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      )
    : clients.filter(c => 
        (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) || 
        (c.id || '').toLowerCase().includes((searchTerm || '').toLowerCase())
      );

  if (!isOpen && !showPreview) return null;

  return (
    <>
    <AnimatePresence>
      {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-spiritual-maroon text-white">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <FileText size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Generate NOC</h2>
              <p className="text-xs text-white/70 uppercase tracking-widest font-medium">
                {nocType?.replace('_', ' ')} NOC • Step {step === 'TYPE' ? '1' : step === 'LANGUAGE' ? '2' : '3'} of 3
              </p>
            </div>
          </div>
          <button 
            onClick={() => { onClose(); reset(); }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {step === 'TYPE' && (
              <motion.div 
                key="type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800">Select NOC Type</h3>
                  <p className="text-slate-500">Choose the category of No Objection Certificate you wish to generate</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'PRE_SALE', label: 'Pre Sale Deed NOC', desc: 'Required before property registration' },
                    { id: 'POST_SALE', label: 'Post Sale NOC', desc: 'Issued after successful sale completion' },
                    { id: 'LOAN', label: 'Loan NOC', desc: 'For bank loan clearance and processing' },
                    { id: 'POST_JOB', label: 'Post-Job NOC', desc: 'For staff and contractor completion' }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => handleTypeSelect(type.id as NOCType)}
                      className="flex flex-col items-start p-6 rounded-2xl border-2 border-slate-100 hover:border-spiritual-maroon hover:bg-red-50/30 transition-all text-left group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-spiritual-maroon group-hover:text-white transition-colors">
                        <FileText size={24} />
                      </div>
                      <h4 className="font-bold text-slate-800 text-lg">{type.label}</h4>
                      <p className="text-sm text-slate-500 mt-1">{type.desc}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 'LANGUAGE' && (
              <motion.div 
                key="lang"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-800">Select Language</h3>
                  <p className="text-slate-500">Choose the language for the generated document</p>
                </div>
                <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
                  {[
                    { id: 'en', label: 'English', native: 'English' },
                    { id: 'hi', label: 'Hindi', native: 'हिंदी' },
                    { id: 'mr', label: 'Marathi', native: 'मराठी' }
                  ].map((lang) => (
                    <button
                      key={lang.id}
                      onClick={() => handleLanguageSelect(lang.id as NOCLanguage)}
                      className="flex items-center justify-between p-6 rounded-2xl border-2 border-slate-100 hover:border-spiritual-maroon hover:bg-red-50/30 transition-all group"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-spiritual-maroon group-hover:text-white transition-colors">
                          <Globe size={24} />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-slate-800 text-lg">{lang.label}</h4>
                          <p className="text-sm text-slate-500">{lang.native}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-slate-300 group-hover:text-spiritual-maroon transition-colors" />
                    </button>
                  ))}
                </div>
                <div className="flex justify-center mt-8">
                  <button 
                    onClick={() => setStep('TYPE')}
                    className="text-slate-500 font-bold hover:text-spiritual-maroon transition-colors"
                  >
                    Back to NOC Type
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'FORM' && (
              <motion.div 
                key="form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {/* 1. Client Selection (Only for Sale NOCs) */}
                {(nocType === 'PRE_SALE' || nocType === 'POST_SALE') && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Client</label>
                      <div className="relative w-64">
                        <input
                          type="text"
                          placeholder="Search Client Name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none"
                        />
                        <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                      {clients.filter(c => (c.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (c.id || '').toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                        <button
                          key={c.id}
                          onClick={() => { setSelectedClientId(c.id); setSelectedPropertyId(''); }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${selectedClientId === c.id ? 'bg-spiritual-maroon text-white border-spiritual-maroon shadow-md' : 'bg-white border-slate-100 hover:border-brand-200 text-slate-700'}`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedClientId === c.id ? 'bg-white/20' : 'bg-slate-100'}`}><User size={14} /></div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-sm truncate">{c.name}</p>
                              <p className={`text-[10px] truncate ${selectedClientId === c.id ? 'text-white/70' : 'text-slate-400'}`}>ID: {c.id}</p>
                            </div>
                          </div>
                          {selectedClientId === c.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. Borrower Selection (Only for Loan NOC) */}
                {nocType === 'LOAN' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Borrower</label>
                      <div className="relative w-64">
                        <input
                          type="text"
                          placeholder="Search Borrower Name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none"
                        />
                        <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                      {loans.filter(l => (l.borrowerName || '').toLowerCase().includes(searchTerm.toLowerCase()) || (l.id || '').toLowerCase().includes(searchTerm.toLowerCase())).map(l => (
                        <button
                          key={l.id}
                          onClick={() => { setSelectedBorrowerId(l.id); setSelectedLoanId(''); }}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${selectedBorrowerId === l.id ? 'bg-spiritual-maroon text-white border-spiritual-maroon shadow-md' : 'bg-white border-slate-100 hover:border-brand-200 text-slate-700'}`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedBorrowerId === l.id ? 'bg-white/20' : 'bg-slate-100'}`}><User size={14} /></div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-sm truncate">{l.borrowerName}</p>
                              <p className={`text-[10px] truncate ${selectedBorrowerId === l.id ? 'text-white/70' : 'text-slate-400'}`}>ID: {l.id}</p>
                            </div>
                          </div>
                          {selectedBorrowerId === l.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Staff Selection (Only for Post-Job NOC) */}
                {nocType === 'POST_JOB' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Staff Member</label>
                      <div className="relative w-64">
                        <input
                          type="text"
                          placeholder="Search Staff Name or ID..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full pl-8 pr-4 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none"
                        />
                        <Users className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/50">
                      {staff.filter(s => (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.id || '').toLowerCase().includes(searchTerm.toLowerCase())).map(s => (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStaffId(s.id)}
                          className={`flex items-center justify-between p-3 rounded-xl border transition-all text-left ${selectedStaffId === s.id ? 'bg-spiritual-maroon text-white border-spiritual-maroon shadow-md' : 'bg-white border-slate-100 hover:border-brand-200 text-slate-700'}`}
                        >
                          <div className="flex items-center space-x-3 overflow-hidden">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${selectedStaffId === s.id ? 'bg-white/20' : 'bg-slate-100'}`}><User size={14} /></div>
                            <div className="overflow-hidden">
                              <p className="font-bold text-sm truncate">{s.name}</p>
                              <p className={`text-[10px] truncate ${selectedStaffId === s.id ? 'text-white/70' : 'text-slate-400'}`}>Role: {s.role}</p>
                            </div>
                          </div>
                          {selectedStaffId === s.id && <Check size={16} />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Property Selection (Only for Sale NOCs) */}
                  {(nocType === 'PRE_SALE' || nocType === 'POST_SALE') && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Purchased Property / Unit</label>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          value={selectedPropertyId}
                          onChange={(e) => setSelectedPropertyId(e.target.value)}
                          disabled={!selectedClientId}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all appearance-none disabled:opacity-50"
                        >
                          <option value="">{selectedClientId ? (clientPurchases.length > 0 ? 'Select Unit' : 'No properties found for this client') : 'Select Client First'}</option>
                          {clientPurchases.map(cp => (
                            <option key={`${cp.property.id}-${cp.unit.id}`} value={`${cp.property.id}-${cp.unit.id}`}>{cp.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Loan Selection (Only for Loan NOC) */}
                  {nocType === 'LOAN' && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Select Loan Record</label>
                      <div className="relative">
                        <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                          value={selectedLoanId}
                          onChange={(e) => setSelectedLoanId(e.target.value)}
                          disabled={!selectedBorrowerId && !selectedClientId}
                          className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all appearance-none disabled:opacity-50"
                        >
                          <option value="">{(selectedBorrowerId || selectedClientId) ? (clientLoans.length > 0 ? 'Select Loan' : 'No loans found for this party') : 'Select Borrower First'}</option>
                          {clientLoans.map(l => (
                            <option key={l.id} value={l.id}>₹{(l.principalAmount || 0)} - Sanctioned {l.startDate ? new Date(l.startDate).toLocaleDateString() : 'N/A'}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Date Selection (Common) */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">NOC Date</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all"
                    />
                  </div>

                  {/* Staff Details (Common) */}
                  <div className="md:col-span-2 space-y-2">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Authorized Signatory / Staff Details</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-3 text-slate-400" size={18} />
                      <textarea
                        value={formData.staffDetails}
                        onChange={(e) => setFormData({ ...formData, staffDetails: e.target.value })}
                        placeholder="Enter name and designation of the person issuing this NOC..."
                        rows={3}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Autofetched Info Preview */}
                {(selectedClient || selectedBorrower || selectedStaff) && (
                  <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <h4 className="text-sm font-bold text-slate-800 mb-4 flex items-center">
                      <Check size={16} className="mr-2 text-green-500" />
                      Data Linked for NOC
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      {selectedClient && (
                        <>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Client Name</p>
                            <p className="font-medium text-slate-700">{selectedClient.name}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Phone</p>
                            <p className="font-medium text-slate-700">{selectedClient.phone}</p>
                          </div>
                        </>
                      )}
                      {selectedBorrower && (
                        <>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Borrower Name</p>
                            <p className="font-medium text-slate-700">{selectedBorrower.borrowerName}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Phone</p>
                            <p className="font-medium text-slate-700">{selectedBorrower.phone}</p>
                          </div>
                        </>
                      )}
                      {selectedStaff && (
                        <>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Staff Name</p>
                            <p className="font-medium text-slate-700">{selectedStaff.name}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Role</p>
                            <p className="font-medium text-slate-700">{selectedStaff.role}</p>
                          </div>
                        </>
                      )}
                      {selectedProperty && (
                        <>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Property</p>
                            <p className="font-medium text-slate-700">{selectedProperty.title}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Location</p>
                            <p className="font-medium text-slate-700">{selectedProperty.locality}, {selectedProperty.city}</p>
                          </div>
                        </>
                      )}
                      {selectedLoan && (
                        <>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Loan Amount</p>
                            <p className="font-medium text-slate-700">₹{selectedLoan.principalAmount}</p>
                          </div>
                          <div>
                            <p className="text-slate-400 text-[10px] uppercase font-bold">Loan Status</p>
                            <p className="font-medium text-slate-700">{selectedLoan.status}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => setStep('LANGUAGE')}
                    className="text-slate-500 font-bold hover:text-spiritual-maroon transition-colors"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => {
                      if (!(selectedClientId || selectedBorrowerId || selectedStaffId)) return;
                      setShowPreview(true);
                      // Don't close immediately so we can see the modal over it or close it properly
                    }}
                    disabled={
                      (nocType === 'PRE_SALE' && (!selectedClientId || !selectedPropertyId)) ||
                      (nocType === 'POST_SALE' && (!selectedClientId || !selectedPropertyId)) ||
                      (nocType === 'LOAN' && (!selectedBorrowerId && !selectedClientId || !selectedLoanId)) ||
                      (nocType === 'POST_JOB' && !selectedStaffId)
                    }
                    className="bg-spiritual-maroon text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-red-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Generate Document
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
    )}
    </AnimatePresence>
    
    {showPreview && (selectedClientId || selectedBorrowerId || selectedStaffId) && (
      <AgreementPreview
        type="noc"
        language={language}
        data={getAgreementData() as any}
        onClose={() => { setShowPreview(false); onClose(); reset(); }}
      />
    )}
    </>
  );
};
