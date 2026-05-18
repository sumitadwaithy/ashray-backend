
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Building, MapPin, Upload, Trash2, Image as ImageIcon, Sparkles, Navigation, Grid, PlusCircle, X, User, Compass, Ruler, IndianRupee, Database, Phone, Zap, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { dbService } from '../services/db';
import { Property, NagpurLocality, ApprovalAuthority, PlotType, PropertyStatus, PlaceType, PlotUnit } from '../types';
import { NAGPUR_LOCALITIES, APPROVAL_AUTHORITIES, PLOT_TYPES, PROPERTY_STATUSES, LOCALITY_COORDS, AVAILABLE_AMENITIES, DEFAULT_COORDS } from '../constants';
import LeafletMap from '../components/LeafletMap';
import { motion } from "framer-motion";

export const AddProperty: React.FC = () => {
  const navigate = useNavigate();
  const [propertyImages, setPropertyImages] = useState<string[]>([]);
  const [propertyForm, setPropertyForm] = useState<Partial<Property>>({
    title: '', 
    price: 0, 
    plotSize: 0, 
    type: 'Residential Plot', 
    approval: 'NMRDA', 
    locality: 'Besa', 
    tehsil: '',
    surveyNumber: '',
    khasraNumber: '',
    city: 'Nagpur', 
    dimensions: '', 
    description: '', 
    coordinates: LOCALITY_COORDS['Besa'] || DEFAULT_COORDS,
    status: 'Available', 
    amenities: [], 
    nearbyPlaces: [], 
    documents: [],
    inventory: []
  });

  const [newPlace, setNewPlace] = useState<{name: string, distance: string, type: PlaceType}>({
    name: '', distance: '', type: 'School'
  });


  const [genParams, setGenParams] = useState({ count: 50 });
  const [editingPlot, setEditingPlot] = useState<PlotUnit | null>(null);
  const [deletingPlotId, setDeletingPlotId] = useState<string | null>(null);

  const handlePropertyImagesUpload = (files: FileList | null) => {
    if (!files) return;
    const readers = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });
    Promise.all(readers).then(images => {
      setPropertyImages(prev => [...prev, ...images]);
    });
  };

  const handleLocalityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocality = e.target.value as NagpurLocality;
    const newCoords = LOCALITY_COORDS[newLocality] || DEFAULT_COORDS;
    setPropertyForm(prev => ({
  ...prev,
  locality: newLocality,
  coordinates: newCoords
}));
  };

  const handleMapPin = (lat: number, lng: number) => {
    setPropertyForm(prev => ({
  ...prev,
  coordinates: { lat, lng }
}));
  };

  const toggleAmenity = (amenity: string) => {
    const current = propertyForm.amenities || [];
    const updated = current.includes(amenity)
        ? current.filter(a => a !== amenity)
        : [...current, amenity];
    setPropertyForm({ ...propertyForm, amenities: updated });
  };

  const handleAddPlace = () => {
    if (newPlace.name && newPlace.distance) {
      setPropertyForm(prev => ({
        ...prev,
        nearbyPlaces: [...(prev.nearbyPlaces || []), { ...newPlace, distance: `${newPlace.distance} km` }]
      }));
      setNewPlace({ name: '', distance: '', type: 'School' });
    }
  };

  const handleRemovePlace = (index: number) => {
     setPropertyForm(prev => ({
        ...prev,
        nearbyPlaces: prev.nearbyPlaces?.filter((_, i) => i !== index)
     }));
  };


  const handleGenerateInventory = () => {
    const newInventory: PlotUnit[] = Array.from({ length: genParams.count }, (_, i) => ({
      id: `plot_${Date.now()}_${i}`,
      plotNumber: `${i + 1}`,
      size: propertyForm.plotSize || 1500,
      status: 'Available',
      dimensions: propertyForm.dimensions,
      facing: 'East'
    }));
    setPropertyForm(prev => ({
  ...prev,
  inventory: newInventory
}));
  };

  const handleUpdatePlot = (updatedPlot: PlotUnit) => {
    if (!propertyForm.inventory) return;
    const updatedInventory = propertyForm.inventory.map(p => p.id === updatedPlot.id ? updatedPlot : p);
    setPropertyForm({ ...propertyForm, inventory: updatedInventory });
    setEditingPlot(null);
  };

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'Available': return 'bg-green-500 text-white border-green-600';
        case 'Reserved': return 'bg-yellow-400 text-yellow-900 border-yellow-500';
        case 'Token Paid': return 'bg-orange-400 text-white border-orange-500';
        case 'Sold': return 'bg-red-600 text-white border-red-700';
        case 'Blocked': return 'bg-slate-500 text-white border-slate-600';
        default: return 'bg-blue-500 text-white';
    }
  };

  const handleAddSinglePlot = () => {
    const nextNum = propertyForm.inventory && propertyForm.inventory.length > 0 
      ? Math.max(...propertyForm.inventory.map(p => parseInt(p.plotNumber) || 0)) + 1 
      : 1;
    
    const newPlot: PlotUnit = {
      id: `plot_${Date.now()}`,
      plotNumber: `${nextNum}`,
      size: propertyForm.plotSize || 1500,
      status: 'Available',
      dimensions: propertyForm.dimensions,
      facing: 'East'
    };
    
    setPropertyForm(prev => ({
  ...prev,
  inventory: [...(prev.inventory || []), newPlot]
}));
  };

  const handleDeletePlot = (plotId: string) => {
    if (!propertyForm.inventory) return;
    const updatedInventory = propertyForm.inventory.filter(p => p.id !== plotId);
    setPropertyForm(prev => ({
  ...prev,
  inventory: updatedInventory
}));
    setEditingPlot(null);
    setDeletingPlotId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const slug = propertyForm.title?.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-") || `property-${Date.now()}`;
  
  const finalProperty: Property = {
    ...(propertyForm as Property),
    id: `prop_${Date.now()}`,
    images: propertyImages.length ? propertyImages : ['https://picsum.photos/800/600?random=' + Date.now()],
    dateAdded: new Date().toISOString(),
    seo: {
      slug,
      metaTitle: propertyForm.title || "Property",
      metaDescription: propertyForm.description?.slice(0, 160) || "",
      keywords: [],
      lastUpdated: new Date().toISOString()
    }
  };

  // 🔥 THIS LINE IS CRITICAL
  await dbService.saveProperty({
  ...finalProperty,
  coordinates: finalProperty.coordinates || DEFAULT_COORDS
});

  alert('Property Added Successfully!');
  navigate('/properties');
};

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto pb-20"
    >
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link to="/properties" className="p-2 mr-4 hover:bg-slate-200 rounded-full transition-colors">
            <ArrowLeft size={24} className="text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Add New Project</h1>
            <p className="text-slate-500 text-sm">Create a new property listing with full inventory.</p>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold flex items-center shadow-lg shadow-red-600/20 transition-all"
        >
          <Save size={20} className="mr-2" /> Publish Project
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
        {/* Right Column: Media & Location (1/3) */}
        <div className="flex flex-col space-y-8 order-2 lg:order-2">
          {/* Photos */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <ImageIcon size={20} className="text-red-600" /> Project Media
            </h2>
            
            <div className="space-y-6">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative group">
                <Upload size={32} className="mx-auto mb-3 text-slate-300 group-hover:text-red-500 transition-colors" />
                <p className="text-sm font-bold text-slate-600">Upload Project Images</p>
                <p className="text-xs text-slate-400 mt-1">Drag & drop or click to browse</p>
                <input 
                  type="file" 
                  multiple 
                  accept="image/*" 
                  onChange={(e) => handlePropertyImagesUpload(e.target.files)} 
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>

              {propertyImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3">
                  {propertyImages.map((img, i) => (
                    <div key={i} className="relative group aspect-video">
                      <img src={img} className="w-full h-full object-cover rounded-xl border border-slate-100" />
                      <button 
                        type="button" 
                        onClick={() => setPropertyImages(propertyImages.filter((_, idx) => idx !== i))}
                        className="absolute top-2 right-2 bg-black/70 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Lifestyle & Connectivity */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-red-600" /> Lifestyle & Connectivity
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold mb-3 text-slate-500 uppercase tracking-wider">Project Amenities</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {AVAILABLE_AMENITIES.map(amenity => (
                    <label key={amenity} className="flex items-center gap-2 p-2 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        checked={propertyForm.amenities?.includes(amenity)} 
                        onChange={() => toggleAmenity(amenity)} 
                        className="rounded text-red-600 focus:ring-red-500 w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-700">{amenity}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold mb-3 text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Navigation size={14}/> Nearby Landmarks
                </label>
                <div className="space-y-2 mb-3">
                  <input 
                    placeholder="Landmark Name" 
                    className="w-full p-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900" 
                    value={newPlace.name} 
                    onChange={e => setNewPlace({...newPlace, name: e.target.value})} 
                  />
                  <div className="flex gap-2">
                    <input 
                      placeholder="Dist (km)" 
                      className="flex-1 p-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900" 
                      value={newPlace.distance} 
                      onChange={e => setNewPlace({...newPlace, distance: e.target.value})} 
                    />
                    <select 
                      className="flex-1 p-2.5 text-xs border border-slate-200 rounded-lg bg-slate-50 text-slate-900" 
                      value={newPlace.type} 
                      onChange={e => setNewPlace({...newPlace, type: e.target.value as any})}
                    >
                      <option value="School">School</option>
                      <option value="Hospital">Hospital</option>
                      <option value="Mall">Mall</option>
                      <option value="Airport">Airport</option>
                      <option value="Metro">Metro</option>
                      <option value="Highway">Highway</option>
                      <option value="Station">Station</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <button 
                    type="button" 
                    onClick={handleAddPlace} 
                    className="w-full bg-slate-800 text-white px-4 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-900 transition-colors"
                  >
                    <PlusCircle size={16}/> Add Landmark
                  </button>
                </div>
                
                <div className="space-y-2">
                  {propertyForm.nearbyPlaces?.map((place, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <MapPin size={12} className="text-red-600"/>
                        <span className="text-xs font-bold text-slate-700">{place.name} <span className="text-slate-400 font-normal ml-1">({place.distance})</span></span>
                      </div>
                      <button type="button" onClick={() => handleRemovePlace(idx)} className="text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Map Location */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <MapPin size={20} className="text-red-600" /> Location Pin
            </h2>
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex-1 min-h-[300px] rounded-2xl overflow-hidden border border-slate-200 relative shadow-inner">
                {propertyForm.coordinates?.lat && propertyForm.coordinates?.lng && (
  <LeafletMap 
    coordinates={propertyForm.coordinates} 
    zoom={14} 
    height="100%" 
    interactive={true} 
    onLocationSelect={handleMapPin} 
    label="Pin Location"
  />
)}
              </div>
              <p className="text-[10px] text-slate-400 text-center italic">Click on the map to accurately pin the project location.</p>
            </div>
          </div>

        </div>

        {/* Left Column: Main Details & Plot Inventory (2/3) */}
        <div className="lg:col-span-2 flex flex-col space-y-8 order-1 lg:order-1">
          {/* Basic Info */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Building size={20} className="text-red-600" /> Basic Information
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Project Title</label>
                <input 
                  required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                  value={propertyForm.title} 
                  onChange={e => setPropertyForm({...propertyForm, title: e.target.value})} 
                  placeholder="e.g. Sunshine Heights Phase II"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Base Price (₹)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.price} 
                    onChange={e => setPropertyForm({...propertyForm, price: Number(e.target.value)})} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Avg. Plot Size (sqft)</label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.plotSize} 
                    onChange={e => setPropertyForm({...propertyForm, plotSize: Number(e.target.value)})} 
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Locality</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.locality} 
                    onChange={handleLocalityChange}
                  >
                    {NAGPUR_LOCALITIES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">City</label>
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.city} 
                    onChange={e => setPropertyForm({...propertyForm, city: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Type</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.type} 
                    onChange={e => setPropertyForm({...propertyForm, type: e.target.value as any})}
                  >
                    {PLOT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Approval</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.approval} 
                    onChange={e => setPropertyForm({...propertyForm, approval: e.target.value as any})}
                  >
                    {APPROVAL_AUTHORITIES.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Status</label>
                  <select 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.status} 
                    onChange={e => setPropertyForm({...propertyForm, status: e.target.value as any})}
                  >
                    {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Dimensions</label>
                  <input 
                    placeholder="e.g. 30x50"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                    value={propertyForm.dimensions} 
                    onChange={e => setPropertyForm({...propertyForm, dimensions: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">Description</label>
                <textarea 
                  required 
                  rows={5} 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 focus:ring-red-500 outline-none transition-all" 
                  value={propertyForm.description} 
                  onChange={e => setPropertyForm({...propertyForm, description: e.target.value})} 
                  placeholder="Enter detailed property highlights, amenities, and location advantages..."
                />
              </div>
            </div>
            {/* INTERNAL LAND DETAILS (NOT PUBLIC) */}
<div className="mt-8 border-t border-slate-200 pt-6">
  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
    Internal Land Details (Private)
  </h3>

  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

    {/* Tehsil */}
    <div>
      <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">
        Tehsil
      </label>
      <input
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
        value={propertyForm.tehsil || ''}
        onChange={e => setPropertyForm({...propertyForm, tehsil: e.target.value})}
        placeholder="e.g. Nagpur Rural"
      />
    </div>

    {/* Survey Number */}
    <div>
      <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">
        Survey Number
      </label>
      <input
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
        value={propertyForm.surveyNumber || ''}
        onChange={e => setPropertyForm({...propertyForm, surveyNumber: e.target.value})}
        placeholder="e.g. 45/2A"
      />
    </div>

    {/* Khasra Number */}
    <div>
      <label className="block text-xs font-bold mb-2 text-slate-500 uppercase tracking-wider">
        Khasra Number
      </label>
      <input
        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900"
        value={propertyForm.khasraNumber || ''}
        onChange={e => setPropertyForm({...propertyForm, khasraNumber: e.target.value})}
        placeholder="e.g. 112/3"
      />
    </div>

  </div>
</div>
          </div>


          {/* Plot Inventory Generator */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 flex flex-col min-h-[600px] overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Grid size={20} className="text-red-600" /> Plot Inventory
              </h2>
              {propertyForm.inventory && propertyForm.inventory.length > 0 && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Total:</span>
                    <span className="text-xs font-bold text-slate-700">{propertyForm.inventory.length}</span>
                  </div>
                  <button 
                    type="button"
                    onClick={handleAddSinglePlot}
                    className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all"
                  >
                    <PlusCircle size={14}/> Add Plot
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col p-8 relative overflow-hidden">
              {!propertyForm.inventory || propertyForm.inventory.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  {/* Decorative background pattern */}
                  <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
                  
                  <div className="max-w-4xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                      <div>
                        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-6 shadow-sm border border-red-100">
                          <Grid size={32} />
                        </div>
                        <h3 className="text-3xl font-black text-slate-800 tracking-tight">Inventory <span className="text-red-600">Architect</span></h3>
                        <p className="text-slate-500 mt-4 text-lg leading-relaxed">
                          Transform your land project into a structured digital inventory. Generate, manage, and track every plot with precision.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 mb-3 shadow-sm">
                            <Zap size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Auto-Generate</h4>
                          <p className="text-xs text-slate-500 mt-1">Create hundreds of plots in seconds.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 mb-3 shadow-sm">
                            <ShieldCheck size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Status Tracking</h4>
                          <p className="text-xs text-slate-500 mt-1">Real-time Available/Sold/Reserved.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 mb-3 shadow-sm">
                            <Sparkles size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Plot Intelligence</h4>
                          <p className="text-xs text-slate-500 mt-1">Add details, pricing, and documents.</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-600 mb-3 shadow-sm">
                            <User size={16} />
                          </div>
                          <h4 className="text-sm font-bold text-slate-800">Client Sync</h4>
                          <p className="text-xs text-slate-500 mt-1">Associate plots with buyers directly.</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative">
                      <div className="absolute -top-4 -right-4 w-24 h-24 bg-red-600/5 rounded-full blur-3xl"></div>
                      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-blue-600/5 rounded-full blur-3xl"></div>
                      
                      <div className="relative space-y-8">
                        <div className="text-center">
                          <span className="inline-block px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-full mb-4">Quick Setup</span>
                          <h4 className="text-xl font-bold text-slate-800">Initialize Grid</h4>
                        </div>

                        <div className="space-y-6">
                          <div className="relative group">
                            <label className="absolute -top-2.5 left-5 px-2 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest transition-colors group-focus-within:text-red-600">Number of Units</label>
                            <input 
                              type="number" 
                              className="w-full p-6 border-2 border-slate-100 rounded-3xl text-3xl font-black bg-slate-50/30 text-slate-900 focus:border-red-500 focus:bg-white outline-none transition-all text-center" 
                              value={genParams.count} 
                              onChange={(e) => setGenParams({...genParams, count: Number(e.target.value)})} 
                              placeholder="0"
                            />
                          </div>
                          
                          <button 
                            type="button"
                            onClick={handleGenerateInventory} 
                            className="w-full py-6 bg-slate-900 text-white text-base font-black rounded-3xl hover:bg-red-600 flex items-center justify-center gap-3 transition-all shadow-xl shadow-slate-900/20 active:scale-[0.98] group"
                          >
                            <PlusCircle size={24} className="group-hover:rotate-90 transition-transform duration-300" /> 
                            Generate Project Grid
                          </button>
                        </div>

                        <p className="text-center text-xs text-slate-400 font-medium">
                          You can always add or remove individual plots later.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col space-y-6 min-h-0">
                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Available</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Sold</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase">Reserved</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4 flex-1 overflow-y-auto p-2 min-h-0 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
                    {propertyForm.inventory.map(plot => (
                      <button 
                        key={plot.id} 
                        type="button"
                        onClick={() => setEditingPlot(plot)}
                        className={`h-20 rounded-2xl shadow-md border-2 flex flex-col items-center justify-center transition-all hover:scale-110 active:scale-95 group relative overflow-hidden ${getStatusColor(plot.status)}`}
                      >
                        <span className="text-sm font-black tracking-tighter z-10">{plot.plotNumber}</span>
                        <span className="text-[9px] font-bold opacity-60 uppercase z-10">{plot.size} sqft</span>
                        {plot.facing && (
                          <div className="absolute top-1 left-1 opacity-30">
                            <Compass size={10} />
                          </div>
                        )}
                        {plot.status !== 'Available' && <User size={12} className="opacity-70 mt-1 z-10" />}
                        <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors"></div>
                        
                        {/* Status bar at bottom */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1.5 opacity-50 ${
                          plot.status === 'Available' ? 'bg-green-700' : 
                          plot.status === 'Sold' ? 'bg-red-900' : 
                          plot.status === 'Reserved' ? 'bg-yellow-700' : 'bg-slate-700'
                        }`}></div>
                      </button>
                    ))}
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-center">
                    <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                      <Sparkles size={10} /> Click any plot to manage its intelligence and association
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Plot Edit Modal */}
      {editingPlot && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-8 rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md"
          >
            <div className="flex justify-between items-center mb-6 border-b border-slate-50 pb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ${getStatusColor(editingPlot.status)}`}>
                    {editingPlot.plotNumber}
                  </div>
                  <h4 className="font-bold text-xl text-slate-900">Plot Intelligence</h4>
                </div>
                <button onClick={() => setEditingPlot(null)} className="text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition-all"><X size={20}/></button>
            </div>
            
            <div className="space-y-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Current Status</label>
                    <select 
                        className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-bold focus:ring-2 focus:ring-red-500 outline-none"
                        value={editingPlot.status}
                        onChange={(e) => setEditingPlot({...editingPlot, status: e.target.value as PropertyStatus})}
                    >
                        {PROPERTY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {(editingPlot.status === 'Sold' || editingPlot.status === 'Reserved' || editingPlot.status === 'Token Paid') && (
                    <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 space-y-4">
                        <p className="text-[10px] text-blue-600 font-bold uppercase tracking-widest flex items-center gap-2">
                            <Database size={12}/> Client Association
                        </p>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                                    <User size={12}/> Buyer Full Name
                                </label>
                                <input 
                                    autoFocus
                                    className="w-full p-2.5 rounded-xl border border-blue-200 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingPlot.buyerName || ''}
                                    onChange={(e) => setEditingPlot({...editingPlot, buyerName: e.target.value})}
                                    placeholder="Enter Name..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-blue-800 uppercase mb-1 flex items-center gap-1">
                                    <Phone size={12}/> WhatsApp / Phone
                                </label>
                                <input 
                                    type="tel"
                                    className="w-full p-2.5 rounded-xl border border-blue-200 text-sm bg-white text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                    value={editingPlot.buyerPhone || ''}
                                    onChange={(e) => setEditingPlot({...editingPlot, buyerPhone: e.target.value})}
                                    placeholder="e.g. 9876543210"
                                />
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Ruler size={12} /> Size (sqft)</label>
                        <input type="number" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900" value={editingPlot.size} onChange={(e) => setEditingPlot({...editingPlot, size: Number(e.target.value)})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Dimensions</label>
                        <input type="text" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900" placeholder="e.g. 30x50" value={editingPlot.dimensions || ''} onChange={(e) => setEditingPlot({...editingPlot, dimensions: e.target.value})} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><Compass size={12}/> Facing</label>
                        <select className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900" value={editingPlot.facing || ''} onChange={(e) => setEditingPlot({...editingPlot, facing: e.target.value as any})}>
                            <option value="East">East</option>
                            <option value="West">West</option>
                            <option value="North">North</option>
                            <option value="South">South</option>
                            <option value="Corner">Corner</option>
                            <option value="Main Road">Main Road</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><IndianRupee size={12}/> Custom Price</label>
                        <input type="number" className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900" placeholder="Optional" value={editingPlot.price || ''} onChange={(e) => setEditingPlot({...editingPlot, price: Number(e.target.value)})} />
                    </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-4">
                  <button 
                    type="button"
                    onClick={() => setDeletingPlotId(editingPlot.id)}
                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
                  >
                    <Trash2 size={18}/> Delete Plot
                  </button>
                  <button 
                      type="button"
                      onClick={() => handleUpdatePlot(editingPlot)}
                      className="flex-[2] bg-slate-900 hover:bg-black text-white py-4 rounded-2xl font-bold shadow-xl shadow-slate-900/20 flex items-center justify-center gap-2 transition-all"
                  >
                      Update Plot Details
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deletingPlotId && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-200 w-full max-w-sm text-center"
            >
              <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center text-red-600 mx-auto mb-6">
                <Trash2 size={40} />
              </div>
              <h3 className="text-2xl font-black text-slate-800 mb-2">Delete Plot?</h3>
              <p className="text-slate-500 mb-8 leading-relaxed">This action cannot be undone. All intelligence associated with this plot will be permanently removed.</p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={() => handleDeletePlot(deletingPlotId)}
                  className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
                >
                  Yes, Delete Plot
                </button>
                <button 
                  onClick={() => setDeletingPlotId(null)}
                  className="w-full py-4 bg-slate-100 text-slate-600 font-black rounded-2xl hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    );
};

export default AddProperty;