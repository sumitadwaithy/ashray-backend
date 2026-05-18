
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Building, MapPin, Eye, ChevronRight, LayoutGrid, List, MessageCircle, Settings as SettingsIcon } from 'lucide-react';
import { dbService } from '../services/db';
import { Property } from '../types';
import { motion } from "framer-motion";

export const Properties: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [filterStatus, setFilterStatus] = useState<string>('All');

  useEffect(() => {
  const load = () => {
    dbService.getProperties().then(setProperties);
  };

  load();

  const interval = setInterval(load, 1000); // live sync safety

  return () => clearInterval(interval);
}, []);

  const filteredProps = properties.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         p.locality.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'All' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 max-w-[1600px] mx-auto"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-800 tracking-tight">Project <span className="text-red-600">Inventory</span></h1>
          <p className="text-slate-500 font-medium mt-1">Manage your real estate portfolio and sales velocity</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1.5 bg-white border border-slate-200 rounded-2xl shadow-sm">
            <button 
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'table' ? 'bg-red-50 text-red-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-red-50 text-red-600 shadow-inner' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid className="w-5 h-5" />
            </button>
          </div>
          <Link 
            to="/add-property"
            className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-black shadow-lg shadow-red-600/20 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>New Project</span>
          </Link>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative md:col-span-2 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          <input
            type="text"
            placeholder="Search by project name or locality..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 shadow-sm font-medium transition-all"
          />
        </div>
        <div className="relative group">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-red-500 transition-colors" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full pl-12 pr-6 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500 shadow-sm appearance-none font-bold text-slate-700 transition-all cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Sold Out">Sold Out</option>
            <option value="Coming Soon">Coming Soon</option>
          </select>
        </div>
      </div>

      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Project Intelligence</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sales Velocity</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Engagement</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Pricing</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Control</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredProps.map((prop) => {
                  const availableCount = prop.inventory?.filter(p => p.status === 'Available').length || 0;
                  const totalCount = prop.inventory?.length || 0;
                  const soldPercentage = totalCount > 0 ? Math.round(((totalCount - availableCount) / totalCount) * 100) : 0;

                  return (
                    <tr key={prop.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200 shadow-inner">
                            {prop.images && prop.images[0] ? (
                              <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-400">
                                <Building className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-black text-slate-900 text-lg tracking-tight group-hover:text-red-600 transition-colors">{prop.title}</div>
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 font-medium mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-red-500" />
                              <span>{prop.locality}, {prop.city}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="space-y-2.5 max-w-[140px]">
                          <div className="flex justify-between text-[10px] font-black uppercase tracking-wider">
                            <span className="text-slate-400">{availableCount} Available</span>
                            <span className="text-red-600">{soldPercentage}% Sold</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${soldPercentage}%` }}
                              className="h-full bg-red-500 rounded-full" 
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="flex flex-col items-center gap-1 text-slate-400" title="Views">
                            <Eye className="w-5 h-5" />
                            <span className="text-xs font-black text-slate-600">{prop.stats?.views || 0}</span>
                          </div>
                          <div className="flex flex-col items-center gap-1 text-slate-400" title="Enquiries">
                            <MessageCircle className="w-5 h-5" />
                            <span className="text-xs font-black text-slate-600">{prop.stats?.enquiries || 0}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-lg font-black text-slate-900 tracking-tight">
                          ₹{(prop.price / 100000).toFixed(1)}L <span className="text-xs font-medium text-slate-400">avg</span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">₹{(prop.price || 0).toLocaleString()}/plot</div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <Link 
                          to={`/properties/${prop.id}`}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl hover:bg-red-600 transition-all text-sm font-black shadow-lg shadow-slate-900/10 active:scale-95"
                        >
                          <SettingsIcon className="w-4 h-4" />
                          <span>Manage</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredProps.length === 0 && (
            <div className="py-20 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mx-auto mb-6">
                <Building className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">No projects found</h3>
              <p className="text-slate-500 font-medium mt-2">Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProps.map((prop) => (
            <Link 
              key={prop.id} 
              to={`/properties/${prop.id}`}
              className="bg-white border border-slate-200 rounded-[2.5rem] shadow-sm overflow-hidden hover:shadow-2xl hover:shadow-slate-200/50 transition-all group flex flex-col"
            >
              <div className="aspect-[16/10] bg-slate-100 relative overflow-hidden">
                {prop.images && prop.images[0] ? (
                  <img src={prop.images[0]} alt={prop.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">
                    <Building className="w-16 h-16" />
                  </div>
                )}
                <div className="absolute top-5 right-5">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg backdrop-blur-md ${
                    prop.status === 'Available' ? 'bg-emerald-500/90 text-white' : 
                    prop.status === 'Sold Out' ? 'bg-rose-500/90 text-white' : 'bg-amber-500/90 text-white'
                  }`}>
                    {prop.status}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-black text-2xl text-slate-800 tracking-tight group-hover:text-red-600 transition-colors leading-tight">{prop.title}</h3>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 font-medium text-sm mb-6">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span>{prop.locality}, {prop.city}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-6 py-6 border-y border-slate-100 mb-6">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Total Units</div>
                    <div className="text-2xl font-black text-slate-900 tracking-tight">{prop.inventory?.length || 0}</div>
                  </div>
                  <div className="border-l border-slate-100 pl-6">
                    <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Available</div>
                    <div className="text-2xl font-black text-red-600 tracking-tight">{prop.inventory?.filter(p => p.status === 'Available').length || 0}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-auto">
                  <div className="flex items-center gap-5 text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-5 h-5" />
                      <span className="text-xs font-black text-slate-600">{prop.stats?.views || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MessageCircle className="w-5 h-5" />
                      <span className="text-xs font-black text-slate-600">{prop.stats?.enquiries || 0}</span>
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:translate-x-1 transition-all shadow-lg shadow-slate-900/10">
                    <ChevronRight className="w-6 h-6" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </motion.div>
  );
};
