import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, Users, Shield, Check, 
  ChevronRight, Printer, Save, X, Globe, UserCheck
} from 'lucide-react';
import { dbService } from '../services/db';
import { Staff, AppSettings } from '../types';
import { AgreementPreview } from '../components/AgreementTemplates';

export const AddPostJobNOC: React.FC = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [officeAddresses, setOfficeAddresses] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showPreview, setShowPreview] = useState(false);
  const [selectedLang, setSelectedLang] = useState<'english' | 'hindi' | 'marathi' | null>(null);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    // Administrative Fields
    categoryId: '',
    categoryCode: '',
    folderId: '',
    folderName: '',
    folderSerial: '',
    officeAddressId: '',
    officeAddress: '',
    officeDistrict: '',
    officeState: '',
    officePincode: '',
    officeLocality: '',
    managerId: '',
    managerName: '',
    managerPosition: '',
    managerPhone: '',
    managerCountryCode: '',
    managerAddress: '',
    managerPAN: '',
    managerAadhaar: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allStaff, allCats, allFolders, allSettings] = await Promise.all([
      dbService.getStaff(),
      dbService.getCategories(),
      dbService.getFolders(),
      dbService.getSettings()
    ]);
    setStaffList(allStaff);
    setCategories(allCats);
    setFolders(allFolders);
    setOfficeAddresses(allSettings.companyAddresses || []);
    setManagers(allSettings.managers || []);
    setSettings(allSettings);
  };

  const selectedStaff = staffList.find(s => s.id === selectedStaffId);

  const handleGenerateNOC = () => {
    setShowPreview(true);
  };

  const getAgreementData = () => {
    return {
      nocType: 'POST_JOB',
      staff: selectedStaff,
      client: {
        name: selectedStaff?.name,
        phone: selectedStaff?.phone,
        address: selectedStaff?.address,
      },
      manager: {
        managerName: formData.managerName,
        managerPosition: formData.managerPosition,
        managerPhone: formData.managerPhone,
        managerAddress: formData.managerAddress,
      },
      company: settings,
      nocDate: formData.date,
      ...formData
    };
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-spiritual-maroon">Generate Post-Job NOC</h1>
          <p className="text-slate-500">Create a No Objection Certificate for staff and contractor completion</p>
        </div>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg flex items-center transition-colors"
        >
          <X size={18} className="mr-2" /> Cancel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Staff Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Users size={20} className="mr-2 text-blue-600" /> Staff / Contractor Selection
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Search & Select Personnel</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {staffList
                        .filter(s => (s.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                        .map(s => (
                          <button
                            key={s.id}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between"
                            onClick={() => {
                              setSelectedStaffId(s.id);
                              setSearchTerm(s.name);
                            }}
                          >
                            <span>{s.name}</span>
                            <span className="text-xs text-slate-400">{s.occupation || 'Staff'}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Preview */}
          {selectedStaff && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[2px] mb-4">Information Verification</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-blue-600 uppercase">Personnel Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-xs text-slate-500">Name</span>
                      <span className="text-xs font-bold text-slate-800">{selectedStaff.name}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-xs text-slate-500">Occupation</span>
                      <span className="text-xs font-bold text-slate-800">{selectedStaff.occupation || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-xs text-slate-500">Phone</span>
                      <span className="text-xs font-bold text-slate-800">{selectedStaff.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Date selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-blue-600" /> NOC Date
            </h2>
            <div className="max-w-xs">
              <label className="block text-sm font-medium text-slate-700 mb-1">Issuance Date</label>
              <input 
                type="date"
                className="w-full border border-slate-300 rounded-lg px-3 py-2"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
          </div>

          {/* Administrative Assignments */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-blue-600" /> Administrative Assignments
            </h2>
            
            {/* File Manager Section */}
            <div className="space-y-4 mb-6">
              <h3 className="text-sm font-bold text-slate-800 flex items-center uppercase tracking-wider">
                File Manager
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Category</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    value={selectedCategory}
                    onChange={(e) => {
                      const catId = e.target.value;
                      const cat = categories.find(c => String(c.id) === String(catId));
                      setSelectedCategory(catId);
                      setSelectedFolder('');
                      setFormData({
                        ...formData,
                        categoryId: catId,
                        categoryCode: cat?.code || '',
                        folderId: '',
                        folderName: '',
                        folderSerial: ''
                      });
                    }}
                  >
                    <option value="">-- Select Category --</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Select Folder (File)</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                    value={selectedFolder}
                    onChange={(e) => {
                      const folderId = e.target.value;
                      const folder = folders.find(f => String(f.id) === String(folderId));
                      setSelectedFolder(folderId);
                      setFormData({
                        ...formData,
                        folderId: folderId,
                        folderName: folder?.name || '',
                        folderSerial: folder?.name?.split('-')[0] || ''
                      });
                    }}
                    disabled={!selectedCategory}
                  >
                    <option value="">-- Select Folder --</option>
                    {folders.filter(f => String(f.category_id) === String(selectedCategory)).map(folder => (
                      <option key={folder.id} value={folder.id}>{folder.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Office Address Selection */}
            <div className="space-y-4 mb-6 pt-4 border-t border-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center uppercase tracking-wider">
                Office Address
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Office Address</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  value={formData.officeAddressId}
                  onChange={(e) => {
                    const addr = officeAddresses.find(a => String(a.id) === String(e.target.value));
                    if (addr) {
                      setFormData(prev => ({
                        ...prev,
                        officeAddressId: e.target.value,
                        officeAddress: addr.addressLine || addr.address || '',
                        officeDistrict: addr.district || '',
                        officeState: addr.state || '',
                        officePincode: addr.pinCode || '',
                        officeLocality: addr.locality || ''
                      }));
                    }
                  }}
                >
                  <option value="">Select from saved Office Addresses</option>
                  {officeAddresses.map(addr => (
                    <option key={addr.id} value={addr.id}>
                      {`${addr.name} - ${[addr.addressLine || addr.address, addr.locality, addr.district, addr.state].filter(Boolean).join(', ')}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Manager Selection */}
            <div className="space-y-4 pt-4 border-t border-slate-50">
              <h3 className="text-sm font-bold text-slate-800 flex items-center uppercase tracking-wider">
                Manager Selection
              </h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select Manager</label>
                <select 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  value={formData.managerId}
                  onChange={(e) => {
                    const manager = managers.find(m => String(m.id) === String(e.target.value));
                    if (manager) {
                      setFormData(prev => ({
                        ...prev,
                        managerId: e.target.value,
                        managerName: manager.name,
                        managerPosition: manager.role,
                        managerPhone: manager.phone,
                        managerCountryCode: manager.countryCode,
                        managerAddress: manager.address || '',
                        managerPAN: manager.pan || '',
                        managerAadhaar: manager.aadhaar || ''
                      }));
                    } else {
                      setFormData(prev => ({
                        ...prev,
                        managerId: '',
                        managerName: '',
                        managerPosition: '',
                        managerPhone: '',
                        managerCountryCode: '',
                        managerAddress: '',
                        managerPAN: '',
                        managerAadhaar: ''
                      }));
                    }
                  }}
                >
                  <option value="">Select from saved Managers</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {`${manager.name} - ${manager.role}`}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-6">
            <h2 className="text-lg font-bold text-slate-800 mb-6 uppercase tracking-wider text-center border-b pb-4">
              NOC Summary
            </h2>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Personnel:</span>
                <span className="font-bold text-slate-800">{selectedStaff?.name || 'Not Selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-slate-800">{formData.date}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGenerateNOC}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1"
              >
                <Printer size={18} /> Generate NOC
              </button>
              
              <button
                onClick={() => navigate(-1)}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-200 transition-all"
              >
                Cancel
              </button>
            </div>
            
            <p className="mt-4 text-[10px] text-slate-400 text-center italic">
              * Make sure all mandatory fields are filled before generating the document.
            </p>
          </div>
        </div>
      </div>

      {/* Language Selection Modal */}
      {showPreview && !selectedLang && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                <Globe size={24} className="mr-2 text-blue-600" /> Select Language
              </h3>
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                <X size={24} />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {['english', 'hindi', 'marathi'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => setSelectedLang(lang as any)}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                >
                  <span className="font-bold text-slate-700 capitalize group-hover:text-blue-700">{lang}</span>
                  <span className="text-xs text-slate-400 font-mono uppercase">{lang.slice(0, 3)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Agreement Preview */}
      {showPreview && selectedLang && (
        <AgreementPreview
          type="noc"
          language={selectedLang === 'english' ? 'en' : selectedLang === 'hindi' ? 'hi' : 'mr'}
          data={getAgreementData() as any}
          onClose={() => { setShowPreview(false); setSelectedLang(null); }}
        />
      )}
    </div>
  );
};
