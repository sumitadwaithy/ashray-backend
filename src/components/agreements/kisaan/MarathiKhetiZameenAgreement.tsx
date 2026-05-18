import React from 'react';
import {
  convertToMarathi,
  convertNumberToMarathi,
  convertNameWithTitle,
  formatAadhaarMarathi,
} from '../../../engine/EnglishToMarathiEngine';
import { PrintFooter } from '../../../../components/Printpreview';

// =========================
// SELLER PERSON (UP TO 4)
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
  mauza: string;           // मौजा / गाव
  mauzaMarathi?: string;   // already in Devanagari
  phHalkaNo: string;       // प.ह. नं.
  khataNo: string;         // खाते क्र.
  khasraNo: string;        // गट / सर्वे नं.
  areaHectare: string;     // क्षेत्रफळ हे. आर.
  akarni?: string;         // पडीक
  tehsil: string;
  district: string;
  state: string;
  pincode: string;

  eastKhasra: string;
  westKhasra: string;
  northKhasra: string;
  southKhasra: string;
}

// =========================
// PAYMENT ENTRY
// =========================
export interface PaymentEntry {
  amount: number;
  amountWords: string;
  mode: 'Cash' | 'Cheque' | 'UPI' | 'NEFT' | 'RTGS' | 'Other';
  referenceNo?: string;
  bank?: string;
  date: string;             // YYYY-MM-DD
  receivedBy: string;
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
// SCHEDULED FUTURE PAYMENT
// =========================
export interface ScheduledPayment {
  label: string;            // e.g. "ऑगस्ट २०२६"
  perSellerAmount: number;
  sellerCount: number;
  totalAmount: number;
}

// =========================
// FULL AGREEMENT DATA
// =========================
export interface MarathiKhetiAgreementData {
  agreementDate: string;    // YYYY-MM-DD
  agreementDay?: {
    mr: string;             // e.g. "रविवार"
  };

  buyer: BuyerData;

  sellers: SellerPerson[];
  sellersCommonAddress: string;
  sellersCommonAddressMarathi?: string;

  land: LandData;

  totalAmount: number;
  totalAmountWords: string;
  ratePerAcre: number;
  ratePerAcreWords: string;

  paidTotal: number;
  paidTotalWords: string;
  paidUptoDate: string;

  payments: PaymentEntry[];

  remainingAmount: number;
  remainingAmountWords: string;
  registryMaxMonths: number;

  scheduledPayments: ScheduledPayment[];

  accountHolderName: string;
  companyName?: string;
  accountNo: string;
  bank: string;
  branch: string;

  tokenLetterDate: string;   // display string e.g. "२९/०१/२०२६"

  kissanId?: string;
  folderSerial?: string;
  company?: CompanyData;
  manager?: ManagerData;
}

// =========================
// TEMPLATE PROPS
// =========================
interface TemplateProps {
  data: MarathiKhetiAgreementData;
  companyLogo?: string;
  companyWatermark?: string;
}

// =========================
// HELPERS
// =========================
const formatMarathiDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
    const day = convertNumberToMarathi(date.getDate());
    const month = convertNumberToMarathi(date.getMonth() + 1);
    const year = convertNumberToMarathi(date.getFullYear());
    return `${day}/${month}/${year}`;
  };

const MARATHI_ORDINALS = [
  '', 'एक', 'दोन', 'तीन', 'चार', 'पाच',
  'सहा', 'सात', 'आठ', 'नऊ', 'दहा',
  'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा',
  'सोळा', 'सतरा', 'अठरा',
];

const monthOrdinal = (n: number): string =>
  MARATHI_ORDINALS[n] ?? convertNumberToMarathi(n);

const DEVA_NUM: Record<number, string> = {
  0: '०', 1: '१', 2: '२', 3: '३', 4: '४', 5: '५',
  6: '६', 7: '७', 8: '८', 9: '९', 10: '१०',
};

const paymentModeMarathi = (
  mode: PaymentEntry['mode'],
  refNo?: string,
  bank?: string
): string => {
  if (mode === 'UPI') return `गूगल पे UPI क्र.-${refNo || '___'}`;
  if (mode === 'Cheque') return `${bank || 'HDFC'} बँक चेक क्र.-${refNo || '___'}`;
  if (mode === 'Cash') return 'रोख';
  if (mode === 'NEFT' || mode === 'RTGS') return `${mode} ट्रान्सफर क्र.-${refNo || '___'}`;
  return convertToMarathi(mode);
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
      विक्रीचा करारनामा
    </h2>
  </div>
);

// =========================
// MAIN COMPONENT
// =========================
const MarathiKhetiZameenAgreement: React.FC<TemplateProps> = ({
  data,
  companyLogo,
  companyWatermark,
}) => {
  const safeData: MarathiKhetiAgreementData = {
    ...data,
    company: data.company ?? {},
    manager: data.manager ?? {},
    sellers: data.sellers ?? [],
    payments: data.payments ?? [],
    scheduledPayments: data.scheduledPayments ?? [],
  };

  const {
    agreementDate, agreementDay, buyer, sellers, sellersCommonAddress,
    sellersCommonAddressMarathi, land, totalAmount, totalAmountWords,
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
            PAGE 1 — मुखपृष्ठ / COVER
        ══════════════════════════════════════════ */}
        <div className="a4-page">
          {/* Stamp paper space */}
          <div className="h-[260px]" />

          {/* Main Title */}
          <div className="text-center mb-10">
            <p className="text-[13px] font-semibold tracking-wide mb-1">स्थावर मालमत्ता</p>
            <h1 className="text-[26px] font-extrabold underline decoration-double mb-2">
              शेतजमिनीचा विक्रीचा करारनामा
            </h1>
          </div>

          {/* Summary Box */}
          <div className="border-2 border-black p-5 text-[14px] leading-[2.1] space-y-1">
            {/* Sale amount */}
            <div className="flex gap-2 items-end">
              <span className="font-bold w-52 shrink-0">विक्री किंमत रुपये :-</span>
              <span className="underline-field flex-1">
                {totalAmount ? `${convertNumberToMarathi(totalAmount)}/-` : ''}
              </span>
              <span className="text-[13px]">
                ({totalAmountWords
                  ? `${convertToMarathi(totalAmountWords)} रुपये मात्र`
                  : ''})
              </span>
            </div>

            {/* Village */}
            <div className="flex gap-2 items-end">
              <span className="font-bold w-52 shrink-0">गाव / मौजा :-</span>
              <span className="underline-field flex-1">
                {land.landName ? convertToMarathi(land.landName) : (land.mauzaMarathi || convertToMarathi(land.mauza))}
              </span>
            </div>

            {/* Land numbers */}
            <div className="flex flex-wrap gap-4 mt-1">
              {[
                ['प.ह.नं. :-', convertNumberToMarathi(land.phHalkaNo), 'w-20'],
                ['खाते क्र. :-', convertNumberToMarathi(land.khataNo), 'w-16'],
                ['गट / सर्वे नं. :-', convertNumberToMarathi(land.khasraNo), 'w-24'],
                ['क्षेत्रफळ :-', `${convertNumberToMarathi(land.areaHectare)} हे. आर.`, 'w-28'],
              ].map(([lbl, val, w]) => (
                <div key={lbl} className="flex gap-2 items-end">
                  <span className="font-bold">{lbl}</span>
                  <span className={`underline-field ${w}`}>{val}</span>
                </div>
              ))}
            </div>

            {/* Location */}
            <div className="flex flex-wrap gap-4 mt-1">
              {[
                ['तालुका :-', convertToMarathi(land.tehsil), 'w-28'],
                ['जिल्हा :-', convertToMarathi(land.district), 'w-24'],
                ['राज्य :-', convertToMarathi(land.state), 'w-24'],
                ['पिन :-', convertNumberToMarathi(land.pincode), 'w-20'],
              ].map(([lbl, val, w]) => (
                <div key={lbl} className="flex gap-2 items-end">
                  <span className="font-bold">{lbl}</span>
                  <span className={`underline-field ${w}`}>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Party 01 — Buyer with Company / Manager */}
          <div className="mt-8 text-[14px]">
            <p className="font-bold mb-3">पक्ष क्र.-०१ (करारनामा लिहून घेणारे) :-</p>
            <div className="pl-4 space-y-2">
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">१. नाव :-</span>
                <span className="underline-field flex-1 text-[13.5px]">
                  {convertNameWithTitle(manager?.managerName || buyer.name, buyer.title)} ({manager?.managerPosition || convertToMarathi(buyer.occupation)})
                  {company?.companyName ? ` साठी ${convertToMarathi(company.companyName)}` : ''}
                  {company?.entityType ? ` (${convertToMarathi(company.entityType)})` : ''}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">पत्ता :-</span>
                <span className="underline-field flex-1 text-[13.5px]">
                  {convertToMarathi([
                    company?.companyAddress || buyer.address,
                    company?.companyLocality || buyer.locality,
                    company?.companyDistrict || buyer.district,
                    company?.companyState || buyer.state,
                    (company?.companyPincode || buyer.pincode) ? `पिन ${company?.companyPincode || buyer.pincode}` : null
                  ].filter(Boolean).join(', '))}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">आधार क्र. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">{formatAadhaarMarathi(manager?.managerAadhaar || buyer.aadhaar)}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">पॅन क्र. :-</span>
                <span className="underline-field flex-1 text-[13.5px] uppercase">{(manager?.managerPAN || company?.companyPan || buyer.pan || '')}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">मोबाईल क्र. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">
                  {manager?.managerPhone
                    ? `${convertNumberToMarathi(manager.managerCountryCode || '91')} ${convertNumberToMarathi(manager.managerPhone)}`
                    : convertNumberToMarathi(buyer.phone)}
                </span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-52 shrink-0">परवाना नोंदणी क्र. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">{company?.licenseRegistrationNumber || ''}</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-bold w-40 shrink-0">उद्यम / URC क्र. :-</span>
                <span className="underline-field flex-1 text-[13.5px]">{company?.urcNumber || ''}</span>
              </div>
            </div>
          </div>
          <PrintFooter />
        </div>

        {/* ══════════════════════════════════════════
            PAGE 2 — विक्रेते (PARTY 02) + कलम १
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            <div className="text-[14px] mb-6">
              <p className="font-bold mb-4">पक्ष क्र.-०२ (करारनामा लिहून देणारे) :-</p>

              {sellers.map((seller, idx) => (
                <div key={idx} className="mb-5 pl-4 border-l-2 border-gray-300">
                  <p className="font-semibold mb-2">{DEVA_NUM[idx + 1] || idx + 1}.</p>
                  <div className="space-y-2">
                    {[
                      ['नाव :-', convertNameWithTitle(seller.name, seller.salutation)],
                      ['वय :-', `${convertNumberToMarathi(seller.age)} वर्षे, व्यवसाय :- ${convertToMarathi(seller.occupation)}`],
                      ['आधार क्र. :-', formatAadhaarMarathi(seller.aadhaar)],
                      ['पॅन क्र. :-', seller.pan.toUpperCase()],
                      ['ध्वनी क्र. :-', convertNumberToMarathi(seller.phone)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-end gap-2">
                        <span className="font-bold w-40 shrink-0">{label}</span>
                        <span className="underline-field flex-1 text-[13.5px]">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div className="mt-4 pl-4">
                <div className="flex items-start gap-2">
                  <span className="font-bold w-40 shrink-0 mt-1">
                    {sellers.length > 2 ? 'सर्वांचा पत्ता :-' : sellers.length === 2 ? 'दोघांचा पत्ता :-' : 'पत्ता :-'}
                  </span>
                  <span className="underline-field flex-1 text-[13.5px]">
                    {sellersCommonAddressMarathi || convertToMarathi(sellersCommonAddress)}
                  </span>
                </div>
              </div>
            </div>

            <div className="section-body mt-6">
              {`०१.\tइसवी सन ${convertNumberToMarathi(new Date(agreementDate).getFullYear())} दिनांक ${formatMarathiDate(agreementDate)} दिवस ${agreementDay?.mr || '________'} रोजी आम्ही वरील दोन्ही पक्ष आपल्या संपूर्ण इच्छेने व पूर्ण आनंदाने, लाभ मिळविण्यासाठी व कौटुंबिक गरजा भागविण्यासाठी हा विक्रीचा करारनामा लिहून घेत व देत आहोत, त्याची संपूर्ण माहिती पुढीलप्रमाणे आहे.`}
            </div>
          </div>
          <PrintFooter />
        </div>

        {/* ══════════════════════════════════════════
            PAGE 3 — जमिनीचा तपशील + कलम २ व ३
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Clause 02 */}
            <div className="section-body">
              {`०२.\tपक्ष क्र.-०२ हे खाली नमूद शेतजमिनीचे शासकीय / निमशासकीय व ७/१२ तसेच २/८ अ नुसार संपूर्णपणे मालक व सर्व प्रकारे ताबेदार आहेत. आणि आजपासून हा विक्रीचा करारनामा पूर्ण होण्याच्या दिवसापर्यंत संपूर्ण शेतजमीन पूर्णपणे पक्ष क्र.-०२ च्या ताब्यात आहे, त्याचा तपशील पुढीलप्रमाणे आहे.`}
            </div>

            {/* Land Detail Box */}
            <div className="mt-5 border border-black p-4 text-[14px] space-y-3">
              <p className="font-bold underline mb-2">२.१) शेतजमिनीचा तपशील :-</p>
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                {[
                  ['गट / सर्वे नं. :-', convertNumberToMarathi(land.khasraNo)],
                  ['खाते क्र. :-', convertNumberToMarathi(land.khataNo)],
                  [
                    'जिरायत :-',
                    `${convertNumberToMarathi(land.areaHectare)} हे. आर.`,
                  ],
                  [
                    'पडीक (अकारणी) :-',
                    land.akarni ? convertNumberToMarathi(land.akarni) : '___',
                  ],
                  [
                    'मौजा / गाव :-',
                    `${land.mauzaMarathi || convertToMarathi(land.mauza)} (${convertToMarathi(land.mauza)})`,
                  ],
                  ['तालुका :-', convertToMarathi(land.tehsil)],
                  ['जिल्हा :-', convertToMarathi(land.district)],
                  ['राज्य :-', convertToMarathi(land.state)],
                  ['पिन :-', convertNumberToMarathi(land.pincode)],
                ].map(([label, value]) => (
                  <div key={label} className="flex gap-1 items-end">
                    <span className="font-semibold">{label}</span>
                    <span className="underline-field min-w-[80px]">{value}</span>
                  </div>
                ))}
              </div>

              <p className="font-bold underline mt-4 mb-2">
                २.२) शेतजमिनीच्या चतुःसीमा :-
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['पूर्वेस :-', `गट नं.- ${convertNumberToMarathi(land.eastKhasra)}`],
                  ['पश्चिमेस :-', `गट नं.- ${convertNumberToMarathi(land.westKhasra)}`],
                  ['उत्तरेस :-', `गट नं.- ${convertNumberToMarathi(land.northKhasra)}`],
                  ['दक्षिणेस :-', `गट नं.- ${convertNumberToMarathi(land.southKhasra)}`],
                ].map(([dir, val]) => (
                  <div key={dir} className="flex gap-2 items-end">
                    <span className="font-semibold w-28 shrink-0">{dir}</span>
                    <span className="underline-field flex-1">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clause 03 */}
            <div className="section-body mt-5">
              {`०३.\tपक्ष क्र.-०२ यांनी वरील संपूर्ण शेतजमीन आज पक्ष क्र.-०१ यांना संपूर्णपणे विकण्याचा करार केला असून त्याचबरोबर संपूर्ण ताबाही दिला आहे. आजपासून पक्ष क्र.-०१ हे सदर जमिनीचे संपूर्ण मालक व सर्व प्रकारे ताबेदार आहेत. पक्ष क्र.-०१ हे सदर शेतजमीन संपूर्ण किंवा आंशिकरित्या विक्री / दान / भेट म्हणून कोणालाही देण्याचा लेखी करार करू शकतात आणि शेतजमिनीत कोणतेही काम करण्यास पूर्णपणे स्वतंत्र आहेत. पक्ष क्र.-०२ कडून कोणत्याही प्रकारे कोणत्याही कामासाठी कोणत्याही स्वरूपात बांधील नाहीत.`}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 4 — कलम ०४: देयकाचा तपशील
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Clause 04 header */}
            <div className="section-body">
              {`०४.\tपक्ष क्र.-०२ यांनी वरील संपूर्ण शेतजमीन ${convertNumberToMarathi(
                ratePerAcre
              )}/- (${convertToMarathi(ratePerAcreWords)} मात्र) रुपये प्रति एकर दराने विकली असून त्याची एकूण किंमत ${convertNumberToMarathi(
                totalAmount
              )}/- (${convertToMarathi(totalAmountWords)} मात्र) रुपये आहे, त्यापैकी ${convertNumberToMarathi(
                paidTotal
              )}/- (${convertToMarathi(paidTotalWords)} मात्र) रुपये पक्ष क्र.-०२ यांनी दिनांक ${formatMarathiDate(
                paidUptoDate
              )} पर्यंत रोख, धनादेश व ई-ट्रान्सफरद्वारे स्वीकारले आहेत. त्याचा संपूर्ण तपशील पुढीलप्रमाणे आहे:-`}
            </div>

            {/* Payment entries */}
            <div className="mt-4 space-y-3 text-[14px]">
              {payments.map((p, idx) => (
                <div key={idx} className="flex items-start gap-2 leading-[1.85]">
                  <span className="font-bold shrink-0 w-12 text-right">
                    {`${DEVA_NUM[idx + 1] || idx + 1}.`}
                  </span>
                  <span>
                    रुपये {convertNumberToMarathi(p.amount)}/-
                    &nbsp;({convertToMarathi(p.amountWords)} मात्र{' '}
                    {paymentModeMarathi(p.mode, p.referenceNo, p.bank)} द्वारे
                    दि.-{formatMarathiDate(p.date)} रोजी{' '}
                    {convertNameWithTitle(p.receivedBy)} यांनी स्वीकारले — मान्य व कबूल आहे)
                  </span>
                </div>
              ))}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 5 — कलम ०५ & ०६: उर्वरित + वेळापत्रक
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Clause 05 */}
            <div className="section-body">
              {`०५.\tवरील देयके स्वीकारल्यानंतर उर्वरित रक्कम ${convertNumberToMarathi(
                remainingAmount
              )}/- (${convertToMarathi(remainingAmountWords)} मात्र) रुपये, पक्ष क्र.-०२ हे जमिनीशी संबंधित सर्व कागदपत्रे शासकीय नियमानुसार नोंदणीसाठी तयार करतील व त्याच कालावधीत जमिनीची शासकीय मोजणी, कौटुंबिक वाटणी इत्यादी सर्व आवश्यक कार्यवाही करून दिल्यानंतर, परस्पर संमतीने ठरविलेल्या तारखेला नोंदणी करून देण्याच्या दिवसापर्यंत जास्तीत जास्त ${convertNumberToMarathi(
                registryMaxMonths
              )}/- (${monthOrdinal(registryMaxMonths)} मात्र) महिन्यांत स्वीकारतील. सर्व कागदपत्रे शासकीय नियमानुसार तयार होण्यापूर्वी उपकलम ५.१ किंवा त्यापुढील कोणतेही देयक दिले जाणार नाही आणि पक्ष क्र.-०२ देयकाबाबत कोणताही वाद करणार नाहीत. उर्वरित देयकाचा तपशील पुढीलप्रमाणे आहे.`}
            </div>

            {/* Scheduled payment table */}
<div className="mt-4 border border-black text-[14px]">
              <div className="grid grid-cols-5 font-bold bg-gray-100 border-b border-black text-center">
                <div className="p-2 border-r border-black">उपकलम</div>
                <div className="p-2 border-r border-black">देय महिना</div>
                <div className="p-2 border-r border-black">प्रति विक्रेता (₹)</div>
                <div className="p-2 border-r border-black">विक्रेते संख्या</div>
                <div className="p-2">एकूण रक्कम (₹)</div>
              </div>
              {scheduledPayments.map((sp, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-5 text-center border-b border-gray-300"
                >
                  <div className="p-2 border-r border-black font-semibold">
                    {`५.${DEVA_NUM[idx + 1] || idx + 1})`}
                  </div>
                  <div className="p-2 border-r border-black">{sp.label}</div>
                  <div className="p-2 border-r border-black">
                    {convertNumberToMarathi(sp.perSellerAmount)}/-
                  </div>
                  <div className="p-2 border-r border-black">{convertNumberToMarathi(sp.sellerCount)}</div>
                  <div className="p-2">{convertNumberToMarathi(sp.totalAmount)}/-</div>
                </div>
              ))}
              {/* Total row */}
              <div className="grid grid-cols-5 text-center font-bold bg-yellow-50">
                <div className="p-2 border-r border-black col-span-3">एकूण उर्वरित देयक</div>
                <div className="p-2 border-r border-black">—</div>
                <div className="p-2">{convertNumberToMarathi(remainingAmount)}/-</div>
              </div>
            </div>
              {scheduledPayments.map((sp, idx) => (
                <div
                  key={idx}
                  className="grid grid-cols-4 text-center border-b border-gray-300"
                >
                  <div className="p-2 border-r border-black font-semibold">
                    {`५.${DEVA_NUM[idx + 1] || idx + 1})`}
                  </div>
                  <div className="p-2 border-r border-black">{sp.label}</div>
                  <div className="p-2 border-r border-black">
                    {convertNumberToMarathi(sp.perSellerAmount)}/-
                  </div>
                  <div className="p-2">{convertNumberToMarathi(sp.totalAmount)}/-</div>
                </div>
              ))}
              {/* Total row */}
              <div className="grid grid-cols-4 text-center font-bold bg-yellow-50">
                <div className="p-2 border-r border-black col-span-2">
                  एकूण उर्वरित देयक
                </div>
                <div className="p-2 border-r border-black">—</div>
                <div className="p-2">{convertNumberToMarathi(remainingAmount)}/-</div>
              </div>
            </div>

            {/* Clause 06 */}
            <div className="section-body mt-5">
              {`०६.\tया विक्रीच्या करारनाम्याच्या आधारे सर्व देयके जी ऑनलाइन, धनादेश, NEFT, RTGS, गूगल पे किंवा इतर कोणत्याही माध्यमातून केली जातील, ती ${convertNameWithTitle(
                accountHolderName
              )} यांच्या नावाने किंवा ${convertNameWithTitle(
                accountHolderName
              )} यांच्या जागी ${
                companyName ? convertToMarathi(companyName) : '___'
              } नावाच्या चालू खाते क्र.:-${accountNo} बँक-${bank} शाखा ${branch} द्वारे केली जातील. दोन्हींपैकी कोणाकडूनही केलेली देयके मान्य असतील व पक्ष क्र.-०२ यांना याबाबत कोणत्याही प्रकारची हरकत नाही व भविष्यातही कोणतीही हरकत निर्माण करणार नाहीत.`}
            </div>
          </div>
          <PrintFooter />
        </div>


        {/* ══════════════════════════════════════════
            PAGE 6 — कलम ०७: अटी व शर्ती (भाग अ)
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />
            <p className="font-bold text-[15px] mb-3">०७. करारनाम्याच्या अटी व शर्ती</p>

            <div className="section-body space-y-4">
              {[
                [
                  '७.१)',
                  `वरील शेतजमिनीची शासकीय मोजणी, भाग नकाशा, फेरफार नोंद, अधिकार अभिलेख इत्यादी सर्व कागदपत्रे व सर्व कौटुंबिक समस्या जे आहेत किंवा भविष्यात येतील त्या सर्वांचे निराकरण पक्ष क्र.-०२ करून देतील. शासकीय मोजणीत जेवढी शेतजमीन भरेल त्याप्रमाणातच पक्ष क्र.-०२ करारानुसार रकमेचे हकदार असतील. शासकीय मोजणीत जमीन कमी भरल्यास पक्ष क्र.-०२ ७/१२ वर नमूद जमिनीच्या आधारे किंवा वरील नमूद जमिनीच्या आधारे रकमेसाठी कोणत्याही प्रकारे वाद करणार नाहीत.`,
                ],
                [
                  '७.२)',
                  `वरील शेतजमिनीवर नोंदणीच्या दिनांकापर्यंतचे सर्व शासकीय कर, पाटबंधारे विभागाचा कर व कोणत्याही प्रकारचे बँक कर्ज, गहाण, बक्षीस किंवा इतर कोणत्याही प्रकारच्या सर्व देण्याची जबाबदारी पक्ष क्र.-०२ यांचीच आहे व त्याचे निराकरणही सर्व परिस्थितीत पक्ष क्र.-०२ करतील. पक्ष क्र.-०२ न केल्यास पक्ष क्र.-०१ करारानुसार उर्वरित रकमेतून वजा करून हे देयक भरतील व पक्ष क्र.-०२ यासाठी कोणत्याही प्रकारे वाद करणार नाहीत.`,
                ],
                [
                  '७.३)',
                  `पक्ष क्र.-०२ यांनी यापूर्वी वरील जमिनीचा करार कोणाशीही केलेला नाही व शेतजमीन विकण्याच्या नावाखाली इतर कोणाकडूनही कोणतीही रक्कम घेतलेली नाही. भविष्यात असे कोणतेही प्रकरण समोर आल्यास त्याची संपूर्ण जबाबदारी पक्ष क्र.-०२ यांची असेल व त्याचे निराकरणही सर्व परिस्थितीत पक्ष क्र.-०२ करतील. निराकरण न झाल्यास व त्यामुळे करार रद्द झाल्यास ${tokenLetterDate} च्या टोकन पत्रासह विक्रीच्या करारनाम्याच्या आधारे सर्व देयके पक्ष क्र.-०२ हे पक्ष क्र.-०१ यांना रद्दीकरणाच्या दिवशीच परत करतील, तेव्हाच रद्दीकरण मान्य होईल.`,
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
            PAGE 7 — कलम ०७: अटी व शर्ती (भाग ब)
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            <div className="section-body space-y-4">
              {[
                [
                  '७.४)',
                  `भविष्यात पक्ष क्र.-०१ किंवा पक्ष क्र.-०२ यापैकी एक किंवा दोघांनाही काही झाल्यास त्यांचे वारसदार या विक्रीच्या करारनामा व शेतजमिनीच्या ताब्याबाबत पूर्णपणे अवगत आहेत व या विक्रीच्या करारनामा व शेतजमिनीच्या ताब्याने पूर्णपणे बांधील आहेत. त्यामुळे हे काम या विक्रीच्या करारनाम्याच्या आधारे पूर्ण करून घेतील व देतील. तसे न केल्यास पक्ष क्र.-०१ च्या वारसदारांनी सदर जमिनीची एकतर्फी नोंदणी स्वत:च्या नावाने करून घ्यावी, परंतु उर्वरित देयक ठरल्याप्रमाणे अनिवार्यपणे द्यावे. पक्ष क्र.-०२ च्या वारसदारांनी देयक न स्वीकारल्यास पक्ष क्र.-०१ चे वारसदार स्वत:च्या नावाने नोंदणी केल्यानंतर हे उर्वरित देयक शासकीय खजिन्यात जमा करतील.`,
                ],
                [
                  '७.५)',
                  `वरील नियमानुसार संपूर्ण देयक झाल्यानंतर वरील शेतजमिनीची नोंदणी पक्ष क्र.-०१ स्वत:च्या सोयीनुसार स्वत:च्या किंवा ${
                    companyName ? convertToMarathi(companyName) : '___'
                  } च्या इतर कोणत्याही अधिकाऱ्याच्या नावाने करू शकतात. यास पक्ष क्र.-०२ पूर्णपणे सहमत आहेत व भविष्यात कोणत्याही प्रकारची समस्या किंवा वाद निर्माण करणार नाहीत.`,
                ],
                [
                  '७.६)',
                  `या विक्रीच्या करारनामा पत्रानंतर कोणताही बदल किंवा फेरबदल केवळ लेखी स्वरूपात दोन्ही पक्षांच्या सह्या व अंगठ्यानंतरच मान्य होईल. कोणत्याही प्रकारचे फोन कॉल, व्हॉट्सअप, ई-मेल किंवा इतर कोणत्याही माध्यमातून केलेली बोलणी या विक्रीच्या करारनाम्यावर कोणताही परिणाम करणार नाहीत.`,
                ],
                [
                  '७.७)',
                  `ठरल्याप्रमाणे वेळेवर देयक न दिल्यास वरील शेतजमिनीवर पक्ष क्र.-०२ चा ताबा कोणत्याही स्वरूपात मान्य नसेल. अशा परिस्थितीत दोन्ही पक्ष एकत्र बसून परस्पर संमतीने मार्ग काढतील व कलम ७ च्या उपकलम ७.६ नुसार भविष्यातील धोरण ठरवतील.`,
                ],
                [
                  '७.८)',
                  `आम्ही दोन्ही पक्ष पूर्णपणे निरोगी आहोत व आम्हांला कोणत्याही प्रकारचा मानसिक आजार नाही. आम्ही दोघांनीही कोणत्याही प्रकारचे व्यसन किंवा मादक द्रव्याचे सेवन केलेले नाही. नंतर कोणी असे म्हटल्यास की एखाद्या आजारात किंवा नशेत लिहून दिले/घेतले, तर तो भारतीय दंड संहितेनुसार शिक्षेस पात्र असेल.`,
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
            PAGE 8 — सह्या
        ══════════════════════════════════════════ */}
        <div className="a4-page" style={{ position: 'relative' }}>
          <Watermark logo={companyLogo} watermark={companyWatermark} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <PageTitle />

            {/* Seller signatures */}
            <div className="mb-10">
              <p className="font-bold text-[15px] mb-6">
                ०८. पक्ष क्र.-०२ (लिहून देणारे) यांच्या सह्या व डाव्या हाताच्या अंगठ्याचे ठसे :-
              </p>
              <div className="grid grid-cols-2 gap-8">
                {sellers.map((seller, idx) => (
                  <div key={idx} className="text-center">
                    <div className="h-20 border border-dashed border-gray-400 mb-2 flex items-end justify-center pb-2">
                      <span className="text-[11px] text-gray-400">अंगठा / सही</span>
                    </div>
                    <p className="font-semibold text-[13px]">
                      ({convertNameWithTitle(seller.name, seller.salutation)})
                    </p>
                    <p className="text-[12px] text-gray-600">
                      {idx === 0 ? 'विक्रेता (मुख्य)' : 'विक्रेता'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Buyer signature */}
            <div className="mb-10">
              <p className="font-bold text-[15px] mb-6">
                ०९. पक्ष क्र.-०१ (लिहून घेणारे) यांची सही व डाव्या हाताच्या अंगठ्याचा ठसा :-
              </p>
              <div className="flex justify-center">
                <div className="text-center w-60">
                  <div className="h-20 border border-dashed border-gray-400 mb-2 flex items-end justify-center pb-2">
                    <span className="text-[11px] text-gray-400">अंगठा / सही</span>
                  </div>
                  <p className="font-semibold text-[13px]">
                    ({convertNameWithTitle(buyer.name, buyer.title)})
                  </p>
                  <p className="text-[12px] text-gray-600">
                    {companyName
                      ? `व्यवस्थापक, ${convertToMarathi(companyName)}`
                      : 'खरेदीदार'}
                  </p>
                </div>
              </div>
            </div>

            {/* Witness signatures */}
            <div className="mb-8">
              <p className="font-bold text-[15px] mb-6">
                १०. साक्षीदारांच्या सह्या व अंगठ्यांचे ठसे :-
              </p>
              <div className="grid grid-cols-2 gap-12">
                {['(१०.१)', '(१०.२)'].map((n) => (
                  <div key={n} className="text-center">
                    <div className="h-20 border border-dashed border-gray-400 mb-2 flex items-end justify-center pb-2">
                      <span className="text-[11px] text-gray-400">अंगठा / सही</span>
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
                {folderSerial ? `${folderSerial}-${land.landName?.replace(/\s+/g, '-') || ''}-${land.mauza?.replace(/\s+/g, '-') || ''}-${land.khasraNo}-${land.tehsil}-${formatMarathiDate(agreementDate).replace(/\//g, '-')}` : [
                  convertToMarathi(land.mauza),
                  `गट-${land.khasraNo}`,
                  `खाते-${land.khataNo}`,
                  convertToMarathi(land.tehsil),
                  convertToMarathi(land.district),
                  convertToMarathi(land.state),
                  land.pincode,
                  formatMarathiDate(agreementDate),
                ]
                  .filter(Boolean)
                  .join(' | ')}
              </p>
            </div>
          </div>
          <PrintFooter />
        </div>

      </div>

  );
};

export default MarathiKhetiZameenAgreement;


// =========================
// USAGE EXAMPLE (remove before prod)
// =========================
/*
const sampleData: MarathiKhetiAgreementData = {
  agreementDate: '2026-02-15',
  agreementDay: { mr: 'रविवार' },

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
    { name: 'Prayag Gangadhar Wankhede',   age: '58', occupation: 'Shetkari', aadhaar: '9876 5432 1098', pan: 'XYZPW1234G', phone: '9112345678' },
    { name: 'Usha Gangadhar Wankhede',     age: '52', occupation: 'Grihini',  aadhaar: '8765 4321 0987', pan: 'UVWUW5678H', phone: '9223456789' },
    { name: 'Prashant Gangadhar Wankhede', age: '34', occupation: 'Naukari',  aadhaar: '7654 3210 9876', pan: 'MNOPW3456J', phone: '9334567890' },
    { name: 'Mahesh Gangadhar Wankhede',   age: '30', occupation: 'Vyapar',   aadhaar: '6543 2109 8765', pan: 'GHIJW6789K', phone: '9445678901' },
  ],
  sellersCommonAddress: 'Ward No. 2, Datta Mandir Javal, Ghogali, Po. Lonkheri, Taluka-v-Jilha Nagpur, Maharashtra-441111',

  land: {
    mauza: 'Lonkheri',
    mauzaMarathi: 'लोणखेरी',
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
  totalAmountWords: 'Pachvis Lakh',
  ratePerAcre: 1000000,
  ratePerAcreWords: 'Das Lakh',
  paidTotal: 1212000,
  paidTotalWords: 'Barah Lakh Barah Hazar',
  paidUptoDate: '2026-02-15',

  payments: [
    { amount: 21000,  amountWords: 'Ekkis Hazar',  mode: 'UPI',    referenceNo: '9876543210',        date: '2026-01-29', receivedBy: 'Prayag Gangadhar Wankhede' },
    { amount: 10000,  amountWords: 'Das Hazar',     mode: 'UPI',    referenceNo: '9876543210',        date: '2026-02-01', receivedBy: 'Prayag Gangadhar Wankhede' },
    { amount: 600000, amountWords: 'Saha Lakh',     mode: 'Cheque', referenceNo: '000123', bank: 'HDFC', date: '2026-02-15', receivedBy: 'Usha Gangadhar Wankhede'   },
    { amount: 600000, amountWords: 'Saha Lakh',     mode: 'Cheque', referenceNo: '000124', bank: 'HDFC', date: '2026-02-15', receivedBy: 'Prashant Gangadhar Wankhede' },
    { amount: 581000, amountWords: 'Paach Lakh Ekyashi Hazar', mode: 'Cash', date: '2026-02-15', receivedBy: 'Mahesh Gangadhar Wankhede' },
  ],

  remainingAmount: 1288000,
  remainingAmountWords: 'Barah Lakh Athahattar Hazar',
  registryMaxMonths: 17,

  scheduledPayments: [
    { label: 'ऑगस्ट २०२६',   perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'नोव्हेंबर २०२६', perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'फेब्रुवारी २०२७', perSellerAmount: 100000, sellerCount: 4, totalAmount: 400000 },
    { label: 'मे २०२७',       perSellerAmount:  50000, sellerCount: 4, totalAmount: 200000 },
    { label: 'जुलै २०२७',     perSellerAmount:  22000, sellerCount: 4, totalAmount:  88000 },
  ],

  accountHolderName: 'Mamata Keshlal Patle',
  companyName: 'Ashray Group',
  accountNo: '12345678901234',
  bank: 'HDFC Bank',
  branch: 'Nagpur Main',

  tokenLetterDate: '२९/०१/२०२६',
};
*/