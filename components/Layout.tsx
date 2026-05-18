
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { 
  Menu, X, Home, Users, BookOpen, FileText, Search,
  Settings, WifiOff, RefreshCw, LogOut, Plus, Building, Receipt, Globe, Briefcase, PieChart, CreditCard, Calendar, Tractor, Sparkles, Clock, Calculator, Landmark, ShieldCheck, FileCheck
} from 'lucide-react';
import { useLanguage } from '../services/i18n';
import { NOCGenerator } from './NOCGenerator';
import { dbService } from '../services/db';
import { AppSettings } from '../types';

interface LayoutProps {
  children: React.ReactNode;
}

const Swastika: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <defs>
      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="2" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
    </defs>
    <g filter="url(#glow)">
      <path d="M12 2L20 2" />
      <path d="M12 2L12 22" />
      <path d="M12 22L4 22" />
      <path d="M2 12L22 12" />
      <path d="M22 12L22 22" />
      <path d="M2 12L2 2" />
      <circle cx="17" cy="7" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="17" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="7" cy="17" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
    </g>
  </svg>
);

const SyncStatus: React.FC = () => {
    const [state, setState] = useState<any>(null);
    useEffect(() => {
        dbService.getInstallationState().then(setState);
    }, []);
    if (!state || state.mode === 'Independent') return null;
    return (
        <div className="flex items-center gap-2 bg-gray-100/50 px-3 py-1.5 rounded-full border border-gray-100 hidden sm:flex">
          <RefreshCw className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{state.mode}</span>
        </div>
    );
};

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const location = useLocation();
  const [showInstall, setShowInstall] = useState(false);
  const { language, setLanguage, t } = useLanguage();
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isNOCModalOpen, setIsNOCModalOpen] = useState(false);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const s = await dbService.getSettings();
      // Ensure we have a default structure to avoid flickers or missing fields
      setSettings({
      companyName: '',
      entityType: '',
      companyLogo: '',
      ...s
    });
    } catch (err) {
      console.error('Failed to fetch settings in Layout:', err);
    }
  };

  useEffect(() => {
  fetchSettings();

  const handleStatusChange = () => setIsOnline(navigator.onLine);

  const handleSettingsUpdate = () => {
    fetchSettings();
  };

  window.addEventListener('online', handleStatusChange);
  window.addEventListener('offline', handleStatusChange);
  window.addEventListener('settings-updated', handleSettingsUpdate);

  const unsubscribe = dbService.subscribe(fetchSettings);

  setTimeout(() => setShowInstall(true), 5000);

  setUserRole(sessionStorage.getItem('userRole'));

  return () => {
    window.removeEventListener('online', handleStatusChange);
    window.removeEventListener('offline', handleStatusChange);
    window.removeEventListener('settings-updated', handleSettingsUpdate);
    unsubscribe();
  };
}, []);

  const navItems = [
    { label: t('nav_dashboard'), icon: <Home size={20} />, path: '/' },
    { label: 'Day Book', icon: <Clock size={20} />, path: '/daybook' },
    { label: 'Expenses', icon: <CreditCard size={20} />, path: '/expenses' },
    { label: t('nav_ledger'), icon: <BookOpen size={20} />, path: '/ledger' },
    { label: t('nav_kissan'), icon: <Tractor size={20} />, path: '/kissan-khata' },
    { label: t('nav_properties'), icon: <Building size={20} />, path: '/properties' },
    { label: t('nav_clients'), icon: <Users size={20} />, path: '/clients' },
    { label: t('nav_investors'), icon: <Briefcase size={20} />, path: '/investors' },
    { label: 'Bank Manager', icon: <Landmark size={20} />, path: '/bank-manager' },
    { label: 'Staff Ledger', icon: <Users size={20} />, path: '/staff-ledger' },
    { label: 'GST BOOK', icon: <Calculator size={20} />, path: '/gst-book' },
    { label: 'Loan Ledger', icon: <Landmark size={20} />, path: '/loan-ledger' },
    { label: t('nav_reports'), icon: <PieChart size={20} />, path: '/reports' },
    { label: t('nav_documents'), icon: <FileText size={20} />, path: '/documents' },
    { label: 'Database', icon: <FileText size={20} />, path: '/database' },
    { label: t('nav_settings'), icon: <Settings size={20} />, path: '/settings' },
  ];

  const handleLogout = () => {
    sessionStorage.removeItem('isLoggedIn');
    sessionStorage.removeItem('userRole');
    window.location.reload(); // Force refresh to clear state
  };

  const getPageTitle = () => {
    const navItem = navItems.find(i => i.path === location.pathname);
    if (navItem) return navItem.label;
    if (location.pathname === '/add-transaction') return t('new_transaction');
    if (location.pathname === '/generate-receipt') return t('generate_receipt');
    if (location.pathname === '/generate-cheque') return 'Cheque Printing';
    if (location.pathname === '/add-client') return t('add_client');
    if (location.pathname === '/add-kissan') return t('add_kissan');
    if (location.pathname === '/add-investor') return t('add_investor');
    if (location.pathname === '/add-loan') return 'Add New Loan';
    if (location.pathname === '/generate-noc') return 'Generate NOC';
    if (location.pathname === '/add-pre-sale-noc') return 'Pre-Sale NOC';
    if (location.pathname === '/add-post-sale-noc') return 'Post-Sale NOC';
    if (location.pathname.startsWith('/investors/')) return 'Investor Details';
    if (location.pathname.startsWith('/properties/')) return 'Property Details';
    if (location.pathname.startsWith('/clients/')) return 'Client Profile';
    if (location.pathname === '/database') return 'Database';
    if (location.pathname === '/categories') return 'Categories';
    return t('nav_dashboard');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-brand-50">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-spiritual-maroon/80 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300 ease-in-out
        bg-gradient-to-b from-spiritual-maroon via-red-900 to-brand-900 text-white shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0 flex flex-col border-r border-brand-800
        print:hidden
      `}>
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg transform rotate-3 hover:rotate-0 transition-transform overflow-hidden px1">
              {settings?.companyLogo ? (
                <img src={settings.companyLogo} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <span className="font-bold text-spiritual-maroon text-xl">
                  {settings?.companyName ? (
                    settings.companyName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                  ) : 'AG'}
                </span>
              )}
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-extrabold text-xl tracking-tight text-white block leading-[0.9] truncate max-w-[140px]">
                {settings?.companyName ? settings.companyName.split(' ')[0] : 'Ashray'}
              </span>
              <span className="font-extrabold text-[15px] tracking-tight text-white block leading-[1.2] truncate max-w-[140px] mt-0.5 opacity-90 uppercase">
                {settings?.companyName && settings.companyName.split(' ').length > 1 
                  ? settings.companyName.split(' ').slice(1).join(' ') 
                  : (settings?.entityType || 'Group')}
              </span>
            </div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-brand-200 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-6">
          <ul className="space-y-2 px-3">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-brand-600 to-brand-500 text-white shadow-lg border border-brand-400/20 translate-x-1' 
                        : 'text-brand-100 hover:bg-white/5 hover:text-white hover:pl-5'
                    }`}
                  >
                    <span className={isActive ? 'text-spiritual-gold' : 'text-brand-200'}>{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

       

        <div className="p-4 border-t border-white/10 bg-black/10">
           
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 text-brand-200 hover:text-white py-2 transition-colors">
            <LogOut size={18} />
            <span className="text-sm">{t('nav_signout')}</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-brand-50/50">
        <header className="bg-white/80 backdrop-blur-md shadow-sm z-10 relative border-b border-brand-100 print:hidden">
          {!isOnline && (
            <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-center text-sm font-medium shadow-inner">
              <WifiOff size={16} className="mr-2" />
              {t('offline_mode')}
            </div>
          )}
          <div className="flex items-center justify-between px-4 py-4 relative">
            <div className="flex items-center">
              <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-brand-50 lg:hidden mr-3 text-spiritual-maroon"><Menu size={24} /></button>
              <h1 className="text-2xl font-bold text-spiritual-maroon tracking-tight">{getPageTitle()}</h1>
              </div>
              {/* FULL CENTER CONTROL BAR */}
<div className="hidden lg:flex items-center justify-start flex-1 pl-8">

  {/* LEFT SIDE (Agreement + NOC) */}
  <div className="flex items-center space-x-3">
    <Link
      to="/pending-agreements"
      className="flex items-center bg-white text-spiritual-maroon border border-spiritual-maroon px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-spiritual-maroon hover:text-white transition-all"
    >
      <FileCheck size={18} className="mr-2" />
      Agreements
    </Link>

    <Link
      to="/generate-noc"
      className="flex items-center bg-white text-spiritual-maroon border border-spiritual-maroon px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-spiritual-maroon hover:text-white transition-all"
    >
      <ShieldCheck size={18} className="mr-2 text-red-600" />
      Generate NOC
    </Link>
  </div>

  {/* CENTER (SWASTIKA ABSOLUTE CENTERED) */}
  <div className="absolute left-1/2 transform -translate-x-1/2">
    <div className="relative">
      <div className="absolute inset-0 bg-red-500 blur-xl opacity-20 rounded-full"></div>
      <Swastika className="text-red-600 w-10 h-10 drop-shadow-sm relative z-10" />
    </div>
  </div>

</div>            
            <div className="flex items-center space-x-3">
              <SyncStatus />
              <Link
                to="/generate-cheque"
                className="hidden md:flex items-center bg-white text-spiritual-maroon border border-spiritual-maroon px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-spiritual-maroon hover:text-white transition-all"
              >
                <CreditCard size={18} className="mr-2 text-red-600" /> Generate Cheque
              </Link>
              <Link to="/generate-receipt" className="hidden md:flex items-center bg-white text-spiritual-maroon border border-spiritual-maroon px-4 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-spiritual-maroon hover:text-white transition-all">
                 <Receipt size={18} className="mr-2" /> {t('generate_receipt')}
              </Link>
              <Link to="/add-transaction" className="hidden sm:flex items-center bg-gradient-to-r from-brand-600 to-brand-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md hover:shadow-lg hover:from-brand-700 hover:to-brand-600 transition-all transform hover:-translate-y-0.5">
                <Plus size={18} className="mr-2" /> {t('transaction')}
              </Link>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-24 print:p-0 print:overflow-visible">{children}</main>
          <NOCGenerator isOpen={isNOCModalOpen} onClose={() => setIsNOCModalOpen(false)} />
      </div>
      <div className="lg:hidden fixed bottom-6 right-6 z-40 flex flex-col space-y-3 items-end print:hidden">
        <Link to="/generate-receipt" className="w-12 h-12 bg-white text-spiritual-maroon rounded-full shadow-xl flex items-center justify-center border-2 border-spiritual-maroon"><Receipt size={20} /></Link>
        <Link to="/add-transaction" className="w-16 h-16 bg-gradient-to-r from-brand-600 to-brand-500 rounded-full shadow-xl flex items-center justify-center text-white hover:scale-105 transition-transform border-4 border-white/20"><Plus size={32} /></Link>
      </div>
    </div>
  );
};

