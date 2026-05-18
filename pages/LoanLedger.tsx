
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Calendar, User, Phone, ArrowUpRight, ArrowDownLeft, Landmark, CheckCircle2, AlertCircle, Clock, Trash2, File, FileText, Eye, ShieldCheck, ShieldAlert, Shield, Sparkles, Edit3, Activity, Download } from 'lucide-react';
import { dbService } from '../services/db';
import { Loan, Transaction, BorrowerReview, LoanType } from '../types';
import { Accounting } from '../services/accounting';
import { TransactionTable } from '../components/Shared';
import { sortTransactions, SortOrder } from '../utils/sorting';

export const LoanLedger: React.FC = () => {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CLOSED'>('ALL');
  const [loanTypeFilter, setLoanTypeFilter] = useState<LoanType>(LoanType.GIVEN);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGeneratingReview, setIsGeneratingReview] = useState(false);
  const [aiReview, setAiReview] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const [l, t] = await Promise.all([
        dbService.getLoans(),
        dbService.getTransactions()
      ]);
      setLoans(l);
      setTransactions(t);
      setLoading(false);
    };
    loadData();
    return dbService.subscribe(loadData);
  }, []);

  const filteredLoans = loans.filter(loan => {
    const search = searchTerm?.toLowerCase() || '';
    const matchesSearch = (loan.borrowerName?.toLowerCase() || '').includes(search) || 
                         (loan.phone?.toLowerCase() || '').includes(search);
    const matchesStatus = statusFilter === 'ALL' || loan.status === statusFilter;
    const matchesType = (loan.loanType || LoanType.GIVEN) === loanTypeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getLoanTransactions = (loanId: string) => {
    return sortTransactions(
      transactions.filter(t => t.loanId === loanId),
      sortOrder
    );
  };

  const handleDeleteLoan = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this specific loan record? Associated transactions will remain.')) {
      await dbService.deleteLoan(id);
      if (selectedLoan?.id === id) setSelectedLoan(null);
    }
  };

  const handleDeleteProfile = async (phone: string, name: string) => {
    if (window.confirm(`DANGER: This will delete ALL loan records for ${name}. This action cannot be undone. Associated transactions will remain in ledger. Proceed?`)) {
      const borrowerLoans = loans.filter(l => l.phone === phone);
      for (const loan of borrowerLoans) {
        await dbService.deleteLoan(loan.id);
      }
      setSelectedLoan(null);
    }
  };

  const calculateBorrowerReview = (borrowerName: string): BorrowerReview => {
    const borrowerLoans = loans.filter(l => l.borrowerName === borrowerName);
    const totalLoans = borrowerLoans.length;
    const closedLoans = borrowerLoans.filter(l => l.status === 'CLOSED').length;
    const defaultedLoans = borrowerLoans.filter(l => l.status === 'DEFAULTED').length;
    
    let score = 70; // Base score
    const insights: string[] = [];

    if (totalLoans > 1) insights.push(`Repeat borrower with ${totalLoans} total loans.`);
    if (closedLoans > 0) {
      score += (closedLoans * 10);
      insights.push(`Successfully closed ${closedLoans} previous loans.`);
    }
    if (defaultedLoans > 0) {
      score -= (defaultedLoans * 40);
      insights.push(`WARNING: Has ${defaultedLoans} previous defaults.`);
    }

    // Check repayment consistency (mock logic for now)
    const totalPaid = borrowerLoans.reduce((acc, l) => acc + (l.totalPaid || 0), 0);
    const totalPrincipal = borrowerLoans.reduce((acc, l) => acc + (l.principalAmount || 0), 0);
    const repaymentRatio = totalPrincipal > 0 ? (totalPaid / totalPrincipal) : 0;

    if (repaymentRatio > 0.5) {
      score += 5;
      insights.push("Strong repayment history (over 50% of total principal paid).");
    }

    score = Math.max(0, Math.min(100, score));

    let status: BorrowerReview['status'] = 'AVERAGE';
    if (score >= 90) status = 'EXCELLENT';
    else if (score >= 75) status = 'GOOD';
    else if (score >= 50) status = 'AVERAGE';
    else if (score >= 30) status = 'RISKY';
    else status = 'DEFAULTED';

    if (defaultedLoans > 0) status = 'DEFAULTED';

    return {
      score,
      status,
      summary: `Borrower has a ${(status?.toLowerCase() || '')} track record based on ${totalLoans} loan(s).`,
      insights,
      lastUpdated: new Date().toISOString()
    };
  };

  const generateAiReview = async (loan: Loan) => {
    setIsGeneratingReview(true);
    // Simulate a small delay for "analysis" feel
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      const review = calculateBorrowerReview(loan.borrowerName);
      const borrowerLoans = loans.filter(l => l.borrowerName === loan.borrowerName);
      const activeLoans = borrowerLoans.filter(l => l.status === 'ACTIVE').length;
      
      let localReview = "";
      
      if (review.status === 'EXCELLENT' || review.status === 'GOOD') {
        localReview = `Borrower ${loan.borrowerName} demonstrates a highly reliable repayment pattern. With ${borrowerLoans.length} total loans and a strong trust score of ${review.score}, they are considered a low-risk profile. Repayment consistency is above average, making them a preferred candidate for future credit extensions.`;
      } else if (review.status === 'AVERAGE') {
        localReview = `Borrower ${loan.borrowerName} has a stable but limited history. While they have managed ${borrowerLoans.length} loans, the repayment velocity is moderate. A trust score of ${review.score} suggests they are a standard risk. Continued monitoring of the current active loan (₹${loan.principalAmount}) is recommended to ensure timely closure.`;
      } else if (review.status === 'RISKY') {
        localReview = `CAUTION: Borrower ${loan.borrowerName} shows signs of potential credit stress. With a trust score of ${review.score}, there is an increased risk of delayed payments. Historical data indicates inconsistencies in repayment. Close supervision of the current ₹${loan.principalAmount} principal is advised before considering further exposure.`;
      } else {
        localReview = `CRITICAL WARNING: Borrower ${loan.borrowerName} is flagged as a high-default risk. Previous defaults or significant repayment failures have resulted in a trust score of ${review.score}. It is strongly advised to prioritize recovery of existing dues and avoid any new credit approvals for this profile.`;
      }

      setAiReview(localReview);
    } catch (error) {
      console.error("Review Error:", error);
      setAiReview("Error generating review. Please try again.");
    } finally {
      setIsGeneratingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tabs for Loan Type */}
      <div className="flex p-1 bg-slate-100 rounded-2xl w-full sm:w-fit">
        <button
          onClick={() => {
            setLoanTypeFilter(LoanType.GIVEN);
            setSelectedLoan(null);
          }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            loanTypeFilter === LoanType.GIVEN
              ? 'bg-white text-brand-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowUpRight size={18} />
          Loans Given (Lending)
        </button>
        <button
          onClick={() => {
            setLoanTypeFilter(LoanType.TAKEN);
            setSelectedLoan(null);
          }}
          className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            loanTypeFilter === LoanType.TAKEN
              ? 'bg-white text-orange-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <ArrowDownLeft size={18} />
          Loans Taken (Borrowing)
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${loanTypeFilter === LoanType.GIVEN ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
              <Landmark size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Principal</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            ₹{Accounting.formatIndian(loans.filter(l => (l.loanType || LoanType.GIVEN) === loanTypeFilter).reduce((acc, l) => acc + l.principalAmount, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">{loans.filter(l => (l.loanType || LoanType.GIVEN) === loanTypeFilter).length} {loanTypeFilter === LoanType.GIVEN ? 'Active Loans' : 'Active Liabilities'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
              <Clock size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outstanding</span>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            ₹{Accounting.formatIndian(loans.filter(l => (l.loanType || LoanType.GIVEN) === loanTypeFilter).reduce((acc, l) => acc + l.remainingPrincipal, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">{loanTypeFilter === LoanType.GIVEN ? 'Total Receivable' : 'Total Payable'}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-lg ${loanTypeFilter === LoanType.GIVEN ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
              <CheckCircle2 size={24} />
            </div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              {loanTypeFilter === LoanType.GIVEN ? 'Interest Earned' : 'Interest Paid'}
            </span>
          </div>
          <p className={`text-2xl font-bold ${loanTypeFilter === LoanType.GIVEN ? 'text-green-600' : 'text-red-600'}`}>
            ₹{Accounting.formatIndian(loans.filter(l => (l.loanType || LoanType.GIVEN) === loanTypeFilter).reduce((acc, l) => acc + l.totalInterestPaid, 0))}
          </p>
          <p className="text-xs text-slate-400 mt-1">{loanTypeFilter === LoanType.GIVEN ? 'Total Profit' : 'Total Cost'}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Loan List */}
        <div className={`flex-1 space-y-4 ${selectedLoan ? 'hidden lg:block' : 'block'}`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${loanTypeFilter === LoanType.GIVEN ? 'borrower' : 'lender'} or phone...`} 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select 
                className="bg-slate-50 border-none rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 outline-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="CLOSED">Closed</option>
              </select>
              <Link to={loanTypeFilter === LoanType.GIVEN ? "/add-lending-loan" : "/add-borrowing-loan"} className={`flex items-center text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md ${loanTypeFilter === LoanType.GIVEN ? 'bg-brand-600 hover:bg-brand-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                <Plus size={18} className="mr-2" /> New {loanTypeFilter === LoanType.GIVEN ? 'Loan' : 'Loan Taken'}
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filteredLoans.map(loan => {
              const review = calculateBorrowerReview(loan.borrowerName);
              return (
                <div 
                  key={loan.id}
                  onClick={() => setSelectedLoan(loan)}
                  className={`group bg-white p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${selectedLoan?.id === loan.id ? 'border-brand-500 ring-1 ring-brand-500' : 'border-slate-200'}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                          <User size={20} />
                        </div>
                        {/* Trust Badge on Profile Image */}
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-sm ${
                          review.status === 'EXCELLENT' ? 'bg-green-500' :
                          review.status === 'GOOD' ? 'bg-emerald-500' :
                          review.status === 'AVERAGE' ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}>
                          <ShieldCheck size={10} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-800">{loan.borrowerName}</h3>
                          {loanTypeFilter === LoanType.GIVEN && (
                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-widest ${
                              review.status === 'EXCELLENT' ? 'bg-green-100 text-green-700' :
                              review.status === 'GOOD' ? 'bg-emerald-100 text-emerald-700' :
                              review.status === 'AVERAGE' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {review.score}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400">{loan.phone}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-800">₹{Accounting.formatIndian(loan.remainingPrincipal)}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Remaining</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Principal</p>
                      <p className="text-xs font-bold text-slate-700">₹{Accounting.formatIndian(loan.principalAmount)}</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Interest</p>
                      <p className="text-xs font-bold text-brand-600">{loan.interestRate}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg text-center">
                      <p className="text-[9px] text-slate-400 uppercase font-bold">Status</p>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${loan.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                        {loan.status}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
            {filteredLoans.length === 0 && (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <AlertCircle className="mx-auto text-slate-300 mb-2" size={48} />
                <p className="text-slate-500 font-medium">No loans found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>

        {/* Loan Details View */}
        {selectedLoan && (
          <div className="flex-1 space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className={`p-6 text-white relative ${loanTypeFilter === LoanType.GIVEN ? 'bg-gradient-to-r from-brand-600 to-brand-700' : 'bg-gradient-to-r from-orange-600 to-orange-700'}`}>
                <button 
                  onClick={() => setSelectedLoan(null)}
                  className="lg:hidden absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
                >
                  <Plus size={20} className="rotate-45" />
                </button>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                    <User size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedLoan.borrowerName}</h2>
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-white/80 flex items-center text-xs">
                        <Phone size={12} className="mr-1" /> {selectedLoan.phone}
                      </p>
                      <div className="h-3 w-px bg-white/20 hidden sm:block"></div>
                      <Link 
                        to={selectedLoan.loanType === LoanType.GIVEN ? "/add-lending-loan" : "/add-borrowing-loan"} 
                        state={{ loanId: selectedLoan.id }}
                        className="text-[10px] font-bold text-white/90 hover:text-white flex items-center bg-white/10 px-2.5 py-1 rounded-lg transition-all border border-white/10 hover:bg-white/20"
                      >
                        <Edit3 size={10} className="mr-1" /> Edit Profile
                      </Link>
                      <Link 
                        to={selectedLoan.loanType === LoanType.GIVEN ? "/add-lending-loan" : "/add-borrowing-loan"} 
                        state={{ borrowerData: selectedLoan }}
                        className={`text-[10px] font-bold text-white flex items-center px-2.5 py-1 rounded-lg transition-all shadow-sm ${loanTypeFilter === LoanType.GIVEN ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                      >
                        <Plus size={10} className="mr-1" /> New {loanTypeFilter === LoanType.GIVEN ? 'Loan' : 'Loan Taken'}
                      </Link>
                      <button 
                        onClick={() => handleDeleteProfile(selectedLoan.phone, selectedLoan.borrowerName)}
                        className="text-[10px] font-bold text-white/80 hover:text-white hover:bg-red-500/20 flex items-center bg-white/5 px-2.5 py-1 rounded-lg transition-all border border-white/5"
                      >
                        <Trash2 size={10} className="mr-1" /> Delete Profile
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-brand-200 uppercase font-bold mb-1">Principal</p>
                    <p className="text-lg font-bold">₹{Accounting.formatIndian(selectedLoan.principalAmount)}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-brand-200 uppercase font-bold mb-1">Interest</p>
                    <p className="text-lg font-bold">{selectedLoan.interestRate}% <span className="text-xs font-normal">({selectedLoan.interestType})</span></p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-brand-200 uppercase font-bold mb-1">Monthly EMI</p>
                    <p className="text-lg font-bold text-yellow-300">₹{Accounting.formatIndian(selectedLoan.monthlyEMI || 0)}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-brand-200 uppercase font-bold mb-1">Paid</p>
                    <p className="text-lg font-bold text-green-300">₹{Accounting.formatIndian(selectedLoan.totalPaid)}</p>
                  </div>
                  <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                    <p className="text-[10px] text-brand-200 uppercase font-bold mb-1">Remaining</p>
                    <p className="text-lg font-bold text-orange-300">₹{Accounting.formatIndian(selectedLoan.remainingPrincipal)}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 flex items-center">
                    <Clock size={18} className={`mr-2 ${loanTypeFilter === LoanType.GIVEN ? 'text-brand-600' : 'text-orange-600'}`} /> Payment History
                  </h3>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                      className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-[10px] font-bold transition-all border border-slate-200"
                    >
                      <Activity size={12} className={sortOrder === 'newest' ? 'rotate-90' : '-rotate-90'} />
                      {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                    </button>
                    <Link 
                      to="/add-transaction" 
                      state={{ 
                        loanId: selectedLoan.id, 
                        partyType: 'LOAN', 
                        borrowerName: selectedLoan.borrowerName,
                        amount: selectedLoan.monthlyEMI
                      }}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${loanTypeFilter === LoanType.GIVEN ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-orange-600 text-white hover:bg-orange-700'}`}
                    >
                      <Sparkles size={14} className="mr-1" /> Quick EMI
                    </Link>
                    <Link 
                      to="/add-transaction" 
                      state={{ loanId: selectedLoan.id, partyType: 'LOAN', borrowerName: selectedLoan.borrowerName }}
                      className={`flex items-center px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${loanTypeFilter === LoanType.GIVEN ? 'bg-brand-50 text-brand-700 hover:bg-brand-100' : 'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}
                    >
                      <Plus size={14} className="mr-1" /> Custom
                    </Link>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-xl overflow-hidden">
                  <TransactionTable 
                    transactions={getLoanTransactions(selectedLoan.id)} 
                    onUpdate={() => {}}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Borrower Review Card - REDESIGNED */}
                  {loanTypeFilter === LoanType.GIVEN && (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:col-span-3">
                      <div className="px-4 py-3 bg-indigo-50/50 border-b border-indigo-100/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-indigo-600 text-white rounded-lg shadow-sm">
                            <ShieldCheck size={14} />
                          </div>
                          <h4 className="text-[10px] font-black text-indigo-900 uppercase tracking-widest">Borrower Trust Score & Review</h4>
                        </div>
                        <button 
                          onClick={() => generateAiReview(selectedLoan)}
                          disabled={isGeneratingReview}
                          className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 text-white rounded-full text-[10px] font-bold hover:bg-indigo-700 transition-all disabled:opacity-50 shadow-sm"
                        >
                          <Sparkles size={12} className={isGeneratingReview ? 'animate-pulse' : ''} />
                          {isGeneratingReview ? 'Analyzing...' : 'Detailed AI Review'}
                        </button>
                      </div>
                      
                      <div className="p-6 bg-gradient-to-br from-white to-indigo-50/30">
                        <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
                          {/* Score Gauge - Enhanced */}
                          <div className="relative flex flex-col items-center shrink-0">
                            <div className="relative w-32 h-32 flex items-center justify-center">
                              {/* Outer Glow */}
                              <div className={`absolute inset-0 rounded-full blur-xl opacity-20 ${
                                calculateBorrowerReview(selectedLoan.borrowerName).score >= 75 ? 'bg-emerald-500' :
                                calculateBorrowerReview(selectedLoan.borrowerName).score >= 50 ? 'bg-amber-500' :
                                'bg-red-500'
                              }`}></div>
                              
                              {/* Background Track */}
                              <svg className="absolute inset-0 w-full h-full -rotate-90">
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  fill="transparent"
                                  stroke="#f1f5f9"
                                  strokeWidth="12"
                                />
                                {/* Progress Circle */}
                                <circle
                                  cx="64"
                                  cy="64"
                                  r="56"
                                  fill="transparent"
                                  stroke={
                                    calculateBorrowerReview(selectedLoan.borrowerName).score >= 75 ? '#10b981' :
                                    calculateBorrowerReview(selectedLoan.borrowerName).score >= 50 ? '#f59e0b' :
                                    '#ef4444'
                                  }
                                  strokeWidth="12"
                                  strokeDasharray={`${(calculateBorrowerReview(selectedLoan.borrowerName).score / 100) * 351.8} 351.8`}
                                  strokeLinecap="round"
                                  className="transition-all duration-1000 ease-out"
                                />
                              </svg>
                              
                              <div className="flex flex-col items-center justify-center z-10">
                                <span className="text-4xl font-black text-slate-800 tracking-tighter">
                                  {calculateBorrowerReview(selectedLoan.borrowerName).score}
                                </span>
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest -mt-1">Trust Score</span>
                              </div>
                            </div>
                            
                            <div className={`mt-4 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm border ${
                              calculateBorrowerReview(selectedLoan.borrowerName).status === 'EXCELLENT' ? 'bg-green-500 text-white border-green-600' :
                              calculateBorrowerReview(selectedLoan.borrowerName).status === 'GOOD' ? 'bg-emerald-500 text-white border-emerald-600' :
                              calculateBorrowerReview(selectedLoan.borrowerName).status === 'AVERAGE' ? 'bg-amber-500 text-white border-amber-600' :
                              'bg-red-500 text-white border-red-600'
                            }`}>
                              {calculateBorrowerReview(selectedLoan.borrowerName).status}
                            </div>
                          </div>
  
                          {/* Analysis & Insights - Enhanced */}
                          <div className="flex-1 space-y-6 w-full">
                            <div className="space-y-2">
                              <h5 className="text-sm font-black text-slate-800 flex items-center gap-2">
                                <Shield size={16} className="text-indigo-600" /> Automated Risk Analysis
                              </h5>
                              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                {calculateBorrowerReview(selectedLoan.borrowerName).summary} Our system has analyzed the repayment patterns and historical data for this borrower.
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {calculateBorrowerReview(selectedLoan.borrowerName).insights.map((insight, idx) => (
                                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                                  insight.includes('WARNING') 
                                    ? 'bg-red-50 border-red-100 text-red-700 shadow-sm shadow-red-100' 
                                    : 'bg-white border-slate-100 text-slate-600 shadow-sm'
                                }`}>
                                  <div className={`p-1.5 rounded-lg shrink-0 ${
                                    insight.includes('WARNING') ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                                  }`}>
                                    {insight.includes('WARNING') ? <ShieldAlert size={14} /> : <ShieldCheck size={14} />}
                                  </div>
                                  <span className="text-[10px] font-bold leading-tight">{insight}</span>
                                </div>
                              ))}
                            </div>
  
                            {aiReview && (
                              <div className="mt-6 p-5 bg-white rounded-2xl border border-indigo-100 shadow-xl shadow-indigo-100/20 relative animate-in fade-in zoom-in-95 duration-500">
                                <div className="absolute -top-3 left-6 px-3 py-1 bg-indigo-600 text-white text-[9px] font-black rounded-full uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-indigo-200">
                                  <Sparkles size={10} /> Detailed AI Insights
                                </div>
                                <div className="text-[11px] text-slate-600 leading-relaxed italic font-medium">
                                  "{aiReview}"
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
  
                  {/* Borrower Profile Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${loanTypeFilter === LoanType.GIVEN ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                          <User size={14} />
                        </div>
                        <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{loanTypeFilter === LoanType.GIVEN ? 'Borrower' : 'Lender'} Profile</h4>
                      </div>
                      <div className="flex items-center gap-1">
                        <Link 
                          to="/add-loan" 
                          state={{ loanId: selectedLoan.id }}
                          className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                          title="Edit Profile"
                        >
                          <Edit3 size={14} />
                        </Link>
                        <button 
                          onClick={() => handleDeleteLoan(selectedLoan.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Delete Loan"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                      <DetailRow label={loanTypeFilter === LoanType.GIVEN ? 'Father/Husband' : 'Contact Person'} value={selectedLoan.fatherHusbandName || 'N/A'} />
                      {loanTypeFilter === LoanType.GIVEN ? (
                        <>
                          <DetailRow label="Occupation" value={selectedLoan.occupation || 'N/A'} />
                          <DetailRow label="DOB" value={selectedLoan.dob || 'N/A'} />
                          <DetailRow label="Age" value={selectedLoan.age?.toString() || 'N/A'} />
                        </>
                      ) : (
                        <DetailRow label="Phone" value={selectedLoan.phone || 'N/A'} />
                      )}
                      <DetailRow label={loanTypeFilter === LoanType.GIVEN ? 'Aadhaar' : 'GST/Reg No'} value={selectedLoan.aadhaar || 'N/A'} />
                      <DetailRow label="PAN" value={selectedLoan.pan || 'N/A'} />
                    </div>
                  </div>

                  {/* Loan Account Details Card (Taken Only) */}
                  {loanTypeFilter === LoanType.TAKEN && (
                    <div className="bg-white rounded-2xl border border-orange-200 shadow-sm overflow-hidden flex flex-col">
                      <div className="px-4 py-3 bg-orange-50 border-b border-orange-100 flex items-center gap-2">
                        <div className="p-1.5 bg-orange-600 text-white rounded-lg">
                          <FileText size={14} />
                        </div>
                        <h4 className="text-[10px] font-bold text-orange-700 uppercase tracking-wider">Loan Account Details</h4>
                      </div>
                      <div className="p-4 space-y-3 flex-1">
                        <DetailRow label="Account Number" value={selectedLoan.loanAccountNumber || 'N/A'} />
                        <DetailRow label="Sanction Date" value={selectedLoan.sanctionDate || 'N/A'} />
                        <DetailRow label="Sanction Amount" value={selectedLoan.sanctionAmount ? `₹${selectedLoan.sanctionAmount.toLocaleString()}` : 'N/A'} />
                      </div>
                    </div>
                  )}

                  {/* Bank Details Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${loanTypeFilter === LoanType.GIVEN ? 'bg-brand-100 text-brand-600' : 'bg-orange-100 text-orange-600'}`}>
                        <Landmark size={14} />
                      </div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        {loanTypeFilter === LoanType.GIVEN ? 'Bank Details' : 'Repayment Account'}
                      </h4>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                      <DetailRow label="Bank Name" value={selectedLoan.bankName || 'N/A'} />
                      <DetailRow label="A/C No" value={selectedLoan.accountNumber || 'N/A'} />
                      <DetailRow label="IFSC" value={selectedLoan.ifscCode || 'N/A'} />
                    </div>
                  </div>

                  {/* Loan Terms Card */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                      <div className="p-1.5 bg-orange-100 text-orange-600 rounded-lg">
                        <Calendar size={14} />
                      </div>
                      <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Loan Terms</h4>
                    </div>
                    <div className="p-4 space-y-3 flex-1">
                      <DetailRow label="Start Date" value={selectedLoan.startDate} />
                      <DetailRow label="Duration" value={`${selectedLoan.durationMonths} Months`} />
                      <DetailRow label="Monthly EMI" value={`₹${Accounting.formatIndian(selectedLoan.monthlyEMI || 0)}`} />
                      <DetailRow label="Collateral Type" value={selectedLoan.collateralType || 'None'} />
                    </div>
                  </div>
                </div>

                {/* Section: Guarantor Profiles (Lending Only) */}
                {loanTypeFilter === LoanType.GIVEN && selectedLoan.guarantors && selectedLoan.guarantors.some(g => g.name) && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center mb-4">
                      <Shield size={14} className="mr-2 text-brand-600" /> Guarantor Profiles
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedLoan.guarantors.filter(g => g.name).map((guarantor, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm font-bold text-slate-800">{guarantor.name}</p>
                            <span className="text-[8px] font-bold bg-slate-100 px-1.5 py-0.5 rounded uppercase">{guarantor.relation}</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <p className="text-slate-500">Phone: <span className="text-slate-700 font-bold">{guarantor.phone}</span></p>
                            <p className="text-slate-500">Aadhaar: <span className="text-slate-700 font-bold">{guarantor.aadhaar}</span></p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs font-bold text-slate-400 uppercase mb-2">Notes</p>
                  <p className="text-sm text-slate-600 italic">
                    {selectedLoan.notes || 'No additional notes provided for this loan.'}
                  </p>
                </div>

                {/* Documents Section - Grid with Overlays */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-bold text-slate-400 uppercase flex items-center">
                      <File size={14} className={`mr-2 ${loanTypeFilter === LoanType.GIVEN ? 'text-brand-600' : 'text-orange-600'}`} /> {loanTypeFilter === LoanType.GIVEN ? 'Borrower' : 'Lender'} Documents & Attachments
                    </p>
                    <Link 
                      to={selectedLoan.loanType === LoanType.GIVEN ? "/add-lending-loan" : "/add-borrowing-loan"} 
                      className="text-[10px] font-bold text-brand-600 hover:underline flex items-center"
                    >
                      <Plus size={10} className="mr-1" /> Manage Docs
                    </Link>
                  </div>
                  
                  {selectedLoan.documents && selectedLoan.documents.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {selectedLoan.documents.map((doc) => (
                        <div 
                          key={doc.id} 
                          className="group relative bg-white p-2 rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-md transition-all text-center"
                        >
                          <div className="aspect-square bg-slate-50 rounded-lg flex items-center justify-center mb-2 overflow-hidden relative group-hover:bg-slate-100 transition-colors">
                            <FileText size={32} className="text-slate-300 group-hover:scale-110 transition-transform duration-300" />
                            
                            {/* Overlay Controls */}
                            <div className="absolute inset-0 bg-brand-900/40 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-2">
                              <button 
                                onClick={() => {
                                  const win = window.open();
                                  if (win) {
                                    win.document.title = doc.name;
                                    if ((doc.fileType || '').startsWith('image/')) {
                                      win.document.write(`<html><body style="margin:0; display:flex; align-items:center; justify-content:center; background:#1a1a1a;"><img src="${doc.fileData}" style="max-width:100%; max-height:100%; object-fit:contain;"></body></html>`);
                                    } else {
                                      win.document.write(`<html><body style="margin:0;"><embed src="${doc.fileData}" type="${doc.fileType}" width="100%" height="100%"></body></html>`);
                                    }
                                  }
                                }}
                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-brand-600 hover:bg-brand-50 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                                title="View"
                              >
                                <Eye size={16} />
                              </button>
                              <a 
                                href={doc.fileData} 
                                download={doc.name}
                                className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-50 shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                                title="Download"
                              >
                                <Download size={16} />
                              </a>
                            </div>
                          </div>
                          
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-800 truncate mb-0.5 text-center">{doc.name}</p>
                            <p className="text-[8px] text-slate-500 uppercase font-medium tracking-tight text-center">{(doc.fileType || 'file').split('/')[1]}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-8 flex flex-col items-center justify-center bg-white/50 rounded-xl border border-dashed border-slate-200">
                      <FileText size={24} className="text-slate-300 mb-2" />
                      <p className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">No documents uploaded</p>
                    </div>
                  )}
                </div>
                
                {/* Extra spacing at bottom */}
                <div className="h-10"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex flex-col gap-0.5">
    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{label}</span>
    <span className="text-xs font-bold text-slate-700 break-words">{value}</span>
  </div>
);
