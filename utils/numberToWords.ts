export function numberToWords(num: number): string {
  if (isNaN(num)) return 'Zero';
  if (num === 0) return 'Zero';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convertLessThan1000 = (n: number): string => {
    if (n === 0) return '';
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + convertLessThan1000(n % 100) : '');
  };

  const convert = (n: number): string => {
    if (n === 0) return '';
    const crore = Math.floor(n / 10000000);
    const lakh = Math.floor((n % 10000000) / 100000);
    const thousand = Math.floor((n % 100000) / 1000);
    const hundred = n % 1000;

    let result = '';
    if (crore) result += convertLessThan1000(crore) + ' Crore ';
    if (lakh) result += convertLessThan1000(lakh) + ' Lakh ';
    if (thousand) result += convertLessThan1000(thousand) + ' Thousand ';
    if (hundred) result += convertLessThan1000(hundred);
    return result.trim();
  };

  const whole = Math.floor(num);
  const decimal = Math.round((num - whole) * 100);

  let result = convert(whole);
  if (result === '') result = 'Zero';

  if (decimal > 0) {
    result += ' and ' + convert(decimal) + ' Paise';
  }

  return result;
}