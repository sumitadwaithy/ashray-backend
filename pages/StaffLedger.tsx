
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, User, Phone, Mail, MapPin, 
  Trash2, Edit2, 
  Briefcase,
  Clock, Download, Filter, Eye, X, FileText, Printer, Wallet
} from 'lucide-react';
import { dbService } from '../services/db';
import { Staff, Transaction, Doc } from '../types';

import { useNavigate, useLocation } from 'react-router-dom';
import { sortTransactions, SortOrder } from '../utils/sorting';
import { StatementPrintView } from '../components/StatementTemplate';
import { TransactionType } from '../types';
import { TransactionTable } from '../components/Shared';


export const StaffLedger: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [staffTransactions, setStaffTransactions] = useState<Transaction[]>([]);
  const [staffDocs, setStaffDocs] = useState<Doc[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<{ name: string; data: string; type: string } | null>(null);

  useEffect(() => {
    loadStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      loadStaffTransactions(selectedStaff.id);
      loadStaffDocs(selectedStaff.id);
    }
  }, [selectedStaff, sortOrder]);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const data = await dbService.getStaff();
      setStaffList(data);
      if (location.state?.staffId) {
        const preSelected = data.find((s: Staff) => s.id === location.state.staffId);
        if (preSelected) setSelectedStaff(preSelected);
      }
    } catch (error) {
      console.error('Error loading staff:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStaffTransactions = async (staffId: string) => {
    try {
      const allTransactions = await dbService.getTransactions();
      const filtered = allTransactions.filter(t => t.staffId === staffId);
      setStaffTransactions(sortTransactions(filtered, sortOrder));
    } catch (error) {
      console.error('Error loading staff transactions:', error);
    }
  };

  const loadStaffDocs = async (staffId: string) => {
    try {
      const allDocs = await dbService.getDocs();
      const filtered = allDocs.filter(d => (d as any).staffId === staffId);
      setStaffDocs(filtered);
    } catch (error) {
      console.error('Error loading staff docs:', error);
    }
  };

  const handleDeleteStaff = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this staff member?')) return;
    try {
      await dbService.deleteStaff(id);
      loadStaff();
      if (selectedStaff?.id === id) setSelectedStaff(null);
    } catch (error) {
      console.error('Error deleting staff:', error);
    }
  };

  const filteredStaff = staffList.filter(s => 
    (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (s.role || '').toLowerCase().includes((searchTerm || '').toLowerCase()) ||
    (s.phone || '').includes(searchTerm || '')
  );

  const handleDownloadDocument = (doc: any) => {
    try {
      const link = document.createElement('a');
      link.href = doc.fileData;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Could not download document.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search staff by name, role or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          onClick={() => navigate('/add-staff')}
          className="flex items-center justify-center space-x-2 bg-brand-600 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all"
        >
          <Plus size={20} />
          <span>Add New Staff</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Staff List */}
        <div className="lg:col-span-1 space-y-4 overflow-y-auto max-h-[calc(100vh-250px)] pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredStaff.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
              <User className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500">No staff members found</p>
            </div>
          ) : (
            filteredStaff.map((staff) => (
              <div
                key={staff.id}
                onClick={() => {
                  setSelectedStaff(staff);
                  loadStaffTransactions(staff.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer hover:shadow-md ${
                  selectedStaff?.id === staff.id 
                    ? 'bg-brand-50 border-brand-200 shadow-sm' 
                    : 'bg-white border-gray-100'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg ${
                      staff.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-400'
                    }`}>
                      {(staff.name || '?')[0].toUpperCase()}
                    </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{staff.title ? `${staff.title} ` : ''}{staff.name}</h3>
                        <p className="text-xs text-gray-500 font-medium">{staff.role}</p>
                      </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    staff.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {staff.status}
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center text-gray-500">
                    <Phone size={12} className="mr-1.5" />
                    {staff.phone}
                  </div>
                  <div className="flex items-center text-brand-600 font-bold justify-end">
                    <span className="mr-0.5 text-[10px]">₹</span>
                    {(staff.salary || 0).toLocaleString()}/mo
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Staff Details & Ledger */}
        <div className="lg:col-span-2 space-y-6">
          {selectedStaff ? (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-brand-600 to-brand-700 p-6 text-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-2xl font-bold border border-white/30">
                        {(selectedStaff.name || '?')[0].toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{selectedStaff.title ? `${selectedStaff.title} ` : ''}{selectedStaff.name}</h2>
                        <p className="text-brand-100">{selectedStaff.role}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          navigate('/add-transaction', { 
                            state: { 
                              partyType: 'EXPENSE', 
                              expenseCategory: 'Salary',
                              staffId: selectedStaff.id,
                              expensePayee: selectedStaff.name,
                              amount: selectedStaff.salary.toString()
                            } 
                          });
                        }}
                        className="flex items-center space-x-2 bg-white text-brand-600 px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-brand-50 transition-all"
                      >
                        <span className="font-bold text-lg leading-none">₹</span>
                        <span>Pay Salary</span>
                      </button>
                      <button
                        onClick={() =>
                          navigate('/add-staff', {
                          state: { staffId: selectedStaff.id }
                        })
                       }
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button
                        onClick={() => handleDeleteStaff(selectedStaff.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Section 1: Personal Profile */}
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
                        <User className="text-brand-500" size={16} />
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Personal Profile</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-start gap-4">
                           <div className="flex-1">
                             <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Full Name</p>
                             <p className="text-sm font-bold text-slate-800">{selectedStaff.title ? `${selectedStaff.title} ` : ''}{selectedStaff.name}</p>
                           </div>
                           <div className="text-right">
                             <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Gender</p>
                             <p className="text-sm font-semibold text-slate-700">{selectedStaff.gender || '—'}</p>
                           </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Father's Name</p>
                          <p className="text-sm font-medium text-slate-700">{selectedStaff.fatherName || '—'}</p>
                        </div>
                        <div className="flex justify-between">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Date of Birth</p>
                            <p className="text-sm font-medium text-slate-700">{selectedStaff.dob || '—'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Age</p>
                            <p className="text-sm font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-lg inline-block">
                              {selectedStaff.age || '—'} Yrs
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 2: Identity & Contact */}
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
                        <Mail className="text-brand-500" size={16} />
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Identity & Contact</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Aadhaar No.</p>
                            <p className="text-xs font-mono font-bold text-slate-700 tracking-tight">{selectedStaff.aadhaar || '—'}</p>
                          </div>
                          <div className="bg-white p-2 rounded-xl border border-slate-100 shadow-sm">
                            <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">PAN Card</p>
                            <p className="text-xs font-mono font-bold text-slate-700 tracking-tight uppercase">{selectedStaff.pan || '—'}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="p-2 bg-brand-50 rounded-lg text-brand-600">
                             <Phone size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Phone Number</p>
                            <p className="font-bold text-slate-800">{selectedStaff.countryCode || '+91'} {selectedStaff.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-sm">
                          <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                             <Mail size={14} />
                          </div>
                          <div className="overflow-hidden">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Work Email</p>
                            <p className="font-bold text-slate-800 truncate">{selectedStaff.email || '—'}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Section 3: Professional Info */}
                    <div className="space-y-4 bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60">
                        <Briefcase className="text-brand-500" size={16} />
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Professional Info</h4>
                      </div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">{selectedStaff.payable || 'Monthly'} Salary</p>
                            <p className="text-lg font-black text-brand-600 leading-tight">₹{(selectedStaff.salary || 0).toLocaleString()}</p>
                            {selectedStaff.annualSalary && (
                              <p className="text-[10px] text-slate-500 font-bold">Annual: ₹{(selectedStaff.annualSalary || 0).toLocaleString()}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Total Paid</p>
                            <p className="text-sm font-bold text-green-600">₹{(selectedStaff.totalSalaryPaid || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                           <div className="text-sm">
                             <p className="text-[10px] text-gray-400 font-bold uppercase">Joined On</p>
                             <p className="font-semibold text-slate-700">{selectedStaff.joiningDate}</p>
                           </div>
                           <div className="text-sm">
                             <p className="text-[10px] text-gray-400 font-bold uppercase">Staff Role</p>
                             <div className="inline-flex items-center text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                               {selectedStaff.role}
                             </div>
                           </div>
                           {(selectedStaff.workingHours || selectedStaff.placeOfPosting) && (
                             <>
                               {selectedStaff.workingHours && (
                                 <div className="text-sm">
                                   <p className="text-[10px] text-gray-400 font-bold uppercase">Working Hours</p>
                                   <p className="font-semibold text-slate-700">{selectedStaff.workingHours}</p>
                                 </div>
                               )}
                               {selectedStaff.placeOfPosting && (
                                 <div className="text-sm">
                                   <p className="text-[10px] text-gray-400 font-bold uppercase">Posting Place</p>
                                   <p className="font-semibold text-slate-700">{selectedStaff.placeOfPosting}</p>
                                 </div>
                               )}
                             </>
                           )}
                           {selectedStaff.jurisdiction && (
                             <div className="text-sm">
                               <p className="text-[10px] text-gray-400 font-bold uppercase">Jurisdiction</p>
                               <p className="font-semibold text-slate-700">{selectedStaff.jurisdiction}</p>
                             </div>
                           )}
                        </div>

                        <div>
                           <p className="text-[10px] text-gray-400 font-bold uppercase mb-1">System Portal Access</p>
                           <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-200/50 px-2 py-0.5 rounded">
                                {selectedStaff.username || 'No ID'}
                              </span>
                              <span className="text-[10px] font-mono font-bold text-slate-300 bg-slate-200/50 px-2 py-0.5 rounded">
                                ••••••••
                              </span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Row 2: Address & Banking Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    {/* Address Section */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60 mb-4">
                        <MapPin className="text-brand-500" size={16} />
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Permanent Address</h4>
                      </div>
                      <div className="flex gap-4">
                        <div className="w-10 h-10 shrink-0 bg-white rounded-xl flex items-center justify-center border border-slate-200 text-slate-400">
                          <MapPin size={20} />
                        </div>
                        <div className="flex-1">
                           <p className="text-sm font-medium text-slate-700 leading-relaxed italic">
                             "{selectedStaff.address || 'Address not provided'}"
                           </p>
                           <div className="mt-3 flex flex-wrap gap-2">
                             {selectedStaff.district && (
                               <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 px-2 py-1 rounded-lg">
                                 {selectedStaff.district}
                               </span>
                             )}
                             {selectedStaff.state && (
                               <span className="text-[10px] font-bold bg-white text-slate-500 border border-slate-200 px-2 py-1 rounded-lg">
                                 {selectedStaff.state}
                               </span>
                             )}
                             {selectedStaff.pincode && (
                               <span className="text-[10px] font-bold bg-brand-50 text-brand-600 border border-brand-100 px-2 py-1 rounded-lg">
                                 {selectedStaff.pincode}
                               </span>
                             )}
                           </div>
                        </div>
                      </div>
                    </div>

                    {/* Banking & Documents */}
                    <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100/50">
                      <div className="flex items-center space-x-2 pb-2 border-b border-slate-200/60 mb-4">
                        <Wallet className="text-brand-500" size={16} />
                        <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Banking & Attachments</h4>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                          <p className="text-[9px] text-gray-400 font-bold uppercase mb-1">Bank Account Info</p>
                          <p className="text-xs font-black text-slate-700 uppercase mb-1 truncate">{selectedStaff.bankName || 'No Bank'}</p>
                          <p className="text-[11px] font-mono font-medium text-slate-500">{selectedStaff.accountNumber || '—'}</p>
                          <p className="text-[11px] font-mono font-bold text-brand-600 mt-0.5">{selectedStaff.ifscCode || '—'}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-gray-400 font-bold uppercase mb-2">Verified Documents</p>
                          {(selectedStaff.documents?.length || 0) + staffDocs.length > 0 ? (
                            <div className="flex flex-col gap-2">
                               {/* Inherited Documents */}
                               {selectedStaff.documents?.map((doc, idx) => (
                                 <div key={`inherited-${idx}`} className="group relative bg-white border border-slate-200 p-2 rounded-xl text-[10px] font-bold text-slate-600 flex items-center shadow-sm hover:shadow-md hover:border-brand-200 transition-all overflow-hidden">
                                   <div className="flex items-center flex-1 mr-2">
                                     <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center mr-2 text-brand-500 group-hover:bg-brand-50 transition-colors">
                                       <FileText size={16} />
                                     </div>
                                     <div className="flex flex-col">
                                       <span className="text-slate-800 line-clamp-1">{doc.name}</span>
                                       <span className="text-[8px] text-slate-400 uppercase tracking-tighter">{doc.type}</span>
                                     </div>
                                   </div>
                                   <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-200">
                                     <button 
                                       onClick={() => setPreviewDoc({ name: doc.name, data: doc.fileData, type: doc.fileType })}
                                       className="p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1 shadow-sm"
                                       title="View Document"
                                     >
                                       <Eye size={14} />
                                       <span>View</span>
                                     </button>
                                     <button 
                                       onClick={() => handleDownloadDocument(doc)}
                                       className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-sm"
                                       title="Download Document"
                                     >
                                       <Download size={14} />
                                       <span>Save</span>
                                     </button>
                                   </div>
                                 </div>
                               ))}
                               {/* Separately Uploaded (Standalone) Documents */}
                               {staffDocs.map((doc, idx) => (
                                 <div key={`standalone-${idx}`} className="group relative bg-brand-50/30 border border-brand-100 p-2 rounded-xl text-[10px] font-bold text-brand-700 flex items-center shadow-sm hover:shadow-md hover:border-brand-300 transition-all overflow-hidden">
                                   <div className="flex items-center flex-1 mr-2">
                                     <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center mr-2 text-brand-600 group-hover:bg-brand-100 transition-colors shadow-sm">
                                       <FileText size={16} />
                                     </div>
                                     <div className="flex flex-col">
                                       <span className="text-brand-900 line-clamp-1">{doc.name}</span>
                                       <span className="text-[8px] text-brand-400 uppercase tracking-tighter">Standalone Doc</span>
                                     </div>
                                   </div>
                                   <div className="absolute inset-0 bg-white/90 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-all duration-200">
                                     <button 
                                       onClick={() => setPreviewDoc({ name: doc.name, data: doc.fileData, type: doc.type })}
                                       className="p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors flex items-center gap-1 shadow-sm"
                                     >
                                       <Eye size={14} />
                                       <span>View</span>
                                     </button>
                                     <button 
                                       onClick={() => {
                                          const link = document.createElement('a');
                                          link.href = doc.fileData;
                                          link.download = doc.name;
                                          document.body.appendChild(link);
                                          link.click();
                                          document.body.removeChild(link);
                                       }}
                                       className="p-1.5 bg-slate-50 text-slate-600 rounded-lg hover:bg-slate-100 transition-colors flex items-center gap-1 shadow-sm"
                                     >
                                       <Download size={14} />
                                       <span>Save</span>
                                     </button>
                                   </div>
                                 </div>
                               ))}
                            </div>
                          ) : (
                            <p className="text-[10px] font-medium text-slate-400 italic">No documents uploaded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Ledger */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center">
                    <Clock className="mr-2 text-brand-500" size={18} />
                    Salary Payment History
                  </h3>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg text-[10px] font-bold transition-all border border-gray-200"
                    >
                      <Filter size={12} className={sortOrder === 'newest' ? 'rotate-90' : '-rotate-90'} />
                      {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>
                    <button 
                      onClick={() => setShowPrintPreview(true)}
                      className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100 transition-all"
                    >
                      <Printer size={14} className="mr-1" /> Print Statement
                    </button>
                    <button className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center">
                      <Download size={14} className="mr-1" /> Export
                    </button>
                  </div>
                </div>
                <TransactionTable transactions={staffTransactions} onUpdate={() => loadStaffTransactions(selectedStaff.id)} />
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-brand-50 rounded-full flex items-center justify-center mb-4">
                <Briefcase className="text-brand-400" size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Select a Staff Member</h3>
              <p className="text-gray-500 max-w-xs">
                Choose a staff member from the list to view their full profile and salary ledger.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Document Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h3 className="text-sm font-bold text-slate-800">{previewDoc.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Document Preview</p>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-red-500 transition-all"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto bg-slate-50 p-6 min-h-[400px]">
              {previewDoc.type.includes('image') ? (
                <div className="flex justify-center items-center h-full">
                  <img 
                    src={previewDoc.data} 
                    alt={previewDoc.name} 
                    className="max-w-full rounded-xl shadow-lg border border-slate-200" 
                    referrerPolicy="no-referrer" 
                  />
                </div>
              ) : (
                <iframe 
                  src={previewDoc.data} 
                  title={previewDoc.name}
                  className="w-full h-full min-h-[600px] border-none rounded-xl shadow-inner bg-white"
                />
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-white">
               <button 
                onClick={() => setPreviewDoc(null)}
                className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              >
                Close
              </button>
              <button 
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = previewDoc.data;
                  link.download = previewDoc.name;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                }}
                className="px-8 py-2.5 bg-brand-600 text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-200 hover:bg-brand-700 transition-all flex items-center gap-2"
              >
                <Download size={18} />
                Download Document
              </button>
            </div>
          </div>
        </div>
      )}

      {showPrintPreview && selectedStaff && (
        <StatementPrintView
          open={showPrintPreview}
          onClose={() => setShowPrintPreview(false)}
          title="Staff Salary Ledger"
          subtitle={`Account Statement: ${selectedStaff.name}`}
          type="ledger"
          partyName={selectedStaff.name}
          partyDetails={`${selectedStaff.phone}\nRole: ${selectedStaff.role}\nSalary: ₹${selectedStaff.salary.toLocaleString()}/mo`}
          data={{
            transactions: staffTransactions,
            totals: {
              debit: staffTransactions.filter(t => t.type === TransactionType.DEBIT).reduce((acc, t) => acc + t.amount, 0),
              credit: staffTransactions.filter(t => t.type === TransactionType.CREDIT).reduce((acc, t) => acc + t.amount, 0),
              balance: selectedStaff.totalSalaryPaid
            }
          }}
        />
      )}
    </div>
  );
};
