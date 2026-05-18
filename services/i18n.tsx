
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'en' | 'hi' | 'mr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, Partial<Record<Language, string>>> = {
  // Navigation
  'nav_dashboard': { en: 'Dashboard', hi: 'डैशबोर्ड' },
  'nav_daybook': { en: 'Day Book', hi: 'डे बुक' },
  'nav_kissan': { en: 'Kissan Khata', hi: 'कृषि भूमि खाता' },
  'nav_properties': { en: 'Properties', hi: 'संपत्तियां' },
  'nav_clients': { en: 'Clients', hi: 'ग्राहक' },
  'nav_investors': { en: 'Investors', hi: 'निवेशक' },
  'nav_ledger': { en: 'Ledger', hi: 'खाता बही' },
  'nav_documents': { en: 'Documents', hi: 'दस्तावेज़' },
  'nav_sync': { en: 'Sync Center', hi: 'सिंक सेंटर' },
  'nav_settings': { en: 'Settings', hi: 'सेटिंग्स' },
  'nav_signout': { en: 'Sign Out', hi: 'लॉग आउट' },
  'install_app': { en: 'Install App', hi: 'ऐप इंस्टॉल करें' },
  'nav_reports': { en: 'CA / Tax Reports', hi: 'सी.ए. / टैक्स रिपोर्ट' },

  // Header
  'online': { en: 'Online', hi: 'ऑनलाइन' },
  'offline': { en: 'Offline', hi: 'ऑफ़लाइन' },
  'synced': { en: 'Synced', hi: 'सिंक हुआ' },
  'generate_receipt': { en: 'Generate Receipt', hi: 'रसीद बनाएं' },
  'transaction': { en: 'Transaction', hi: 'लेनदेन' },
  'offline_mode': { en: 'Offline Mode Active', hi: 'ऑफ़लाइन मोड सक्रिय' },

  // Dashboard
  'collections_month': { en: 'Collections (Month)', hi: 'संग्रह (इस माह)' },
  'cash_inflow': { en: 'Cash Inflow', hi: 'नकद आवक' },
  'total_receivables': { en: 'Total Receivables', hi: 'कुल प्राप्य (बकाया)' },
  'market_outstanding': { en: 'Market Outstanding', hi: 'बाजार बकाया' },
  'active_clients': { en: 'Active Clients', hi: 'सक्रिय ग्राहक' },
  'across_projects': { en: 'Across Projects', hi: 'प्रोजेक्ट्स में' },
  'high_value_dues': { en: 'High Value Dues', hi: 'बड़ी बकाया राशि' },
  'need_followup': { en: 'Need Follow-up', hi: 'फॉलो-अप जरूरी' },
  'quick_actions': { en: 'Quick Actions', hi: 'त्वरित कार्य' },
  'new_transaction': { en: 'New Transaction', hi: 'नया लेनदेन' },
  'add_client': { en: 'Add Client', hi: 'ग्राहक जोड़ें' },
  'add_loan': { en: 'Add Loan', hi: 'ऋण जोड़ें' },
  'add_property': { en: 'Add Property', hi: 'संपत्ति जोड़ें' },
  'add_kissan': { en: 'Add Agriculture Land', hi: 'कृषि भूमि जोड़ें' },
  'upload_document': { en: 'Upload Document', hi: 'दस्तावेज़ अपलोड' },
  'view_ledger': { en: 'View Ledger', hi: 'खाता देखें' },
  'recent_transactions': { en: 'Recent Transactions', hi: 'हाल के लेनदेन' },
  'view_all': { en: 'View All', hi: 'सभी देखें' },

  // Investors
  'add_investor': { en: 'Add Investor', hi: 'निवेशक जोड़ें' },
  'add_expense': { en: 'Add Expense', hi: 'खर्च जोड़ें' },
  'add_gst': { en: 'Add GST Entry', hi: 'जीएसटी एंट्री जोड़ें' },
  'total_invested': { en: 'Capital Invested', hi: 'पूंजी निवेश' },
  'total_returns': { en: 'Total Paid Out', hi: 'कुल भुगतान' },
  'current_balance': { en: 'Net Payable', hi: 'वर्तमान शेष' },
  'investor': { en: 'Investor', hi: 'निवेशक' },
  'select_party_type': { en: 'Select Party Type', hi: 'पक्ष प्रकार चुनें' },
  'party_client': { en: 'Client (Customer)', hi: 'ग्राहक (खरीदार)' },
  'party_investor': { en: 'Investor (Partner)', hi: 'निवेशक (साझेदार)' },
  'party_kissan': { en: 'Agri Land (Property)', hi: 'कृषि भूमि (संपत्ति)' },
  
  // Categories
  'cat_capital': { en: 'Capital Injection (Principal)', hi: 'पूंजी निवेश (मूल)' },
  'cat_interest': { en: 'Interest / Profit Accrual', hi: 'ब्याज / लाभ (जमा)' },
  'cat_payout': { en: 'Withdrawal / Payout', hi: 'निकासी / भुगतान' },

  // Ledger
  'master_ledger': { en: 'Master Ledger', hi: 'मुख्य खाता बही' },
  'consolidated_view': { en: 'Consolidated Company View', hi: 'समेकित कंपनी दृश्य' },
  'client_statement': { en: 'Client Account Statement', hi: 'ग्राहक खाता विवरण' },
  'kissan_statement': { en: 'Agri Land Statement', hi: 'कृषि भूमि विवरण' },
  'print_pdf': { en: 'Print / PDF', hi: 'प्रिंट / पीडीएफ' },
  'export': { en: 'Export', hi: 'एक्सपोर्ट' },
  'account_client': { en: 'Account / Client', hi: 'खाता / ग्राहक' },
  'all_clients_master': { en: 'All Clients (Master)', hi: 'सभी ग्राहक (मास्टर)' },
  'period': { en: 'Period', hi: 'अवधि' },
  'this_month': { en: 'This Month', hi: 'इस महीने' },
  'last_month': { en: 'Last Month', hi: 'पिछले महीने' },
  'this_year': { en: 'This Financial Year', hi: 'इस वित्तीय वर्ष' },
  'all_time': { en: 'All Time', hi: 'अब तक' },
  'search_placeholder': { en: 'Ref ID, Amount, Particulars...', hi: 'संदर्भ, राशि, विवरण...' },
  'transaction_type': { en: 'Transaction Type', hi: 'लेनदेन प्रकार' },
  'all': { en: 'All', hi: 'सभी' },
  'receipts': { en: 'Receipts', hi: 'रसीदें' },
  'payments': { en: 'Payments', hi: 'भुगतान' },
  'opening_balance': { en: 'Opening Balance', hi: 'प्रारंभिक शेष' },
  'total_receipts': { en: 'Total Receipts (Cr)', hi: 'कुल जमा (Cr)' },
  'total_debits': { en: 'Total Debits (Dr)', hi: 'कुल नामे (Dr)' },
  'closing_balance': { en: 'Closing Balance', hi: 'अंतिम शेष' },
  'date': { en: 'Date', hi: 'दिनांक' },
  'particulars': { en: 'Particulars', hi: 'विवरण' },
  'ref_mode': { en: 'Ref / Mode', hi: 'संदर्भ / माध्यम' },
  'client': { en: 'Client', hi: 'ग्राहक' },
  'debit': { en: 'Debit', hi: 'नामे (Debit)' },
  'credit': { en: 'Credit', hi: 'जमा (Credit)' },
  'run_bal': { en: 'Run. Bal', hi: 'शेष राशि' },
  'opening_balance_bf': { en: 'Opening Balance B/F', hi: 'पिछला शेष आगे लाया गया' },
  'no_transactions': { en: 'No transactions found for the selected period.', hi: 'चयनित अवधि के लिए कोई लेनदेन नहीं मिला।' },
  'period_totals': { en: 'Period Totals', hi: 'अवधि कुल' },

  // CA Reports
  'ca_title': { en: 'CA / Tax Reports', hi: 'सी.ए. / टैक्स रिपोर्ट' },
  'ca_desc': { en: 'Select specific transactions to generate a clean statement for ITR/GST filing.', hi: 'ITR/GST फाइलिंग के लिए विशिष्ट लेनदेन चुनें।' },
  'filter_method': { en: 'Filter by Payment Method', hi: 'भुगतान विधि द्वारा फ़िल्टर करें' },
  'select_all': { en: 'Select All', hi: 'सभी चुनें' },
  'generate_statement': { en: 'Generate Official Statement', hi: 'आधिकारिक विवरण बनाएं' },
  'report_summary': { en: 'Report Summary', hi: 'रिपोर्ट सारांश' },
  'net_balance': { en: 'Net Balance', hi: 'शुद्ध शेष' },
  'included_items': { en: 'Items Included', hi: 'शामिल आइटम' },
  'print_instructions': { en: 'Use the print button to save as PDF.', hi: 'पीडीएफ के रूप में सहेजने के लिए प्रिंट बटन का उपयोग करें।' },
  
  // Referral Loyalty Bonus
  'client_portal': { en: 'Referral Loyalty Bonus', hi: 'रेफरल लॉयल्टी बोनस' },
  'client_login_desc': { en: 'Securely access your referral rewards and property portfolio.', hi: 'अपने रेफरल पुरस्कार और संपत्ति पोर्टफोलियो को सुरक्षित रूप से एक्सेस करें।' },
  'welcome_back': { en: 'Welcome Back', hi: 'स्वागत है' },
  'logout': { en: 'Logout', hi: 'लॉग आउट' },
  
  // Loan Agreement & Purpose
  'loan_purpose': { en: 'Loan Purpose', hi: 'ऋण का उद्देश्य' },
  'purpose_personal': { en: 'Personal Loan', hi: 'व्यक्तिगत ऋण' },
  'purpose_business': { en: 'Business Loan', hi: 'व्यावसायिक ऋण' },
  'purpose_property': { en: 'Property Loan', hi: 'संपत्ति ऋण' },
  'purpose_vehicle': { en: 'Vehicle Loan', hi: 'वाहन ऋण' },
  'purpose_education': { en: 'Education Loan', hi: 'शिक्षा ऋण' },
  'purpose_gold': { en: 'Gold Loan', hi: 'स्वर्ण ऋण' },
  'loan_agreement': { en: 'Loan Agreement', hi: 'ऋण समझौता' },
  'generate_agreement': { en: 'Generate Agreement', hi: 'समझौता बनाएं' },
  'preview_agreement': { en: 'Preview Agreement', hi: 'पूर्वावलोकन' },
  'select_agreement_lang': { en: 'Select Agreement Language', hi: 'समझौते की भाषा चुनें' },
  'agreement_lang_en': { en: 'English', hi: 'अंग्रेजी', mr: 'इंग्रजी' },
  'agreement_lang_hi': { en: 'Hindi', hi: 'हिंदी', mr: 'हिंदी' },
  'agreement_lang_mr': { en: 'Marathi', hi: 'मराठी', mr: 'मराठी' },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('app_language');
    return (saved === 'en' || saved === 'hi' || saved === 'mr') ? saved as Language : 'en';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('app_language', lang);
  };

  const t = (key: string): string => {
    const translation = translations[key];
    if (!translation) return key; 
    return translation[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};
