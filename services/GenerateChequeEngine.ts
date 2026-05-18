
/**
 * GENERATE CHECK ENGINE
 * 
 * Provides layout coordinates and logic for printing on standard CTS-2010 checks.
 * Dimensions: 203mm x 95mm (8" x 3.75")
 */

export interface ChequeField {
  x: number; // in mm
  y: number; // in mm
  width?: number; // in mm
  fontSize?: number; // in pt
  fontWeight?: string;
  letterSpacing?: string;
}

export interface ChequeLayout {
  date: ChequeField;
  payee: ChequeField;
  amountInWords: ChequeField;
  amountInWordsLine2: ChequeField;
  amountInFigures: ChequeField;
  accountNumber?: ChequeField;
  bearerStrike?: ChequeField;
}

export const STANDARD_CHEQUE_LAYOUT: ChequeLayout = {
  date: { x: 153, y: 7.5, letterSpacing: '4.8mm', fontSize: 13, fontWeight: 'bold' },
  payee: { x: 22, y: 19, width: 145, fontSize: 12, fontWeight: 'bold' },
  amountInWords: { x: 28, y: 32, width: 145, fontSize: 10, fontWeight: 'bold' },
  amountInWordsLine2: { x: 15, y: 40, width: 145, fontSize: 10, fontWeight: 'bold' },
  amountInFigures: { x: 165, y: 41, fontSize: 13, fontWeight: 'bold' },
  bearerStrike: { x: 178, y: 19, width: 22 }, // Location to strike "Or Bearer" if needed
};

export const GenerateChequeEngine = {
  numberToWords: (num: number): string => {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty ', 'Thirty ', 'Forty ', 'Fifty ', 'Sixty ', 'Seventy ', 'Eighty ', 'Ninety '];

    const convert = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + a[n % 10];
      if (n < 1000) return a[Math.floor(n / 100)] + 'Hundred ' + convert(n % 100);
      if (n < 100000) return convert(Math.floor(n / 1000)) + 'Thousand ' + convert(n % 1000);
      if (n < 10000000) return convert(Math.floor(n / 100000)) + 'Lakh ' + convert(n % 100000);
      return convert(Math.floor(n / 10000000)) + 'Crore ' + convert(n % 10000000);
    };

    const n = Math.floor(num);
    if (n === 0) return 'Zero';
    
    const str = convert(n);
    return str.replace(/\s+/g, ' ').trim();
  },

  formatDateForCheque: (dateStr: string): string => {
    // Format: DDMMYYYY
    const d = new Date(dateStr);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear().toString();
    return day + month + year;
  },

  splitAmountInWords: (words: string, maxLength: number = 45): { line1: string; line2: string } => {
    if (words.length <= maxLength) {
      return { line1: words, line2: '' };
    }
    
    // Find last space before maxLength
    let lastSpace = words.lastIndexOf(' ', maxLength);
    if (lastSpace === -1) lastSpace = maxLength;
    
    return {
      line1: words.substring(0, lastSpace),
      line2: words.substring(lastSpace).trim()
    };
  }
};
