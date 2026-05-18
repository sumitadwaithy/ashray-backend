import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, MoreVertical, Trash2, Download, Upload, X, Search, Building, CheckCircle, Clock } from 'lucide-react';
import { Doc, Property, Client, Kissan, Investor, Loan, Staff } from '../types';
import { dbService } from '../services/db';
import { DocumentViewer } from '../components/Shared';
import { handleDownloadDoc } from '../components/docUtils';

export const Documents: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [kissans, setKissans] = useState<Kissan[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  const [newDoc, setNewDoc] = useState({
    name: '',
    category: 'CLIENT' as const,
    propertyId: '',
    clientId: '',
    kissanId: '',
    ownerId: '',
    investorId: '',
    staffId: '',
    loanId: '',
    type: 'pdf' as const
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) {
      setSearchTerm(search);
    }
  }, [searchParams]);

  const fetchData = async () => {
    setLoading(true);
    const [fetchedDocs, fetchedProperties, fetchedClients, fetchedKissans, fetchedInvestors, fetchedLoans, fetchedStaff] = await Promise.all([
      dbService.getDocs(),
      dbService.getProperties(),
      dbService.getClients(),
      dbService.getKissans(),
      dbService.getInvestors(),
      dbService.getLoans(),
      dbService.getStaff()
    ]);
    // For Documents page, only show real entity documents or standalone documents, NOT the virtual reports
    const realDocs = fetchedDocs.filter(d => d.type !== 'virtual' && d.category !== 'REPORT');
    setDocs(realDocs);
    setProperties(fetchedProperties);
    setClients(fetchedClients);
    setKissans(fetchedKissans);
    setInvestors(fetchedInvestors);
    setLoans(fetchedLoans);
    setStaff(fetchedStaff);
    setLoading(false);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    // Read file as base64
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      const docName = selectedFile.name;
      const docSize = `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
      const docType = selectedFile.type.includes('pdf') ? 'pdf' : 'img';

      const doc: Doc = {
        id: `doc_${Date.now()}`,
        name: docName || 'Unnamed_Document',
        date: new Date().toISOString().split('T')[0],
        size: docSize,
        type: docType as 'pdf' | 'img',
        synced: false,
        category: newDoc.category,
        propertyId: newDoc.propertyId || undefined,
        clientId: newDoc.category === 'CLIENT' ? newDoc.clientId : undefined,
        kissanId: newDoc.category === 'KISSAN' ? newDoc.kissanId : undefined,
        ownerId: newDoc.category === 'KISSAN' ? newDoc.ownerId : undefined,
        investorId: newDoc.category === 'INVESTOR' ? newDoc.investorId : undefined,
        staffId: (newDoc.category as any) === 'STAFF' ? (newDoc as any).staffId : undefined,
        loanId: newDoc.category === 'LOAN' ? newDoc.loanId : undefined,
        fileData: base64Data
      };

      await dbService.saveDoc(doc);
      setShowUploadModal(false);
      setNewDoc({ name: '', category: 'CLIENT', propertyId: '', clientId: '', kissanId: '', ownerId: '', investorId: '', staffId: '', loanId: '', type: 'pdf' });
      setSelectedFile(null);
      fetchData();
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      await dbService.deleteDoc(id);
      fetchData();
    }
  };

  const filteredDocs = docs.filter(doc => {
    const matchesSearch = (doc.name?.toLowerCase() || '').includes(searchTerm?.toLowerCase() || '');
    const matchesCategory = filterCategory === 'ALL' || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Document Manager</h2>
          <p className="text-slate-500 text-sm mt-1">Manage and link documents to properties for client access</p>
        </div>
        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-brand-100"
        >
          <Upload size={20} />
          Upload New Document
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search documents by name..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {['ALL', 'CLIENT', 'INVESTOR', 'KISSAN', 'STAFF', 'LOAN', 'GENERAL'].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap ${
                filterCategory === cat 
                  ? 'bg-brand-600 text-white shadow-md' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Document Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-100 animate-pulse h-48"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredDocs.map(doc => {
            const linkedProperty = properties.find(p => p.id === doc.propertyId);
            const linkedClient = clients.find(c => c.id === doc.clientId);
            const linkedKissan = kissans.find(k => k.id === doc.kissanId);
            const linkedOwner = (linkedKissan?.owners || []).find(o => o.id === doc.ownerId);
            const linkedInvestor = investors.find(i => i.id === doc.investorId);
            const linkedStaff = staff.find(s => s.id === doc.staffId);
            const linkedLoan = loans.find(l => l.id === doc.loanId);

            return (
              <div key={doc.id} className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-brand-300 hover:shadow-md transition-all flex flex-col justify-between relative">
                <div className="flex justify-between items-start">
                  <div className={`p-4 rounded-xl ${doc.type === 'pdf' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>
                    <FileText size={32} />
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      doc.category === 'CLIENT' ? 'bg-blue-50 text-blue-600' :
                      doc.category === 'INVESTOR' ? 'bg-purple-50 text-purple-600' :
                      doc.category === 'KISSAN' ? 'bg-green-50 text-green-600' :
                      (doc.category as any) === 'STAFF' ? 'bg-indigo-50 text-indigo-600' :
                      doc.category === 'LOAN' ? 'bg-amber-50 text-amber-600' :
                      'bg-slate-50 text-slate-600'
                    }`}>
                      {doc.category}
                    </span>
                    {doc.synced ? (
                      <div className="p-1.5 text-green-500 bg-green-50 rounded-full" title="Synced to Website">
                        <CheckCircle size={14} />
                      </div>
                    ) : (
                      <div className="p-1.5 text-orange-500 bg-orange-50 rounded-full" title="Pending Sync">
                        <Clock size={14} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="font-bold text-slate-800 text-base truncate mb-1" title={doc.name}>{doc.name}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span>{doc.date}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                  
                  <div className="mt-3 flex flex-wrap gap-2">
                    {linkedProperty && (
                      <div className="flex items-center gap-2 text-[10px] font-medium text-brand-600 bg-brand-50 px-2 py-1 rounded-lg">
                        <Building size={10} />
                        {linkedProperty.title}
                      </div>
                    )}
                    {linkedClient && (
                      <div className="flex items-center gap-2 text-[10px] font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                        <CheckCircle size={10} />
                        {linkedClient.name}
                      </div>
                    )}
                    {linkedKissan && (
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center gap-2 text-[10px] font-medium text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                          <Building size={10} />
                          {linkedKissan.landName}
                        </div>
                        {linkedOwner && (
                          <div className="flex items-center gap-2 text-[10px] font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                            <CheckCircle size={10} />
                            {linkedOwner.name}
                          </div>
                        )}
                      </div>
                    )}
                    {linkedInvestor && (
                      <div className="flex items-center gap-2 text-[10px] font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">
                        <CheckCircle size={10} />
                        {linkedInvestor.name}
                      </div>
                    )}
                    {linkedStaff && (
                      <div className="flex items-center gap-2 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg">
                        <CheckCircle size={10} />
                        {linkedStaff.name} ({linkedStaff.role})
                      </div>
                    )}
                    {linkedLoan && (
                      <div className="flex items-center gap-2 text-[10px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-lg">
                        <CheckCircle size={10} />
                        {linkedLoan.borrowerName}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setPreviewDoc(doc)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="View Document"
                    >
                      <FileText size={18} />
                    </button>
                    <button 
                      onClick={() => handleDownloadDoc(doc)}
                      className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors"
                      title="Download"
                    >
                      <Download size={18} />
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors">
                    <MoreVertical size={18} />
                  </button>
                </div>
              </div>
            );
          })}
          
          {filteredDocs.length === 0 && (
            <div className="col-span-full py-20 text-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
              <FileText className="mx-auto text-slate-300 mb-4" size={48} />
              <p className="text-slate-500 font-medium">No documents found matching your criteria</p>
              <button 
                onClick={() => setShowUploadModal(true)}
                className="mt-4 text-brand-600 font-bold hover:underline"
              >
                Upload your first document
              </button>
            </div>
          )}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="text-xl font-bold text-slate-800">Upload Document</h3>
              <button onClick={() => setShowUploadModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleUpload} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Select File</label>
                <div className="relative group">
                  <input 
                    type="file"
                    required
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        if (!newDoc.name) {
                          setNewDoc(prev => ({ ...prev, name: file.name }));
                        }
                      }
                    }}
                  />
                  <div className="w-full px-4 py-3 rounded-xl border-2 border-dashed border-slate-200 group-hover:border-brand-400 bg-slate-50 flex flex-col items-center justify-center gap-2 transition-all">
                    <Upload className="text-slate-400 group-hover:text-brand-500" size={24} />
                    <span className="text-sm font-bold text-slate-500 group-hover:text-brand-600">
                      {selectedFile ? selectedFile.name : 'Click to select or drag & drop'}
                    </span>
                    {selectedFile && (
                      <span className="text-[10px] text-slate-400">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Document Name (Optional Override)</label>
                <input 
                  type="text"
                  placeholder="e.g. Sale_Agreement_Plot_101.pdf"
                  className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none"
                  value={newDoc.name}
                  onChange={(e) => setNewDoc({...newDoc, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">Link Category</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newDoc.category}
                    onChange={(e) => setNewDoc({...newDoc, category: e.target.value as any, clientId: '', kissanId: '', ownerId: '', investorId: '', staffId: '', loanId: ''})}
                  >
                    <option value="CLIENT">Clients</option>
                    <option value="KISSAN">Kissan (Agri Land)</option>
                    <option value="STAFF">Staff Members</option>
                    <option value="INVESTOR">Investors / Partners</option>
                    <option value="LOAN">Loans (Lending/Borrowing)</option>
                    <option value="GENERAL">General Office Docs</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-1">File Type</label>
                  <select 
                    className="w-full px-4 py-2 rounded-lg border border-slate-200 font-medium focus:ring-2 focus:ring-brand-500 outline-none"
                    value={newDoc.type}
                    onChange={(e) => setNewDoc({...newDoc, type: e.target.value as any})}
                  >
                    <option value="pdf">PDF Document</option>
                    <option value="img">Image / Photo</option>
                  </select>
                </div>
              </div>
            
              {/* Dynamic Entity Selection Section */}
              <div className="space-y-4 p-4 bg-slate-50 rounded-xl border border-slate-100">
                {newDoc.category === 'CLIENT' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Client</label>
                    <select 
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white font-medium"
                      value={newDoc.clientId}
                      onChange={(e) => setNewDoc({...newDoc, clientId: e.target.value})}
                    >
                      <option value="">Select Client Account</option>
                      {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                )}

                {newDoc.category === 'INVESTOR' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Investor</label>
                    <select 
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white font-medium"
                      value={newDoc.investorId}
                      onChange={(e) => setNewDoc({...newDoc, investorId: e.target.value})}
                    >
                      <option value="">Select Investor Account</option>
                      {investors.map(i => (
                        <option key={i.id} value={i.id}>{i.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {newDoc.category === 'STAFF' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Staff Member</label>
                    <select 
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white font-medium"
                      value={(newDoc as any).staffId}
                      onChange={(e) => setNewDoc({...newDoc, staffId: e.target.value} as any)}
                    >
                      <option value="">Select Staff Member</option>
                      {staff.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                )}

                {newDoc.category === 'KISSAN' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Step 1: Select Land Profile</label>
                      <select 
                        required
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white font-medium"
                        value={newDoc.kissanId}
                        onChange={(e) => setNewDoc({...newDoc, kissanId: e.target.value, ownerId: ''})}
                      >
                        <option value="">Choose Land/Kissan Profile</option>
                        {kissans.map(k => (
                          <option key={k.id} value={k.id}>{k.landName} ({k.village})</option>
                        ))}
                      </select>
                    </div>
                    {newDoc.kissanId && (
                      <div className="animate-in slide-in-from-top-2 duration-300">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Step 2: Select Specific Partner (Kissan)</label>
                        <select 
                          required
                          className="w-full px-4 py-2 rounded-lg border-2 border-brand-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white font-bold text-brand-700"
                          value={newDoc.ownerId}
                          onChange={(e) => setNewDoc({...newDoc, ownerId: e.target.value})}
                        >
                          <option value="">Select Kissan Partner</option>
                          {(kissans.find(k => k.id === newDoc.kissanId)?.owners || []).map(o => (
                            <option key={o.id} value={o.id}>{o.name}</option>
                          ))}
                        </select>
                        <p className="text-[10px] text-brand-600 mt-1 font-medium italic">
                          Important: This document will show directly in this specific Kissan's profile.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {newDoc.category === 'LOAN' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Select Loan Account</label>
                    <select 
                      required
                      className="w-full px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-brand-500 outline-none bg-white font-medium"
                      value={newDoc.loanId}
                      onChange={(e) => setNewDoc({...newDoc, loanId: e.target.value})}
                    >
                      <option value="">Select Loan (Lending/Borrowing)</option>
                      {loans.map(l => (
                        <option key={l.id} value={l.id}>
                          {l.borrowerName} - ₹{(l.principalAmount || 0).toLocaleString()} ({l.loanType === 'GIVEN' ? 'Lending' : 'Borrowing'})
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              </div>

              <div className="pt-2 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-600 hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={!selectedFile || (newDoc.category === 'KISSAN' && (!newDoc.kissanId || !newDoc.ownerId))}
                  className="flex-1 px-4 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Confirm Upload
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DocumentViewer doc={previewDoc} onClose={() => setPreviewDoc(null)} />
    </div>
  );
};
