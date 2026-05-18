import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Transaction } from '../types';

export function extractPartyName(p: string): string | null {
  const obMatch = p.match(/Opening Balance Payment.*? \(([^)]+)\)$/);
  if (obMatch) return obMatch[1];
  const toMatch = p.match(/^To (.*?) [-–]/);
  if (toMatch) return toMatch[1];
  const fromMatch = p.match(/^From (.*?)(?:\s*[-–(]|$)/);
  if (fromMatch) return fromMatch[1];
  const byMatch = p.match(/^By (.*?) [-–]/);
  if (byMatch) return byMatch[1];
  const salaryMatch = p.match(/^Salary Paid to (.*?) [-–]/);
  if (salaryMatch) return salaryMatch[1];
  const tokenMatch = p.match(/from (.*?)$/i);
  if (p.includes('Booking Token Amount Received') && tokenMatch) return tokenMatch[1];
  const loanDbMatch = p.match(/^Loan Disbursement - (.*?)$/);
  if (loanDbMatch) return loanDbMatch[1];
  const loanTkMatch = p.match(/^Loan Taken - (.*?)$/);
  if (loanTkMatch) return loanTkMatch[1];
  const chequeMatch = p.match(/^Cheque Payment to (.*?)(?:\s*\(|$)/);
  if (chequeMatch) return chequeMatch[1];
  const parenMatch = Array.from(p.matchAll(/\(([^)]+)\)/g)).find((m: any) => {
    const lower = m[1].toLowerCase();
    return !lower.includes('no:') && !lower.includes('cheque') && !lower.includes('chq') && !lower.includes('payment') && !lower.includes('cash') && !lower.includes('%');
  });
  if (parenMatch) return parenMatch[1];
  return null;
}

export const TransactionPartyLink: React.FC<{ tx: Transaction, className?: string }> = ({ tx, className }) => {
  const navigate = useNavigate();
  
  let url = '';
  let state: any = undefined;
  if (tx.clientId) {
    url = `/clients/${encodeURIComponent(tx.clientId)}`;
  } else if (tx.kissanId) {
    url = `/kissan-khata/${encodeURIComponent(tx.kissanId)}`;
    if (tx.ownerId) {
      state = { ownerId: tx.ownerId };
    }
  } else if (tx.investorId) {
    url = `/investors/${encodeURIComponent(tx.investorId)}`;
  } else if (tx.staffId) {
    url = `/staff-ledger`;
    state = { staffId: tx.staffId };
  }

  const { particulars } = tx;

  if (url) {
    const name = tx.partyName || extractPartyName(particulars || '');
    
    if (name && (particulars || '').includes(name)) {
      const index = particulars.indexOf(name);
      const before = particulars.substring(0, index);
      const after = particulars.substring(index + name.length);
      
      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (state) navigate(url, { state });
        else navigate(url);
      };

      return (
        <span className={className}>
          {before}
          <button 
            type="button"
            onClick={handleClick}
            className="text-brand-600 hover:text-brand-800 hover:underline font-bold transition-colors inline cursor-pointer break-words"
          >
            {name}
          </button>
          {after}
        </span>
      );
    } else {
      const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (state) navigate(url, { state });
        else navigate(url);
      };
      
      return (
        <span className={className}>
          <button 
            type="button"
            onClick={handleClick}
            className="hover:text-brand-800 hover:underline transition-colors inline cursor-pointer text-left break-words"
          >
            {particulars}
          </button>
        </span>
      );
    }
  }

  return <span className={className}>{particulars}</span>;
}
