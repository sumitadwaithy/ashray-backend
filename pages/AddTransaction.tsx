
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Upload, MessageCircle, Smartphone, CheckCircle, Loader2, Wifi, WifiOff, ExternalLink, Send, Receipt, FileText, Briefcase, User, CreditCard, Tractor, Landmark, Plus, X, Trash2, RefreshCw, Printer, Clock } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { PaymentMethod, TransactionType, Client, AppSettings, Transaction, Investor, TransactionCategory, Kissan, Loan, BankProfile, Staff, LoanType } from '../types';
import { dbService } from '../services/db';
import { ReceiptTemplate, ReceiptPrintView } from '../components/Receipt';
import { useLanguage } from '../services/i18n';
import { Accounting } from '../services/accounting';
import { format } from 'date-fns';

export const AddTransaction: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [investors, setInvestors] = useState<Investor[]>([]);
  const [farmers, setFarmers] = useState<Kissan[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [banks, setBanks] = useState<BankProfile[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [originalTx, setOriginalTx] = useState<Transaction | null>(null);
  const [currentTx, setCurrentTx] = useState<Transaction | null>(null);
  const [lastTxId, setLastTxId] = useState<string | null>(null);
  const [generatedMessage, setGeneratedMessage] = useState('');
  const [remainingBalance, setRemainingBalance] = useState<number | null>(null);
  const [nextEmiInfo, setNextEmiInfo] = useState<{ number: number; amount: number } | null>(null);
  
  const [partyType, setPartyType] = useState<'CLIENT' | 'INVESTOR' | 'EXPENSE' | 'KISSAN' | 'LOAN' | 'BANK'>('CLIENT');
  const [borrowerType, setBorrowerType] = useState<'LOAN' | 'CLIENT' | 'KISSAN' | 'INVESTOR'>('LOAN');
  const [selectedBorrowerId, setSelectedBorrowerId] = useState('');
  const [selectedBorrowerPhone, setSelectedBorrowerPhone] = useState('');

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    dueDate: '',
    amount: '',
    type: TransactionType.DEBIT,
    category: TransactionCategory.GENERAL,
    particulars: '',
    method: PaymentMethod.BANK_TRANSFER,
    referenceId: '', // Added Reference ID
    purpose: '',
    clientId: '',
    investorId: '',
    kissanId: '',
    ownerId: '',
    loanId: '',
    propertyId: '',
    expenseCategory: '',
    expensePayee: '',
    staffId: '',
    bankId: '',
    toBankId: '',
    tags: [] as string[],
    agriType: '',
    partNumber: '',
    manualPart: '',
    isSplit: false,
    splitPayments: [
      { amount: '', method: PaymentMethod.CASH, referenceId: '', bankId: '' }
    ]
  });

  useEffect(() => {
    if (location.state) {
      const state = location.state as any;
      if (state.editMode && state.transaction) {
        const tx = state.transaction as Transaction;
        setIsEditMode(true);
        setOriginalTx(tx);
        
        // Infer party type if not present
        let pt = (tx.partyType as any) || '';
        
        if (!pt) {
          if (tx.kissanId || (tx as any).farmerId || tx.agriType) pt = 'KISSAN';
          else if (tx.staffId || tx.expenseCategory === 'Salary') pt = 'EXPENSE';
          else if (tx.loanId) pt = 'LOAN';
          else if (tx.investorId) pt = 'INVESTOR';
          else if (tx.category === TransactionCategory.TRANSFER || tx.toBankId) pt = 'BANK';
          else if (tx.expenseCategory) pt = 'EXPENSE';
          else pt = 'CLIENT';
        }
        setPartyType(pt);

        // Infer borrower type for loans
        if (pt === 'LOAN') {
          if (tx.clientId) setBorrowerType('CLIENT');
          else if (tx.kissanId || (tx as any).farmerId) setBorrowerType('KISSAN');
          else if (tx.investorId) setBorrowerType('INVESTOR');
          else setBorrowerType('LOAN');
        }

        setFormData({
          date: tx.date || new Date().toISOString().split('T')[0],
          dueDate: (tx as any).dueDate || '',
          amount: tx.amount.toString(),
          type: tx.type,
          category: tx.category || TransactionCategory.GENERAL,
          particulars: tx.particulars || '',
          method: tx.method,
          referenceId: tx.referenceId || '',
          purpose: tx.purpose || '',
          clientId: tx.clientId || '',
          investorId: tx.investorId || '',
          kissanId: tx.kissanId || (tx as any).farmerId || '',
          ownerId: tx.ownerId || '',
          loanId: tx.loanId || '',
          propertyId: tx.propertyId || '',
          expenseCategory: tx.expenseCategory || '',
          expensePayee: tx.expensePayee || '',
          staffId: tx.staffId || '',
          bankId: tx.bankId || '',
          toBankId: tx.toBankId || '',
          tags: tx.tags || [],
          agriType: tx.agriType || (tx.partyType === 'KISSAN' ? tx.purpose : '') || '',
          partNumber: tx.partNumber || '',
          manualPart: tx.manualPart || '',
          isSplit: tx.isSplit || false,
          splitPayments: tx.splitPayments || [
            { amount: '', method: PaymentMethod.CASH, referenceId: '', bankId: '' }
          ]
        });
      } else if (state.loanId) {
        setPartyType('LOAN');
        setFormData(prev => ({
          ...prev,
          loanId: state.loanId,
          amount: state.amount?.toString() || prev.amount,
          particulars: state.particulars || `Loan Repayment - ${state.borrowerName || ''}`
        }));
      } else if (state.partyType === 'EXPENSE') {
        setPartyType('EXPENSE');
        if (state.expenseCategory === 'Salary') {
          setFormData(prev => ({
            ...prev,
            expenseCategory: 'Salary',
            staffId: state.staffId || '',
            expensePayee: state.expensePayee || '',
            amount: state.amount || ''
          }));
        }
      }
    }
  }, [location.state]);

  useEffect(() => {
    const init = async () => {
      const [c, i, k, l, b, s, st] = await Promise.all([
        dbService.getClients(),
        dbService.getInvestors(),
        dbService.getKissans(),
        dbService.getLoans(),
        dbService.getBanks(),
        dbService.getSettings(),
        dbService.getStaff()
      ]);
      setClients(c);
      setInvestors(i);
      setFarmers(k);
      setLoans(l);
      setBanks(b);
      setSettings(s);
      setStaff(st);
    };
    init();
  }, []);

  useEffect(() => {
    if (location.state?.loanId && loans.length > 0) {
      const loan = loans.find(l => l.id === location.state.loanId);
      if (loan) {
        setSelectedBorrowerPhone(loan.phone);
        if (location.state.amount) {
           setFormData(prev => ({ ...prev, loanId: loan.id, amount: location.state.amount.toString() }));
        } else {
           setFormData(prev => ({ ...prev, loanId: loan.id }));
        }
      }
    }
  }, [loans, location.state]);

  useEffect(() => {
    // Skip resetting if we are in edit mode and just initializing
    if (isEditMode) return;

    if (partyType === 'CLIENT') {
      setFormData(prev => ({ ...prev, category: TransactionCategory.GENERAL, kissanId: '', investorId: '', ownerId: '', agriType: '', partNumber: '', manualPart: '' }));
    } else if (partyType === 'INVESTOR') {
      setFormData(prev => ({ ...prev, category: TransactionCategory.CAPITAL_INJECTION, type: TransactionType.CREDIT, clientId: '', kissanId: '', ownerId: '', agriType: '', partNumber: '', manualPart: '' }));
    } else if (partyType === 'EXPENSE') {
      setFormData(prev => ({ ...prev, category: TransactionCategory.EXPENSE, type: TransactionType.DEBIT, clientId: '', investorId: '', kissanId: '', ownerId: '', agriType: '', partNumber: '', manualPart: '' }));
    } else if (partyType === 'KISSAN') {
      setFormData(prev => ({ ...prev, category: TransactionCategory.KISSAN_PAYMENT, type: TransactionType.DEBIT, clientId: '', investorId: '', loanId: '', agriType: '', partNumber: '', manualPart: '' }));
    } else if (partyType === 'LOAN') {
      const loan = loans.find(l => l.id === formData.loanId);
      const isLoanTaken = loan?.loanType === LoanType.TAKEN;
      setFormData(prev => ({ 
        ...prev, 
        category: TransactionCategory.LOAN, 
        type: isLoanTaken ? TransactionType.DEBIT : TransactionType.CREDIT, 
        clientId: '', 
        investorId: '', 
        kissanId: '', 
        ownerId: '', 
        agriType: '', 
        partNumber: '', 
        manualPart: '' 
      }));
    } else if (partyType === 'BANK') {
      setFormData(prev => ({ ...prev, category: TransactionCategory.TRANSFER, type: TransactionType.DEBIT, clientId: '', investorId: '', kissanId: '', ownerId: '', agriType: '', partNumber: '', manualPart: '', loanId: '' }));
    }
  }, [partyType, formData.loanId, loans, isEditMode]);

  useEffect(() => {
    const calculateBalance = async () => {
      if (partyType === 'KISSAN' && formData.kissanId && formData.ownerId) {
        const kissan = farmers.find(f => f.id === formData.kissanId);
        const owner = kissan?.owners.find(o => o.id === formData.ownerId);
        if (kissan && owner) {
          const transactions = await dbService.getTransactions();
          const kissanParts = transactions
  .filter(t =>
    t.kissanId === formData.kissanId &&
    t.ownerId === formData.ownerId   // ✅ OWNER LEVEL FIX
  )
  .map(t => t.particulars || '')
  .filter(p => p.includes('Part Payment'))
  .map(p => {
    const match = p.match(/Part (\d+)/);
    return match ? Number(match[1]) : null;
  })
  .filter((n): n is number => n !== null);

// ✅ STORE GLOBALLY FOR DROPDOWN
(window as any).__kissanParts = kissanParts;
const nextPart =
  kissanParts.length > 0
    ? Math.max(...kissanParts) + 1
    : 1;

if (formData.agriType === 'Part Payment') {
  setFormData(prev => ({
    ...prev,
    partNumber: `Part ${nextPart}`
  }));
}
          const ownerShareValue = (kissan.totalLandValue * owner.sharePercentage) / 100;
          const totalPaid = transactions
            .filter(t => t.kissanId === formData.kissanId && t.ownerId === formData.ownerId && t.type === TransactionType.DEBIT)
            .reduce((acc, t) => acc + t.amount, 0);
          setRemainingBalance(ownerShareValue - totalPaid);
        } else {
          setRemainingBalance(null);
        }
      } else if (partyType === 'LOAN' && formData.loanId) {
        const loan = loans.find(l => l.id === formData.loanId);
        if (loan) {
          setRemainingBalance(loan.remainingPrincipal);
          
          // Calculate EMI
          const P = loan.principalAmount;
          const R = loan.interestRate;
          const N = loan.durationMonths;
          
          let emiAmount = 0;
          if (loan.interestType === 'SIMPLE') {
            const totalInterest = (P * R * N) / (12 * 100);
            emiAmount = Math.round((P + totalInterest) / N);
          } else {
            // Compound Interest EMI formula
            const r = R / (12 * 100);
            emiAmount = Math.round((P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1));
          }

          // Fetch transactions to count EMIs
          const allTransactions = await dbService.getTransactions();
          const isLoanTaken = loan.loanType === LoanType.TAKEN;
          const repaymentType = isLoanTaken ? TransactionType.DEBIT : TransactionType.CREDIT;
          const loanRepayments = allTransactions.filter(t => t.loanId === loan.id && t.type === repaymentType);
          const nextEmiNumber = loanRepayments.length + 1;
          
          setNextEmiInfo({ number: nextEmiNumber, amount: emiAmount });
          
          // Auto-fill amount and particulars only if type matches repayment type
          if (formData.type === repaymentType) {
            setFormData(prev => ({
              ...prev,
              amount: emiAmount.toString(),
              particulars: `EMI #${nextEmiNumber} Repayment - ${loan.borrowerName}`
            }));
          }
        } else {
          setRemainingBalance(null);
          setNextEmiInfo(null);
        }
        
      } else if (partyType === 'CLIENT' && formData.clientId) {
  const client = clients.find(c => c.id === formData.clientId);

  if (client) {
    const transactions = await dbService.getTransactions();

    const clientTx = transactions.filter(t => t.clientId === client.id);

    // ✅ TOTAL PAID
    const totalPaid = clientTx
      .filter(t => t.type === TransactionType.CREDIT)
      .reduce((sum, t) => sum + t.amount, 0);

    const contractValue = client.totalContractValue || 0;
    const remaining = contractValue - totalPaid;

    setRemainingBalance(remaining);

    // 🔥 NEW LOGIC: AUTO NEXT PART
    const paidParts = clientTx
  .map(t => t.particulars || '')
  .filter(p => p.includes('Part Payment'))
  .map(p => {
    const match = p.match(/Part (\d+)/);
    return match ? Number(match[1]) : null;
  })
  .filter((n): n is number => n !== null);

  // ✅ STORE AFTER CALCULATION
  (window as any).__clientTxCache = paidParts;

    const nextPart = paidParts.length > 0
      ? Math.max(...paidParts) + 1
      : 1;

    // ✅ AUTO SET NEXT PART
    if (formData.purpose === 'PART_PAYMENT') {
      setFormData(prev => ({
        ...prev,
        partNumber: `Part ${nextPart}`
      }));
    }

    // 🔥 FULL PAYMENT AUTO AMOUNT
    if (formData.purpose === 'FULL_PAYMENT') {
      setFormData(prev => ({
        ...prev,
        amount: remaining.toString(),
        particulars: `Full Payment - ${client.name}`
      }));
    }

  } else {
    setRemainingBalance(null);
  }

  setNextEmiInfo(null);
}

else {
  setRemainingBalance(null);
  setNextEmiInfo(null);
}
    };
    calculateBalance();
  }, [
    formData.kissanId,
    formData.ownerId,
    formData.loanId,
    formData.clientId,
    formData.purpose, 
    formData.type,
    partyType,
    farmers,
    loans,
    clients
  ]);

  const selectedKissan = farmers.find(f => f.id === formData.kissanId);

  const updateSplitPayment = (index: number, field: string, value: any) => {
    const newPayments = [...formData.splitPayments];
    newPayments[index] = { ...newPayments[index], [field]: value };
    
    // Calculate total amount
    const total = newPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    
    setFormData({ 
      ...formData, 
      splitPayments: newPayments,
      amount: total > 0 ? total.toString() : formData.amount
    });
  };

  const addSplitPayment = () => {
    setFormData({
      ...formData,
      splitPayments: [...formData.splitPayments, { amount: '', method: PaymentMethod.CASH, referenceId: '', bankId: '' }]
    });
  };

  const removeSplitPayment = (index: number) => {
    if (formData.splitPayments.length <= 1) return;
    const newPayments = formData.splitPayments.filter((_, i) => i !== index);
    const total = newPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    setFormData({ 
      ...formData, 
      splitPayments: newPayments,
      amount: total > 0 ? total.toString() : formData.amount
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // 🔥 REVERSE PREVIOUS IMPACT IF EDITING
    if (isEditMode && originalTx) {
      try {
        if (originalTx.partyType === 'CLIENT' && originalTx.clientId) {
          const client = clients.find(c => c.id === originalTx.clientId);
          if (client) {
            const isCredit = originalTx.type === TransactionType.CREDIT;
            const reversedBalance = (client.balance || 0) + (isCredit ? originalTx.amount : -originalTx.amount);
            await dbService.saveClient({ ...client, balance: reversedBalance });
            // Update local state temporarily so subsequent logic uses updated balance
            setClients(prev => prev.map(c => c.id === client.id ? { ...c, balance: reversedBalance } : c));
          }
        } else if (originalTx.partyType === 'KISSAN' && originalTx.kissanId) {
          const kissan = farmers.find(k => k.id === originalTx.kissanId);
          if (kissan) {
            const isDebit = originalTx.type === TransactionType.DEBIT;
            const reversedBalance = (kissan.balance || 0) + (isDebit ? originalTx.amount : -originalTx.amount);
            await dbService.saveKissan({ ...kissan, balance: reversedBalance });
            setFarmers(prev => prev.map(k => k.id === kissan.id ? { ...k, balance: reversedBalance } : k));
          }
        } else if (originalTx.partyType === 'INVESTOR' && originalTx.investorId) {
          const investor = investors.find(i => i.id === originalTx.investorId);
          if (investor) {
            const isCredit = originalTx.type === TransactionType.CREDIT;
            const reversedBalance = (investor.currentBalance || 0) - (isCredit ? originalTx.amount : -originalTx.amount);
            await dbService.saveInvestor({ ...investor, currentBalance: reversedBalance });
            setInvestors(prev => prev.map(i => i.id === investor.id ? { ...i, currentBalance: reversedBalance } : i));
          }
        } else if (originalTx.partyType === 'LOAN' && originalTx.loanId) {
          const loan = loans.find(l => l.id === originalTx.loanId);
          if (loan) {
             const isLoanTaken = loan.loanType === LoanType.TAKEN;
             const repaymentType = isLoanTaken ? TransactionType.DEBIT : TransactionType.CREDIT;
             const isRepay = originalTx.type === repaymentType;
             const reversedRemaining = (loan.remainingPrincipal || 0) + (isRepay ? originalTx.amount : -originalTx.amount);
             await dbService.saveLoan({ ...loan, remainingPrincipal: reversedRemaining });
             setLoans(prev => prev.map(l => l.id === loan.id ? { ...l, remainingPrincipal: reversedRemaining } : l));
          }
        }
        
        // Reverse Salary if applicable
        if (originalTx.partyType === 'EXPENSE' && originalTx.expenseCategory === 'Salary' && originalTx.staffId) {
          const staffMember = staff.find(s => s.id === originalTx.staffId);
          if (staffMember) {
            const reversedSalaryPaid = (staffMember.totalSalaryPaid || 0) - originalTx.amount;
            const updatedStaff: Staff = {
              ...staffMember,
              totalSalaryPaid: reversedSalaryPaid
            };
            await dbService.saveStaff(updatedStaff);
            setStaff(prev => prev.map(s => s.id === staffMember.id ? updatedStaff : s));
          }
        }
      } catch (err) {
        console.error("Critical failure during balance reversal:", err);
      }
    }
    
    const getLedgerParticulars = () => {
  if (partyType === 'CLIENT') {
    const client = clients.find(c => c.id === formData.clientId);

    if (formData.purpose === 'PART_PAYMENT') {
      const partLabel =
        formData.partNumber === 'Manual'
          ? formData.manualPart
          : formData.partNumber;

      return `From ${client?.name} – Part Payment (${partLabel})`;
    }

    if (formData.purpose === 'FULL_PAYMENT') {
      return `From ${client?.name} – Full Payment`;
    }

    if (formData.purpose === 'FINAL_PAYMENT') {
      return `From ${client?.name} – Final Payment`;
    }

    return `From ${client?.name}`;
  }

  if (partyType === 'KISSAN') {
    const kissan = farmers.find(f => f.id === formData.kissanId);
    const owner = kissan?.owners.find(o => o.id === formData.ownerId);

    return `To ${owner?.name} – ${kissan?.landName} (${formData.agriType})`;
  }

  if (partyType === 'INVESTOR') {
    const investor = investors.find(i => i.id === formData.investorId);
    return `By ${investor?.name} – Investment`;
  }

  if (partyType === 'LOAN') {
    const loan = loans.find(l => l.id === formData.loanId);
    const isLoanTaken = loan?.loanType === LoanType.TAKEN;
    return isLoanTaken 
      ? `To ${loan?.borrowerName} – Loan Repayment`
      : `By ${loan?.borrowerName} – EMI Repayment`;
  }

  if (partyType === 'EXPENSE') {
      if (formData.expenseCategory === 'Salary' && formData.staffId) {
        const s = staff.find(st => st.id === formData.staffId);
        return `Salary Paid to ${s?.name} – ${format(new Date(formData.date), 'MMMM yyyy')}`;
      }
      return `To ${formData.expensePayee} – ${formData.expenseCategory || 'Expense'}`;
  }

  if (formData.category === TransactionCategory.TRANSFER) {
    const fromBank = banks.find(b => b.id === formData.bankId);
    const toBank = banks.find(b => b.id === formData.toBankId);
    return `Bank Transfer: ${fromBank?.bankName} → ${toBank?.bankName}`;
  }

  return formData.particulars;
};

    let finalParticulars = getLedgerParticulars();
    const { isSplit, splitPayments, ...restFormData } = formData as any;
    let lastRefId = '';
    let lastTransactionId = '';
    const splitTransactionIds: string[] = [];

    // Helper functions for party names
    const getPartyName = (fd: any, pt: string) => {
      return pt === 'CLIENT'
        ? clients.find(c => c.id === fd.clientId)?.name
        : pt === 'KISSAN'
        ? farmers.find(f => f.id === fd.kissanId)?.owners.find(o => o.id === fd.ownerId)?.name
        : pt === 'INVESTOR'
        ? investors.find(i => i.id === fd.investorId)?.name
        : pt === 'LOAN'
        ? loans.find(l => l.id === fd.loanId)?.borrowerName
        : pt === 'EXPENSE'
        ? fd.expensePayee
        : pt === 'BANK'
        ? banks.find(b => b.id === fd.bankId)?.bankName
        : 'Expense';
    };

    const getPartyId = (fd: any, pt: string) => {
      return pt === 'CLIENT'
        ? fd.clientId
        : pt === 'KISSAN'
        ? fd.kissanId
        : pt === 'INVESTOR'
        ? fd.investorId
        : pt === 'LOAN'
        ? fd.loanId
        : pt === 'BANK'
        ? fd.bankId
        : pt === 'STAFF'
        ? fd.staffId
        : '';
    };

    const getLandName = (fd: any, pt: string) => {
      return pt === 'KISSAN' ? farmers.find(f => f.id === fd.kissanId)?.landName : '';
    };

    const getOwnerName = (fd: any, pt: string) => {
      return pt === 'KISSAN' ? farmers.find(f => f.id === fd.kissanId)?.owners.find(o => o.id === fd.ownerId)?.name : '';
    };

    const getInvestorName = (fd: any, pt: string) => {
      return pt === 'INVESTOR' ? investors.find(i => i.id === fd.investorId)?.name : '';
    };

    const getClientName = (fd: any, pt: string) => {
      return pt === 'CLIENT' ? clients.find(c => c.id === fd.clientId)?.name : '';
    };

    const getLoanName = (fd: any, pt: string) => {
      return pt === 'LOAN' ? loans.find(l => l.id === fd.loanId)?.borrowerName : '';
    };

    const getDisplayLabel = (fd: any, pt: string) => {
      return pt === 'KISSAN'
        ? `${farmers.find(f => f.id === fd.kissanId)?.landName} • ${farmers.find(f => f.id === fd.kissanId)?.owners.find(o => o.id === fd.ownerId)?.name}`
        : pt === 'CLIENT'
        ? clients.find(c => c.id === fd.clientId)?.name
        : pt === 'INVESTOR'
        ? investors.find(i => i.id === fd.investorId)?.name
        : pt === 'LOAN'
        ? loans.find(l => l.id === fd.loanId)?.borrowerName
        : pt === 'EXPENSE'
        ? fd.expensePayee
        : 'Expense';
    };

    if (isSplit) {
      for (let i = 0; i < splitPayments.length; i++) {
        const payment = splitPayments[i];
        if (!payment.amount || Number(payment.amount) <= 0) continue;

        const refId = payment.referenceId || `SPLIT-${Date.now()}-${i}`;
        
        const newTx: Transaction = {
          id: (isEditMode && originalTx && i === 0) ? originalTx.id : `${Date.now()}-${i}`,
          ...restFormData,
          method: payment.method,
          bankId: payment.bankId,
          referenceId: refId,
          particulars: `${finalParticulars} (${payment.method})`,
          amount: Number(payment.amount),
          balanceAfter: 0,
          synced: false,
          partyType,
          partyName: getPartyName(formData, partyType),
          landName: getLandName(formData, partyType),
          ownerName: getOwnerName(formData, partyType),
          investorName: getInvestorName(formData, partyType),
          clientName: getClientName(formData, partyType),
          loanName: getLoanName(formData, partyType),
          displayLabel: getDisplayLabel(formData, partyType)
        };

        await dbService.saveTransaction(newTx);
        lastRefId = refId;
        lastTransactionId = newTx.id;
        splitTransactionIds.push(newTx.id);
        
        // Update Entity Balance for Split
        try {
            if (partyType === 'CLIENT' && formData.clientId) {
              const client = clients.find(c => c.id === formData.clientId);
              if (client) {
                const amount = Number(payment.amount);
                const isCredit = formData.type === TransactionType.CREDIT;
                const newBalance = (client.balance || 0) - (isCredit ? amount : -amount);
                await dbService.saveClient({ ...client, balance: newBalance });
              }
            } else if (partyType === 'KISSAN' && formData.kissanId) {
              const kissan = farmers.find(k => k.id === formData.kissanId);
              if (kissan) {
                const amount = Number(payment.amount);
                const isDebit = formData.type === TransactionType.DEBIT;
                const newBalance = (kissan.balance || 0) - (isDebit ? amount : -amount);
                await dbService.saveKissan({ ...kissan, balance: newBalance });
              }
            } else if (partyType === 'INVESTOR' && formData.investorId) {
              const investor = investors.find(i => i.id === formData.investorId);
              if (investor) {
                 const amount = Number(payment.amount);
                 const isCredit = formData.type === TransactionType.CREDIT;
                 const newBalance = (investor.currentBalance || 0) + (isCredit ? amount : -amount);
                 await dbService.saveInvestor({ ...investor, currentBalance: newBalance });
              }
            } else if (partyType === 'LOAN' && formData.loanId) {
              const loan = loans.find(l => l.id === formData.loanId);
              if (loan) {
                const amount = Number(payment.amount);
                const isLoanTaken = loan.loanType === LoanType.TAKEN;
                const repaymentType = isLoanTaken ? TransactionType.DEBIT : TransactionType.CREDIT;
                const isRepayment = formData.type === repaymentType;
                const newRemaining = (loan.remainingPrincipal || 0) - (isRepayment ? amount : -amount);
                await dbService.saveLoan({ ...loan, remainingPrincipal: Math.max(0, newRemaining) });
              }
            }
        } catch (balErr) {
            console.error("Error updating party balance in split:", balErr);
        }

        // Handle Salary update for each split if applicable
        if (partyType === 'EXPENSE' && formData.expenseCategory === 'Salary' && formData.staffId) {
          const staffMember = staff.find(s => s.id === formData.staffId);
          if (staffMember) {
            const updatedStaff: Staff = {
              ...staffMember,
              totalSalaryPaid: (staffMember.totalSalaryPaid || 0) + Number(payment.amount),
              lastPaymentDate: formData.date
            };
            await dbService.saveStaff(updatedStaff);
          }
        }

        if (i === splitPayments.length - 1) {
          setLastTxId(newTx.id);
          setCurrentTx({
            ...newTx,
            isSplit: true,
            splitPayments: splitPayments
          } as any);
        }
      }
    } else {
      const refId = formData.referenceId || 'REF' + Math.floor(Math.random() * 10000);
      const newTx: Transaction = {
        id: isEditMode && originalTx ? originalTx.id : Date.now().toString(),
        ...restFormData,
        particulars: finalParticulars,
        amount: Number(formData.amount),
        referenceId: refId,
        balanceAfter: 0,
        synced: false,
        partyType,
        partyName: getPartyName(formData, partyType),
        landName: getLandName(formData, partyType),
        ownerName: getOwnerName(formData, partyType),
        investorName: getInvestorName(formData, partyType),
        clientName: getClientName(formData, partyType),
        loanName: getLoanName(formData, partyType),
        displayLabel: getDisplayLabel(formData, partyType)
      };

      await dbService.saveTransaction(newTx);
      lastRefId = refId;
      lastTransactionId = newTx.id;

      // Update Entity Balance
      try {
        if (partyType === 'CLIENT' && formData.clientId) {
          const client = clients.find(c => c.id === formData.clientId);
          if (client) {
            const amount = Number(formData.amount);
            const isCredit = formData.type === TransactionType.CREDIT;
            // For client, CREDIT means they paid us (reduces their balance)
            const newBalance = (client.balance || 0) - (isCredit ? amount : -amount);
            await dbService.saveClient({ ...client, balance: newBalance });
          }
        } else if (partyType === 'KISSAN' && formData.kissanId) {
          const kissan = farmers.find(k => k.id === formData.kissanId);
          if (kissan) {
            const amount = Number(formData.amount);
            const isDebit = formData.type === TransactionType.DEBIT;
            // For kissan, DEBIT means we paid them (reduces our debt/balance to them)
            const newBalance = (kissan.balance || 0) - (isDebit ? amount : -amount);
            await dbService.saveKissan({ ...kissan, balance: newBalance });
          }
        } else if (partyType === 'INVESTOR' && formData.investorId) {
          const investor = investors.find(i => i.id === formData.investorId);
          if (investor) {
             const amount = Number(formData.amount);
             const isCredit = formData.type === TransactionType.CREDIT;
             // For investor, CREDIT means they gave us money (increases our debt/their currentBalance)
             const newBalance = (investor.currentBalance || 0) + (isCredit ? amount : -amount);
             await dbService.saveInvestor({ ...investor, currentBalance: newBalance });
          }
        } else if (partyType === 'LOAN' && formData.loanId) {
          const loan = loans.find(l => l.id === formData.loanId);
          if (loan) {
            const amount = Number(formData.amount);
            const isLoanTaken = loan.loanType === LoanType.TAKEN;
            const repaymentType = isLoanTaken ? TransactionType.DEBIT : TransactionType.CREDIT;
            const isRepayment = formData.type === repaymentType;
            
            const newRemaining = (loan.remainingPrincipal || 0) - (isRepayment ? amount : -amount);
            await dbService.saveLoan({ ...loan, remainingPrincipal: Math.max(0, newRemaining) });
          }
        }
      } catch (balErr) {
        console.error("Error updating party balance:", balErr);
      }

      // 🔥 HANDLE DOUBLE ENTRY FOR BANK TRANSFERS
      if (partyType === 'BANK' && formData.toBankId) {
        const toBank = banks.find(b => b.id === formData.toBankId);
        const fromBank = banks.find(b => b.id === formData.bankId);
        
        const linkedTx: Transaction = {
          ...newTx,
          id: (Date.now() + 1).toString(),
          bankId: formData.toBankId,
          toBankId: formData.bankId, // Reverse for reference
          type: TransactionType.CREDIT, // Money coming in
          particulars: `Bank Transfer: Received from ${fromBank?.bankName}`,
          linkedTransactionId: newTx.id,
          partyName: toBank?.bankName || 'Bank'
        };
        
        await dbService.saveTransaction(linkedTx);
        
        // Update original transaction with link
        newTx.linkedTransactionId = linkedTx.id;
        await dbService.saveTransaction(newTx);
      }

      setLastTxId(newTx.id);
      setCurrentTx(newTx);
    }

    // Add to Pending Receipts if it's a CREDIT (Receipt)
    if (formData.type === TransactionType.CREDIT) {
      const receipts = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
      if (isSplit) {
        formData.splitPayments.forEach((p, idx) => {
          if (p.amount && Number(p.amount) > 0) {
            receipts.push({
              id: `pending_${Date.now()}_${idx}`,
              transactionId: splitTransactionIds[idx] || `${Date.now()}-${idx}`,
              date: formData.date,
              amount: Number(p.amount),
              payeeName: getPartyName(formData, partyType),
              partyId: getPartyId(formData, partyType),
              partyType: partyType,
              printed: false,
              createdAt: new Date().toISOString()
            });
          }
        });
      } else {
        receipts.push({
          id: `pending_${Date.now()}`,
          transactionId: lastTransactionId,
          date: formData.date,
          amount: Number(formData.amount),
          payeeName: getPartyName(formData, partyType),
          partyId: getPartyId(formData, partyType),
          partyType: partyType,
          printed: false,
          createdAt: new Date().toISOString()
        });
      }
      localStorage.setItem('pending_receipts', JSON.stringify(receipts));
      Promise.all(receipts.map(r => dbService.savePendingReceipt(r).catch(err => console.error('Failed to save pending receipt:', err))));
    }

    // Handle Pending Cheques if method is CHEQUE and it's a DEBIT (payment we make)
    if (formData.method === PaymentMethod.CHEQUE && formData.type === TransactionType.DEBIT && !isSplit) {
      const pendingCheques = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
      pendingCheques.push({
        id: `chq_${Date.now()}`,
        transactionId: lastTransactionId,
        date: formData.date,
        amount: Number(formData.amount),
        payeeName: getPartyName(formData, partyType),
        partyId: getPartyId(formData, partyType),
        partyType: partyType,
        printed: false,
        createdAt: new Date().toISOString()
      });
      localStorage.setItem('pending_cheques', JSON.stringify(pendingCheques));
    } else if (isSplit) {
       const pendingCheques = JSON.parse(localStorage.getItem('pending_cheques') || '[]');
       formData.splitPayments.forEach((p, idx) => {
         if (p.method === PaymentMethod.CHEQUE && formData.type === TransactionType.DEBIT) {
           pendingCheques.push({
             id: `chq_${Date.now()}_${idx}`,
              transactionId: splitTransactionIds[idx] || `${Date.now()}-${idx}`,
              date: formData.date,
              amount: Number(p.amount),
              payeeName: getPartyName(formData, partyType),
             partyId: getPartyId(formData, partyType),
             partyType: partyType,
             printed: false,
             createdAt: new Date().toISOString()
           });
         }
       });
       localStorage.setItem('pending_cheques', JSON.stringify(pendingCheques));
    }
    
    // Generate WhatsApp message
    if (settings) {
  let phone = '';
  let name = '';

  if (partyType === 'CLIENT') {
    const client = clients.find(c => c.id === formData.clientId);
    phone = client?.phone || '';
    name = client?.name || '';
  }

  if (partyType === 'KISSAN') {
    const kissan = farmers.find(f => f.id === formData.kissanId);
    const owner = kissan?.owners.find(o => o.id === formData.ownerId);
    phone = owner?.phone || '';
    name = owner?.name || '';
  }

  if (partyType === 'INVESTOR') {
    const investor = investors.find(i => i.id === formData.investorId);
    phone = investor?.phone || '';
    name = investor?.name || '';
  }

  if (partyType === 'LOAN') {
    const loan = loans.find(l => l.id === formData.loanId);
    phone = loan?.phone || '';
    name = loan?.borrowerName || '';
  }

  let msg = settings.paymentMessageTemplate || '';

  msg = msg.replace('{name}', name)
           .replace('{amount}', '₹' + Accounting.formatIndian(Number(formData.amount)))
           .replace('{unit}', formData.propertyId || 'N/A')
           .replace('{ref}', lastRefId)
           .replace('{company}', settings.companyName || 'Ashray Group')
           .replace('{receipt_link}', `${window.location.origin}/receipt/${lastTransactionId}`);

  setGeneratedMessage(msg);

  // 🔥 STORE PHONE GLOBALLY
  (window as any).__lastWhatsAppPhone = phone;
}

    // Simulate a brief sync delay for "team" effect
    setTimeout(() => {
      setIsProcessing(false);
      
      if (formData.method === PaymentMethod.CHEQUE && formData.type === TransactionType.DEBIT) {
        navigate('/generate-cheque', {
          state: {
            autoFillCheque: {
              transactionId: lastTransactionId,
              amount: formData.amount,
              partyType: partyType,
              clientId: formData.clientId,
              kissanId: formData.kissanId, // we need kissanId and ownerId
              ownerId: formData.ownerId,
              investorId: formData.investorId,
              loanId: formData.loanId,
              expensePayee: formData.expensePayee,
              date: formData.date,
              bankId: formData.bankId
            }
          }
        });
      } else {
        setShowSuccess(true);
      }
    }, 800);
  };

  const handleWhatsAppShare = () => {
  if (!generatedMessage) return;
  const phone = (window as any).__lastWhatsAppPhone || '';
  if (!phone) {
    alert('Phone number not available');
    return;
  }
  const url = `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(generatedMessage)}`;
  window.open(url, '_blank');
};

  return (
    <div className="max-w-3xl mx-auto relative pb-20">
      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full text-center space-y-6 border border-slate-100">
             <div className="flex justify-center mb-2">
               <div className="bg-emerald-50 p-5 rounded-full text-emerald-600">
                 <CheckCircle size={40} />
               </div>
             </div>
             <div>
               <h3 className="text-2xl font-bold text-slate-800">Transaction Saved!</h3>
               <p className="text-slate-500 mt-2">The entry has been updated across all ledgers:</p>
             </div>
             
             <div className="grid grid-cols-2 gap-3 text-left">
               <SyncStatus label="Day Book" />
               <SyncStatus label="Master Ledger" />
               <SyncStatus label="Client Profile" />
               <SyncStatus label="Dashboard Stats" />
             </div>

             <div className="flex flex-col gap-2 pt-4">
               {currentTx && (
                 <button 
                   type="button"
                   onClick={() => navigate('/generate-receipt', { state: { transaction: currentTx } })}
                   className="w-full bg-spiritual-maroon text-white py-3 rounded-xl font-bold shadow-md hover:bg-spiritual-maroon/90 flex items-center justify-center gap-2 transition-all"
                 >
                   <Receipt size={20} />
                   Generate Receipt
                 </button>
               )}
               {generatedMessage && (
                 <button 
                   type="button"
                   onClick={handleWhatsAppShare}
                   className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-emerald-700 flex items-center justify-center gap-2 transition-all"
                 >
                   <MessageCircle size={20} />
                   Share on WhatsApp
                 </button>
               )}
               <button 
                 type="button"
                 onClick={() => {
                   const pendingReceipts = JSON.parse(localStorage.getItem('pending_receipts') || '[]');
                   const newPending = {
                     id: Date.now().toString(),
                     transactionId: currentTx.id,
                     payeeName: currentTx.partyName || 'Unknown',
                     amount: currentTx.amount,
                     date: currentTx.date,
                     partyType: currentTx.partyType,
                     partyId: (currentTx as any).clientId || (currentTx as any).investorId || (currentTx as any).loanId || (currentTx.kissanId ? `${currentTx.kissanId}::${currentTx.ownerId}` : ''),
                     printed: false
                   };
                   // Duplicate addition removed
                   localStorage.removeItem('pending_receipts_remind_after');
                   setShowSuccess(false);
                   navigate('/pending-receipts');
                 }}
                 className="w-full bg-spiritual-maroon/10 text-spiritual-maroon py-3 rounded-xl font-bold hover:bg-spiritual-maroon/20 flex items-center justify-center gap-2 transition-all border border-spiritual-maroon/20"
               >
                 <Clock size={20} />
                 Remind me later
               </button>
               <button onClick={() => navigate('/')} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-brand-700 transition-all">Go to Dashboard</button>
               <button onClick={() => setShowSuccess(false)} className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all">Add Another</button>
             </div>
          </div>
        </div>
      )}

      <div className="flex items-center mb-6">
        <Link to="/" className="p-2 mr-2 hover:bg-slate-100 rounded-full transition-colors"><ArrowLeft size={20} className="text-slate-600" /></Link>
        <h1 className="text-2xl font-bold text-slate-800">{isEditMode ? 'Edit Transaction' : 'Add Transaction'}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-3">
           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">{t('select_party_type')}</label>
           <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
             <PartyBtn active={partyType==='CLIENT'} onClick={()=>setPartyType('CLIENT')} icon={<User size={16}/>} label="Client" />
             <PartyBtn active={partyType==='KISSAN'} onClick={()=>setPartyType('KISSAN')} icon={<Tractor size={16}/>} label="Agri Land" />
             <PartyBtn active={partyType==='INVESTOR'} onClick={()=>setPartyType('INVESTOR')} icon={<Briefcase size={16}/>} label="Investor" />
             <PartyBtn active={partyType==='LOAN'} onClick={()=>setPartyType('LOAN')} icon={<Landmark size={16}/>} label="Loan" />
             <PartyBtn active={partyType==='EXPENSE'} onClick={()=>setPartyType('EXPENSE')} icon={<CreditCard size={16}/>} label="Expense" />
             <PartyBtn active={partyType==='BANK'} onClick={()=>setPartyType('BANK')} icon={<Landmark size={16}/>} label="Bank" />
           </div>
        </div>

        {/* Split Payment Toggle */}
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${formData.isSplit ? 'bg-brand-100 text-brand-600' : 'bg-slate-200 text-slate-500'}`}>
              <RefreshCw size={20} className={formData.isSplit ? 'animate-spin-slow' : ''} />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Split Payment Mode</p>
              <p className="text-[10px] text-slate-500">Enable to pay using multiple methods/banks</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFormData({ ...formData, isSplit: !formData.isSplit })}
            className={`w-12 h-6 rounded-full transition-all relative ${formData.isSplit ? 'bg-brand-600' : 'bg-slate-300'}`}
          >
            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.isSplit ? 'left-7' : 'left-1'}`}></div>
          </button>
        </div>

        {!formData.isSplit ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {partyType === 'BANK' ? 'From Bank' : 'Select Bank'}
                </label>
                <select 
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" 
                  value={formData.bankId} 
                  onChange={e => setFormData({...formData, bankId: e.target.value})}
                  required
                >
                  <option value="">-- Select Bank --</option>
                  {banks.map(b => <option key={b.id} value={b.id}>{b.bankName} ({b.accountNumber})</option>)}
                </select>
              </div>
              {partyType === 'BANK' && (
                <div className="animate-in fade-in slide-in-from-left-2 duration-300">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">To Bank</label>
                  <select 
                    className="w-full bg-slate-50 text-slate-800 border border-brand-500/30 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                    value={formData.toBankId} 
                    onChange={e => setFormData({...formData, toBankId: e.target.value})}
                    required
                  >
                    <option value="">-- Select Destination Bank --</option>
                    {banks.filter(b => b.id !== formData.bankId).map(b => (
                      <option key={b.id} value={b.id}>{b.bankName} ({b.accountNumber})</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Mode of Payment</label>
                <select 
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" 
                  value={formData.method} 
                  onChange={e => setFormData({...formData, method: e.target.value as PaymentMethod})}
                  required
                >
                  {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Reference ID (Cheque/Tx ID)</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
                  placeholder={formData.method === PaymentMethod.CHEQUE ? "Generated automatically" : "Enter Reference ID"}
                  value={formData.referenceId} 
                  onChange={e => setFormData({...formData, referenceId: e.target.value})}
                  disabled={formData.method === PaymentMethod.CHEQUE}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Split Payments</label>
              <button 
                type="button" 
                onClick={addSplitPayment}
                className="text-[10px] bg-brand-50 text-brand-600 px-3 py-1 rounded-lg font-bold border border-brand-100 hover:bg-brand-100 transition-all flex items-center gap-1"
              >
                <Plus size={12} /> Add Row
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.splitPayments.map((payment, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 relative group">
                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Amount</label>
                    <input 
                      type="number" 
                      className="w-full bg-white text-slate-800 border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm font-mono"
                      placeholder="0.00"
                      value={payment.amount}
                      onChange={e => updateSplitPayment(index, 'amount', e.target.value)}
                      required
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Method</label>
                    <select 
                      className="w-full bg-white text-slate-800 border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      value={payment.method}
                      onChange={e => updateSplitPayment(index, 'method', e.target.value)}
                      required
                    >
                      {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Bank</label>
                    <select 
                      className="w-full bg-white text-slate-800 border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                      value={payment.bankId}
                      onChange={e => updateSplitPayment(index, 'bankId', e.target.value)}
                      required
                    >
                      <option value="">-- Bank --</option>
                      {banks.map(b => <option key={b.id} value={b.id}>{b.bankName}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Reference</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        className="w-full bg-white text-slate-800 border border-slate-200 p-2 rounded-lg outline-none focus:ring-2 focus:ring-brand-500 text-sm"
                        placeholder="Ref ID"
                        value={payment.referenceId}
                        onChange={e => updateSplitPayment(index, 'referenceId', e.target.value)}
                      />
                      {formData.splitPayments.length > 1 && (
                        <button 
                          type="button" 
                          onClick={() => removeSplitPayment(index)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
               {partyType === 'LOAN' ? 'Transaction Type' : 'Type'}
             </label>
             <div className="grid grid-cols-2 gap-3">
               <button
                 type="button"
                 onClick={() => setFormData({...formData, type: TransactionType.DEBIT})}
                 className={`py-3 rounded-xl font-bold transition-all border ${formData.type === TransactionType.DEBIT? 'bg-red-600 border-red-600 text-white shadow-md': 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
               >
                 {partyType === 'LOAN' ? 'Loan Given' : 'Debit'}
               </button>
               <button
                 type="button"
                 onClick={() => setFormData({...formData, type: TransactionType.CREDIT})}
                 className={`py-3 rounded-xl font-bold transition-all border ${formData.type === TransactionType.CREDIT ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}
               >
                 {partyType === 'LOAN' ? 'Loan Taken' : 'Credit'}
               </button>
             </div>
           </div>
           <div>
             <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date</label>
             <input type="date" className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" value={formData.date} onChange={e=>setFormData({...formData, date: e.target.value})} />
           </div>
        </div>

        {partyType === 'KISSAN' && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Agri Purpose</label>
            <select 
              className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" 
              value={formData.agriType} 
              onChange={e => {
                const val = e.target.value;
                setFormData({
                  ...formData, 
                  agriType: val,
                  type: val === 'Agreement Entry' ? TransactionType.CREDIT : TransactionType.DEBIT
                });
              }}
              required
            >
              <option value="">-- Select Agri Purpose --</option>
              <option value="Token Amount">Token Amount</option>
              <option value="Advance (As Per Agreement)">Advance (As Per Agreement)</option>
              <option value="Part Payment">Part Payment</option>
              <option value="Final Payment">Final Payment</option>
              <option value="Agreement Entry">Agreement Entry</option>
            </select>
          </div>
        )}

        {partyType === 'KISSAN' && formData.agriType === 'Part Payment' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Part</label>
              <select 
                className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" 
                value={formData.partNumber}
                onChange={e => setFormData({...formData, partNumber: e.target.value})}
                required
              >
                <option value="">-- Select Part --</option>
                {[1,2,3,4,5,6,7,8,9,10].filter(n => {
                  const paidParts = (window as any).__kissanParts || [];
                  return !paidParts.includes(n);
                }).map(n => {
                  const paidParts = (window as any).__kissanParts || [];
                  const lastPaid = paidParts.length > 0 ? Math.max(...paidParts) : 0;
                  const isNext = n === lastPaid + 1;
                  return (
                    <option key={n} value={`Part ${n}`} style={{ color: isNext ? '#10b981' : '#64748b', fontWeight: isNext ? 700 : 500 }}>
                      {isNext ? `✔ Last Paid: Part ${lastPaid} → Part ${n}` : `Part ${n}`}
                    </option>
                  );
                })}
                <option value="Manual">Manual Entry</option>
              </select>
            </div>
            {formData.partNumber === 'Manual' && (
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enter Part Name</label>
                <input 
                  type="text" 
                  className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" 
                  placeholder="e.g. Part 11 or Special Part"
                  value={formData.manualPart} 
                  onChange={e => setFormData({...formData, manualPart: e.target.value})}
                  required
                />
              </div>
            )}
          </div>
        )}

        {partyType !== 'BANK' && (
          <div className="space-y-4">
            <div>
              {['CLIENT', 'KISSAN', 'INVESTOR'].includes(partyType) && (
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Party</label>
              )}
              {partyType === 'CLIENT' && (
              <select className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" value={formData.clientId} onChange={e=>setFormData({...formData, clientId: e.target.value})}>
                <option value="">-- Select Client --</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
            {partyType === 'CLIENT' && remainingBalance !== null && (
              <div className="mt-2 flex items-center justify-between p-3 bg-brand-50 rounded-xl border border-brand-100 animate-in fade-in slide-in-from-top-1 duration-300">
                <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Remaining Balance</span>
                <div className="text-right">
                  <span className={`text-sm font-bold font-mono ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    ₹{Accounting.formatIndian(Math.abs(remainingBalance))} {remainingBalance > 0 ? 'Dr' : 'Cr'}
                  </span>
                  <p className="text-[9px] text-slate-400 -mt-1 italic">{Accounting.formatIndianWords(Math.abs(remainingBalance))} Only</p>
                </div>
              </div>
            )}
            {partyType === 'CLIENT' && formData.clientId && (
              <div className="mt-4">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Purpose</label>
                <select className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} required>
                  <option value="">-- Select Purpose --</option>
                  <option value="PART_PAYMENT">Part Payment</option>
                  <option value="FULL_PAYMENT">Full Payment</option>
                  <option value="FINAL_PAYMENT">Final Payment</option>
                </select>
              </div>
            )}
            {partyType === 'CLIENT' && formData.purpose === 'PART_PAYMENT' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-2 duration-300 mt-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Part</label>
                  <select className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" value={formData.partNumber} onChange={e => setFormData({ ...formData, partNumber: e.target.value })} required>
                    <option value="">-- Select Part --</option>
                    {[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map(n => {
                      const paidParts = (window as any).__clientTxCache || [];
                      const lastPaid = paidParts.length > 0 ? Math.max(...paidParts) : 0;
                      const isNext = n === lastPaid + 1;
                      if (paidParts.includes(n)) return null;
                      return (
                        <option key={n} value={`Part ${n}`} style={{ color: isNext ? '#10b981' : '#64748b', fontWeight: isNext ? 700 : 500 }}>
                          {isNext ? `✔ Last Paid: Part ${lastPaid} → Part ${n}` : `Part ${n}`}
                        </option>
                      );
                    })}
                    <option value="Manual">Manual Entry</option>
                  </select>
                </div>
                {formData.partNumber === 'Manual' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Enter Part Name</label>
                    <input type="text" className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" placeholder="e.g. Part 11 or Special Part" value={formData.manualPart} onChange={e => setFormData({...formData, manualPart: e.target.value})} required />
                  </div>
                )}
              </div>
            )}

            {partyType === 'KISSAN' && (
              <select className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" value={formData.kissanId} onChange={e=>{
                setFormData({...formData, kissanId: e.target.value, ownerId: ''});
                (window as any).__kissanParts = [];
              }}>
                <option value="">-- Select Agri Land --</option>
                {farmers.map(f => <option key={f.id} value={f.id}>{f.landName} ({f.village})</option>)}
              </select>
            )}
            {partyType === 'KISSAN' && formData.kissanId && (
              <div className="mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Owner</label>
                <select className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" value={formData.ownerId} onChange={e => setFormData({...formData, ownerId: e.target.value})} required>
                  <option value="">-- Select Owner --</option>
                  {farmers.find(f => f.id === formData.kissanId)?.owners.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.sharePercentage}%)</option>
                  ))}
                </select>
                {remainingBalance !== null && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between p-3 bg-brand-50 rounded-xl border border-brand-100 animate-in fade-in slide-in-from-top-1 duration-300">
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider">Remaining Balance</span>
                      <div className="text-right">
                        <span className={`text-sm font-bold font-mono ${remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                          ₹{Accounting.formatIndian(Math.abs(remainingBalance))}
                        </span>
                      </div>
                    </div>
                    
                    {nextEmiInfo && (
                      <div className="flex items-center justify-between p-3 bg-orange-50 rounded-xl border border-orange-100 animate-in fade-in slide-in-from-top-1 duration-300">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Next EMI Due</span>
                          <span className="text-[9px] text-orange-500 font-bold">EMI #{nextEmiInfo.number}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-bold text-orange-600 font-mono">₹{Accounting.formatIndian(nextEmiInfo.amount)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {partyType === 'INVESTOR' && (
              <select className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" value={formData.investorId} onChange={e=>setFormData({...formData, investorId: e.target.value})}>
                <option value="">-- Select Investor --</option>
                {investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            )}
            {partyType === 'LOAN' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">Borrower Type</label>
                  <div className="flex gap-2">
                    {[
                      { id: 'LOAN', label: 'Existing Loan' },
                      { id: 'CLIENT', label: 'Client' },
                      { id: 'KISSAN', label: 'Kissan' },
                      { id: 'INVESTOR', label: 'Partner' },
                    ].map((bt) => (
                      <button
                        key={bt.id}
                        type="button"
                        onClick={() => {
                          setBorrowerType(bt.id as any);
                          setFormData(prev => ({ ...prev, loanId: '', clientId: '', kissanId: '', investorId: '' }));
                          setSelectedBorrowerPhone('');
                        }}
                        className={`flex-1 py-2 rounded-xl text-[10px] font-bold border transition-all ${
                          borrowerType === bt.id
                            ? 'bg-brand-500 border-brand-500 text-white shadow-sm'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select {borrowerType}</label>
                  <select 
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none" 
                    value={borrowerType === 'LOAN' ? formData.loanId : borrowerType === 'CLIENT' ? formData.clientId : borrowerType === 'KISSAN' ? formData.kissanId : formData.investorId} 
                    onChange={e => {
                      const val = e.target.value;
                      if (borrowerType === 'LOAN') {
                        setFormData({...formData, loanId: val});
                        const loan = loans.find(l => l.id === val);
                        if (loan) setSelectedBorrowerPhone(loan.phone);
                      }
                      else if (borrowerType === 'CLIENT') setFormData({...formData, clientId: val});
                      else if (borrowerType === 'KISSAN') setFormData({...formData, kissanId: val});
                      else if (borrowerType === 'INVESTOR') setFormData({...formData, investorId: val});
                    }}
                    required
                  >
                    <option value="">-- Select {borrowerType} --</option>
                    {borrowerType === 'LOAN' && loans.map(l => <option key={l.id} value={l.id}>{l.borrowerName} (₹{Accounting.formatIndian(l.principalAmount)})</option>)}
                    {borrowerType === 'CLIENT' && clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    {borrowerType === 'KISSAN' && farmers.map(k => <option key={k.id} value={k.id}>{k.name}</option>)}
                    {borrowerType === 'INVESTOR' && investors.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                  </select>
                </div>

                {((borrowerType === 'LOAN' && formData.loanId) || (borrowerType === 'CLIENT' && formData.clientId) || (borrowerType === 'KISSAN' && formData.kissanId) || (borrowerType === 'INVESTOR' && formData.investorId)) && (
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 animate-in zoom-in-95 duration-200">
                    <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-3">Borrower Bank Details</h4>
                    {(() => {
                      let party: any;
                      if (borrowerType === 'LOAN') party = loans.find(l => l.id === formData.loanId);
                      else if (borrowerType === 'CLIENT') party = clients.find(c => c.id === formData.clientId);
                      else if (borrowerType === 'KISSAN') party = farmers.find(k => k.id === formData.kissanId);
                      else if (borrowerType === 'INVESTOR') party = investors.find(i => i.id === formData.investorId);

                      if (!party) return null;

                      return (
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">Bank</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{party.bankName || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">Account</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{party.accountNumber || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase">IFSC</p>
                            <p className="text-xs font-bold text-slate-700 truncate">{party.ifscCode || 'N/A'}</p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                )}
                
                {partyType === 'LOAN' && borrowerType === 'LOAN' && formData.loanId && (
                  <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-1 duration-300">
                    <div className="p-3 bg-brand-50 rounded-xl border border-brand-100">
                      <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider block">Remaining Balance</span>
                      <span className={`text-sm font-bold font-mono ${remainingBalance !== null && remainingBalance > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                        {remainingBalance !== null ? `₹${Accounting.formatIndian(Math.abs(remainingBalance))}` : '---'}
                      </span>
                    </div>
                    {nextEmiInfo && (
                      <div className="p-3 bg-orange-50 rounded-xl border border-orange-100">
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider block">
                          {nextEmiInfo.number === loans.find(l => l.id === formData.loanId)?.durationMonths ? 'Final EMI' : `EMI #${nextEmiInfo.number}`}
                        </span>
                        <span className="text-sm font-bold font-mono text-orange-600">
                          ₹{Accounting.formatIndian(nextEmiInfo.amount)}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            {partyType === 'EXPENSE' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expense Category</label>
                  <select
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all appearance-none"
                    value={formData.expenseCategory}
                    onChange={e => setFormData({ ...formData, expenseCategory: e.target.value })}
                    required
                  >
                    <option value="">-- Select Expense Type --</option>
                    <option value="Development">Development</option>
                    <option value="Rent">Rent</option>
                    <option value="Electricity">Electricity</option>
                    <option value="Labour">Labour</option>
                    <option value="Carting / Transportation">Carting / Transportation</option>
                    <option value="Office Expense">Office Expense</option>
                    <option value="Salary">Salary</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Legal / CA">Legal / CA</option>
                    <option value="Miscellaneous">Miscellaneous</option>
                  </select>
                </div>
                {formData.expenseCategory === 'Salary' && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Staff Member</label>
                    <select
                      className="w-full bg-slate-50 text-slate-800 border border-brand-500/30 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                      value={formData.staffId}
                      onChange={e => {
                        const s = staff.find(st => st.id === e.target.value);
                        setFormData({ 
                          ...formData, 
                          staffId: e.target.value,
                          expensePayee: s?.name || '',
                          amount: s?.salary.toString() || formData.amount
                        });
                      }}
                      required
                    >
                      <option value="">-- Select Staff --</option>
                      {staff.filter(s => s.status === 'ACTIVE').map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.role})</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Payee To</label>
                  <input
                    type="text"
                    placeholder="Enter Payee (e.g. Ramesh Contractor)"
                    className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all"
                    value={formData.expensePayee}
                    onChange={e => setFormData({ ...formData, expensePayee: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}
          </div>
        </div>
        )}

         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 text-brand-600">Total Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                <input 
                  type="number" 
                  className={`w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 pl-8 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all font-mono text-lg ${formData.isSplit ? 'bg-brand-50/50 border-brand-200 text-brand-700 font-bold' : ''}`} 
                  placeholder="0.00" 
                  value={formData.amount} 
                  onChange={e=>setFormData({...formData, amount: e.target.value})} 
                  required 
                  readOnly={formData.isSplit}
                />
              </div>
              {formData.amount && <p className="text-[10px] text-slate-400 mt-1 italic ml-1">{Accounting.formatIndianWords(Number(formData.amount))} Only</p>}
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Particulars</label>
              <input type="text" className="w-full bg-slate-50 text-slate-800 border border-slate-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-brand-500 transition-all" placeholder="Enter Description" value={formData.particulars} onChange={e=>setFormData({...formData, particulars: e.target.value})} />
           </div>
         </div>

        <div className="pt-6 flex justify-end">
           <button type="submit" disabled={isProcessing} className="w-full sm:w-auto px-12 py-4 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 text-sm">
             {isProcessing ? <><Loader2 className="animate-spin" size={20} />Processing...</> : (
               formData.method === PaymentMethod.CHEQUE && formData.type === TransactionType.DEBIT 
                 ? <><Printer size={20} />Print Cheque by Saving Transaction</>
                 : <><Save size={20} />Save Transaction</>
             )}
           </button>
        </div>
      </form>

      {currentTx && settings && (
        <ReceiptPrintView
          open={showReceipt}
          onClose={() => setShowReceipt(false)}
          transaction={currentTx}
          client={clients.find(c => c.id === currentTx.clientId)}
          settings={settings}
        />
      )}
    </div>
  );
};

const PartyBtn = ({ active, onClick, icon, label }: any) => (
  <button type="button" onClick={onClick} className={`flex items-center justify-center p-3 rounded-xl border text-[10px] font-bold transition-all ${active ? 'bg-brand-500 border-brand-500 text-white shadow-md' : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'}`}>
    {icon} <span className="ml-2">{label}</span>
  </button>
);

const SyncStatus = ({ label }: { label: string }) => (
  <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
    <span className="text-[10px] font-bold text-slate-600">{label}</span>
    <CheckCircle size={12} className="text-emerald-500 ml-auto" />
  </div>
);

