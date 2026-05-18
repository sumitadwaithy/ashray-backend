import { vi } from 'vitest';

const hindiMap: Record<string, string> = {
  'Ashray Group': 'आश्रय ग्रुप',
  'Pvt. Ltd.': 'प्रा. लि.',
  'ABC Project': 'एबीसी प्रोजेक्ट',
  'Engineer': 'इंजीनियर',
  'Male': 'पुरुष',
  'Female': 'महिला',
  'Nagpur': 'नागपुर',
  'Maharashtra': 'महाराष्ट्र',
  'Sadar': 'सदर',
  'Teacher': 'शिक्षक',
  'Student': 'छात्र',
  'Ramesh Sharma': 'रमेश शर्मा',
};

const marathiMap: Record<string, string> = {
  'Ashray Group': 'आश्रय ग्रुप',
  'Pvt. Ltd.': 'प्रा. लि.',
  'ABC Project': 'एबीसी प्रकल्प',
  'Engineer': 'अभियंता',
  'Nagpur': 'नागपूर',
  'Maharashtra': 'महाराष्ट्र',
  'Ramesh Sharma': 'रमेश शर्मा',
};

const digits = (str: string) => str.replace(/[0-9]/g, d => '०१२३४५६७८९'[Number(d)]);

function mkConvert(map: Record<string, string>) {
  return vi.fn((input: any) => {
    if (!input) return '';
    if (typeof input === 'object' && input !== null) return String(input.hi || input.mr || input.en || '');
    return map[String(input)] || String(input);
  });
}

function mkNumberConvert() {
  return vi.fn((v?: number | string) => !v ? '' : digits(String(v)));
}

function mkNameWithTitle(map: Record<string, string>, titleMap: Record<string, string>) {
  return vi.fn((name?: string, title?: string) => {
    if (!name) return '';
    const t = title?.toLowerCase().replace('.', '').trim() || '';
    return `${titleMap[t] || title || ''} ${map[name] || name}`.trim();
  });
}

function mkAadhaar() {
  return vi.fn((aadhaar?: string) => {
    if (!aadhaar) return '';
    return digits(String(aadhaar).replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').trim());
  });
}

function mkGender(map: Record<string, string>) {
  return vi.fn((g?: string) => map[g || ''] || g || '');
}

// These mocks must be hoisted before imports. vitest.mock() auto-hoists.
const hindiExports = {
  convertToHindi: mkConvert(hindiMap),
  convertNumberToHindi: mkNumberConvert(),
  convertNameWithTitle: mkNameWithTitle(hindiMap, { mr: 'श्री', mrs: 'श्रीमती', miss: 'कुमारी', ms: 'सुश्री' }),
  formatAadhaarHindi: mkAadhaar(),
  convertGender: mkGender(hindiMap),
  learnWord: vi.fn(),
  learnWords: vi.fn(),
  exportMemory: vi.fn(() => ({})),
  importMemory: vi.fn(),
  resetHindiEngine: vi.fn(),
};

const marathiExports = {
  convertToMarathi: mkConvert(marathiMap),
  convertNumberToMarathi: mkNumberConvert(),
  convertNameWithTitle: mkNameWithTitle(marathiMap, { mr: 'श्री', mrs: 'श्रीमती', miss: 'कु', ms: 'सौ' }),
  formatAadhaarMarathi: mkAadhaar(),
  convertGender: mkGender(marathiMap),
  learnWord: vi.fn(),
  learnWords: vi.fn(),
  exportMemory: vi.fn(() => ({})),
  importMemory: vi.fn(),
  resetMarathiEngine: vi.fn(),
};

const printPreviewMock = { PrintFooter: () => null };

// Mock all possible import paths
vi.mock('/Users/sumitadwaithy/Local Sites/Ashray-Group-Ledger-main/src/engine/EnglishToHindiEngine', () => hindiExports);
vi.mock('/Users/sumitadwaithy/Local Sites/Ashray-Group-Ledger-main/src/engine/EnglishToMarathiEngine', () => marathiExports);
vi.mock('/Users/sumitadwaithy/Local Sites/Ashray-Group-Ledger-main/components/Printpreview', () => printPreviewMock);

export { hindiExports, marathiExports };