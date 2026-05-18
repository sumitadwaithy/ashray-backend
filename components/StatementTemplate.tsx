
import React, { useEffect, useState } from 'react';
import { Building2, User, Settings } from 'lucide-react';
import { dbService } from '../services/db';
import { AppSettings, Transaction, TransactionType } from '../types';
import PrintPreview from './Printpreview';
import { Accounting } from '../services/accounting';

interface StatementTemplateProps {
  title: string;
  subtitle?: string;
  dateRange?: string;
  data: {
    transactions?: Transaction[];
    totals?: {
      debit: number;
      credit: number;
      balance: number;
    };
    amount?: number;
    method?: string;
    referenceId?: string;
    date?: string;
    particulars?: string;
    company?: CompanyData;
    manager?: {
      managerPhone?: string;
  };
}
  type: 'ledger' | 'receipt' | 'entry' | 'summary';
  partyName?: string;
  partyDetails?: string;
  footer?: React.ReactNode;
}

// =========================
// COMPANY (SELLER)
// =========================
interface CompanyData {
  companyName?: string;
  entityType?: string;
  companyPan?: string;
  companyEmail?: string;
  companyWebsite?: string;

  licenseRegistrationNumber?: string;
  urcNumber?: string;

  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;

  // ✅ OFFICE ADDRESS
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
}

export const StatementContent: React.FC<StatementTemplateProps & { settings: AppSettings | null }> = ({
  title,
  subtitle,
  dateRange,
  data,
  type,
  partyName,
  partyDetails,
  footer,
  settings
}) => {
  const formatCurrency = (amount: number) => {
    return Accounting.formatIndian(amount);
  };

  const transactions = data.transactions || [];

  const getPageSlices = () => {
    if (transactions.length === 0) return [[]];
    const FIRST_PAGE_LIMIT = 8;
    const SUBSEQUENT_PAGE_LIMIT = 10;

    const slices = [];
    slices.push(transactions.slice(0, FIRST_PAGE_LIMIT));

    let current = FIRST_PAGE_LIMIT;
    while (current < transactions.length) {
      const remaining = transactions.slice(current);
      if (remaining.length <= 10) {
        slices.push(remaining);
        break;
      }
      slices.push(remaining.slice(0, SUBSEQUENT_PAGE_LIMIT));
      current += SUBSEQUENT_PAGE_LIMIT;
    }

    return slices;
  };

  const WatermarkOverlay = () => (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: 0.08,
        zIndex: 0,
        pointerEvents: "none",
        overflow: "hidden"
      }}
    >
      <img
        src={settings?.companyWatermark || settings?.companyLogo || ''}
        style={{
          width: "75%",
          maxWidth: "750px",
          height: "auto",
          objectFit: "contain",
        }}
      />
    </div>
  );

  const PageWrapper: React.FC<{ children: React.ReactNode; isFirstPage?: boolean }> = ({ children, isFirstPage = true }) => (
<div className="bg-white w-[210mm] p-[10mm_15mm] font-serif text-slate-900 flex flex-col sheet relative box-border mx-auto print:w-full print:p-0" style={{ minHeight: '297mm' }}>
    <style>{`
  .gradient-text {
    color: #D9001B;
  }

  @media screen {
    .sheet {
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      margin-bottom: 24px !important;
      height: 297mm;
      overflow: hidden;
    }

    .gradient-text {
      background: linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
  }

  @media print {
    .sheet {
      box-shadow: none !important;
      margin: 0 !important;
      display: block !important;
      height: auto !important;
    }
  }
`}</style>

      {/* CONTENT */}
      <div className="print-content-wrapper" style={{ position: "relative", zIndex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* HEADER */}
        <div className="border-b-[3px] border-[#D9001B] pb-4 mb-6">
          <div className="flex justify-between items-center text-[12px] font-bold text-slate-700 tracking-wide mb-3 font-sans lining-nums tabular-nums">
            <div>REG NO: {settings?.licenseRegistrationNumber?.toUpperCase() || '-'}</div>
            <div>EST. 2019</div>
          </div>

          <div className="flex justify-between items-start">
            <div className="flex flex-col text-left">
              <span className="text-[52px] font-extrabold font-serif leading-tight gradient-text">
                Ashray Group
              </span>

              <div className="text-[12px] text-slate-800 mt-2.5 font-medium max-w-[520px] leading-relaxed font-sans">
                {(() => {
                  const parts = [
                    settings?.companyAddresses?.[0]?.addressLine,
                    settings?.companyAddresses?.[0]?.locality,
                    settings?.companyAddresses?.[0]?.district,
                    settings?.companyAddresses?.[0]?.state
                  ].filter(Boolean);
                  const address = parts.length > 0 ? parts.join(', ') : '';
                  const pincode = settings?.companyAddresses?.[0]?.pinCode;
                  return address ? `${address}${pincode ? ` - ${pincode}` : ''}` : 'Address not set';
                })()}
              </div>

              <div className="flex flex-wrap gap-2 text-[12px] font-bold text-slate-600 mt-2 font-sans tabular-nums">
                <span>Mob: {(data.manager?.managerPhone || data.company?.managerPhone)}</span>
                <span className="text-slate-300">|</span>
                <span>Mail: {settings?.companyEmail || '-'}</span>
                <span className="text-slate-300">|</span>
                <span>Web: {settings?.companyWebsite || '-'}</span>
              </div>
            </div>

            <div className="flex flex-col items-end text-right">
              {settings?.companyLogo && (
                <img
                  src={settings.companyLogo}
                  style={{ width: "95px", height: "95px", objectFit: "contain" }}
                  alt="Company Logo"
                />
              )}
            </div>
          </div>
        </div>

        {/* Title Section */}
        {isFirstPage && (
          <div className="mt-4 flex items-center justify-center relative mb-8">
            <div className="flex flex-col items-center">
              <div className="text-center font-serif text-lg font-bold tracking-[1.5px] uppercase text-indigo-700 underline underline-offset-4">
                {title}
              </div>
              {settings?.financialYearStart && settings?.financialYearEnd && (
                <div className="text-[9px] font-bold text-slate-500 mt-1 uppercase tracking-widest font-sans">
                  Financial Year: {new Date(settings.financialYearStart).getFullYear()} - {new Date(settings.financialYearEnd).getFullYear()}
                </div>
              )}
              {subtitle && <div className="text-[10px] font-bold text-slate-400 mt-0.5 font-sans">{subtitle}</div>}
            </div>
            <div className="absolute right-0 text-[10px] font-bold font-sans">
              <span className="uppercase mr-1 text-slate-400">Date:</span>
              <span className="tabular-nums">{new Date().toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        )}

        {/* Party Information */}
        {isFirstPage && (partyName || partyDetails) && (
          <div className="mb-8 grid grid-cols-2 gap-8">
            <div className="border border-slate-200 p-4 rounded-sm bg-slate-50/30">
              <h3 className="text-[10px] font-bold uppercase text-slate-500 mb-2 border-b border-slate-100 pb-1 tracking-widest font-sans">Party Information:</h3>
              <p className="font-bold text-lg text-slate-900">{partyName || '-'}</p>
              <div className="text-[11px] text-slate-600 space-y-1 mt-2 font-sans">
                {partyDetails?.split('\n').map((line, i) => <p key={i}>{line}</p>)}
              </div>
            </div>
            <div className="text-right flex flex-col justify-end">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest font-sans">Document Status</div>
              <p className="text-xs text-slate-600 font-medium">Original Copy</p>
            </div>
          </div>
        )}

        <div className="print-table-wrapper w-full">
          {children}
        </div>

        {/* Dynamic Footer for Screen */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end text-[9px] text-slate-400 uppercase font-bold tracking-widest font-sans print:hidden">
          <p>{settings?.companyName ? `System Generated Document • ${settings.companyName}` : 'Generated by Ashray ERP'}</p>
        </div>
      </div>
    </div>
  );

  if (type === 'ledger') {
    const pageSlices = getPageSlices();
    
    return (
      <div className="space-y-6 bg-transparent">
        {pageSlices.map((slice, pageIndex) => {
          const isFirstPage = pageIndex === 0;
          const isLastPage = pageIndex === pageSlices.length - 1;

          return (
            <PageWrapper key={pageIndex} isFirstPage={isFirstPage}>
              <div className="relative">
                <WatermarkOverlay />
                <table className="w-full text-left border-collapse table-fixed relative z-10">
                  <thead>
                    <tr className="bg-slate-100 border-y border-slate-900/20">
                      <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest w-24 font-sans">Date</th>
                      <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest font-sans">Particulars</th>
                      <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-right w-28 font-sans">Debit (-)</th>
                      <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-right w-28 font-sans">Credit (+)</th>
                      <th className="py-3 px-2 text-[10px] font-bold uppercase tracking-widest text-right w-32 font-sans">Balance</th>
                    </tr>
                  </thead>

                <tbody className="divide-y divide-slate-100">
                  {slice.map((tx: any, idx: number) => (
                    <tr key={idx} className="font-sans text-[11px] hover:bg-slate-50/50">
                      <td className="py-3 px-2 whitespace-nowrap font-medium text-slate-500 tabular-nums">
                        {tx.date}
                      </td>

                      <td className="py-3 px-2">
                        <div className="font-bold text-slate-800">{tx.particulars}</div>
                        {tx.referenceId && (
                          <div className="text-[9px] text-slate-400 mt-1 font-mono uppercase">
                            Ref: {tx.referenceId} | {tx.method}
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-2 text-right font-bold text-red-600 font-mono tabular-nums">
                        {tx.type === TransactionType.DEBIT ? formatCurrency(tx.amount) : '-'}
                      </td>

                      <td className="py-3 px-2 text-right font-bold text-emerald-600 font-mono tabular-nums">
                        {tx.type === TransactionType.CREDIT ? formatCurrency(tx.amount) : '-'}
                      </td>

                      <td className="py-3 px-2 text-right font-black text-slate-900 font-mono tabular-nums">
                        {Accounting.formatDrCr(tx.displayBalance || tx.balance)}
                      </td>
                    </tr>
                  ))}
                  
                  {/* TOTAL ROW (Rendered as last row of tbody) */}
                  {isLastPage && data.totals && (
                    <tr className="bg-slate-100 font-bold font-sans tabular-nums border-t-2 border-slate-900">
                      <td colSpan={2} className="py-4 px-2 uppercase text-[10px] tracking-widest">
                        Total Summary
                      </td>
                      <td className="py-4 px-2 text-right text-red-600 font-black text-sm">
                        ₹{formatCurrency(data.totals.debit)}
                      </td>
                      <td className="py-4 px-2 text-right text-emerald-600 font-black text-sm">
                        ₹{formatCurrency(data.totals.credit)}
                      </td>
                      <td className="py-4 px-2 text-right bg-slate-900 text-white font-black text-sm">
                        {Accounting.formatDrCr(data.totals.balance)}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              </div>

              {/* TERMS (At the end) */}
              {isLastPage && (
                <div className="mt-10 pt-6 border-t border-slate-200">
                  <h4 className="text-[9px] font-black uppercase text-slate-400 mb-3 tracking-[0.2em] font-sans">
                    Terms & Legal Information
                  </h4>

                  <div className="text-[10px] text-slate-600 leading-relaxed font-sans space-y-1">
                    <p>1. All entries are subject to verification.</p>
                    <p>2. Discrepancies must be reported within 7 days.</p>
                    <p>3. Payments via cheque/bank are subject to realization.</p>
                    <p>4. This is a system-generated document and does not require a signature.</p>
                    <p>5. Jurisdiction: Nagpur, Maharashtra.</p>
                  </div>
                </div>
              )}
            </PageWrapper>
          );
        })}
      </div>
    );
  }

  // Fallback for other types
  return (
    <PageWrapper>
      <div className="relative flex-grow flex flex-col">
        <WatermarkOverlay />
        {type === 'receipt' && (
          <div className="max-w-xl mx-auto border-4 border-double border-slate-300 p-8 my-12 relative overflow-hidden bg-slate-50/30 rounded-xl w-full z-10">
            <div className="text-center mb-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2">Acknowledgement Receipt</p>
              <div className="h-0.5 bg-slate-200 w-24 mx-auto" />
            </div>
            
            <div className="space-y-6 text-slate-800 italic leading-loose text-base">
              <p>Received with thanks FROM <span className="font-bold not-italic border-b border-slate-400 px-2 uppercase">{partyName}</span>,</p>
              <p>a sum of Rupees <span className="font-bold not-italic border-b border-slate-400 px-2 uppercase">₹{formatCurrency(data.amount || 0)}</span></p>
              <p>Words: <span className="font-bold text-xs uppercase opacity-70">({Accounting.formatIndianWords(data.amount || 0)})</span></p>
              <p>vide <span className="font-bold not-italic border-b border-slate-400 px-2 uppercase tabular-nums">{data.method}</span> ref <span className="font-bold not-italic border-b border-slate-400 px-2 uppercase tabular-nums">{data.referenceId || '---'}</span></p>
              <p>dated <span className="font-bold not-italic border-b border-slate-400 px-2 uppercase tabular-nums">{data.date}</span></p>
              <p>on account of <span className="font-bold not-italic border-b border-slate-400 px-2 uppercase">{data.particulars}</span>.</p>
            </div>

            <div className="mt-16 flex justify-between items-end">
              <div className="text-center">
                <div className="h-12 w-40 border-b border-slate-300 mb-2" />
                <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest font-sans">Receiver's Signature</p>
              </div>
              <div className="text-center">
                <div className="h-12 w-48 border-b border-slate-300 mb-2 flex items-end justify-center">
                   <span className="text-slate-200 uppercase text-[10px] mb-1 font-bold font-sans">Authorized Sign</span>
                </div>
                <p className="text-[9px] font-bold uppercase text-slate-500 tracking-widest font-sans">For {settings?.companyName}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export const StatementPrintView: React.FC<StatementTemplateProps & { 
  open: boolean; 
  onClose: () => void; 
}> = (props) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  useEffect(() => {
    dbService.getSettings().then(s => {
      setSettings(s);
      if (s) {
        if (s.companyAddresses && s.companyAddresses.length > 0) {
          setSelectedAddressId(s.companyAddresses[0].id);
        }
        if (s.managers && s.managers.length > 0) {
          setSelectedManagerId(s.managers[0].id);
        }
      }
    });
  }, []);

  const selectedAddress = settings?.companyAddresses?.find(a => a.id === selectedAddressId);
  const selectedManager = settings?.managers?.find(m => m.id === selectedManagerId);

  return (
    <PrintPreview
      open={props.open}
      onClose={props.onClose}
      title={props.title}
      subtitle={props.subtitle}
      companyName={settings?.companyName}
      taxId={settings?.panNumber ? `PAN: ${settings.panNumber}` : (settings?.gstNumber ? `GST: ${settings.gstNumber}` : undefined)}
      configPanel={
        <div className="p-4 bg-[#1a1a1a] border-b border-white/5 space-y-4">
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
            <Settings size={14} className="text-brand-400 font-bold" />
            <span className="text-[11px] font-black uppercase text-white/40 tracking-[0.1em]">Administrative Assignments</span>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                <Building2 size={12} className="text-emerald-400" />
                Office Address
              </label>
              <select
                className="w-full text-xs border border-white/10 rounded-lg p-2 bg-[#2a2a2a] text-white outline-none focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
              >
                {settings?.companyAddresses?.map((addr) => (
                  <option key={addr.id} value={addr.id} className="bg-[#2a2a2a]">
                    {addr.name} - {addr.locality}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-white/50 uppercase tracking-wider flex items-center gap-2">
                <User size={12} className="text-blue-400" />
                Authorized Manager
              </label>
              <select
                className="w-full text-xs border border-white/10 rounded-lg p-2 bg-[#2a2a2a] text-white outline-none focus:ring-1 focus:ring-brand-500 transition-all font-medium"
                value={selectedManagerId}
                onChange={(e) => setSelectedManagerId(e.target.value)}
              >
                {settings?.managers?.map((man) => (
                  <option key={man.id} value={man.id} className="bg-[#2a2a2a]">
                    {man.name} ({man.role})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      }
    >
      <StatementContent
        {...props}
        settings={settings}
        data={{
          ...props.data,
          company: {
            ...props.data.company,
            companyName: settings?.companyName,
            companyEmail: settings?.companyEmail,
            companyWebsite: settings?.companyWebsite,
            licenseRegistrationNumber: settings?.licenseRegistrationNumber,
            
            // Dynamic Address from Selection
            companyAddress: selectedAddress?.addressLine,
            companyLocality: selectedAddress?.locality,
            companyDistrict: selectedAddress?.district,
            companyState: selectedAddress?.state,
            companyPincode: selectedAddress?.pinCode,
            
            // Dynamic Manager from Selection
            managerPhone: selectedManager?.phone || settings?.whatsappNumber,
          },
          manager: {
            ...props.data.manager,
            managerPhone: selectedManager?.phone || settings?.whatsappNumber,
          },
        }}
      />
    </PrintPreview>
  );
};
