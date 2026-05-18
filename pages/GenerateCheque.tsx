import React, { useState, useEffect, useRef } from 'react';
import { Printer, ArrowLeft, Calendar, User, IndianRupee, CheckSquare, RotateCcw, MapPin, Phone, XCircle, Clock, Folder as FolderIcon, Layers as CategoryIcon } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import PrintPreview from '../components/Printpreview';
import { GenerateChequeEngine, STANDARD_CHEQUE_LAYOUT } from '../services/GenerateChequeEngine';
import { Accounting } from '../services/accounting';
import { dbService } from '../services/db';
import { AppSettings, CompanyAddress, Manager, Client, Kissan, Investor, Loan, Transaction, TransactionType, PaymentMethod, TransactionCategory, Category, Folder, Doc, BankProfile } from '../types';

interface ChequeInfo {
  date: string;
  payee: string;
  amount: number;
  isAccountPayee: boolean;
  strikeBearer: boolean;
}

// ─── Utility: Number to Indian Words ──────────────────────────────────────────
// Wraps GenerateChequeEngine with a "Rupees ... Only" format for cheque display
function formatAmountWords(words: string): string {
  if (!words) return '';
  const clean = words.trim();
  if (!clean) return '';
  return `${clean} Only`;
}

// ─── Date Box Grid ─────────────────────────────────────────────────────────────
// Renders DD / MM / YYYY in individual outlined boxes like a real Indian cheque
const DateBoxRow: React.FC<{ date: string }> = ({ date }) => {
  const [dd, mm, yyyy] = date
    ? [date.slice(8, 10), date.slice(5, 7), date.slice(0, 4)]
    : ['', '', ''];

  const digits = [
    dd[0] || '', dd[1] || '',
    mm[0] || '', mm[1] || '',
    yyyy[0] || '', yyyy[1] || '', yyyy[2] || '', yyyy[3] || '',
  ];

  const labels = ['D', 'D', 'M', 'M', 'Y', 'Y', 'Y', 'Y'];

  return (
    <div className="flex items-end gap-[1px]">
      {digits.map((d, i) => (
        <React.Fragment key={i}>
          {/* Separator slash after DD and MM - removed for pre-printed compatibility */}
          {(i === 2 || i === 4) && (
            <span className="mx-[4px] w-[5px] inline-block" />
          )}
          <div className="flex flex-col items-center">
            <div
              className="w-[18px] h-[22px] flex items-center justify-center font-mono font-bold text-[13px] text-gray-900"
              style={{ letterSpacing: 0 }}
            >
              {d}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

// ─── Cheque Preview (Screen) ────────────────────────────────────────────────────
const ChequePreview: React.FC<{ cheque: ChequeInfo; amountInWords: string }> = ({
  cheque,
  amountInWords,
}) => {
  const words = formatAmountWords(amountInWords);
  // Split into two lines at ~50 chars
  const splitAt = 52;
  let line1 = words;
  let line2 = '';
  if (words.length > splitAt) {
    const breakPoint = words.lastIndexOf(' ', splitAt);
    line1 = words.slice(0, breakPoint > 0 ? breakPoint : splitAt);
    line2 = words.slice(breakPoint > 0 ? breakPoint + 1 : splitAt);
  }

  const formattedFigures =
    cheque.amount > 0 ? `** ${Accounting.formatMoney(cheque.amount)} /-` : '';

  return (
    <div
      className="relative bg-white shadow-xl border border-gray-200 overflow-hidden"
      style={{
        width: '100%',
        aspectRatio: '203 / 95',
        fontFamily: "'Times New Roman', Times, serif",
        /* Simulate the faint security paper tint */
        backgroundImage:
          'radial-gradient(ellipse at 70% 30%, rgba(255,251,230,0.6) 0%, transparent 60%),' +
          'repeating-linear-gradient(45deg,transparent,transparent 18px,rgba(200,200,200,0.04) 18px,rgba(200,200,200,0.04) 19px)',
      }}
    >
      {/* ── Watermark ── */}
      <div
        className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
        style={{ opacity: 0.03 }}
      >
        <span
          className="font-black text-gray-900 rotate-[-30deg] whitespace-nowrap"
          style={{ fontSize: '6cqw' }}
        >
          SPECIMEN
        </span>
      </div>

      {/* ── CTS-2010 Badge ── */}
      <div
        className="absolute top-[3%] right-[3%] border border-gray-300 text-gray-400 font-mono font-bold px-1"
        style={{ fontSize: '1.4cqw' }}
      >
        CTS-2010
      </div>

      {/* ── Bank / Branch area (left top) ── */}
      <div
        className="absolute font-bold text-gray-500"
        style={{ top: '4%', left: '3%', fontSize: '2cqw' }}
      >
        <div style={{ fontSize: '2.4cqw', fontWeight: 900, color: '#555' }}>
          STATE BANK OF INDIA
        </div>
        <div style={{ fontSize: '1.6cqw', color: '#888', marginTop: '0.3cqw' }}>
          Main Branch, Nagpur · IFSC: SBIN0001234
        </div>
      </div>

      {/* ── Cheque Number ── */}
      <div
        className="absolute font-mono text-gray-400"
        style={{ top: '4%', left: '40%', fontSize: '1.6cqw' }}
      >
        001235
      </div>

      {/* ── A/c Payee Crossing ── */}
      {cheque.isAccountPayee && (
        <div
          className="absolute"
          style={{
            top: '9%',
            left: '-3%',
            width: '25%',
            height: '9%',
            borderTop: '1.5px solid #333',
            borderBottom: '1.5px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'rotate(-38deg)',
          }}
        >
          <span
            className="font-bold text-gray-800 tracking-wider"
            style={{ fontSize: '1.6cqw' }}
          >
            A/C PAYEE
          </span>
        </div>
      )}

      {/* ── Date (top-right, individual boxes) ── */}
      <div
        className="absolute"
        style={{ top: '16%', right: '3%' }}
      >
        <DateBoxRow date={cheque.date} />
      </div>

      {/* ── PAY label + payee line ── */}
      <div
        className="absolute flex items-baseline gap-[1.5%]"
        style={{ top: '24%', left: '10%', right: '3%' }}
      >
        <div className="flex-1 relative">
          <div
            className="font-bold text-gray-900 truncate"
            style={{ fontSize: '3.2cqw', minHeight: '1em', marginLeft: '10cqw' }}
          >
            {cheque.payee}
          </div>
          {/* Or Bearer (struck through if requested) */}
          {cheque.strikeBearer && (
            <div
              className="absolute"
              style={{
                right: '4cqw',
                top: '1cqw',
                width: '15cqw',
                borderTop: '1.5pt solid black',
              }}
            />
          )}
        </div>
      </div>

      {/* ── RUPEES label + amount words ── */}
      <div
        className="absolute"
        style={{ top: '46%', left: '10%', right: '30%' }}
      >
        <div className="flex items-baseline gap-[1.5%]">
          <div className="flex-1">
            <div
              className="font-bold text-gray-900"
              style={{ fontSize: '2.4cqw', minHeight: '1em', lineHeight: 1.3, marginLeft: '7cqw' }}
            >
              {line1}
              {line2 && (
                <>
                  <br />
                  {line2}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Amount Figures Box ── */}
      <div
        className="absolute flex items-center justify-end"
        style={{
          top: '42%',
          right: '5%',
          width: '25%',
          height: '18%',
          padding: '0 1cqw',
        }}
      >
        <span
          className="font-mono font-bold text-gray-900"
          style={{ fontSize: '2.8cqw' }}
        >
          {formattedFigures}
        </span>
      </div>

      {/* Signature area removed - pre-printed on cheque */}


      {/* ── MICR Band ── */}
      <div
        className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-[3%] bg-white border-t border-gray-100"
        style={{ height: '14%' }}
      >
        <div
          className="font-mono text-gray-400 tracking-widest"
          style={{ fontSize: '1.8cqw' }}
        >
          ⑆432581⑆
        </div>
        <div
          className="font-mono text-gray-400 tracking-widest"
          style={{ fontSize: '1.8cqw' }}
        >
          440012012⑈
        </div>
        <div
          className="font-mono text-gray-400 tracking-widest"
          style={{ fontSize: '1.8cqw' }}
        >
          001235⑆
        </div>
        <div
          className="font-mono text-gray-400 tracking-widest"
          style={{ fontSize: '1.8cqw' }}
        >
          10
        </div>
      </div>
    </div>
  );
};

// ─── Print-Ready Cheque ────────────────────────────────────────────────────────
// This is what actually goes to the printer — px-perfect at 203mm × 95mm
const PrintableCheque: React.FC<{ cheque: ChequeInfo; amountInWords: string }> = ({
  cheque,
  amountInWords,
}) => {
  const words = formatAmountWords(amountInWords);
  const splitAt = 55;
  let line1 = words;
  let line2 = '';
  if (words.length > splitAt) {
    const breakPoint = words.lastIndexOf(' ', splitAt);
    line1 = words.slice(0, breakPoint > 0 ? breakPoint : splitAt);
    line2 = words.slice(breakPoint > 0 ? breakPoint + 1 : splitAt);
  }

  const [dd, mm, yyyy] = cheque.date
    ? [cheque.date.slice(8, 10), cheque.date.slice(5, 7), cheque.date.slice(0, 4)]
    : ['', '', ''];
  const dateDigits = [dd[0], dd[1], mm[0], mm[1], yyyy[0], yyyy[1], yyyy[2], yyyy[3]];

  const formattedFigures =
    cheque.amount > 0 ? `** ${Accounting.formatMoney(cheque.amount)} /-` : '';

  return (
    <div
      style={{
        width: '203mm',
        height: '95mm',
        position: 'relative',
        backgroundColor: 'white',
        fontFamily: "'Times New Roman', Times, serif",
        color: '#111',
        overflow: 'hidden',
      }}
    >
      {/* A/c Payee crossing */}
      {cheque.isAccountPayee && (
        <div
          style={{
            position: 'absolute',
            top: '8mm',
            left: '-3mm',
            width: '45mm',
            height: '8mm',
            borderTop: '1pt solid black',
            borderBottom: '1pt solid black',
            transform: 'rotate(-38deg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <span
            style={{
              fontSize: '10pt',
              fontWeight: 'bold',
              letterSpacing: '0.5pt',
            }}
          >
            A/C PAYEE
          </span>
        </div>
      )}

      {/* Date boxes */}
      <div
        style={{
          position: 'absolute',
          top: '6mm',
          right: '2.5mm',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '0mm',
        }}
      >
        {dateDigits.map((d, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                width: '5.1mm',
                height: '7mm',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'monospace',
                fontSize: '10pt',
                fontWeight: 'bold',
              }}
            >
              {d || ''}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* PAY line */}
      <div
        style={{
          position: 'absolute',
          top: '20.3mm',
          left: '16mm',
          right: '6mm',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '3mm',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
          <div style={{ fontSize: '11pt', fontWeight: 'bold', minHeight: '5mm', marginLeft: '15mm' }}>
            {cheque.payee}
          </div>
          {cheque.strikeBearer && (
            <div
              style={{
                position: 'absolute',
                right: '1mm',
                top: '2.7mm',
                width: '20mm',
                borderTop: '1pt solid black',
              }}
            />
          )}
        </div>
      </div>

      {/* RUPEES line */}
      <div
        style={{
          position: 'absolute',
          top: '30.3mm',
          left: '20mm',
          right: '54mm',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '2mm' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '9pt', fontWeight: 'bold', lineHeight: 1.05, minHeight: 'auto', marginLeft: '20mm', letterSpacing: '0.4pt' }}>
              {line1}
            </div>
          </div>
        </div>
        {line2 && (
          <div
            style={{
              fontSize: '9pt',
              fontWeight: 'bold',
              lineHeight: 1.15,
              marginTop: '5.8mm',
            }}
          >
            {line2}
          </div>
        )}
      </div>

      {/* Amount figures box */}
      <div
        style={{
          position: 'absolute',
          top: '31.6mm',
          right: '6mm',
          width: '45mm',
          height: '14mm',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '2mm',
          overflow: 'hidden',
        }}
      >
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: '8.5pt',
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.3pt'
          }}
        >
          {formattedFigures}
        </span>
      </div>


    </div>
  );
};

// ─── Print-Ready Cheque Back ───────────────────────────────────────────────────
const PrintableChequeBack: React.FC<{ 
  address?: CompanyAddress;
  manager?: Manager;
  beneficiaryAccount?: { accountNumber: string, bankName: string, ifscCode: string };
  payeeName?: string;
}> = ({ address, manager, beneficiaryAccount, payeeName }) => {
  return (
    <div
      style={{
        width: '203mm',
        height: '95mm',
        position: 'relative',
        backgroundColor: 'white',
        fontFamily: "'Times New Roman', Times, serif",
        color: '#111',
        overflow: 'hidden',
        padding: '10mm',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center'
      }}
    >
      {beneficiaryAccount && beneficiaryAccount.accountNumber && (
        <div style={{ marginBottom: '8mm', fontSize: '11pt', fontWeight: 'bold' }}>
          {payeeName && <div>{payeeName}</div>}
          A/c: {beneficiaryAccount.accountNumber}<br/>
          <span style={{ fontSize: '10pt', fontWeight: 'normal' }}>
            {[beneficiaryAccount.bankName, beneficiaryAccount.ifscCode].filter(Boolean).join(' - ')}
          </span>
        </div>
      )}

      {address && (
        <div style={{ marginBottom: '5mm', fontSize: '11pt', fontWeight: 'bold' }}>
          {address.name}<br/>
          <span style={{ fontSize: '10pt', fontWeight: 'normal' }}>
            {[address.addressLine, address.locality, address.district, address.state].filter(Boolean).join(', ')} - {address.pinCode}
          </span>
        </div>
      )}

      {manager && (
        <div style={{ fontSize: '11pt', fontWeight: 'bold' }}>
          {manager.name}<br/>
          <span style={{ fontSize: '10pt', fontWeight: 'normal' }}>
            {manager.phone}
          </span>
        </div>
      )}
    </div>
  );
};

// ─── Print-Ready Cancelled Cheque ──────────────────────────────────────────────
const PrintableCancelledCheque: React.FC = () => {
  return (
    <div
      style={{
        width: '203mm',
        height: '95mm',
        position: 'relative',
        backgroundColor: 'white',
        fontFamily: "'Times New Roman', Times, serif",
        color: '#111',
        overflow: 'hidden',
      }}
    >
      {/* Two parallel lines with CANCELLED inside */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%) rotate(-25deg)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '180mm',
          borderTop: '2.5pt solid black',
          borderBottom: '2.5pt solid black',
          padding: '5mm 0',
        }}
      >
        <span
          style={{
            fontSize: '36pt',
            fontWeight: 'bold',
            letterSpacing: '8pt',
            color: 'black',
          }}
        >
          CANCELLED
        </span>
      </div>
    </div>
  );
};

// ─── Main Page ─────────────────────────────────────────────────────────────────
export const GenerateCheque: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);

  const [cheque, setCheque] = useState<ChequeInfo>({
    date: new Date().toISOString().split('T')[0],
    payee: '',
    amount: 0,
    isAccountPayee: true,
    strikeBearer: true,
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isBackPreviewOpen, setIsBackPreviewOpen] = useState(false);
  const [isCancelPreviewOpen, setIsCancelPreviewOpen] = useState(false);
  const [amountInWords, setAmountInWords] = useState('');

  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [officeAddresses, setOfficeAddresses] = useState<CompanyAddress[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');

  const [clients, setClients] = useState<Client[]>([]);
  const [kissans, setKissans] = useState<Kissan[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);

  const [pendingCheques, setPendingCheques] = useState<{id: string, payeeName: string, amount: number, date: string, partyType?: 'Manual' | 'Client' | 'Kissan' | 'Investor' | 'Loan Borrower', partyId?: string, printed: boolean}[]>([]);
  const [payeeType, setPayeeType] = useState<'Manual' | 'Client' | 'Kissan' | 'Investor' | 'Loan Borrower'>('Manual');
  const [selectedPayeeId, setSelectedPayeeId] = useState<string>(''); // For Kissan, use targetOwnerId
  const [associatedTransactionId, setAssociatedTransactionId] = useState<string | null>(null);
  const [chequeNumber, setChequeNumber] = useState('');
  const [recordInLedger, setRecordInLedger] = useState(false);
  const [beneficiaryAccount, setBeneficiaryAccount] = useState({
    accountNumber: '',
    bankName: '',
    ifscCode: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [banks, setBanks] = useState<BankProfile[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [isCancelSetupOpen, setIsCancelSetupOpen] = useState(false);
  const [cancelStep, setCancelStep] = useState<1 | 2>(1);
  const [cancelPartyType, setCancelPartyType] = useState<'CLIENT' | 'KISSAN' | 'INVESTOR' | 'LOAN' | 'EXPENSE' | 'NONE'>('NONE');
  const [selectedTxId, setSelectedTxId] = useState('');
  const [cancelChequeNo, setCancelChequeNo] = useState('');
  const [cancelDate, setCancelDate] = useState('');
  const [cancelPayee, setCancelPayee] = useState('');
  
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [cancelAmount, setCancelAmount] = useState('');
  const [cancelCategoryId, setCancelCategoryId] = useState<string | number>('');
  const [cancelFolderId, setCancelFolderId] = useState<string | number>('');
  const [syncWithPartyFolder, setSyncWithPartyFolder] = useState(true);

  const openCancelSetup = () => {
    setCancelStep(1);
    setCancelPartyType('NONE');
    setSelectedTxId('');
    setCancelDate(cheque.date);
    setCancelChequeNo('');
    setCancelPayee(cheque.payee);
    setCancelAmount(cheque.amount ? cheque.amount.toString() : '');
    
    // Pre-fill from current main form payee if selected
    let catId: string | number = '';
    let foldId: string | number = '';
    
    if (payeeType === 'Client' && selectedPayeeId) {
      const c = clients.find(x => String(x.id) === String(selectedPayeeId));
      if (c) { catId = c.categoryId || ''; foldId = c.folderId || ''; }
    } else if (payeeType === 'Investor' && selectedPayeeId) {
      const i = investors.find(x => String(x.id) === String(selectedPayeeId));
      if (i) { catId = i.categoryId || ''; foldId = i.folderId || ''; }
    } else if (payeeType === 'Loan Borrower' && selectedPayeeId) {
      const l = loans.find(x => String(x.id) === String(selectedPayeeId));
      if (l) { catId = l.categoryId || ''; foldId = l.folderId || ''; }
    } else if (payeeType === 'Kissan' && selectedPayeeId) {
      const kId = String(selectedPayeeId).split('::')[0];
      const k = kissans.find(x => String(x.id) === kId);
      if (k) { catId = k.categoryId || ''; foldId = k.folderId || ''; }
    }

    setCancelCategoryId(catId);
    setCancelFolderId(foldId);
    setIsCancelSetupOpen(true);
  };

  useEffect(() => {
    dbService.getSettings().then(s => {
      setSettings(s);
      const addrs = s.companyAddresses || [];
      const mgrs = s.managers || [];
      setOfficeAddresses(addrs);
      setManagers(mgrs);
      if (addrs.length > 0) setSelectedAddressId(addrs[0].id);
      if (mgrs.length > 0) setSelectedManagerId(mgrs[0].id);
    });

    // Load initial data
    Promise.all([
      dbService.getClients().then(setClients),
      dbService.getKissans().then(setKissans),
      dbService.getInvestors().then(setInvestors),
      dbService.getLoans().then(setLoans),
      dbService.getCategories().then(setCategories),
      dbService.getFolders().then(setFolders),
      dbService.getBanks().then(setBanks),
      dbService.getTransactions().then(txs => {
        // Only keep Cheque Debits
        setTransactions(txs.filter(t => t.method === PaymentMethod.CHEQUE && t.type === TransactionType.DEBIT));
      })
    ]).then(async () => {
      let stored = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
      
      let modified = false;
      stored = stored.map((r: any) => {
        if (r.partyName && !r.payeeName) {
          modified = true;
          return { ...r, payeeName: r.partyName };
        }
        return r;
      });
      if (modified) localStorage.setItem('pending_cheques', JSON.stringify(stored));

      const clientsList = await dbService.getClients();
      const kissansList = await (dbService as any).getKissans ? await (dbService as any).getKissans() : await (dbService as any).getKissan();
      const investorsList = await dbService.getInvestors();
      const loansList = await dbService.getLoans();
      const staffList = await dbService.getStaff();

      const validIds = new Set([
        ...clientsList.map((c: any) => c.id),
        ...kissansList.map((k: any) => k.id),
        ...investorsList.map((i: any) => i.id),
        ...loansList.map((l: any) => l.id),
        ...staffList.map((s: any) => s.id),
        ...kissansList.flatMap((k: any) => k.owners?.map((o: any) => `${k.id}::${o.id}`) || [])
      ]);

      const validNames = new Set([
        ...clientsList.map((c: void | any) => c.name?.toLowerCase()),
        ...kissansList.map((k: void | any) => k.landName?.toLowerCase()),
        ...investorsList.map((i: void | any) => i.name?.toLowerCase()),
        ...loansList.map((l: void | any) => l.borrowerName?.toLowerCase()),
        ...staffList.map((s: void | any) => s.name?.toLowerCase()),
        ...kissansList.flatMap((k: void | any) => k.owners?.map((o: any) => o.name?.toLowerCase()) || [])
      ]);

      const validCheques = stored.filter((c: any) => {
        if (c.partyId) return validIds.has(c.partyId);
        if (c.payeeName) return validNames.has(c.payeeName.toLowerCase());
        return true;
      });
      if (validCheques.length !== stored.length) {
        localStorage.setItem('pending_cheques', JSON.stringify(validCheques));
      }
      setPendingCheques(validCheques.filter((c: any) => !c.printed));

      // Handle autoFillCheque from AddTransaction routing or URL parameters
      const state = location.state as any;
      
      const searchAmount = searchParams.get('amount');
      const searchDate = searchParams.get('date');
      const searchPayeeName = searchParams.get('payeeName');
      const searchPendingId = searchParams.get('pendingId');
      const searchPartyType = searchParams.get('partyType');
      const searchPartyId = searchParams.get('partyId');

      if (searchPendingId) {
        setPendingId(searchPendingId);
        // Mark as printed right away
        const pCheques = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
        const updated = pCheques.map((c: any) => c.id === searchPendingId ? { ...c, printed: true } : c);
        localStorage.setItem('pending_cheques', JSON.stringify(updated));
        setPendingCheques(updated.filter((c: any) => !c.printed));
        setRecordInLedger(true);

        if (searchPartyType && searchPartyId) {
          setPayeeType(searchPartyType as any);
          setSelectedPayeeId(searchPartyId);
        }
      }

      if (state && state.autoFillCheque) {
        const auto = state.autoFillCheque;
        
        if (auto.transactionId) {
          setAssociatedTransactionId(auto.transactionId);
        }

        // Update amount and date
        if (auto.amount) {
          setCheque(prev => ({ ...prev, amount: Number(auto.amount), date: auto.date || prev.date }));
        }

        // Map partyType to payeeType
        if (auto.partyType === 'CLIENT' && auto.clientId) {
          setPayeeType('Client');
          setSelectedPayeeId(auto.clientId);
        } else if (auto.partyType === 'KISSAN' && auto.kissanId && auto.ownerId) {
          setPayeeType('Kissan');
          setSelectedPayeeId(`${auto.kissanId}::${auto.ownerId}`);
        } else if (auto.partyType === 'INVESTOR' && auto.investorId) {
          setPayeeType('Investor');
          setSelectedPayeeId(auto.investorId);
        } else if (auto.partyType === 'LOAN' && auto.loanId) {
          setPayeeType('Loan Borrower');
          setSelectedPayeeId(auto.loanId);
        } else if (auto.partyType === 'EXPENSE' || auto.partyType === 'BANK') {
          setPayeeType('Manual');
          if (auto.expensePayee) {
             setCheque(prev => ({ ...prev, payee: auto.expensePayee }));
          }
        }
        
        if (auto.bankId) {
          setSelectedBankId(auto.bankId);
        }
        
        // Clear state to avoid infinite loops if it remounts or location changes
        window.history.replaceState({}, document.title);
      } else if (searchAmount || searchPayeeName) {
        setCheque(prev => ({ 
          ...prev, 
          amount: Number(searchAmount) || prev.amount, 
          date: searchDate || prev.date,
          payee: searchPayeeName || prev.payee
        }));
        
        if (searchPayeeName) {
          setPayeeType('Manual');
        }
        
        // Remove params from URL to avoid re-triggering
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
      }
    });

  }, [location.state, location.search]);

  // Sync Cancel form when a transaction is selected
  useEffect(() => {
    if (selectedTxId) {
      const tx = transactions.find(t => t.id === selectedTxId);
      if (tx) {
        setCancelChequeNo(tx.referenceId || '');
        setCancelDate(tx.date);
        setCancelPayee(tx.partyName || '');
        setCancelAmount(tx.amount.toString());

        // Autofetch category/folder from the linked party
        let catId: string | number = '';
        let foldId: string | number = '';

        if (tx.clientId) {
          const c = clients.find(x => String(x.id) === String(tx.clientId));
          if (c) { catId = c.categoryId || ''; foldId = c.folderId || ''; }
        } else if (tx.investorId) {
          const i = investors.find(x => String(x.id) === String(tx.investorId));
          if (i) { catId = i.categoryId || ''; foldId = i.folderId || ''; }
        } else if (tx.loanId) {
          const l = loans.find(x => String(x.id) === String(tx.loanId));
          if (l) { catId = l.categoryId || ''; foldId = l.folderId || ''; }
        } else if (tx.kissanId) {
          const k = kissans.find(x => String(x.id) === String(tx.kissanId));
          if (k) { catId = k.categoryId || ''; foldId = k.folderId || ''; }
        }

        setCancelCategoryId(catId);
        setCancelFolderId(foldId);
      }
    }
  }, [selectedTxId, transactions, clients, investors, loans, kissans]);

  // Sync Payee Name based on selection
  useEffect(() => {
    if (payeeType === 'Manual') return;

    if (!selectedPayeeId) {
      setCheque(prev => ({ ...prev, payee: '' }));
      setBeneficiaryAccount({ accountNumber: '', bankName: '', ifscCode: '' });
      return;
    }

    if (payeeType === 'Client') {
      const c = clients.find(x => String(x.id) === String(selectedPayeeId));
      if (c) {
        setCheque(prev => ({ ...prev, payee: c.name }));
        setBeneficiaryAccount({ accountNumber: c.accountNumber || '', bankName: c.bankName || '', ifscCode: c.ifscCode || '' });
      }
    } else if (payeeType === 'Investor') {
      const i = investors.find(x => String(x.id) === String(selectedPayeeId));
      if (i) {
        setCheque(prev => ({ ...prev, payee: i.name }));
        setBeneficiaryAccount({ accountNumber: i.accountNumber || '', bankName: i.bankName || '', ifscCode: i.ifscCode || '' });
      }
    } else if (payeeType === 'Loan Borrower') {
      const l = loans.find(x => String(x.id) === String(selectedPayeeId));
      if (l) {
        setCheque(prev => ({ ...prev, payee: l.borrowerName }));
        setBeneficiaryAccount({ accountNumber: l.accountNumber || '', bankName: l.bankName || '', ifscCode: l.ifscCode || '' });
      }
    } else if (payeeType === 'Kissan') {
      const [kId, oId] = String(selectedPayeeId).split('::');
      const k = kissans.find(x => String(x.id) === String(kId));
      if (k) {
        // Find specific owner or fallback to first if only one exists or ID is missing/undefined
        const owners = k.owners || [];
        const owner = owners.find((ox: any) => String(ox.id) === String(oId)) || 
                      (owners.length > 0 && (!oId || oId === 'undefined' || oId === '') ? owners[0] : null);
        
        if (owner) {
          setCheque(prev => ({ ...prev, payee: owner.name }));
          setBeneficiaryAccount({ 
            accountNumber: owner.accountNumber || '', 
            bankName: owner.bankName || '', 
            ifscCode: owner.ifscCode || '' 
          });
        } else {
          setCheque(prev => ({ ...prev, payee: k.landName }));
          setBeneficiaryAccount({ accountNumber: '', bankName: '', ifscCode: '' });
        }
      }
    }
  }, [payeeType, selectedPayeeId, clients, kissans, investors, loans]);

  useEffect(() => {
    if (cheque.amount > 0) {
      setAmountInWords(GenerateChequeEngine.numberToWords(cheque.amount));
    } else {
      setAmountInWords('');
    }
  }, [cheque.amount]);

  const isReady = !!cheque.payee.trim() && cheque.amount > 0;

  const handleReset = () => {
    setCheque({
      date: new Date().toISOString().split('T')[0],
      payee: '',
      amount: 0,
      isAccountPayee: true,
      strikeBearer: true,
    });
  };

  const handleUpdateTransaction = async () => {
    if (!associatedTransactionId) {
      alert('No transaction linked to this cheque entry.');
      return;
    }
    
    try {
      const txs = await dbService.getTransactions();
      const tx = txs.find(t => String(t.id) === String(associatedTransactionId));
      
      if (tx) {
        const updatedTx: Transaction = {
          ...tx,
          referenceId: chequeNumber || tx.referenceId,
          particulars: tx.particulars.replace(/ \(No: .*\)/, '').replace(/ \(Cheque No: .*\)/, '') + 
                      (chequeNumber ? ` (Cheque No: ${chequeNumber})` : ''),
          bankId: selectedBankId || tx.bankId
        };
        await dbService.saveTransaction(updatedTx);
        setRecordInLedger(false); // Transaction is now synced
        alert('Ledger transaction updated successfully!');
      } else {
        alert('Could not find original transaction in ledger.');
      }
    } catch (err) {
      console.error("Failed to update transaction", err);
      alert('Error updating transaction.');
    }
  };

  const handleAddToLedger = async () => {
    if (!isReady || payeeType === 'Manual' || !selectedPayeeId) {
      alert('Please select a party and enter an amount first.');
      return;
    }

    try {
      const amount = Number(cheque.amount);
      const date = cheque.date;
      const refId = chequeNumber || `CHQ-${Date.now()}`;
      
      const particulars = `Cheque Payment to ${cheque.payee}${chequeNumber ? ` (Cheque No: ${chequeNumber})` : ''}`;

      const partyData: any = {};
      if (payeeType === 'Client') partyData.clientId = String(selectedPayeeId);
      else if (payeeType === 'Investor') partyData.investorId = String(selectedPayeeId);
      else if (payeeType === 'Loan Borrower') partyData.loanId = String(selectedPayeeId);
      else if (payeeType === 'Kissan') {
        const [kId, oId] = String(selectedPayeeId).split('::');
        partyData.kissanId = kId;
        partyData.ownerId = oId === 'undefined' ? '' : oId;
      }

      const newTx: Transaction = {
        id: Date.now().toString(),
        date,
        particulars,
        amount,
        type: TransactionType.DEBIT,
        method: PaymentMethod.CHEQUE,
        referenceId: refId,
        bankId: selectedBankId || undefined,
        ...partyData,
        synced: false,
        balanceAfter: 0,
        partyName: cheque.payee,
        displayLabel: cheque.payee
      };

      await dbService.saveTransaction(newTx);
      setAssociatedTransactionId(newTx.id);
      setRecordInLedger(false); // Transaction is now synced
      setTransactions(prev => [...prev, newTx]); // Update local list
      alert('Transaction added to ledger successfully!');
    } catch (error) {
      console.error('Error adding to ledger:', error);
      alert('Failed to add transaction to ledger.');
    }
  };

  const handlePrintCheque = async () => {
    setIsPreviewOpen(true);
    
    // Mark pending cheque as printed if applicable
    if (pendingId) {
      const pCheques = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
      const updated = pCheques.map((c: any) => c.id === pendingId ? { ...c, printed: true } : c);
      localStorage.setItem('pending_cheques', JSON.stringify(updated));
      setPendingCheques(updated.filter((c: any) => !c.printed));
      setTimeout(() => navigate('/pending-cheques'), 800);
    }

    // Auto-save or update ledger
    if (payeeType !== 'Manual' && selectedPayeeId && (recordInLedger || associatedTransactionId)) {
      if (associatedTransactionId) {
        // Update existing transaction
        try {
          const txs = await dbService.getTransactions();
          const tx = txs.find(t => String(t.id) === String(associatedTransactionId));
          if (tx) {
            const updatedTx: Transaction = {
              ...tx,
              referenceId: chequeNumber || tx.referenceId,
              particulars: tx.particulars.replace(/ \(No: .*\)/, '').replace(/ \(Cheque No: .*\)/, '') + 
                          (chequeNumber ? ` (Cheque No: ${chequeNumber})` : ''),
              bankId: selectedBankId || tx.bankId
            };
            await dbService.saveTransaction(updatedTx);
            console.log("Updated existing transaction", updatedTx);
          }
        } catch (err) {
          console.error("Failed to update transaction", err);
        }
      } else {
        // Create new transaction
        const tx: Transaction = {
          id: 'tx_cheque_' + Date.now(),
          date: cheque.date,
          particulars: `Cheque Payment to ${cheque.payee}${chequeNumber ? ' (Cheque No: ' + chequeNumber + ')' : ''}`,
          amount: cheque.amount,
          type: TransactionType.DEBIT,
          method: PaymentMethod.CHEQUE,
          bankId: selectedBankId || undefined,
          referenceId: chequeNumber || `CHQ-${Date.now().toString().slice(-6)}`,
          balanceAfter: 0,
          synced: false,
          partyName: cheque.payee,
          category: TransactionCategory.GENERAL
        };

        if (payeeType === 'Client') {
          tx.clientId = selectedPayeeId;
        } else if (payeeType === 'Investor') {
          tx.investorId = selectedPayeeId;
          tx.category = TransactionCategory.PAYOUT; 
        } else if (payeeType === 'Loan Borrower') {
          tx.loanId = selectedPayeeId;
        } else if (payeeType === 'Kissan') {
          const [kId, oId] = String(selectedPayeeId).split('::');
          tx.kissanId = kId;
          if (oId && oId !== 'undefined' && oId !== 'null' && oId !== '') {
            tx.ownerId = oId;
          }
        }

        try {
          await dbService.saveTransaction(tx);
          setAssociatedTransactionId(tx.id); // CRITICAL: Link it now!
          console.log("Saved cheque transaction to ledger", tx);
        } catch (err) {
          console.error("Failed to save cheque to ledger", err);
        }
      }
      setRecordInLedger(false); 
    }
  };

  const handleCancelSetupSubmit = async () => {
    // Save to ledger/docs if selected
    if (cancelCategoryId && cancelFolderId) {
      const doc: Doc = {
        id: 'doc_cancelled_' + Date.now(),
        name: `Cancelled Cheque${cancelChequeNo ? ' #' + cancelChequeNo : ''}${cancelPayee ? ' - ' + cancelPayee : ''}`,
        date: cancelDate || new Date().toISOString(),
        size: cancelAmount ? `${cancelAmount} INR` : 'Print Only',
        type: 'virtual',
        synced: false,
        category_id: cancelCategoryId,
        folder_id: cancelFolderId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const tx = selectedTxId ? transactions.find(t => t.id === selectedTxId) : null;

      if (tx) {
        if (tx.clientId) doc.clientId = tx.clientId;
        else if (tx.investorId) doc.investorId = tx.investorId;
        else if (tx.loanId) doc.loanId = tx.loanId;
        else if (tx.kissanId) doc.kissanId = tx.kissanId;
      } else if (payeeType !== 'Manual' && selectedPayeeId) {
        if (payeeType === 'Client') doc.clientId = selectedPayeeId;
        else if (payeeType === 'Investor') doc.investorId = selectedPayeeId;
        else if (payeeType === 'Loan Borrower') doc.loanId = selectedPayeeId;
        else if (payeeType === 'Kissan') doc.kissanId = selectedPayeeId.split('::')[0];
      }

      // Update the party's permanent folder if requested
      if (syncWithPartyFolder && (tx || (payeeType !== 'Manual' && selectedPayeeId))) {
        try {
          if (tx) {
            if (tx.clientId) {
              const c = clients.find(x => x.id === tx.clientId);
              if (c) await dbService.saveClient({ ...c, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
            } else if (tx.investorId) {
              const i = investors.find(x => x.id === tx.investorId);
              if (i) await dbService.saveInvestor({ ...i, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
            } else if (tx.loanId) {
              const l = loans.find(x => x.id === tx.loanId);
              if (l) await dbService.saveLoan({ ...l, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
            } else if (tx.kissanId) {
              const k = kissans.find(x => x.id === tx.kissanId);
              if (k) await dbService.saveKissan({ ...k, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
            }
          } else {
             if (payeeType === 'Client') {
               const c = clients.find(x => String(x.id) === String(selectedPayeeId));
               if (c) await dbService.saveClient({ ...c, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
             } else if (payeeType === 'Investor') {
               const i = investors.find(x => String(x.id) === String(selectedPayeeId));
               if (i) await dbService.saveInvestor({ ...i, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
             } else if (payeeType === 'Loan Borrower') {
               const l = loans.find(x => String(x.id) === String(selectedPayeeId));
               if (l) await dbService.saveLoan({ ...l, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
             } else if (payeeType === 'Kissan') {
               const kId = String(selectedPayeeId).split('::')[0];
               const k = kissans.find(x => String(x.id) === kId);
               if (k) await dbService.saveKissan({ ...k, categoryId: String(cancelCategoryId), folderId: String(cancelFolderId) });
             }
          }
        } catch (err) {
          console.error("Failed to update party permanent folder", err);
        }
      }

      try {
        if ((dbService as any).api?.saveDocument) {
           await (dbService as any).api.saveDocument(doc);
        } else {
           await dbService.saveDoc(doc);
        }
        console.log("Saved cancelled cheque to docs", doc);
      } catch (err) {
        console.error("Failed to save cancelled cheque wrapper", err);
      }
    }
    setIsCancelSetupOpen(false);
    setIsCancelPreviewOpen(true);
  };

  return (
    <div className="min-h-screen bg-brand-50">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-brand-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Link
            to={pendingId ? "/pending-cheques" : "/"}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-50 text-spiritual-maroon transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-black text-spiritual-maroon tracking-tight">
              Cheque Printing
            </h1>
            <p className="text-xs text-brand-500 font-medium">
              CTS-2010 · Pixel-accurate print alignment
            </p>
          </div>
        </div>

        {pendingId && (
          <Link
            to="/pending-cheques"
            className="bg-green-100 border border-green-200 text-green-700 px-4 py-2 font-bold rounded-lg hover:bg-green-200"
          >
             Return to Pending Cheques Queue
          </Link>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-brand-200 text-brand-600 hover:bg-brand-50 text-sm font-semibold transition-all"
          >
            <RotateCcw size={14} />
            Reset
          </button>
          <button
            onClick={openCancelSetup}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-sm font-semibold transition-all"
          >
            <XCircle size={16} />
            Print Cancel
          </button>
          <button
            onClick={() => setIsBackPreviewOpen(true)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl border border-spiritual-maroon text-spiritual-maroon bg-white font-bold shadow-sm hover:bg-spiritual-maroon hover:text-white transition-all text-sm"
          >
            <Printer size={16} />
            Print Back
          </button>
          <button
            onClick={handlePrintCheque}
            disabled={!isReady}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-spiritual-maroon text-white font-bold shadow-md hover:shadow-lg hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none text-sm"
          >
            <Printer size={16} />
            Print Cheque
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">

        {/* ── Two-column layout ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-8 items-start">

          {/* ── Left: Form ── */}
          <div className="bg-white rounded-2xl shadow-sm border border-brand-100 overflow-hidden">
            {/* Form Header */}
            <div className="px-6 py-4 bg-spiritual-maroon text-white">
              <h2 className="font-bold text-base tracking-tight">Cheque Details</h2>
              <p className="text-xs text-red-200 mt-0.5">Fill all fields before printing</p>
            </div>

            <div className="p-6 space-y-5">
              {/* Pending Cheques Selection */}
              {pendingCheques.length > 0 && (
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 mb-4">
                  <label className="block text-[10px] font-bold text-orange-600 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Clock size={12} /> Pending Cheques (Remind me later)
                  </label>
                  <div className="space-y-2">
                    {pendingCheques.slice(0, 5).map(pending => (
                      <button
                        key={pending.id}
                        onClick={() => {
                          setCheque({
                            ...cheque,
                            payee: pending.payeeName,
                            amount: pending.amount,
                            date: pending.date
                          });
                          if (pending.partyType && pending.partyId) {
                            setPayeeType(pending.partyType as any);
                            setSelectedPayeeId(pending.partyId);
                          } else {
                            // Fallback: Try to find party by name if partyType is missing (for older browser storage)
                            let found = false;
                            
                            // Check Kissan Owners
                            for (const k of kissans) {
                              const o = k.owners?.find(ox => ox.name.toLowerCase() === pending.payeeName.toLowerCase());
                              if (o) {
                                setPayeeType('Kissan');
                                setSelectedPayeeId(`${k.id}::${o.id}`);
                                found = true;
                                break;
                              }
                            }
                            
                            if (!found) {
                                const c = clients.find(x => x.name.toLowerCase() === pending.payeeName.toLowerCase());
                                if (c) {
                                    setPayeeType('Client');
                                    setSelectedPayeeId(c.id);
                                    found = true;
                                }
                            }
                            
                            if (!found) {
                                const i = investors.find(x => x.name.toLowerCase() === pending.payeeName.toLowerCase());
                                if (i) {
                                    setPayeeType('Investor');
                                    setSelectedPayeeId(i.id);
                                    found = true;
                                }
                            }

                            if (!found) setPayeeType('Manual');
                          }
                          setPendingId(pending.id);
                          setAssociatedTransactionId((pending as any).transactionId || null);
                          setRecordInLedger(true);
                        }}
                        className="w-full text-left bg-white border border-orange-200 hover:border-orange-400 p-2 rounded-lg transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-700 group-hover:text-orange-700">{pending.payeeName}</span>
                          <span className="text-[10px] font-bold text-orange-600">₹{pending.amount.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 mt-0.5">{pending.date}</div>
                      </button>
                    ))}
                    {pendingCheques.length > 5 && (
                      <Link to="/pending-cheques" className="block text-center text-[10px] font-bold text-orange-500 hover:text-orange-700 mt-1">
                        View All {pendingCheques.length} Pending
                      </Link>
                    )}
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-2">
                  Cheque Number / ID (For Ledger)
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <CheckSquare size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Enter Cheque No."
                      value={chequeNumber}
                      onChange={(e) => setChequeNumber(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-50 border border-brand-100 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all font-bold text-brand-900 text-sm"
                    />
                  </div>
                  {associatedTransactionId ? (
                    <button
                      type="button"
                      onClick={handleUpdateTransaction}
                      className="px-4 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors whitespace-nowrap shadow-sm border border-emerald-700/20"
                    >
                      Update
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddToLedger}
                      disabled={!isReady || payeeType === 'Manual'}
                      className="px-4 bg-brand-600 text-white rounded-xl text-xs font-bold hover:bg-brand-700 transition-colors whitespace-nowrap shadow-sm border border-brand-700/20 disabled:opacity-50"
                    >
                      Add to Ledger
                    </button>
                  )}
                </div>
                <p className="text-[9px] text-brand-400 mt-1 font-medium italic">* This ID used for transaction history entry</p>
              </div>

              {/* Date */}
              <div>
                <label className="block text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-2">
                  Date
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                  <input
                    type="date"
                    value={cheque.date}
                    onChange={(e) => setCheque({ ...cheque, date: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 border border-brand-100 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all font-semibold text-brand-900 text-sm"
                  />
                </div>
              </div>

              {/* Payee */}
              <div>
                <label className="block text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-2">
                  Pay To
                </label>
                <div className="flex flex-col gap-2">
                  <select
                    value={payeeType}
                    onChange={(e) => {
                      const newType = e.target.value as any;
                      setPayeeType(newType);
                      setSelectedPayeeId('');
                      if (newType === 'Manual') {
                        setCheque({ ...cheque, payee: '' });
                        setRecordInLedger(false);
                      } else {
                        setRecordInLedger(true);
                      }
                    }}
                    className="w-full px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800"
                  >
                    <option value="Manual">Manual Entry</option>
                    <option value="Client">Client</option>
                    <option value="Kissan">Kissan (with Owners)</option>
                    <option value="Investor">Investor</option>
                    <option value="Loan Borrower">Loan Borrower</option>
                  </select>

                  {payeeType !== 'Manual' && (
                    <select
                      value={selectedPayeeId}
                      onChange={(e) => setSelectedPayeeId(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-brand-100 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800"
                    >
                      <option value="">-- Select {payeeType} --</option>
                      {payeeType === 'Client' && clients.map(c => (
                        <option value={c.id} key={c.id}>{c.name}</option>
                      ))}
                      {payeeType === 'Investor' && investors.map(i => (
                        <option value={i.id} key={i.id}>{i.name}</option>
                      ))}
                      {payeeType === 'Loan Borrower' && loans.map(l => (
                        <option value={l.id} key={l.id}>{l.borrowerName}</option>
                      ))}
                      {payeeType === 'Kissan' && kissans.flatMap(k => {
                        const options = [];
                        if (k.owners && k.owners.length > 0) {
                          k.owners.forEach(o => {
                            options.push(<option value={`${k.id}::${o.id}`} key={`${k.id}::${o.id}`}>{k.landName} - {o.name}</option>);
                          });
                        } else {
                          options.push(<option value={`${k.id}::`} key={k.id}>{k.landName}</option>);
                        }
                        return options;
                      })}
                    </select>
                  )}

                  <div className="relative mt-1">
                    <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Payee / Party Name"
                      value={cheque.payee}
                      onChange={(e) => setCheque({ ...cheque, payee: e.target.value })}
                      disabled={payeeType !== 'Manual'}
                      className="w-full pl-10 pr-4 py-2.5 bg-brand-50 border border-brand-100 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all font-semibold text-brand-900 text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-[11px] font-bold text-brand-600 uppercase tracking-widest mb-2">
                  Amount (₹)
                </label>
                <div className="relative">
                  <IndianRupee size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none" />
                  <input
                    type="number"
                    placeholder="0.00"
                    value={cheque.amount || ''}
                    onChange={(e) =>
                      setCheque({ ...cheque, amount: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-brand-50 border border-brand-100 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none transition-all font-bold text-brand-900 text-lg"
                  />
                </div>

                {/* Amount in words preview */}
                {amountInWords && (
                  <div className="mt-2.5 px-3 py-2.5 bg-amber-50 border border-amber-100 rounded-lg">
                    <p className="text-[11px] text-amber-700 font-semibold italic leading-relaxed">
                      {formatAmountWords(amountInWords)}
                    </p>
                  </div>
                )}
              </div>

              {/* Select Bank */}
              <div>
                <label className="block text-xs font-bold text-brand-600 mb-1.5 uppercase tracking-wider">
                  Select Bank
                </label>
                <div className="relative">
                  <select
                    value={selectedBankId}
                    onChange={(e) => setSelectedBankId(e.target.value)}
                    className="w-full px-3 py-2.5 bg-brand-50 border border-brand-100 rounded-xl focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800 appearance-none"
                  >
                    <option value="">-- Select Bank --</option>
                    {banks.map(b => (
                      <option key={b.id} value={b.id}>{b.bankName} - {b.accountNumber} ({b.accountHolderName})</option>
                    ))}
                  </select>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-400 pointer-events-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-brand-50 pt-4 space-y-3">
                <p className="text-[11px] font-bold text-brand-500 uppercase tracking-widest mb-3">
                  Cheque Options
                </p>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                      cheque.isAccountPayee
                        ? 'bg-spiritual-maroon border-spiritual-maroon'
                        : 'border-brand-300 bg-white'
                    }`}
                    onClick={() =>
                      setCheque({ ...cheque, isAccountPayee: !cheque.isAccountPayee })
                    }
                  >
                    {cheque.isAccountPayee && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-brand-700 group-hover:text-spiritual-maroon transition-colors">
                    A/c Payee Only
                  </span>
                  <span className="ml-auto text-[10px] text-brand-400 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
                    Recommended
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                      cheque.strikeBearer
                        ? 'bg-spiritual-maroon border-spiritual-maroon'
                        : 'border-brand-300 bg-white'
                    }`}
                    onClick={() =>
                      setCheque({ ...cheque, strikeBearer: !cheque.strikeBearer })
                    }
                  >
                    {cheque.strikeBearer && (
                      <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm font-semibold text-brand-700 group-hover:text-spiritual-maroon transition-colors">
                    Strike "Or Bearer"
                  </span>
                </label>

                {payeeType !== 'Manual' && (
                  <label className="flex items-center gap-3 cursor-pointer group mt-2 pt-2 border-t border-brand-50">
                    <div
                      className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-all ${
                        recordInLedger
                          ? 'bg-emerald-600 border-emerald-600'
                          : 'border-brand-300 bg-white'
                      }`}
                      onClick={() => setRecordInLedger(!recordInLedger)}
                    >
                      {recordInLedger && (
                        <svg viewBox="0 0 12 12" className="w-3 h-3 text-white fill-current">
                          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
                        </svg>
                      )}
                    </div>
                    <span className="text-sm font-bold text-emerald-700">
                      Record in Ledger
                    </span>
                    <span className="ml-auto text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium">
                      Auto-Save
                    </span>
                  </label>
                )}
              </div>
              
              {/* Back of Cheque Options */}
              <div className="border-t border-brand-50 pt-4 space-y-4">
                <p className="text-[11px] font-bold text-brand-500 uppercase tracking-widest mb-1 flex items-center gap-2">
                  <Printer size={12} />
                  Back of Cheque Settings
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-brand-600 mb-1.5 flex items-center gap-1.5">
                      <User size={12} />
                      Beneficiary Account (For Back Print)
                    </label>
                    <div className="flex flex-col gap-2">
                      <input
                        type="text"
                        placeholder="Account Number"
                        value={beneficiaryAccount.accountNumber}
                        onChange={(e) => setBeneficiaryAccount(prev => ({ ...prev, accountNumber: e.target.value }))}
                        className="w-full px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800 disabled:opacity-70 disabled:cursor-not-allowed"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          placeholder="Bank Name"
                          value={beneficiaryAccount.bankName}
                          onChange={(e) => setBeneficiaryAccount(prev => ({ ...prev, bankName: e.target.value }))}
                          className="w-full px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800 disabled:opacity-70 disabled:cursor-not-allowed"
                        />
                        <input
                          type="text"
                          placeholder="IFSC Code"
                          value={beneficiaryAccount.ifscCode}
                          onChange={(e) => setBeneficiaryAccount(prev => ({ ...prev, ifscCode: e.target.value }))}
                          className="w-full px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800 disabled:opacity-70 disabled:cursor-not-allowed uppercase"
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-brand-600 mb-1.5 flex items-center gap-1.5">
                      <MapPin size={12} />
                      Office Address
                    </label>
                    <select
                      value={selectedAddressId}
                      onChange={e => setSelectedAddressId(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800"
                    >
                      <option value="">-- No Address --</option>
                      {officeAddresses.map(addr => (
                        <option value={addr.id} key={addr.id}>{addr.name} {addr.addressLine ? `- ${addr.addressLine}, ${addr.locality}, ${addr.district}` : ''}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-brand-600 mb-1.5 flex items-center gap-1.5">
                      <Phone size={12} />
                      Manager Phone
                    </label>
                    <select
                      value={selectedManagerId}
                      onChange={e => setSelectedManagerId(e.target.value)}
                      className="w-full px-3 py-2 bg-brand-50 border border-brand-100 rounded-lg focus:ring-2 focus:ring-spiritual-maroon outline-none text-sm font-semibold text-brand-800"
                    >
                      <option value="">-- No Manager --</option>
                      {managers.map(mgr => (
                        <option value={mgr.id} key={mgr.id}>{mgr.name} - {mgr.phone}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Ready indicator */}
              <div
                className={`mt-2 rounded-xl px-4 py-3 text-xs font-semibold flex items-center gap-2 transition-all ${
                  isReady
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-brand-50 text-brand-400 border border-brand-100'
                }`}
              >
                <CheckSquare size={14} />
                {isReady
                  ? 'Cheque is ready to print'
                  : 'Enter payee name and amount to continue'}
              </div>
            </div>
          </div>

          {/* ── Right: Cheque Preview ── */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-brand-600 uppercase tracking-widest">
                Live Preview
              </h3>
              <span className="text-xs text-brand-400 font-medium">
                203mm × 95mm · CTS-2010 standard
              </span>
            </div>

            {/* Cheque wrapper with subtle shadow/depth */}
            <div className="relative">
              {/* Depth layers */}
              <div className="absolute inset-0 translate-y-2 translate-x-1 bg-gray-200 rounded-sm opacity-50" />
              <div className="absolute inset-0 translate-y-1 bg-gray-100 rounded-sm opacity-70" />

              <div className="relative" style={{ containerType: 'inline-size' }}>
                <ChequePreview cheque={cheque} amountInWords={amountInWords} />
              </div>
            </div>

            {/* Print alignment note */}
            <p className="text-[11px] text-brand-400 font-medium text-right leading-relaxed">
              ✓ Print with zero margins · Landscape · Custom page size 203 × 95 mm
            </p>
          </div>
        </div>
      </div>

      {isCancelSetupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
              <h3 className="font-bold text-red-700 flex items-center gap-2">
                <XCircle size={18} />
                Print Cancelled Cheque
              </h3>
              <button onClick={() => setIsCancelSetupOpen(false)} className="text-red-400 hover:text-red-600">
                <XCircle size={20} />
              </button>
            </div>
            {cancelStep === 1 && (
              <div className="p-6 space-y-4">
                <p className="text-sm text-gray-600 font-medium pb-2 border-b border-gray-100">
                  Search recorded transaction or enter manually
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lookup Party</label>
                    <select 
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200 text-sm font-semibold"
                      value={cancelPartyType}
                      onChange={(e) => {
                        setCancelPartyType(e.target.value as any);
                        setSelectedTxId('');
                      }}
                    >
                      <option value="NONE">-- Manual Entry --</option>
                      <option value="CLIENT">Client</option>
                      <option value="KISSAN">Kissan</option>
                      <option value="INVESTOR">Investor</option>
                      <option value="LOAN">Loan Borrower</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Lookup Cheque</label>
                    <select 
                      disabled={cancelPartyType === 'NONE'}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200 text-sm font-semibold disabled:bg-gray-50 disabled:text-gray-400"
                      value={selectedTxId}
                      onChange={(e) => setSelectedTxId(e.target.value)}
                    >
                      <option value="">-- Select Record --</option>
                      {transactions
                        .filter(t => {
                          if (cancelPartyType === 'CLIENT') return !!t.clientId;
                          if (cancelPartyType === 'KISSAN') return !!t.kissanId;
                          if (cancelPartyType === 'INVESTOR') return !!t.investorId;
                          if (cancelPartyType === 'LOAN') return !!t.loanId;
                          return false;
                        })
                        .map(t => (
                          <option key={t.id} value={t.id}>
                            No: {t.referenceId || 'N/A'} ({t.partyName})
                          </option>
                        ))
                      }
                    </select>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Cheque Number</label>
                    <input 
                      type="text" 
                      readOnly={!!selectedTxId}
                      className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200 text-sm font-semibold ${!!selectedTxId ? 'opacity-70 cursor-not-allowed select-none bg-gray-100' : ''}`}
                      value={cancelChequeNo} 
                      onChange={e => setCancelChequeNo(e.target.value)} 
                      placeholder="e.g. 001234" 
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                      <input 
                        type="date" 
                        readOnly={!!selectedTxId}
                        className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200 text-sm font-semibold ${!!selectedTxId ? 'opacity-70 cursor-not-allowed select-none bg-gray-100' : ''}`}
                        value={cancelDate} 
                        onChange={e => setCancelDate(e.target.value)} 
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Amount</label>
                      <input 
                        type="number" 
                        readOnly={!!selectedTxId}
                        className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200 text-sm font-semibold ${!!selectedTxId ? 'opacity-70 cursor-not-allowed select-none bg-gray-100' : ''}`}
                        value={cancelAmount} 
                        onChange={e => setCancelAmount(e.target.value)} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Payee Name</label>
                    <input 
                      type="text" 
                      readOnly={!!selectedTxId}
                      className={`w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-red-200 text-sm font-semibold ${!!selectedTxId ? 'opacity-70 cursor-not-allowed select-none bg-gray-100' : ''}`}
                      value={cancelPayee} 
                      onChange={e => setCancelPayee(e.target.value)} 
                    />
                  </div>
                </div>
              </div>
            )}

            {cancelStep === 2 && (
              <div className="p-6 space-y-5">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
                   <div className="flex items-center gap-3">
                     <div 
                        className={`w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all cursor-pointer ${
                          syncWithPartyFolder ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-200'
                        }`}
                        onClick={() => setSyncWithPartyFolder(!syncWithPartyFolder)}
                      >
                        {syncWithPartyFolder && <CheckSquare size={14} className="text-white" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-blue-900">Update this change</p>
                        <p className="text-[10px] text-blue-600 font-medium">Keep party folder in sync with this selection</p>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Selecting categories and folders for saving cancelled checks
                    </p>
                    {cancelCategoryId && (
                      <span className="px-2 py-0.5 bg-green-100 text-[9px] text-green-700 font-bold rounded-full border border-green-200 animate-pulse">
                        Auto-Fetched
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                      <CategoryIcon size={14} className="text-gray-400" />
                      Category
                    </label>
                    <select 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-200 text-sm font-bold text-gray-800 transition-all"
                      value={cancelCategoryId}
                      onChange={(e) => setCancelCategoryId(e.target.value)}
                    >
                      <option value="">-- Do not save --</option>
                      {categories.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                    </select>
                  </div>

                  {cancelCategoryId && (
                    <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                      <label className="block text-xs font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                        <FolderIcon size={14} className="text-gray-400" />
                        Folder
                      </label>
                      <select
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-200 text-sm font-bold text-gray-800 transition-all"
                        value={cancelFolderId}
                        onChange={(e) => setCancelFolderId(e.target.value)}
                      >
                        <option value="">-- Select Folder --</option>
                        {folders.filter(f => f.category_id == cancelCategoryId || f.parentId == cancelCategoryId).map(f => (
                          <option value={f.id} key={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
              {cancelStep === 1 && (
                <>
                  <button 
                    onClick={() => setIsCancelSetupOpen(false)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setCancelStep(2)}
                    className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg shadow hover:bg-red-700 transition-colors"
                  >
                    Next
                  </button>
                </>
              )}
              {cancelStep === 2 && (
                <>
                  <button 
                    onClick={() => setCancelStep(1)}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleCancelSetupSubmit}
                    className="px-6 py-2 bg-red-600 text-white text-sm font-bold rounded-lg shadow hover:bg-red-700 transition-colors"
                  >
                    Save & Continue to Print
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Print Preview Modal ── */}
      {isPreviewOpen && (
        <PrintPreview
          title="Print Bank Cheque"
          onClose={() => setIsPreviewOpen(false)}
          centerContent={true}
          defaultSettings={{
           pageSize: 'A4',
           orientation: 'portrait',
           margins: 'custom',
           marginTop: 0,
           marginRight: 0,
           marginBottom: 0,
           marginLeft: 0,
         }}
        >
          <PrintableCheque cheque={cheque} amountInWords={amountInWords} />
        </PrintPreview>
      )}

      {/* ── Print Back Preview Modal ── */}
      {isBackPreviewOpen && (
        <PrintPreview
          title="Print Back of Cheque"
          onClose={() => setIsBackPreviewOpen(false)}
          centerContent={true}
          defaultSettings={{
            pageSize: 'A4',
            orientation: 'portrait',
            margins: 'custom',
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
          }}
        >
          <PrintableChequeBack
            address={officeAddresses.find(a => a.id === selectedAddressId)}
            manager={managers.find(m => m.id === selectedManagerId)}
            beneficiaryAccount={beneficiaryAccount}
            payeeName={cheque.payee}
          />
        </PrintPreview>
      )}

      {/* ── Print Cancel Preview Modal ── */}
      {isCancelPreviewOpen && (
        <PrintPreview
          title="Print Cancelled Cheque"
          onClose={() => setIsCancelPreviewOpen(false)}
          centerContent={true}
          defaultSettings={{
            pageSize: 'A4',
            orientation: 'portrait',
            margins: 'custom',
            marginTop: 0,
            marginRight: 0,
            marginBottom: 0,
            marginLeft: 0,
          }}
        >
          <PrintableCancelledCheque />
        </PrintPreview>
      )}
    </div>
  );
};
