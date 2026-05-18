
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, User, Building, MapPin, Shield, Check, 
  ChevronRight, Printer, Save, X, Globe, UserCheck
} from 'lucide-react';
import { dbService } from '../services/db';
import { Client, Property, AppSettings } from '../types';
import { AgreementPreview } from '../components/AgreementTemplates';

export const AddPostSaleNOC: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [folders, setFolders] = useState<any[]>([]);
  const [officeAddresses, setOfficeAddresses] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedPropertyIds, setSelectedPropertyIds] = useState<string[]>([]);
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
    const [allClients, allProperties, allCats, allFolders, allSettings] = await Promise.all([
      dbService.getClients(),
      dbService.getProperties(),
      dbService.getCategories(),
      dbService.getFolders(),
      dbService.getSettings()
    ]);
    setClients(allClients);
    setProperties(allProperties);
    setCategories(allCats);
    setFolders(allFolders);
    setOfficeAddresses(allSettings.companyAddresses || []);
    setManagers(allSettings.managers || []);
    setSettings(allSettings);
  };

  const selectedClient = clients.find(c => c.id === selectedClientId);
  
  const clientPurchases = properties.flatMap(p => 
    (p.inventory || [])
      .filter(unit => unit.buyerPhone === selectedClient?.phone)
      .map(unit => ({
        property: p,
        unit: unit,
        label: `${p.title} - Plot ${unit.plotNumber}`
      }))
  );

  const selectedPurchases = clientPurchases.filter(cp => selectedPropertyIds.includes(`${cp.property.id}-${cp.unit.id}`));

  const handleGenerateNOC = () => {
    setShowPreview(true);
  };

  const getAgreementData = () => {
    const propertyTitle = selectedPurchases.length > 0 ? Array.from(new Set(selectedPurchases.map(p => p.property.title))).join(', ') : '';
    const locality = selectedPurchases.length > 0 ? Array.from(new Set(selectedPurchases.map(p => p.property.locality))).join(', ') : '';
    const plotNumbers = selectedPurchases.map(p => p.unit.plotNumber).join(', ');
    const totalArea = selectedPurchases.reduce((sum, p) => sum + (Number(p.unit.size) || 0), 0);
    const totalPrice = selectedPurchases.reduce((sum, p) => sum + (Number(p.unit.price) || 0), 0);

    return {
      nocType: 'POST_SALE',
      client: selectedClient,
      property: {
        ...selectedPurchases[0]?.property,
        plotNumber: plotNumbers,
        area: totalArea.toString(),
        totalAmount: totalPrice.toString(),
        bookingDate: formData.date,
        projectName: propertyTitle,
        locality: locality,
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
          <h1 className="text-2xl font-bold text-spiritual-maroon">Generate Post-Sale NOC</h1>
          <p className="text-slate-500">Create a No Objection Certificate after property sale completion</p>
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
          {/* Client Selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <User size={20} className="mr-2 text-brand-600" /> Client & Property
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Search & Select Client</label>
                <div className="relative">
                  <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="text"
                    placeholder="Search client by name..."
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {clients
                        .filter(c => (c.name || '').toLowerCase().includes((searchTerm || '').toLowerCase()))
                        .map(c => (
                          <button
                            key={c.id}
                            className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between"
                            onClick={() => {
                              setSelectedClientId(c.id);
                              setSearchTerm(c.name);
                              // Auto-select all properties for this client
                              const clientProps = properties.flatMap(p => 
                                p.inventory
                                  .filter(unit => unit.buyerPhone === c.phone)
                                  .map(unit => `${p.id}-${unit.id}`)
                              );
                              setSelectedPropertyIds(clientProps);
                            }}
                          >
                            <span>{c.name}</span>
                            <span className="text-xs text-slate-400">{c.phone}</span>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {clientPurchases.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Purchased Units</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {clientPurchases.map(cp => {
                      const id = `${cp.property.id}-${cp.unit.id}`;
                      const isSelected = selectedPropertyIds.includes(id);
                      return (
                        <label key={id} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${isSelected ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:bg-slate-50'}`}>
                          <input
                            type="checkbox"
                            className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPropertyIds(prev => [...prev, id]);
                              } else {
                                setSelectedPropertyIds(prev => prev.filter(pId => pId !== id));
                              }
                            }}
                          />
                          <div className="ml-3 flex-1">
                            <div className="font-bold text-slate-800 text-sm">{cp.label}</div>
                            <div className="text-xs text-slate-500">Area: {cp.unit.size} Sq.Ft. | Price: ₹{cp.unit.price?.toLocaleString('en-IN') || 0}</div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedClientId && clientPurchases.length === 0 && (
                <p className="text-xs text-red-500 mt-1 italic">No purchases found for this client.</p>
              )}
            </div>
          </div>

          {/* Details Preview */}
          {(selectedClient || selectedPurchases.length > 0) && (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-6">
              <h2 className="text-sm font-black text-slate-400 uppercase tracking-[2px] mb-4">Information Verification</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {selectedClient && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-brand-600 uppercase">Client Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs text-slate-500">Name</span>
                        <span className="text-xs font-bold text-slate-800">{selectedClient.name}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs text-slate-500">Aadhaar</span>
                        <span className="text-xs font-bold text-slate-800">{selectedClient.aadhaar || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs text-slate-500">Phone</span>
                        <span className="text-xs font-bold text-slate-800">{selectedClient.phone}</span>
                      </div>
                      <div className="pt-1">
                        <span className="text-xs text-slate-500 block mb-1">Address</span>
                        <span className="text-[11px] font-medium text-slate-600 leading-relaxed bg-white p-2 rounded block border border-slate-100">
                          {selectedClient.address}, {selectedClient.locality}, {selectedClient.district}, {selectedClient.state}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPurchases.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-brand-600 uppercase">Property Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs text-slate-500">Project</span>
                        <span className="text-xs font-bold text-slate-800">{Array.from(new Set(selectedPurchases.map(p => p.property.title))).join(', ')}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs text-slate-500">Unit No</span>
                        <span className="text-xs font-bold text-slate-800">Plot {selectedPurchases.map(p => p.unit.plotNumber).join(', ')}</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs text-slate-500">Total Area</span>
                        <span className="text-xs font-bold text-slate-800">{(selectedPurchases || []).reduce((s, p) => s + (Number(p.unit?.size) || 0), 0)} Sq. Ft.</span>
                      </div>
                      <div className="flex justify-between border-b border-slate-200 pb-1">
                        <span className="text-xs text-slate-500">Amount</span>
                        <span className="text-xs font-bold text-emerald-600">₹{(selectedPurchases || []).reduce((s, p) => s + (Number(p.unit?.price) || 0), 0).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Date selection */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <FileText size={20} className="mr-2 text-brand-600" /> NOC Date
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

          {/* Administrative Assignments (Copied from AddClient) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
              <Shield size={20} className="mr-2 text-brand-600" /> Administrative Assignments
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
                <span className="text-slate-500">Client:</span>
                <span className="font-bold text-slate-800">{selectedClient?.name || 'Not Selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Property:</span>
                <span className="font-bold text-slate-800">{selectedPurchases.length > 0 ? Array.from(new Set(selectedPurchases.map(p => p.property.title))).join(', ') : 'Not Selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Unit:</span>
                <span className="font-bold text-slate-800">{selectedPurchases.length > 0 ? `Plot ${selectedPurchases.map(p => p.unit.plotNumber).join(', ')}` : 'Not Selected'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Date:</span>
                <span className="font-bold text-slate-800">{formData.date}</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleGenerateNOC}
                className="w-full flex items-center justify-center gap-2 bg-spiritual-maroon text-white font-bold py-3 rounded-xl shadow-lg hover:bg-red-900 transition-all transform hover:-translate-y-1"
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
                <Globe size={24} className="mr-2 text-brand-600" /> Select Language
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
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-100 hover:border-brand-500 hover:bg-brand-50 transition-all group"
                >
                  <span className="font-bold text-slate-700 capitalize group-hover:text-brand-700">{lang}</span>
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
