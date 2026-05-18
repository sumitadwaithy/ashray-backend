import React from 'react';
import {
  convertToHindi,
  convertNumberToHindi,
  convertNameWithTitle,
  formatAadhaarHindi,
} from '../../../engine/EnglishToHindiEngine';
import { PrintFooter } from '../../../../components/Printpreview';

// =========================
// SELLER PERSON (ONE OF UP TO 4)
// =========================
export interface SellerPerson {
  salutation?: string;
  name: string;
  age: string;
  occupation: string;
  aadhaar: string;
  pan: string;
  phone: string;
}

// =========================
// BUYER (PARTY 01)
// =========================
export interface BuyerData {
  title?: string;
  name: string;
  age: string;
  occupation: string;
  address: string;
  locality?: string;
  district?: string;
  state?: string;
  pincode?: string;
  aadhaar: string;
  pan: string;
  phone: string;
}

// =========================
// LAND (PROPERTY)
// =========================
export interface LandData {
  landName?: string;
  mauza: string;           // मौज़ा (village name)
  mauzaHindi?: string;     // मौज़ा in Devanagari (if already provided)
  phHalkaNo: string;       // प. ह. नं. (Patwar Halka No.)
  khataNo: string;         // खाते क्रमांक
  khasraNo: string;        // ख़सरा नं.
  areaHectare: string;     // area in he. ar.
  akarni?: string;         // अकारणी (uncultivated)
  tehsil: string;
  district: string;
  state: string;
  pincode: string;

  // Boundaries (khasra numbers of neighbours)
  eastKhasra: string;
  westKhasra: string;
  northKhasra: string;
  southKhasra: string;
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
  companyAddress?: string;
  companyLocality?: string;
  companyDistrict?: string;
  companyState?: string;
  companyPincode?: string;
}

// =========================
// MANAGER (SELLER PERSON)
// =========================
interface ManagerData {
  managerName?: string;
  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;
}

// =========================
// PAYMENT ENTRY
// =========================
export interface PaymentEntry {
  amount: number;
  amountWords: string;
  mode: 'Cash' | 'Cheque' | 'UPI' | 'NEFT' | 'RTGS' | 'Other';
  referenceNo?: string;      // cheque / UPI / txn no.
  bank?: string;             // for cheque
  date: string;              // YYYY-MM-DD
  receivedBy: string;        // name of seller who received
}

// =========================
// SCHEDULED FUTURE PAYMENT
// =========================
export interface ScheduledPayment {
  label: string;           // e.g. "अगस्त २०२६"
  perSellerAmount: number;
  sellerCount: number;
  totalAmount: number;
}

// =========================
// FULL AGREEMENT DATA
// =========================
export interface HindiKhetiZameenAgreementData {
  agreementDate: string;     // YYYY-MM-DD
  agreementDay?: {
    hi: string;
  };

  buyer: BuyerData;

  sellers: SellerPerson[];          // 1–4 sellers
  sellersCommonAddress: string;     // shared address of sellers
  sellersCommonAddressHindi?: string;

  land: LandData;

  totalAmount: number;
  totalAmountWords: string;
  ratePerAcre: number;
  ratePerAcreWords: string;

  paidTotal: number;
  paidTotalWords: string;
  paidUptoDate: string;             // YYYY-MM-DD

  payments: PaymentEntry[];         // itemised received payments

  remainingAmount: number;
  remainingAmountWords: string;
  registryMaxMonths: number;        // max months to complete registry

  scheduledPayments: ScheduledPayment[];

  // Account for online payments
  accountHolderName: string;        // e.g. "ममता केशलाल पटले"
  companyName?: string;             // e.g. "आश्रय ग्रुप"
  accountNo: string;
  bank: string;
  branch: string;

  // Token letter date reference
  tokenLetterDate: string;          // e.g. "29/01/2026"

  kissanId?: string;
  folderSerial?: string;
  company?: CompanyData;
  manager?: ManagerData;
}

// =========================
// TEMPLATE PROPS
// =========================
interface TemplateProps {
  data: HindiKhetiZameenAgreementData;
  companyLogo?: string;
  companyWatermark?: string;
}

// =========================
// HELPERS
// =========================
const formatHindiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
    const day = convertNumberToHindi(date.getDate());
    const month = convertNumberToHindi(date.getMonth() + 1);
    const year = convertNumberToHindi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

const HINDI_ORDINALS = [
  '', 'एक', 'दो', 'तीन', 'चार', 'पाँच',
  'छह', 'सात', 'आठ', 'नौ', 'दस',
];

const sellerOrdinal = (n: number): string =>
  HINDI_ORDINALS[n] ?? convertNumberToHindi(n);

// Devanagari numerals for section numbers
const DEVA_NUM: Record<number, string> = {
  0: '०', 1: '१', 2: '२', 3: '३', 4: '४', 5: '५',
  6: '६', 7: '७', 8: '८', 9: '९', 10: '१०',
};

const paymentModeHindi = (mode: PaymentEntry['mode'], refNo?: string, bank?: string): string => {
  if (mode === 'UPI') return `गूगल पे UPI नं.-${refNo || '___'}`;
  if (mode === 'Cheque') return `${bank || 'HDFC'} बैंक चेक नं.-${refNo || '___'}`;
  if (mode === 'Cash') return 'कॅश';
  if (mode === 'NEFT' || mode === 'RTGS') return `${mode} ट्रान्सफर नं.-${refNo || '___'}`;
  return convertToHindi(mode);
};

// =========================
// WATERMARK
// =========================
const Watermark = ({ logo, watermark }: { logo?: string; watermark?: string }) => (
  <div
    style={{
      position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      opacity: 0.07, zIndex: 0, pointerEvents: 'none',
    }}
  >
    <img
      src={watermark || logo || ''}
      style={{ width: '70%', maxWidth: '720px', height: 'auto', objectFit: 'contain' }}
    />
  </div>
);

// =========================
// PAGE TITLE
// =========================
const PageTitle = () => (
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">
      विक्री का करारनामा
    </h2>
  </div>
);

// =========================
// MAIN COMPONENT
// =========================
const HindiKhetiZameenAgreement: React.FC<TemplateProps> = ({ data, companyLogo, companyWatermark }) => {
  const safeData: HindiKhetiZameenAgreementData = {
    ...data,
    company: data.company ?? {},
    manager: data.manager ?? {},
    sellers: data.sellers ?? [],
    payments: data.payments ?? [],
    scheduledPayments: data.scheduledPayments ?? [],
  };

  const {
    agreementDate, agreementDay, buyer, sellers, sellersCommonAddress,
    sellersCommonAddressHindi, land, totalAmount, totalAmountWords,
    ratePerAcre, ratePerAcreWords, paidTotal, paidTotalWords, paidUptoDate,
    payments, remainingAmount, remainingAmountWords, registryMaxMonths,
    scheduledPayments, accountHolderName, companyName, accountNo, bank, branch,
    tokenLetterDate, company, manager, folderSerial
  } = safeData;

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{`
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto 20px;
          background: white;
          padding: 20mm 20mm 18mm;
          box-sizing: border-box;
          page-break-after: always;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          display: block;
          position: relative;
        }
        @media print {
          .a4-page { margin: 0 auto; box-shadow: none; }
          .no-print { display: none !important; }
        }
        .underline-field {
          border-bottom: 1px solid #000;
          min-height: 20px;
          display: inline-block;
        }
        .section-body {
          white-space: pre-line;
          font-size: 14.5px;
          line-height: 1.95;
          text-align: justify;
        }
      `}</style>

      <div
        className="flex flex-col items-center gap-8 text-slate-900"
        style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}
      >

        {/* ══════════════════════════════════════════
            PAGE 1 — COVER / TITLE PAGE
        ══════════════════════════════════════════ */}
        <div className="a4-page">
          {/* Stamp paper space */}
          <div className="h-[260px]" />

          {/* Main Title */}
          <div className="text-center mb-10">
            <p className="text-[13px] font-semibold tracking-wide mb-1">अचल संपत्ति</p>
            <h1 className="text-[26px] font-extrabold underline decoration-double mb-2">
              खेती-ज़मीन का विक्री का करारनामा
            </h1>
          </div>

          {/* Summary Box */}
          <div className="border-2 border-black p-5 text-[14px] leading-[2.1] space-y-1">
            <div className="flex gap-2">
              <span className="font-bold w-48 shrink-0">सौदा किमत रुपये :-</span>
              <span className="underline-field flex-1">
                {totalAmount ? `${convertNumberToHindi(totalAmount)}/-` : ''}
              </span>
              <span className="text-[13px]">
                ({totalAmountWords ? `${convertToHindi(totalAmountWords)} रुपये मात्र` : ''})
              </span>
            </div>

            <div className="flex gap-2">
              <span className="font-bold w-48 shrink-0">गाव / मौज़ा :-</span>
              <span className="underline-field flex-1">
                {land.landName ? convertToHindi(land.landName) : (land.mauzaHindi || convertToHindi(land.mauza))}
              </span>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <span className="font-bold">प.ह.नं. :-</span>
                <span className="underline-field w-20">{convertNumberToHindi(land.phHalkaNo)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">खाते क्र. :-</span>
                <span className="underline-field w-16">{convertNumberToHindi(land.khataNo)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">ख़सरा नं. :-</span>
                <span className="underline-field w-20">{convertNumberToHindi(land.khasraNo)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">आराजी :-</span>
                <span className="underline-field w-20">{convertNumberToHindi(land.areaHectare)} हे. आर.</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <div className="flex gap-2">
                <span className="font-bold">तहसील :-</span>
                <span className="underline-field w-28">{convertToHindi(land.tehsil)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">जिल्हा :-</span>
                <span className="underline-field w-24">{convertToHindi(land.district)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">राज्य :-</span>
                <span className="underline-field w-24">{convertToHindi(land.state)}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-bold">पिन :-</span>
                <span className="underline-field w-20">{convertNumberToHindi(land.pincode)}</span>
              </div>
            </div>
          </div>

          {/* Party 1 (Buyer) — Company / Manager */}
          <div className="mt-8 text-[14px]">
            <p className="font-bold mb-3">पक्ष नं.-०१ (करारनामा लिखकर लेने वाला) :-</p>
            <div className="pl-4 space-y-2">
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">१. नाम :-</span>
                <span className="underline-field flex-1 text-[13.5px]">
                  {convertNameWithTitle('', manager?.managerName || buyer.name)} ({manager?.managerPosition || convertToHindi(buyer.occupation)})
                  {company?.companyName ? ` के लिए ${convertToHindi(company.companyName)}` : ''}
                  {company?.entityType ? ` (${convertToHindi(company.entityType)})` : ''}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">पता :-</span>
                <span className="underline-field flex-1 text-[13.5px]">
                  {convertToHindi([
                    company?.companyAddress || buyer.address,
                    company?.companyLocality || buyer.locality,
                    company?.companyDistrict || buyer.district,
                    company?.companyState || buyer.state,
                    (company?.companyPincode || buyer.pincode) ? `पिन ${company?.companyPincode || buyer.pincode}` : null
                  ].filter(Boolean).join(', '))}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">आधार नं. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">{formatAadhaarHindi(manager?.managerAadhaar || buyer.aadhaar)}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">पैन नं. :-</span>
                <span className="underline-field flex-1 text-[13.5px] uppercase">{(manager?.managerPAN || company?.companyPan || buyer.pan || '')}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">मोबाइल फ़ोन क्र. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">
                  {manager?.managerPhone
                    ? `${convertNumberToHindi(manager.managerCountryCode || '91')} ${convertNumberToHindi(manager.managerPhone)}`
                    : convertNumberToHindi(buyer.phone)}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-52 shrink-0">लाइसेंस रजिस्ट्रेशन नं. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">{company?.licenseRegistrationNumber || ''}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">उद्यम / URC नं. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">{company?.urcNumber || ''}</span>
              </div>
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 2 — SELLERS (PARTY 02)
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            <div className="text-[14px] mb-6">
              <p className="font-bold mb-4">पक्ष नं.-०२ (करारनामा लिखकर देने वाला) :-</p>

              {sellers.map((seller, idx) => {
                const isFirst = idx === 0;
                const hasOthers = sellers.length > 1;
                const otherCount = sellers.length - 1;
                
                let nameDisplay = convertNameWithTitle('', seller.salutation ? `${seller.salutation} ${seller.name}` : seller.name);
                if (isFirst && hasOthers) {
                  nameDisplay += ` -व- अन्य - ${convertNumberToHindi(otherCount)}`;
                }

                return (
                  <div key={idx} className="mb-6 pl-4 border-l-2 border-brand-200">
                    <div className="space-y-2">
                      <div className="flex items-end gap-2">
                        <span className="font-bold w-44 shrink-0">{`${DEVA_NUM[idx + 1] || idx + 1}. नाम:-`}</span>
                        <span className="underline-field flex-1 text-[13.5px]">{nameDisplay}</span>
                      </div>
                      
                      <div className="flex items-end gap-2">
                        <span className="font-bold w-44 shrink-0">आयु:-</span>
                        <span className="underline-field flex-1 text-[13.5px]">
                          {`${convertNumberToHindi(seller.age)} वर्ष, व्यवसाय:- ${convertToHindi(seller.occupation)}`}
                        </span>
                      </div>

                      <div className="flex items-end gap-2">
                        <span className="font-bold w-44 shrink-0">आधार नंबर:-</span>
                        <span className="underline-field flex-1 text-[13.5px]">{formatAadhaarHindi(seller.aadhaar)}</span>
                      </div>

                      <div className="flex items-end gap-2">
                        <span className="font-bold w-44 shrink-0">पैन नंबर:-</span>
                        <span className="underline-field flex-1 text-[13.5px]">{seller.pan.toUpperCase()}</span>
                      </div>

                      <div className="flex items-end gap-2">
                        <span className="font-bold w-44 shrink-0">
                          {idx % 2 === 0 ? 'मोबाइल फ़ोन क्र:-' : 'ध्वनि क्र:-'}
                        </span>
                        <span className="underline-field flex-1 text-[13.5px]">{convertNumberToHindi(seller.phone)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Common address for all sellers */}
              <div className="mt-4 pl-4">
                <div className="flex items-start gap-2">
                  <span className="font-bold w-44 shrink-0 mt-1">
                    {sellers.length > 1 ? `${sellers.length > 2 ? 'सभी का' : 'दोनों का'} पता :-` : 'पता :-'}
                  </span>
                  <span className="underline-field flex-1 text-[13.5px]">
                    {sellersCommonAddressHindi || convertToHindi(sellersCommonAddress)}
                  </span>
                </div>
              </div>
            </div>

            {/* Clause 01 — Introduction */}
            <div className="section-body mt-6">
              {`०१.\tईस्वी सन ${convertNumberToHindi(new Date(agreementDate).getFullYear())} दिनांक ${formatHindiDate(agreementDate)} दिन ${agreementDay?.hi || '________'} को हम उपरोक्त दोनों पक्ष अपनी सम्पूर्ण राज़ी-ख़ुशी एवं पूर्ण प्रसन्नता से लाभ प्राप्त करने हेतु तथा पारिवारिक आवश्यकताएं पूर्ण करने हेतु यह विक्री का करारनामा का लेख लिखकर लेते और देते हैं जिसकी सम्पूर्ण जानकारी निम्न प्रकार हैI`}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 3 — LAND DETAILS + CLAUSE 02 & 03
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            <div className="section-body">
              {`०२.\tयह कि पक्ष नं.-०२ निम्न विवृत खेती-जमीन का सरकारी/निम्न्सरकारी एवं ७/१ तथा २/८ अ अनुसार सम्पूर्ण रूप से स्वामी तथा हर प्रकार से कब्ज़ा धारक हैंI और आज यह विक्री का करारनामा सह पूर्ण होने के दिन तक सम्पूर्ण खेती-जमीन सम्पूर्ण रूप से पक्ष नं.-०२ के कब्ज़े में है जिसका विवरण निम्न प्रकार हैI`}
            </div>

            {/* Land Details Box */}
            <div className="mt-5 border border-black p-4 text-[14px] space-y-3">
              <p className="font-bold underline mb-2">२.१) खेती-जमीन का विवरण :-</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {[
                  ['ख़सरा नंबर :-', convertNumberToHindi(land.khasraNo)],
                  ['खाते क्र. :-', convertNumberToHindi(land.khataNo)],
                  ['जिरायत :-', `${convertNumberToHindi(land.areaHectare)} हे. आर.`],
                  ['अकारणी :-', land.akarni ? convertNumberToHindi(land.akarni) : '___'],
                  ['मौज़ा :-', `${land.mauzaHindi || convertToHindi(land.mauza)} (${convertToHindi(land.mauza)})`],
                  ['तहसील :-', convertToHindi(land.tehsil)],
                  ['जिल्हा :-', convertToHindi(land.district)],
                  ['राज्य :-', convertToHindi(land.state)],
                  ['पिन :-', convertNumberToHindi(land.pincode)],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-1">
                    <span className="font-semibold">{label}</span>
                    <span className="underline-field min-w-[80px]">{value}</span>
                  </div>
                ))}
              </div>

              <p className="font-bold underline mt-4 mb-2">२.२) खेती ज़मीन की चातुर्सीमा :-</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['पूर्व में :-', `ख़सरा नं.- ${convertNumberToHindi(land.eastKhasra)}`],
                  ['पश्चिम में :-', `ख़सरा नं.- ${convertNumberToHindi(land.westKhasra)}`],
                  ['उत्तर में :-', `ख़सरा नं.- ${convertNumberToHindi(land.northKhasra)}`],
                  ['दक्षिण में :-', `ख़सरा नं.- ${convertNumberToHindi(land.southKhasra)}`],
                ].map(([dir, val]) => (
                  <div key={dir} className="flex gap-2">
                    <span className="font-semibold w-28 shrink-0">{dir}</span>
                    <span className="underline-field flex-1">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clause 03 */}
            <div className="section-body mt-5">
              {`०३.\tयह कि पक्ष नं.-०२ अपनी उपरोक्त विवृत सम्पूर्ण खेती-ज़मीन आज पक्ष नं.-०१ को सम्पूर्ण रूप से बेंचने का सौदा कर चुका हैं और साथ में सम्पूर्ण रूप से कब्जा भी दे चुका हैंI आज से पक्ष नं.-०१ उपरोक्त ज़मीन का सम्पूर्ण रूप से स्वामी तथा हर प्रकार से कब्जा धारक हैI एवं पक्ष नं.-०१ उपरोक्त खेती ज़मीन को पूर्ण या आंशिक रूप से विक्रय/दान/उपहार स्वरूप किसी को भी देने का लिखित में करारनामा कर सकता है और खेती ज़मीन में कुछ भी कार्य करने के लिए पूर्ण रूप से स्वतंत्र है और पक्ष नं.-०२ की ओर से किसी भी प्रकार से किसी भी कार्य के लिए किसी भी रूप में बाध्य नहीं हैंI`}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 4 — CLAUSE 04: PAYMENT DETAILS
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            <div className="section-body">
              {`०४.\tयह कि उपरोक्त विवृत सम्पूर्ण खेती-ज़मीन पक्ष नं.-०२ ने ${convertNumberToHindi(ratePerAcre)}/--(${convertToHindi(ratePerAcreWords)} मात्र) रुपया प्रति एकर की दर से बेच दिया है जिसकी समस्त कीमत ${convertNumberToHindi(totalAmount)}/--(${convertToHindi(totalAmountWords)} मात्र) रुपया है जिसमें से ${convertNumberToHindi(paidTotal)}/--(${convertToHindi(paidTotalWords)} मात्र) रुपया पक्ष नं.-०२ दिनांक:- ${formatHindiDate(paidUptoDate)} तक समस्त भुगतान नगदी, चेक एवं ई-ट्रान्सफर के माध्यम से प्राप्त कर चुका हैI जिसका सम्पूर्ण विवरण निम्न लिखित हैI:-`}
            </div>

            {/* Payment entries */}
            <div className="mt-4 space-y-3 text-[14px]">
              {payments.map((p, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-[1.85]">
                  <span className="font-bold shrink-0 w-12 text-right">{`${DEVA_NUM[idx + 1] || idx + 1}.`}</span>
                  <span>
                    रुपया {convertNumberToHindi(p.amount)}/-
                    &nbsp;({convertToHindi(p.amountWords)} मात्र{' '}
                    {paymentModeHindi(p.mode, p.referenceNo, p.bank)} के माध्यम से
                    दि.-{formatHindiDate(p.date)} को{' '}
                    {p.mode === 'UPI' || p.mode === 'Cash' || p.mode === 'Cheque'
                      ? `${convertNameWithTitle('', p.receivedBy)} के द्वारा`
                      : `${convertNameWithTitle('', p.receivedBy)} ने`}{' '}
                    प्राप्त किये कबूल एवं मान्य हैं)
                  </span>
                </div>
              ))}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 5 — CLAUSE 05 & 06: REMAINING + SCHEDULE
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Clause 05 */}
            <div className="section-body">
              {`०५.\tयह कि उपरोक्त भुगतान लेने के बाद बाकी बचा हुआ पैसा ${convertNumberToHindi(remainingAmount)}/--(${convertToHindi(remainingAmountWords)} मात्र) रुपया पक्ष नं.-०२ ज़मीन से सम्बंधित समस्त दस्तावेज़ सरकारी नियमानुसार रजिस्ट्री करने हेतु ठीक करेगा और इसी अन्तराल में ही ज़मीन की सरकारी मोजणी, पारिवारिक वाटणी इत्यादि समस्त आवश्यक कार्यवाही करके देने के बाद आपसी सहमति से निश्चित की गयी दिनांक पर रजिस्ट्री करके देने के दिन तक अधिकतम ${convertNumberToHindi(registryMaxMonths)}/--(${sellerOrdinal(registryMaxMonths)} मात्र) माह में प्राप्त करेगा तथा समस्त दस्तावेज़ सरकारी नियमानुसार ठीक होने से पहले किसी भी प्रकार का कोई भी भुगतान जोकि उपखंड ५.१ या उससे आगे का है नहीं किया जाएगा और पक्ष नं.-०२ भुगतान के लिए किसी भी प्रकार से कोई भी वाद-विवाद नहीं करेगाI शेष भुगतान का विवरण निम्न प्रकार हैI`}
            </div>

            {/* Scheduled payment table */}
            <div className="mt-4 border border-black text-[14px]">
              <div className="grid grid-cols-5 font-bold bg-gray-100 border-b border-black text-center">
                <div className="p-2 border-r border-black">उपखंड</div>
                <div className="p-2 border-r border-black">देय माह</div>
                <div className="p-2 border-r border-black">प्रति विक्रेता (₹)</div>
                <div className="p-2 border-r border-black">विक्रेता संख्या</div>
                <div className="p-2">कुल राशि (₹)</div>
              </div>
              {scheduledPayments.map((sp, idx) => (
                <div key={idx} className="grid grid-cols-5 text-center border-b border-gray-300">
                  <div className="p-2 border-r border-black font-semibold">
                    {`५.${DEVA_NUM[idx + 1] || idx + 1})`}
                  </div>
                  <div className="p-2 border-r border-black">{sp.label}</div>
                  <div className="p-2 border-r border-black">
                    {convertNumberToHindi(sp.perSellerAmount)}/-
                  </div>
                  <div className="p-2 border-r border-black">{convertNumberToHindi(sp.sellerCount)}</div>
                  <div className="p-2">{convertNumberToHindi(sp.totalAmount)}/-</div>
                </div>
              ))}
              {/* Total row */}
              <div className="grid grid-cols-5 text-center font-bold bg-yellow-50">
                <div className="p-2 border-r border-black col-span-3">कुल शेष भुगतान</div>
                <div className="p-2 border-r border-black">—</div>
                <div className="p-2">{convertNumberToHindi(remainingAmount)}/-</div>
              </div>
            </div>

            {/* Clause 06 */}
            <div className="section-body mt-5">
              {`०६.\tयह कि इस विक्री के करारनामे के आधार पर समस्त भुगतान जोकि ऑनलाइन, चेक, NEFT, RTGS एवं गूगल पे या अन्य समस्त माध्यमों से किए जाएंगे वह ${convertNameWithTitle('', accountHolderName)} या ${convertNameWithTitle('', accountHolderName)} के स्थान पर ${companyName ? convertToHindi(companyName) : '___'} नाम के चालू खाता नं.:-${accountNo} बैंक-${bank} शाखा ${branch} के माध्यम से किए जाएंगे अतः दोनों के द्वारा किए गए भुगतान मान्य किये जाएंगे इससे पक्ष नं.-०२ को किसी भी प्रकार की कोई भी समस्या नहीं है और न ही भविष्य में कोई समस्या उत्पन्न करेगाI`}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 6 — CLAUSE 07: TERMS & CONDITIONS (A)
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />
            <p className="font-bold text-[15px] mb-3">०७. करारनामे के नियम-व-शर्तें</p>

            <div className="section-body space-y-4">
              {[
                [
                  '७.१)',
                  `यह कि उपरोक्त खेती-ज़मीन की सरकारी मोजणी, भाग नकाशा, फेर फार पंजी, अधिकार अभिलेख इत्यादि समस्त कागज़ एवं समस्त पारिवारिक समस्याएं जो भी हैं या भविष्य में आती हैं तो उन समस्त का निपटारा पक्ष नं.-०२ ही करके देगा और मोजणी में जितनी खेती-ज़मीन भरेगी उसी के अनुसार सौदे के आधार पर पैसे का हक़दार होगा यदि सरकारी मोजणी में खेती-ज़मीन कम भर्ती है तो पक्ष नं.-०२ किसी भी प्रकार से ७/१२ पर वर्णित खेती-ज़मीन के आधार पर या उपरोक्त वर्णित खेती-ज़मीन के आधार पर पैसे के लिए किसी भी रूप से वाद-विवाद नहीं करेगाI`,
                ],
                [
                  '७.२)',
                  `यह कि उपरोक्त खेती-ज़मीन पर रजिस्ट्री की दिनांक तक के समस्त सरकारी कर, तबंधारे विभाग का कर और किसी भी प्रकार का बैंक क़र्ज़, गिर्वी, बख्शिश या अन्य किसी भी प्रकार के समस्त क़र्ज़ का जवाबदार पक्ष नं.-०२ ही है और इसका निपटारा भी हर स्थिति में पक्ष नं.-०२ ही करेगा यदि पक्ष नं.-०२ नहीं करता हैं तो पक्ष नं.-०१ सौदे के आधार पर बची हुई समस्त शेष राशि में से काट कर यह भुगतान करके समस्या का निदान करेगा और पक्ष नं.-०२ इसके लिए किसी भी रूप से कोई भी वाद-विवाद नहीं करेगाI`,
                ],
                [
                  '७.३)',
                  `यह कि पक्ष नं.-०२ ने उपरोक्त ज़मीन का सौदा इससे पहले किसी से भी नहीं किया है और न ही खेती-ज़मीन बेचने के नाम पर किसी भी अन्य व्यक्ति से कोई भी रकम प्राप्त किया है यदि भविष्य में ऐसा कोई भी मामला सामने आता है तो उसकी सम्पूर्ण जवाबदारी पक्ष नं.-०२ की होगी और उसका निपटारा भी हर अवस्था में पक्ष नं.-०२ ही करके देगाI यदि निपटारा नहीं होता है और उसके कारण सौदा रद्द होता है तो ${convertNumberToHindi(tokenLetterDate)} के टोकन पत्र सह विक्री के करारनामा के आधार पर समस्त भुगतान पक्ष नं.-०२, पक्ष नं.-०१ को रद्दीकरण के दिन ही वापस करेगा तभी रद्दीकरण मान्य होगाI`,
                ],
              ].map(([num, text]) => (
                <div key={num} className="flex gap-3">
                  <span className="font-bold shrink-0 w-12">{num}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 7 — CLAUSE 07: TERMS & CONDITIONS (B)
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            <div className="section-body space-y-4">
              {[
                [
                  '७.४)',
                  `यह कि यदि भविष्य में पक्ष नं.-०१ या पक्ष नं.-०२ में से किसी एक या दोनों को कुछ होता है तो इनके वारिस-दार इस विक्री के क़रारनामा एवं खेती-ज़मीन के कब्ज़े से पूर्ण रूप से अवगत हैं और इस विक्री के क़रारनामा एवं खेती ज़मीन के कब्ज़े से पूर्ण रूप से बंधित हैं अतः इस कार्य को इस विक्री के क़रारनामा के आधार पर पूर्ण करके लेंगे-देंगे यदि नहीं करते हैं तो पक्ष नं.-०१ के वारिसदार उपरोक्त ज़मीन की एक-तरफा रजिस्ट्री अपने नाम पर कर लेंगे परन्तु उपरोक्त तय अनुसार शेष भुगतान करना अनिवार्य होगा परन्तु यदि पक्ष नं.-०२ के वारिस-दार भुगतान नहीं लेते हैं तो पक्ष नं.-०१ के वारिसदार यह शेष भुगतान अपने नाम पर रजिस्ट्री करने के बाद सरकारी कोष में जमा करा देंगेI`,
                ],
                [
                  '७.५)',
                  `यह कि उपरोक्त नियमानुसार भुगतान पूर्ण होने के बाद उपरोक्त खेती-ज़मीन की रजिस्ट्री पक्ष नं.-०१ अपनी सुविधा के अनुसार अपने स्वयं के या ${companyName ? convertToHindi(companyName) : '___'} के किसी भी अन्य अधिकारी के नाम में कर सकता है इसके लिए पक्ष नं.-०२ पूर्ण रूप से सहमत है और भविष्य में किसी भी प्रकार की कोई समस्या या वाद-विवाद उत्पन्न नहीं करेगाI`,
                ],
                [
                  '७.६)',
                  `यह कि इस विक्री के क़रारनामा पत्र के बाद कोई भी बदलाव या फेर बदल केवल लिखित रूप में दोनों पक्षों के हस्ताक्षर और अंगूठे के बाद ही मान्य होगा किसी भी प्रकार की कोई फ़ोन कॉल, व्हाट्स एप, ई-मेल, या अन्य कोई भी माध्यम से की गयी वार्ता इस विक्री के क़रारनामा पर कोई प्रभाव नहीं डालेगीI`,
                ],
                [
                  '७.७)',
                  `यह कि यदि ऐसी स्थिति आती कि तय अनुसार समय पर भुगतान नहीं किया जाता है तो उपरोक्त खेती-ज़मीन पर पक्ष नं.-०२ का कब्ज़ा किसी भी रूप में मान्य नहीं होगा और इस स्थिति में दोनों पक्ष आपस में बैठ कर आपसी सहमति से मार्ग निकाल कर खंड ७ के उपखंड ७.६ के अनुसार भविष्य की नीति निर्धारित करेंगेI`,
                ],
                [
                  '७.८)',
                  `यह कि हम दोनों पक्ष पूर्ण रूप से स्वस्थ हैं और हमको किसी भी प्रकार की कोई भी मानसिक बीमारी नहीं है और न ही हम दोनों पक्षों ने किसी भी प्रकार का कोई नशा या अन्य मादक पदार्थ का सेवन किया हुआ हैI बाद में यदि कोई ऐसा बोलता है कि किसी बीमारी या नशे की हालत में लिख कर दिया/लिया तो वह भारतीय कानून की दंड नियमावली आधार पर दंड का भोगी होगाI`,
                ],
              ].map(([num, text]) => (
                <div key={num} className="flex gap-3">
                  <span className="font-bold shrink-0 w-12">{num}</span>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 8 — SIGNATURES
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Seller signatures */}
            <div className="mb-10">
              <p className="font-bold text-[15px] mb-6">
                ०८. पक्ष नं.-०२ (लिखकर देने वालों) के हस्ताक्षर एवं बाएं हाथ के अंगूठों के निशान :-
              </p>
              <div className={`grid gap-8 ${sellers.length <= 2 ? 'grid-cols-2' : 'grid-cols-2'}`}>
                {sellers.map((seller, idx) => (
                  <div key={idx} className="text-center">
                    {/* Thumb + signature space */}
                    <div className="h-20 border border-dashed border-gray-400 mb-2 flex items-end justify-center pb-2">
                      <span className="text-[11px] text-gray-400">अंगूठा / हस्ताक्षर</span>
                    </div>
                    <p className="font-semibold text-[13px]">
                      ({convertNameWithTitle('', seller.salutation ? `${seller.salutation} ${seller.name}` : seller.name)})
                    </p>
                    <p className="text-[12px] text-gray-600">
                      {idx === 0 ? 'विक्रेता प्र.' : 'विक्रेता'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer signature */}
            <div className="mb-10">
              <p className="font-bold text-[15px] mb-6">
                ०९. पक्ष नं.-०१ (लिखकर लेने वाला) के हस्ताक्षर एवं बाएं हाथ के अंगूठे का निशान :-
              </p>
              <div className="flex justify-center">
                <div className="text-center w-60">
                  <div className="h-20 border border-dashed border-gray-400 mb-2 flex items-end justify-center pb-2">
                    <span className="text-[11px] text-gray-400">अंगूठा / हस्ताक्षर</span>
                  </div>
<p className="font-semibold text-[13px]">
                      ({convertNameWithTitle(buyer.name, buyer.title)})
                  </p>
                  <p className="text-[12px] text-gray-600">
                    {companyName ? `प्रबंधक, ${convertToHindi(companyName)}` : 'क्रेता'}
                  </p>
                </div>
              </div>
            </div>

            {/* Witness signatures */}
            <div className="mb-8">
              <p className="font-bold text-[15px] mb-6">
                १०. गवाहों के हस्ताक्षर के हस्ताक्षर-व-अंगूठों के निशान :-
              </p>
              <div className="grid grid-cols-2 gap-12">
                {['(१०.१)', '(१०.२)'].map((n) => (
                  <div key={n} className="text-center">
                    <div className="h-20 border border-dashed border-gray-400 mb-2 flex items-end justify-center pb-2">
                      <span className="text-[11px] text-gray-400">अंगूठा / हस्ताक्षर</span>
                    </div>
                    <p className="font-semibold">{n} _________________________</p>
                  </div>
                ))}
              </div>
            </div>

            {/* END */}
            <div className="mt-16 text-center space-y-3">
              <p className="text-[20px] font-bold tracking-widest">* * *  समाप्त  * * *</p>
              <p className="text-[11px] font-mono text-gray-500 break-words">
                {folderSerial ? `${folderSerial}-${land.landName?.replace(/\s+/g, '-') || ''}-${land.mauza?.replace(/\s+/g, '-') || ''}-${land.khasraNo}-${land.tehsil}-${formatHindiDate(agreementDate).replace(/\//g, '-')}` : [
                  convertToHindi(land.mauza),
                  `खसरा-${land.khasraNo}`,
                  `खाता-${land.khataNo}`,
                  convertToHindi(land.tehsil),
                  convertToHindi(land.district),
                  convertToHindi(land.state),
                  land.pincode,
                  formatHindiDate(agreementDate),
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            </div>
          </div>
          <PrintFooter />
        </div>

      </div>
    </div>
  );
};

export default HindiKhetiZameenAgreement;


// =========================
// USAGE EXAMPLE (remove before prod)
// =========================
/*
const sampleData: KhetiAgreementData = {
  agreementDate: '2026-02-15',
  agreementDay: { hi: 'रविवार' },

  buyer: {
    name: 'Mamata Keshlal Patle',
    title: 'Smt.',
    age: '42',
    occupation: 'Business',
    address: 'Ward No. 5, Ashray Colony',
    locality: 'Mankapur',
    district: 'Nagpur',
    state: 'Maharashtra',
    pincode: '441013',
    aadhaar: '1234 5678 9012',
    pan: 'ABCDE1234F',
    phone: '9876543210',
  },

  sellers: [
    { name: 'Prayag Gangadhar Wankhede', age: '58', occupation: 'Krishi', aadhaar: '9876 5432 1098', pan: 'XYZPW1234G', phone: '9112345678' },
    { name: 'Usha Gangadhar Wankhede', age: '52', occupation: 'Grihini', aadhaar: '8765 4321 0987', pan: 'UVWUW5678H', phone: '9223456789' },
    { name: 'Prashant Gangadhar Wankhede', age: '34', occupation: 'Nokari', aadhaar: '7654 3210 9876', pan: 'MNOPW3456J', phone: '9334567890' },
    { name: 'Mahesh Gangadhar Wankhede', age: '30', occupation: 'Vyapar', aadhaar: '6543 2109 8765', pan: 'GHIJW6789K', phone: '9445678901' },
  ],
  sellersCommonAddress: 'Ward No. 2, Datta Mandir ke Paas, Ghogali, Po. Lonkheri, Tahsil-v-Zila Nagpur, Maharashtra-441111',

  land: {
    mauza: 'Lonkheri',
    mauzaHindi: 'लोणखेरी',
    phHalkaNo: '12',
    khataNo: '45',
    khasraNo: '123/1',
    areaHectare: '2.50',
    tehsil: 'Nagpur',
    district: 'Nagpur',
    state: 'Maharashtra',
    pincode: '441111',
    eastKhasra: '122',
    westKhasra: '124',
    northKhasra: '120',
    southKhasra: '125/2',
  },

  totalAmount: 2500000,
  totalAmountWords: 'Pachis Lakh',
  ratePerAcre: 1000000,
  ratePerAcreWords: 'Das Lakh',
  paidTotal: 1212000,
  paidTotalWords: 'Barah Lakh Barah Hazar',
  paidUptoDate: '2026-02-15',

  payments: [
    { amount: 21000, amountWords: 'Ikkis Hazar', mode: 'UPI', referenceNo: '9876543210', date: '2026-01-29', receivedBy: 'Prayag Gangadhar Wankhede' },
    { amount: 10000, amountWords: 'Das Hazar', mode: 'UPI', referenceNo: '9876543210', date: '2026-02-01', receivedBy: 'Prayag Gangadhar Wankhede' },
    { amount: 600000, amountWords: 'Chhah Lakh', mode: 'Cheque', referenceNo: '000123', bank: 'HDFC', date: '2026-02-15', receivedBy: 'Usha Gangadhar Wankhede' },
  ],

  remainingAmount: 1288000,
  remainingAmountWords: 'Barah Lakh Athattar Hazar',
  registryMaxMonths: 17,

  scheduledPayments: [
    { label: 'अगस्त २०२६', perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'नवम्बर २०२६', perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'फ़रवरी २०२७', perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'मई २०२७',    perSellerAmount: 50000,  sellerCount: 4, totalAmount: 200000 },
    { label: 'जुलाई २०२७', perSellerAmount: 22000,  sellerCount: 4, totalAmount:  88000 },
  ],

  accountHolderName: 'Mamata Keshlal Patle',
  companyName: 'Ashray Group',
  accountNo: '12345678901234',
  bank: 'HDFC Bank',
  branch: 'Nagpur Main',

  tokenLetterDate: '29/01/2026',
};
*/