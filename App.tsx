
import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Clients } from './pages/Clients';
import { AddClient } from './pages/AddClient';
import { KissanKhata } from './pages/KissanKhata';
import { AddKissan } from './pages/AddKissan';
import { KissanProfile } from './pages/KissanProfile';
import { Properties } from './pages/Properties';
import { AddProperty } from './pages/AddProperty';
import { PropertyDetails } from './pages/PropertyDetails';
import { Ledger } from './pages/Ledger';
import { CAReports } from './pages/CAReports';
import { AddTransaction } from './pages/AddTransaction';
import { ClientProfile } from './pages/ClientProfile';
import { Investors } from './pages/Investors';
import { AddInvestor } from './pages/AddInvestor';
import { InvestorDetails } from './pages/InvestorDetails';
import { Documents } from './pages/Documents';
import { BankManager } from './pages/BankManager';
import { Settings } from './pages/Settings';
import { ReceiptGenerator } from './pages/ReceiptGenerator';
import { GenerateNOC } from './pages/GenerateNOC';
import { GenerateCheque } from './pages/GenerateCheque';
import { AddPreSaleNOC } from './pages/AddPreSaleNOC';
import { AddPostSaleNOC } from './pages/AddPostSaleNOC';
import { AddLoanNOC } from './pages/AddLoanNOC';
import { AddPostJobNOC } from './pages/AddPostJobNOC';
import { StaffLedger } from './pages/StaffLedger';
import { AddStaff } from './pages/AddStaff';
import { Expenses } from './pages/Expenses';
import { DayBook } from './pages/DayBook';
import { GSTBook } from './pages/GSTBook';
import { LoanLedger } from './pages/LoanLedger';
import { AddLendingLoan } from './pages/AddLendingLoan';
import { AddBorrowingLoan } from './pages/AddBorrowingLoan';
import { LanguageProvider } from './services/i18n';
import { dbService } from './services/db';
import DataBasePage from './pages/DataBasePage';
import CategoriesPage from './components/CategoriesPage';
import  PendingCheques from './pages/PendingCheques';
import { PendingReceipts } from './pages/PendingReceipts';
import { PendingAgreements } from './pages/PendingAgreements';
import { BackupReminder } from './components/BackupReminder';
import { initErrorTracking } from './src/utils/runtimeErrorTracker';
import { InstallationWizard } from './components/InstallationWizard';
import type { InstallationState } from './types';

const RequireAuth = () => {
  const location = useLocation();
  return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`} replace />;
};

const RedirectHandler = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const redirect = searchParams.get('redirect') || '/';
  return <Navigate to={redirect} replace />;
};

const GlobalReminders = () => {
  const [showReceipts, setShowReceipts] = useState(false);
  const [showCheques, setShowCheques] = useState(false);
  const [showAgreements, setShowAgreements] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkReminders = () => {
      // Receipt Logic
      const onReceiptsPage = location.pathname.includes('/pending-receipts') || location.pathname.includes('/generate-receipt');
      const receipts = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
      const hasPendingReceipts = receipts.filter((r: any) => !r.printed).length > 0;
      const remindReceiptsAfter = localStorage.getItem('pending_receipts_remind_after');
      const shouldShowReceipts = !onReceiptsPage && hasPendingReceipts && (!remindReceiptsAfter || Date.now() > Number(remindReceiptsAfter));

      // Cheque Logic
      const onChequesPage = location.pathname.includes('/pending-cheques') || location.pathname.includes('/generate-cheque');
      const cheques = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
      const hasPendingCheques = cheques.filter((c: any) => !c.printed).length > 0;
      const remindChequesAfter = localStorage.getItem('pending_cheques_remind_after');
      const shouldShowCheques = !onChequesPage && hasPendingCheques && (!remindChequesAfter || Date.now() > Number(remindChequesAfter));

      // Agreement Logic
      const onAgreementsPage = location.pathname.includes('/pending-agreements');
      const agreements = JSON.parse(localStorage.getItem('pending_agreements') || '[]');
      const hasPendingAgreements = agreements.filter((a: any) => !a.printed).length > 0;
      const remindAgreementsAfter = localStorage.getItem('pending_agreements_remind_after');
      const shouldShowAgreements = !onAgreementsPage && hasPendingAgreements && (!remindAgreementsAfter || Date.now() > Number(remindAgreementsAfter));

      setShowReceipts(shouldShowReceipts);
      setShowCheques(shouldShowCheques);
      setShowAgreements(shouldShowAgreements);
    };

    checkReminders();
    const interval = setInterval(checkReminders, 60000);
    window.addEventListener('storage', checkReminders);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', checkReminders);
    };
  }, [location.pathname]);

  const hasReminders = showReceipts || showCheques || showAgreements;
  if (!hasReminders) return null;

  return (
    <div className="fixed bottom-6 right-6 bg-white border border-slate-200 shadow-2xl rounded-2xl p-5 w-80 z-50 animate-in fade-in slide-in-from-bottom-6 ring-1 ring-black/5">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-slate-800 text-lg">
          {hasReminders && [showReceipts, showCheques, showAgreements].filter(Boolean).length > 1 
            ? 'Action Required' 
            : showReceipts ? 'Pending Receipts' 
            : showAgreements ? 'Pending Agreements'
            : 'Pending Cheques'}
        </h3>
        <button onClick={() => {
          if (showReceipts) localStorage.setItem('pending_receipts_remind_after', (Date.now() + 15 * 60 * 1000).toString());
          if (showCheques) localStorage.setItem('pending_cheques_remind_after', (Date.now() + 15 * 60 * 1000).toString());
          if (showAgreements) localStorage.setItem('pending_agreements_remind_after', (Date.now() + 15 * 60 * 1000).toString());
          setShowReceipts(false);
          setShowCheques(false);
          setShowAgreements(false);
        }} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
      <p className="text-sm text-slate-600 mb-5 leading-relaxed">
        {hasReminders && [showReceipts, showCheques, showAgreements].filter(Boolean).length > 1
          ? 'You have tokens, agreements or cheques that need to be generated.' 
          : showReceipts 
            ? 'You have receipts that need to be generated.' 
            : showAgreements
              ? 'You have agreements that need to be generated.'
              : 'You have cheques that need to be printed.'}
      </p>
      <div className="flex flex-col gap-2">
        {showAgreements && (
          <button 
            onClick={() => {
              setShowAgreements(false);
              navigate('/pending-agreements');
            }}
            className="w-full bg-brand-600 text-white font-bold py-3 rounded-xl hover:bg-brand-700 text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            View Agreements
          </button>
        )}
        {showReceipts && (
          <button 
            onClick={() => {
              setShowReceipts(false);
              navigate('/pending-receipts');
            }}
            className="w-full bg-spiritual-maroon text-white font-bold py-3 rounded-xl hover:bg-spiritual-maroon/90 text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            View Receipts
          </button>
        )}
        {showCheques && (
          <button 
            onClick={() => {
              setShowCheques(false);
              navigate('/pending-cheques');
            }}
            className="w-full bg-orange-600 text-white font-bold py-3 rounded-xl hover:bg-orange-700 text-sm shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            View Cheques
          </button>
        )}
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
    const [installation, setInstallation] = useState<InstallationState | null>(null);
  
     useEffect(() => {
    const initApp = async () => {
      try {
        const state = await dbService.getInstallationState();
        setInstallation(state);
        const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        setIsLoggedIn(loggedIn);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

   useEffect(() => {
  initErrorTracking();
}, []);

  useEffect(() => {
    // Check session storage for login status
    const loggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    setIsLoggedIn(loggedIn);
    setLoading(false);

    let inactivityTimer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(inactivityTimer);
      // Logout after 60 minutes of inactivity
      inactivityTimer = setTimeout(() => {
        sessionStorage.removeItem('isLoggedIn');
        sessionStorage.removeItem('userRole');
        window.location.reload();
      }, 60 * 60 * 1000); 
    };

    if (loggedIn) {
      window.addEventListener('mousemove', resetTimer);
      window.addEventListener('keydown', resetTimer);
      window.addEventListener('scroll', resetTimer);
      window.addEventListener('click', resetTimer);
      resetTimer();
    }

    return () => {
      clearTimeout(inactivityTimer);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('scroll', resetTimer);
      window.removeEventListener('click', resetTimer);
    };
  }, [isLoggedIn]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-600">
        <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (installation && !installation.isInitialized) {
    return <InstallationWizard onComplete={() => window.location.reload()} />;
  }

  return (
    <LanguageProvider>
      <HashRouter>
        {isLoggedIn && <BackupReminder />}
        <Routes>
          <Route path="/login" element={isLoggedIn ? <RedirectHandler /> : <Login />} />
          
          <Route path="/*" element={
            isLoggedIn ? (
              <Layout>
                <GlobalReminders />
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/daybook" element={<DayBook />} />
                  <Route path="/kissan-khata" element={<KissanKhata />} />
                  <Route path="/add-kissan" element={<AddKissan />} />
                  <Route path="/kissan-khata/:id" element={<KissanProfile />} />
                  <Route path="/clients" element={<Clients />} />
                  <Route path="/add-client" element={<AddClient />} />
                  <Route path="/clients/:id" element={<ClientProfile />} />
                  <Route path="/investors" element={<Investors />} />
                  <Route path="/add-investor" element={<AddInvestor />} />
                  <Route path="/investors/:id" element={<InvestorDetails />} />
                  <Route path="/properties" element={<Properties />} />
                  <Route path="/properties/:id" element={<PropertyDetails />} />
                  <Route path="/add-property" element={<AddProperty />} />
                  <Route path="/expenses" element={<Expenses />} />
                  <Route path="/ledger" element={<Ledger />} />
                  <Route path="/gst-book" element={<GSTBook />} />
                  <Route path="/staff-ledger" element={<StaffLedger />} />
                  <Route path="/add-staff" element={<AddStaff />} />
                  <Route path="/loan-ledger" element={<LoanLedger />} />
                  <Route path="/add-lending-loan" element={<AddLendingLoan />} />
                  <Route path="/add-borrowing-loan" element={<AddBorrowingLoan />} />
                  <Route path="/reports" element={<CAReports />} />
                  <Route path="/add-transaction" element={<AddTransaction />} />
                  <Route path="/generate-noc" element={<GenerateNOC />} />
                  <Route path="/add-pre-sale-noc" element={<AddPreSaleNOC />} />
                  <Route path="/add-post-sale-noc" element={<AddPostSaleNOC />} />
                  <Route path="/generate-cheque" element={<GenerateCheque />} />
                  <Route path="/pending-cheques" element={<PendingCheques />} />
                  <Route path="/pending-receipts" element={<PendingReceipts />} />
                  <Route path="/add-loan-noc" element={<AddLoanNOC />} />
                  <Route path="/add-post-job-noc" element={<AddPostJobNOC />} />
                  <Route path="/pending-agreements" element={<PendingAgreements />} />
                  <Route path="/generate-receipt" element={<ReceiptGenerator />} />
                  <Route path="/database" element={<DataBasePage />} />
                  <Route path="/database/categories" element={<CategoriesPage onBack={() => window.history.back()} />} />
                  <Route path="/documents" element={<Documents />} />
                  <Route path="/bank-manager" element={<BankManager />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Layout>
            ) : (
              <RequireAuth />
            )
          } />
        </Routes>
      </HashRouter>
    </LanguageProvider>
  );
};

export default App;
