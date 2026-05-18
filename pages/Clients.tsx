import React, { useState, useEffect } from 'react';
import { Search, Filter, Phone, MapPin, ChevronRight, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { dbService } from '../services/db';
import { Client, Transaction } from '../types';

export const Clients: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    Promise.all([
      dbService.getClients(),
      dbService.getTransactions()
    ]).then(([cs, ts]) => {
      setClients(cs);
      setTransactions(ts);
    });
  }, []);

  const filteredClients = clients.filter(c => {
    const search = searchTerm?.toLowerCase() || '';
    const name = typeof c.name === 'string' ? c.name : (c.name as any)?.en || '';
    return name.toLowerCase().includes(search) ||
           (c.email?.toLowerCase() || '').includes(search);
  });

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search clients by name, email..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <button className="flex items-center justify-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-sm font-medium">
            <Filter size={18} className="mr-2" /> Filter
          </button>
          <Link to="/add-client" className="flex items-center justify-center px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
            <Plus size={18} className="mr-2" /> Add Client
          </Link>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => {
          const clientTransactions = transactions.filter(t => t.clientId === client.id);
          return <ClientCard key={client.id} client={client} transactions={clientTransactions} />;
        })}
      </div>
    </div>
  );
};

const ClientCard: React.FC<{ client: Client, transactions: Transaction[] }> = ({ client, transactions }) => {
  const name = typeof client.name === 'string' ? client.name : (client.name as any)?.en || 'Unnamed Client';
  
  // Calculate specific balance matching Profile logic
  const totalPaid = transactions
    .filter(t => t.type === 'CREDIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const contractValue = client.totalContractValue || 0;
  const balance = contractValue - totalPaid;
  const isOutstanding = balance > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-semibold text-lg text-slate-800">{name}</h3>
          <p className="text-xs text-slate-400">ID: {client.id?.toUpperCase() || 'N/A'}</p>
        </div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${isOutstanding ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {isOutstanding ? 'Outstanding' : 'Cleared'}
        </span>
      </div>

      <div className="space-y-2 text-sm text-slate-500 mb-6">
        <div className="flex items-center">
          <Phone size={14} className="mr-2" /> {client.phone}
        </div>
        <div className="flex items-center">
          <MapPin size={14} className="mr-2 flex-shrink-0" /> 
          <span className="truncate">
            {[client.address, client.district, client.state].filter(Boolean).map(a => typeof a === 'string' ? a : (a as any)?.en || '').join(', ')}
          </span>
        </div>
      </div>

      <div className="flex items-end justify-between border-t border-slate-50 pt-4">
        <div>
          <p className="text-xs text-slate-400">Remaining Balance</p>
          <p className={`text-lg font-bold ${isOutstanding ? 'text-red-600' : 'text-green-600'}`}>
            ₹{Math.abs(balance).toLocaleString()}
          </p>
        </div>
        <Link to={`/clients/${encodeURIComponent(client.id)}`} className="p-2 bg-brand-50 rounded-full text-brand-600 hover:bg-brand-100">
          <ChevronRight size={20} />
        </Link>
      </div>
    </div>
  );
};
