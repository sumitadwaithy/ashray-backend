
/**
 * ACCOUNTING ENGINE
 * 
 * JavaScript numbers are IEEE 754 floating point, which causes errors like 0.1 + 0.2 = 0.30000000000000004.
 * In a financial ledger, this is unacceptable.
 * 
 * This service handles all arithmetic by converting to integers (Paisa/Cents), 
 * performing the operation, and converting back.
 */

export const Accounting = {
  // Convert to integer (avoiding floating point shift errors)
  toInt: (num: number): number => Math.round((num + Number.EPSILON) * 100),
  
  // Convert back to float
  toFloat: (int: number): number => int / 100,

  // Precise Addition
  add: (a: number, b: number): number => {
    const intA = Math.round((a + Number.EPSILON) * 100);
    const intB = Math.round((b + Number.EPSILON) * 100);
    return (intA + intB) / 100;
  },

  // Precise Subtraction
  subtract: (a: number, b: number): number => {
    const intA = Math.round((a + Number.EPSILON) * 100);
    const intB = Math.round((b + Number.EPSILON) * 100);
    return (intA - intB) / 100;
  },

  // Precise Multiplication (e.g. for Interest calculations)
  multiply: (amount: number, factor: number): number => {
    // Logic: (Amount * 100) * Factor / 100
    const intAmount = Math.round((amount + Number.EPSILON) * 100);
    return Math.round(intAmount * factor) / 100;
  },

  // Format as Currency string (Indian Standard)
  formatMoney: (amount: number): string => {
    if (amount == null || isNaN(amount)) return '0.00';
    return amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  },

  // Format as Compact Indian Currency (e.g. 1.44 Cr, 12.5 Lakh)
  formatIndian: (amount: number): string => {
    if (amount == null || isNaN(amount)) return '0.00';
    const absAmount = Math.abs(amount);
    const sign = amount < 0 ? '-' : '';
    
    if (absAmount >= 10000000) {
      return `${sign}${(absAmount / 10000000).toFixed(2)} Cr`;
    } else if (absAmount >= 100000) {
      return `${sign}${(absAmount / 100000).toFixed(2)} Lakh`;
    }
    
    return `${sign}${absAmount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  },

  // Format as Indian Words (e.g. One Crore Forty Four Lakh)
  formatIndianWords: (amount: number): string => {
    if (amount == null || isNaN(amount)) return 'Zero';
    if (amount === 0) return 'Zero';
    
    const a = [
      '', 'One', 'Two', 'Three', 'Four',
      'Five', 'Six', 'Seven', 'Eight', 'Nine',
      'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen',
      'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
    ];
    const b = [
      '', '', 'Twenty', 'Thirty', 'Forty',
      'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'
    ];

    const numToWords = (n: number, suffix: string): string => {
      let str = '';
      if (n > 19) {
        str += b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      } else {
        str += a[n];
      }
      return str ? str + ' ' + suffix + ' ' : '';
    };

    const absAmount = Math.floor(Math.abs(amount));
    const isNegative = amount < 0;

    let res = '';
    res += numToWords(Math.floor((absAmount / 10000000) % 100), 'Crore');
    res += numToWords(Math.floor((absAmount / 100000) % 100), 'Lakh');
    res += numToWords(Math.floor((absAmount / 1000) % 100), 'Thousand');
    res += numToWords(Math.floor((absAmount / 100) % 10), 'Hundred');
    
    if (absAmount > 100 && absAmount % 100 > 0) {
      res += 'and ';
    }
    
    res += numToWords(absAmount % 100, '');

    res = res.trim();
    if (isNegative) res = 'Minus ' + res;

    return res;
  },

  // Get Debit/Credit Suffix
  formatDrCr: (amount: number): string => {
    if (amount == null || isNaN(amount)) return '₹0.00';
    const absVal = Math.abs(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    if (amount === 0) return '₹0.00';
    return `₹${absVal} ${amount < 0 ? 'Dr' : 'Cr'}`;
  }
};
