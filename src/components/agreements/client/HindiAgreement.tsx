import React from 'react';
import { convertToHindi, convertNumberToHindi, convertNameWithTitle, formatAadhaarHindi, convertGender, } from '../../../engine/EnglishToHindiEngine';
import { PrintFooter } from '../../../../components/Printpreview';

// =========================
// CLIENT (BUYER)
// =========================
interface ClientData {
  title?: string;
  name: string;
  age: string;
  gender: string;
  occupation: string;
  phone: string;
  email: string;
  aadhaar: string;
  pan: string;

  address: string;
  district?: string;
  locality?: string;
  state?: string;
  pincode?: string;

  nominee1Title?: string;
  nominee1Name?: string;
  nominee1Age?: string;
  nominee1Occupation?: string;
  nominee1Aadhaar?: string;

  nominee2Title?: string;
  nominee2Name?: string;
  nominee2Age?: string;
  nominee2Occupation?: string;
  nominee2Aadhaar?: string;

  folderName?: string;
  folderSerial?: string;

  tokenSerial?: string;

  clientId?: string;
}

// =========================
// PROPERTY (PROJECT + PLOT)
// =========================
interface PropertyData {
  projectName?: string;
  locality?: string;
  tehsil?: string;
  district?: string;
  state?: string;
  pincode?: string;

  khasraNumber?: string;
  surveyNumber?: string;
  registrationNumber?: string;
  layoutApprovalNumber?: string;
  reraNumber?: string;

  plotNumber?: string;
  area?: string;
  plotStatus?: string;

  rate?: string | number;
  totalAmount?: string | number;

  tokenAmount?: number | string;
  paymentReference?: string;
  bookingDate?: string;
  bookingDay?: {
    en: string;
    hi: string;
    mr: string;
  };

  paymentMode?: string;

  emiDuration?: number;
  emiAmount?: number;
  remainingAmount?: number;
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

  // ✅ OFFICE ADDRESS
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
// FINAL AGREEMENT DATA
// =========================
interface AgreementData {
  client: ClientData;
  property: PropertyData;
  company: CompanyData;
  manager?: ManagerData;

  transferNote?: string;
}

interface TemplateProps {
  data: AgreementData;
  language: 'hi' | 'en' | 'mr' | 'hindi' | 'english' | 'marathi';
  type: 'agreement' | 'token';
  onClose: () => void;
  companyLogo?: string;
  companyWatermark?: string;
}

const HindiAgreement = ({ data, companyLogo, companyWatermark  }: TemplateProps) => {

// 🔥 SAFE NUMERIC CALCULATIONS
const total = Number(data?.property?.totalAmount || 0);
const token = Number(data?.property?.tokenAmount || 0);
const duration = Number(data?.property?.emiDuration || 0);

const remaining = total - token;

const emi =
  Number(data?.property?.emiAmount) ||
  (duration > 0 ? Math.round(remaining / duration) : 0);

// 🔥 DATE
const formatHindiDate = (dateStr?: string) => {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return convertNumberToHindi(dateStr);
  }

  const day = convertNumberToHindi(date.getDate());
  const month = convertNumberToHindi(date.getMonth() + 1);
  const year = convertNumberToHindi(date.getFullYear());

  return `${day}/${month}/${year}`;
};

// 🔥 CALCULATE INSTALLMENT + AGREEMENT END DATE
const calculateEndDate = (start?: string, months?: number) => {
  if (!start || !months) return '';

  const d = new Date(start);

  if (isNaN(d.getTime())) return '';

  d.setMonth(d.getMonth() + months);

  return d.toISOString().split('T')[0]; // YYYY-MM-DD
};

const lastInstallmentDate = calculateEndDate(data?.property?.bookingDate, duration);
const agreementEndDate = lastInstallmentDate;

const renderWatermark = () => (
  <div
    style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    opacity: 0.08,        // 🔥 increased from 0.05
    zIndex: 0,
    pointerEvents: "none",
  }}
  >
    <img
      src={companyWatermark || companyLogo || ''}
      style={{
      width: "70%",
      maxWidth: "720px",
      height: "auto",
      objectFit: "contain",
    }}
    />
  </div>
);

  return (
         <div id="printable-document" className="flex flex-col items-center">
          <style>{`
          .a4-page {
            width: 210mm;
            min-height: 297mm;
            margin: 0 auto 20px;
            background: white;
            padding: 25mm 20mm;
            box-sizing: border-box;
            page-break-after: always;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            display: block;
            position: relative;
          }

          @media print {
            .a4-page {
              margin: 0 auto;
              box-shadow: none;
            }
            .no-print {
              display: none !important;
            }
          }

          .stamp-paper-header {
            border: 4px double #333;
            padding: 20px;
            text-align: center;
            margin-bottom: 40px;
            position: relative;
          }

          .stamp-paper-header::before {
            content: 'Rs. 100';
            position: absolute;
            top: 10px;
            left: 10px;
            font-weight: bold;
            font-size: 24px;
          }

          .stamp-paper-header::after {
            content: 'ONE HUNDRED RUPEES';
            position: absolute;
            bottom: 10px;
            right: 10px;
            font-weight: bold;
            font-size: 14px;
          }

          /* =========================
   HEADER BOX (LETTERHEAD)
   ========================= */
.header-box {
  border: 2.5px solid #000;
  padding: 10px 14px;
  margin-bottom: 10px;
}

/* =========================
   FIELD LAYOUT (FORM STYLE)
   ========================= */
.field-row {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  margin-bottom: 6px;
  flex-wrap: wrap;
}

.field-label {
  font-weight: 700;
  white-space: nowrap;
  font-size: 13px;
}

/* 🔥 MAIN UNDERLINE */
.field-value {
  border-bottom: 1px solid #000;
  min-height: 20px;
  flex: 1;
  display: inline-block;
}

/* 🔥 FULL WIDTH LINE (ADDRESS) */
.field-value-wide {
  border-bottom: 1px solid #000;
  width: 100%;
  min-height: 20px;
  display: block;
}
        `}</style>

          <div className="flex flex-col items-center gap-8 text-slate-900" style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}>

          {/* PAGE 1 */}
          <div className="a4-page">
            {/* STAMP PAPER TOP SPACE (REALISTIC) */}
            <div className="h-[300px]"></div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold underline decoration-double">विक्री का करारनामा</h2>
            </div>

            {/* Party 1: Buyer */}
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <span className="font-bold mr-4">लिखकर लेने वाला (पक्ष नं. ०१) :-</span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-end pb-2">
                    <span className="w-24 font-bold">(१) नाम :-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{convertNameWithTitle(data.client.name, data.client.title)}</span>
                  </div>
                  {/* Age + Gender */}
<div className="flex items-end pb-2">
  <span className="w-24 font-bold">आयु :-</span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {convertNumberToHindi(data.client.age)} वर्ष
  </span>

  <span className="w-20 font-bold">लिंग :-</span>
  <span className="w-32 border-b border-black inline-block min-h-[20px]">
    {convertGender(data.client.gender)}
  </span>
</div>

{/* Occupation (Separate Line) */}
<div className="flex items-end pb-2">
  <span className="w-24 font-bold">व्यवसाय :-</span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {convertToHindi(data.client.occupation)}
  </span>


                  </div>
                  <div className="flex items-end pb-2">
                    <span className="w-24 font-bold">पता :-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">        
                        {convertToHindi(`${data.client.address}, ${data.client.locality}, ${data.client.district}, ${data.client.state} - ${data.client.pincode}`)}
                    </span>
                  </div>
                  <div className="flex items-end pb-2">
                    <span className="w-24 font-bold">आधार नंबर :-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{formatAadhaarHindi(data.client.aadhaar)}</span>
                  </div>
                  <div className="flex items-end pb-2">
                    <span className="w-24 font-bold">पैन नंबर :-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{String(data.client.pan || '').toUpperCase()}</span>
                  </div>
                  <div className="flex items-end pb-2">
                    <span className="w-24 font-bold">ध्वनि क्रमांक :-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{convertNumberToHindi(data.client.phone)}</span>
                  </div>
                  <div className="flex items-end pb-2">
                    <span className="w-24 font-bold">ईमेल आईडी :-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">
                      {data.client.email}
                    </span>

            </div>
            </div>
            </div>

            </div>

            {/* PARTY NO. 02 — SELLER */}
   <div className="mb-8">
  <div className="flex items-start mb-4">
    <div className="font-bold mr-4 leading-tight">
      <div className="flex justify-between w-full">
  <span>लिखकर देने वाला (पक्ष नं. ०२) :-</span>
  <span className="invisible">abc</span>
</div>
    </div>

    <div className="flex-1 space-y-2">
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">(१) नाम:-</span>
                    <div className="flex-1 border-b border-black inline-block min-h-[20px]">
          <div>
              प्रबंधक, {convertToHindi(data.company.companyName || '')} ({convertToHindi(data.company.entityType)})
          </div>
        
        </div>
      </div>


      {/* ADDRESS (AUTO FROM SETTINGS OFFICE ADDRESS) */}
      <div className="flex items-end pb-1">
        <span className="w-24 font-bold">पता:-</span>
        <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {[
  convertToHindi(data.client.address),
  convertToHindi(data.client.locality),
  convertToHindi(data.client.district),
  convertToHindi(data.client.state)
]
  .filter(Boolean)
  .join(', ')
}
{data.client.pincode ? ` - ${convertNumberToHindi(data.client.pincode)}` : ''}
          .
        </span>
      </div>

      {/* AADHAAR */}
      <div className="flex items-end pb-1">
        <span className="w-32 font-bold">आधार नंबर:-</span>
       <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {convertNumberToHindi(data.manager?.managerAadhaar || '')}
        </span>
      </div>

      {/* PAN */}
      <div className="flex items-end pb-1">
        <span className="w-32 font-bold">पैन नंबर:-</span>
        <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {data.manager?.managerPAN || data.company.companyPan || ''}
        </span>
      </div>

      {/* CONTACT */}
      <div className="flex items-end pb-1">
        <span className="w-32 font-bold">ध्वनि क्रमांक:-</span>
        <span className="flex-1 border-b border-black inline-block min-h-[20px]">
          {data.manager?.managerPhone
  ? `${data.manager.managerCountryCode || ''} ${convertNumberToHindi(data.manager.managerPhone)}`
  : ''}
        </span>
      </div>

      {/* UDYAM / LICENSE */}
<div className="flex flex-col pb-1">
  
  {/* LICENSE REGISTRATION — SINGLE LINE */}
<div className="flex items-end pb-1">
  <span className="w-56 font-bold whitespace-nowrap">
    उद्योग पंजीकरण क्र.:
  </span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {convertNumberToHindi(data.company?.licenseRegistrationNumber)}
  </span>
</div>

  {/* LINE 2 — URC NUMBER */}
  <div className="flex items-end">
    <span className="w-40 font-bold">
      URC नं.:
    </span>
    <span className="flex-1 border-b border-black inline-block min-h-[20px]">
      {convertNumberToHindi(data.company.urcNumber)}
    </span>
  </div>

</div>

    </div>
  </div>

             </div> 
             <PrintFooter />
             </div>


{/* PAGE 2 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>


  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15px] leading-[1.9] text-justify">

{`
१.	दिनांक ${formatHindiDate(data.property.bookingDate)} दिन ${data.property.bookingDay?.hi} को उपरोक्त दोनों पक्षों की सम्पूर्ण सहमती एवं प्रसन्नता से इसक़रारनामें का लेख लिखा जाता है। जिसका सम्पूर्ण विवरण निम्न प्रकार है।

२.	यह कि पक्ष नंबर:०२ उसकी माल्की और हक़ की जगह जोकि उसके ही कब्ज़े में है जिस पर “${convertToHindi(data.property.projectName)}” नाम से व्यावसायिक एवं आवासीय प्लॉट ले-आउट डाला है। यह मौज़ा:- ${convertToHindi(data.property.locality)} , तहसील:- ${convertToHindi(data.property.tehsil)} , जिल्हा:- ${convertToHindi(data.property.district)} के अंतर्गत आता है। जिसका खसरा नम्बर:- ${convertNumberToHindi(data.property.khasraNumber)} तथा पटवारी हल्का नम्बर:- ${convertNumberToHindi(data.property.surveyNumber)} है।

३.	यह कि उपरोक्त लेआउट पर पक्ष नं. ०१ को प्लॉट नम्बर:- ${convertNumberToHindi(data.property.plotNumber)} / (${convertNumberToHindi(data.property.plotNumber)}) जो कि ${convertNumberToHindi(data.property.area)} / (${convertNumberToHindi(data.property.area)} मात्र) चौरस फीट हैं। ${convertNumberToHindi(data.property.rate)} / (${convertNumberToHindi(data.property.rate)} मात्र) रुपया प्रति चौरस फीट की दर से देने का क़रार तय हुआ है। जिसकी समस्त जानकारियाँ निम्न लिखित हैं।

४. यह कि पक्ष नं. ०१ ने उपरोक्त प्लाट के टोकन के रूप मे ₹${convertNumberToHindi(data.property.tokenAmount)} / (${convertNumberToHindi(data.property.tokenAmount)} मात्र) रुपया दिनांक:- ${formatHindiDate(data.property.bookingDate)} को ${convertToHindi(data.property.paymentMode)} माध्यम से दिया है। (जोकि किसी भी स्थिति मे वापस नहीं किया जाएगा)

५. यह कि पक्ष नं.-०१ ने उपरोक्त प्लॉट का अग्रिम भुगतान ₹${convertNumberToHindi(data.property.tokenAmount)} / (${convertNumberToHindi(data.property.tokenAmount)} मात्र) रुपया दिनांक:- ${formatHindiDate(data.property.bookingDate)} को ${data.property.paymentMode === 'Cash' ? 'नगद' : data.property.paymentMode === 'Cheque' ? 'चेक' : 'ई-ट्रान्सफर'} माध्यम से दिया है। जिसका संदर्भ क्रमांक:- ${data.property.paymentMode !== 'Cash' ? (data.property.paymentReference || '___________') : '___________'} है। (जोकि सौदा रद्द होने पर मात्र ७०% ही वापस किया जाएगा।)

६. यह कि उपरोक्त ${convertNumberToHindi(data.property.area)} चौरस फीट प्लॉट की समस्त कीमत ₹ ${convertNumberToHindi(data.property.totalAmount)} / ((${convertNumberToHindi(data.property.totalAmount)} मात्र) रुपया है। जिसमे से पक्ष नं. ०१ ने पक्ष नं. ०२ को करारनामे की दिनांक तक ₹ ${convertNumberToHindi(data.property.tokenAmount)} / (${convertNumberToHindi(data.property.tokenAmount)} मात्र) रुपया दे दिया है। बाकी बचा हुआ भुगतान ₹ ${convertNumberToHindi(Number(data.property.totalAmount || 0) - Number(data.property.tokenAmount || 0))} / (${convertNumberToHindi(Number(data.property.totalAmount || 0) - Number(data.property.tokenAmount || 0))} मात्र) रुपया पक्ष नं. ०१, पक्ष नं. ०२ को ${convertNumberToHindi(data.property.emiDuration)} (${convertNumberToHindi(data.property.emiDuration)}) माह की आसान किस्तों मे भुगतान करेगा। पक्ष नं. ०१ की प्रत्येक मासिक किश्त ₹ (${convertNumberToHindi(emi)} मात्र) रुपया की होगी।
`}
  </div>
<PrintFooter />
</div>


{/* PAGE 3 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15px] leading-[1.9] text-justify">

{`
७.	यह किउपरोक्त प्लाट की अंतिम मासिक किश्त दिनांक:- ${formatHindiDate(lastInstallmentDate)} को लगेगी, दिनांक:- ${formatHindiDate(agreementEndDate)} को  यह क़रारनामा समाप्त हो जाएगा और इसके बाद कोई भी किश्त स्वीकार नहीं की जाएगी। और यदि उपरोक्त प्लाट का भुगतान बाकी है तो इस संदर्भ मे पक्ष नं. ०२का निर्णय ही अंतिम निर्णय होगा (कि पक्ष नं. ०१ से बाकी बची हुई रकम लेकर प्लॉट देना है या करारनामे के नियमानुसार कटौती करने के बाद बाकी बची हुई रकम चैक के माध्यम से करारनामे की अवधि पूर्ण होने के बाद अधिकतम छ्ह माह में पक्ष नं. ०१ को वापस करना है या बाकी बचे हुए भुगतान पर १०% मासिक चक्रवृद्धि ब्याज लगाकर लेना है और पक्ष नं. ०१ प्लॉट देना है) जो कि पक्ष नं. ०१ को अभी से सर्व रूपों में मान्य है।
८.	उपरोक्त प्लॉट का सम्पूर्ण विवरण निम्न लिखित हैं।:-
    उपरोक्त प्लॉट :- ${convertNumberToHindi(data.property.plotNumber)} / (${convertNumberToHindi(data.property.plotNumber)}), कुल ${convertNumberToHindi(data.property.area)} चौरस फीट)
    पूर्व दिशा मे :- _______
    पश्चिम दिशा मे :- प्लाट नं._______
    उत्तर दिशा मे :- प्लॉट नं._______
	(उ) दक्षिण दिशा मे :-खसरा नं.______					
९.	उपरोक्त लेआउट पर उपरोक्त निश्चित मूल्य में आश्रय ग्रुप की ओर से दिये जाने वाले विकास कार्ये:-
	(अ)	यह किउपरोक्त लेआउट के समस्त रोड्स केवल (मुरुम निर्मित मात्र) श्रेणी के 	दिये जाएंगे।
	(आ)	यह किउपरोक्त लेआउट का सार्वजनिक उपयोगिता स्थान का विकास करके दिया जाएगा जिसमे पेड़, पौधे, इत्यादि सम्मिलित हैं।								
    (इ)	यह कि उपरोक्त लेआउट पर केवल बिजली के खम्बे मात्र ही लगा कर दिये जाएंगे।
१०.	पक्ष नं. ०१को दिये जाने वाले लाभ:-
	(अ)	यह कि यदि पक्ष नं. ०१ उपरोक्त प्लॉट की समस्त उपरोक्त राशि का भुगतान प्लॉट बुकिंग की दिनांक ${formatHindiDate(data.property.bookingDate)} से अंतिम दिन तक कर देता हैं तो पक्ष नं. ०१ को बोनस के तौर पर ५% उपरोक्त प्लॉट की समस्त कीमत में से ५% राशि की छूट प्रदान की जाएगी।
	(आ)	यह कि यदि पक्ष नं. ०१ उपरोक्त प्लॉट की समस्त उपरोक्त राशि का भुगतान प्लॉट बुकिंग की दिनांक ${formatHindiDate(data.property.bookingDate)} से अंतिम दिन तक कर देता हैं तो पक्ष नं. ०१ को बोनस के तौर पर ३% उपरोक्त प्लॉट की समस्त कीमत मे से ३% राशि की छूट प्रदान की जाएगी।
    (इ) यह कि यदि पक्ष नं. ०१ उपरोक्त प्लॉट की समस्त उपरोक्त राशि का भुगतान प्लॉट बुकिंग की दिनांक ${formatHindiDate(agreementEndDate)} से करारनामे के अंतिम दिन तक कर देता हैं तो पक्ष नं. ०१ को बोनस के तौर पर १.००% उपरोक्त प्लॉट की समस्त कीमत मे से १.००% राशि की छूट प्रदान की जाएगी।
`}
  </div>
<PrintFooter />
</div>


{/* PAGE 4 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15px] leading-[1.9] text-justify">

{`
    ११.	करारनामे के नियम व शर्तें निम्न लिखित हैं।:-
	(अ)	यह कि पक्ष नं. ०१ को नियमानुसार हर माह की १० तारीख तक उपरोक्त प्लॉट की किश्त हर अवस्थामे जमा करनी होगी,११तारीख को जमा करने पर किश्त की समस्त राशि पर १०% ब्याज का अतिरिक्त भुगतान विलंब-शुल्क के रूप मे करना अनिवार्ये होगा, पक्ष नं. ०१ किश्त का भुगतान करने के लिए नेट बैंकिंग,मोबाइल वालेट,बैंक चेक या अन्य किसी भी माध्यम का प्रयोग कर सकता हैं।
    (आ)	यह कि यदि पक्ष नं. ०१ किसी माह मे किस्त भरने मे असमर्थ हैं तो पक्ष नं. ०१ ऑफिस 	के संपर्क नम्बर पर या ऑफिस के अधिकारी के संपर्क नम्बर पर संपर्क कर अवश्य ही सूचित करेंगा अन्यथा किश्त की राशि पर १०% ब्याज का अतिरिक्त भुगतान बिलंब शुल्क के रूप मे जमा करना अनिवार्ये होगा।
	(इ)	यह कि यदि पक्ष नं. ०१किसी भी परिस्थिति मे बिना सुचित किए लगातार तीन माह तक 	किश्त का भुगतान नहीं करता हैं तो यह क़रारनामा अमान्य होगा और पक्ष नं. ०१ को बिना सूचित किये उपरोक्त प्लॉट किसी और को आवंटित कर दिया जाएगा और पक्ष नं. ०१ को प्लॉट नहीं दिया जाएगा परन्तु जब तक पक्ष नं. ०१ निरस्तीकरण के लिए स्वहस्ताक्षरित प्रार्थना इस कार्यालय में जमा नहीं करता तब तक पक्ष नं. ०१ पर मासिक किश्त का विलम्ब शुक्ल लगता रहेगा और यदि पक्ष नं. ०१ इसके विरूद्ध न्यायालय मे अर्ज़ी करता हैं तो पक्ष नं. ०१ इस करारनामे के उल्लंघन के अपराध मे भारतीय दण्ड नियमावली के आधार पर दण्ड के भोगी होगा।
	(ई)	यह कि यदि पक्ष नं. ०१ क़रारनामा रद्द होने के बाद भी खंड ११ के उपखड़ (इ) का उल्लंघन करते हुए उपरोक्त प्लॉट के लिए दोबारा इस ऑफिस मे अर्ज़ी देता हैं और उपरोक्त प्लॉट उस समय तक किसी अन्य को आवंटित नहीं हुआ है तो पक्ष नं. ०१ को छूटी हुई समस्त किश्तों पर १०% (दस प्रतिशत) मासिक चक्रबृद्धि ब्याज की दर से अतिरिक्त भुगतान विलंब-शुल्क के रूप में करना अनिवार्ये होगा और भविष्य मे कभी भी यह भूल न दोहराने का शपथ पत्र भी लिख कर देना होगा।
    (उ) यह कि पक्ष नं. ०१ की ओर से किसी भी कारण से यह क़रारनामा रद्द होने के बाद पक्ष नं. ०१ को अग्रिम भुगतान एवं टोकन राशि उपरोक्त खंड नं. ०४ और ०५ के अनुसार काट कर शेष समस्त बची राशि मे से ३०% (तीस प्रतिशत) राशि दण्ड स्वरूप काटी जाएगी तथा अंतिम जितनी किश्तों का भुगतान पक्ष नं. ०१ ने नहीं किया है उनके ऊपर विलम्ब शुल्क, जोकि उपरोक्त निश्चित है वह भी पक्ष नं. ०१ की शेष बाकी बची ७०%(सत्तर प्रतिशत) राशि से काट कर बाकी का बचा हुआ पैसा चेक के माध्यम से इस करारमाने की अवधि पूर्ण होने के बाद अधिकतम छ्ह माह मे ही वापस दिया जाएगा और पक्ष नं. ०१बीच मे किसी भी प्रकार का हस्तक्छेप नहीं करेंगा। यदि आप ऐसा करता हैं तो पक्ष नं. ०१ इस क़रारनामे के उल्लंघन के अपराध मे भारतीय दण्ड नियमावली के आधार पर दण्ड के हकदार होगा।
    (ऊ)	यह कि उपरोक्त प्लॉट का विक्री पत्र/विकक्री का क़रारनामा/आमुख्त्यार पत्र की समस्त कीमत पक्ष नं. ०१ को ही देनी होगी तथा सरकार,ग्रामपंचायत,नगरपंचायत इसके अलावा जो भी सरकारी कर हैं वह भी पक्ष नं. ०१ ही भुगतान करेगा।
`}
  </div>
<PrintFooter />
</div>

{/* PAGE 5 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15px] leading-[1.9] text-justify">

{`
  (ऋ) यह कि उपरोक्त सम्पूर्ण ले-आउट को NMRDA/गुंठेवारी कानून के नियमानुसार अप्रूव 	कराने की सम्पूर्ण जवाबदारी एवं सम्पूर्ण ले-आउट को NMRDA/गुंठेवारी कानून के अनुसार 	विकसित करने जैसे रोड, बिजली,पानी, जल-मल निकासी एवं समस्त कार्ये जो उपरोक्त कानून के अनुसार हैं उनको पूर्ण करने की सम्पूर्ण जवाबदारी भी पक्ष नं. ०२ की है परंतु इस सम्पूर्ण कार्य में जितना भी व्यय होगा उसका भुगतान प्रति चौरस फुट के हिसाब से पक्ष नं. ०१ को अलग से करना अनिवार्य होगा और यह भुगतान पक्ष नं. ०२ उपरोक्त विकास कार्य में व्यय करेगा एवं शेष राशि NMRDA/गुंठेवारी कार्यालय में नियमानुसार सरकारी शुल्क के रूप में जमा करेगा।
  (ए) यह कि उपरोक्त प्लॉट का विक्री पत्र/विक्री का क़रारनामा/आमुख्त्यारपत्र इस करारनामे का खंड ११ का उपखंड (ऋ)पूर्ण होने के बाद अधिकतम छ्ह माह मे ही करके दिया जाएगा पक्ष नं. ०१विकास कार्ये पूर्ण होने से पहले और सरकारी शुल्क का भुगतान पूर्ण होने से पहले विक्री पत्र/विक्री का क़रारनामा/आमुख्त्यारके लिए किसी भी प्रकार से बाध्य नहीं करेगा।
  (ऐ) यह कि उपरोक्त प्लॉट का विक्री पत्र/विक्री का क़रारनामा/आमुख्त्यार पत्र केवल पक्ष नं. ०१ या उसके रक्त संबंधी/पति/पत्नी के नाम में ही होगा यदि पक्ष नं. ०१ किसी अन्य के नाम मे करवाना चाहता हैं तो उसके लिए १०% स्थानांतरण शुल्क उपरोक्त इस प्लॉट के उस समय के बजार मूल्य के अनुसार अतिरिक्त भुगतान पक्ष नं. ०१, पक्ष नं. ०२ को अनिवार्ये रूप से करेगा यह पक्ष नं. ०१ को मंजूर है।
  (ओ) यह कि उपरोक्त प्लॉट काविक्री पत्र/विक्री का क़रारनामा/आमुख्त्यार पत्र लगाने से पहले यह क़रारनामा और भुगतान की समस्त पावतियाँ तथा इस सौदे से संबन्धित जो भी कागज़/पत्र इस कार्यालय से पक्ष नं. ०१ को जारी किये गये हैं वह समस्त बिना किसी भी प्रश्न के इस कार्यालय मे जमा करना अनिवार्ये हैं।
  (औ) यह कि यदि पक्ष नं. ०१ के पास भुगतान पावती नहीं हैं तो प्रति पावती १००/-(एक सौ मात्र) रुपया जमा कर उसकी दूसरी प्रति इस कार्यालय से बना कर जमा करना अनिवार्ये है उसके उपरांत ही विक्री पत्र/विक्री का क़रारनामा/आमुख्त्यार पत्र लगाकर दिया जाएगा। बिना समस्त दस्तबेज जमा किए इस कार्य के लिए किसी भी रूप मे बाध्य नहीं करेंगा यदि ऐसा करता हैं तो इस करारनामे के उल्लंघन के अपराध मेभारतिय संविधान की दण्ड नियमावली के आधार पर दण्ड का हकदार होगा।
  (अं) यह कि यदि उपरोक्त प्लॉट का यह क़रारनामा ही गुम है तो इस सम्बंधमे इस कार्यालय के प्रशासनिक अधिकारी का निर्णय ही अंतिम निर्णय होगा जो पक्ष नं. ०१को सर्व रूपों मे अभी से मान्य है।
  (अः) यह कि उपरोक्त प्लॉट का यह क़रारनामा केवल पक्ष नं. ०१ से किया गया है यदि भविष्य में पक्ष नं. ०२ इस प्लॉट का क़रारनामा पक्ष नं. ०१ के इस करारनामे के वैध रहते हुए किसी और से करता हैं या पक्ष नं. ०१के अलावा किसी और से कर चुका हैं और वह क़रारनामा अभी तक अर्थात इस करारनामे के पूर्ण होने की दिनांक तक वैध है तो पक्ष नं. ०२ भारतिय संविधान की दण्ड नियमावली के आधार पर दण्ड का हकदार होगा।
`}
  </div>
<PrintFooter />
</div>


{/* PAGE 6 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15px] leading-[1.9] text-justify">

{`
  (क) यह कि उपरोक्त प्लॉट का विक्री पत्र/विक्री का क़रारनामा/आमुख्त्यार पत्रपक्ष नं. ०१ के हक में लगाने से पहले पक्ष नं. ०२ को कुछ होता है तो पक्ष नं. ०२के वारिसदार इस कार्ये को इसी करारनामे के अनुसार पूर्ण कर पक्ष नं. ०१ को उपरोक्त प्लाट का विक्री पत्र/विक्री का क़रारनामा/आमुख्त्यार पत्रलगा कर देंगे पक्ष नं. ०२ उत्तराधिकारियों को यह अधिकार अभी से इसी क़रारनामे मे दे रहा हैं। ताकि भविष्य मेपक्ष नं. ०१ किसी भी रूप में किसी भी प्रकार की समस्या का सामना न करना पड़े।					
  (ख) यह किपक्ष नं. ०१को इस समय जो प्लॉट नंबर दिया गया है वह भविष्य मे बदली हो 	सकता हैं परंतु प्लॉट का स्थान बदली नहीं होगा परन्तु यदि NMRDA/गुंठेवारी कानून के अनुसार समस्त ले-आउट में मजबूरन कुछ बदलाओ करना पड़ता है और उस कारण से स्थान बदली होता है तो पक्ष नं. ०१ पूर्ण सहयोग करेंगा,पक्ष नं. ०१ इस कार्य के लिए पूर्ण रूप से सहमत और भविष्य में कोई भी वाद-विवाद नहीं करेंगा। यदि करता हैं तो करारनामा उल्लंघन के अपराध में भारतिय संविधान की दण्ड नियमावली के आधार पर दण्ड का हकदार होगा जोकि पक्ष नं. ०१ अभी से मान्य है।
  (ग) यह कि पक्ष नं. ०१ को एक व्हाट्स-एपब्रोडकास्ट ग्रुप पर जोड़ा जाएगा यदि पक्ष नं. ०१. व्हाट्स-एप का 	प्रयोग 	नहीं करता हैं तो एस.एम.एस. या फोन काल के माध्यम से समस्त जानकारियाँ जैसे किश्त भुगतान का रिमाईंडर,कागज़ पत्र संबंधी जानकारी, करारनामे से संबन्धित जानकारी, नोटिस इनके अलावा अन्य समस्त जो भी जानकारियाँ प्रदान की जाएंगी वह समस्त कार्यालय से दी गयी जानकारियाँ होंगी और पूर्ण रूप के प्रमाणीकृत	होगी पक्ष नं. ०१ को उन 	समस्त को पूर्ण गम्भीरता से लेना हैI यदि पक्ष नं. ०१ गंभीरता से नहीं लेता हैं और करारनामे के विरुद्ध कार्यवाही कर देता हैं तो पक्ष नं.०१ क़रारनामा उल्लंघन का दोषी होगा और उसी के अनुसार उस पर कार्यवाही की जाएगी।
  (घ) यह कि करारनामे के समय पक्ष नं. ०१ने जो संपर्क नम्बर पंजीकृत कराया है यदि किसी कारणवश वह संपर्क नंबर बदली होता हैं या स्थाई रूप से बंद होता हैं तो पक्ष नं. ०१को इस कार्यालय को शीघ्रता से सूचित करना होगा और दूसरा संपर्क नंबर पंजीकृत कराना होगा यदि ऐसा नहीं करता हैं और कार्यालय सम्बंधित जानकारी पक्ष नं. ०१ तक नहीं पहुँचती है तो सम्पूर्ण रूप से उसका जवाबदार पक्ष नं. ०१ होगा।
  (ड़) यह कि यदि भविष्य में उपरोक्त समस्त ले-आउट की ज़मीन पर किसी भी प्रकार की कोई कानूनी अड़चन या अन्य कोई कनूनी समस्या किसी तीसरे व्यक्ति/व्यक्तियों द्वारा उत्पन्न होती है तो पक्ष नं. ०१ शांतिरूप से अड़चन/समस्या के समाधान होने तक पूर्ण सहयोग करेगा और उपरोक्त नियमनुसार भुगतान जारी रखेगा यदि भुगतान रोकता है तो उपरोक्त नियमनुसार विलंब शुल्क का भुगतान करेगा और किसी भी रूप में किसी भी प्रकार से कोई वाद-विवाद नहीं करेगा।
`}
  </div>
<PrintFooter />
</div>



{/* PAGE 7 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>
{/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15px] leading-[1.9] text-justify">

{`
  (च) यह कि हम दोनों पक्ष अपने पूरे होश मे हैं और हमने किसी प्रकार का कोई भी नशा नहीं किया हुआ हैं और न ही हम दोनों पक्षों में कोई मानसिक रोगी है हम पूरी तरह से स्वस्थ हालत में हैं और यह शपथ लेते हैं की हम इस क़रारनामे के समस्त नियम और शर्तों को पूरी जिम्मेदारी से निभाएँगे यदि हम में से कोई भी इस क़रारनामे के विपरीत जाता है तो वह कानूनी तौर पर दण्ड का भोगी होगा और हम दोनों पक्ष इस पर पूर्ण रूप से सहमत हैं।
`}
  </div>

  {/* Section 12 */}
<div className="text-[15px] leading-[1.9] text-justify">

  <p className="font-bold mb-2">
    १२. विशेष टिप्पणी यदि कोई है:-
  </p>

  {/* 🔥 HANDWRITING SPACE (HALF PAGE) */}
  <div className="h-[35vh] border border-black mt-2"></div>

</div>
{/* Nominee Section */}
<div className="mt-6 text-[15px] space-y-6">

  <p className="font-bold">१३. नामनिर्दिष्ट :-</p>

  {/* Nominee 1 */}
  <div className="space-y-3">

    <div className="flex items-end gap-2">
      <span className="w-19 font-bold">(अ) नाम :-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNameWithTitle(data.client.nominee1Name, data.client.nominee1Title)}
      </span>
    </div>

    <div className="space-y-3">

  {/* AGE + YEAR + OCCUPATION */}
  <div className="flex items-end gap-6">

    {/* AGE */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-10 font-bold">आयु :-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNumberToHindi(data.client.nominee1Age)}
      </span>
    </div>

    {/* OCCUPATION */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-19 font-bold">व्यवसाय :-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertToHindi(data.client.nominee1Occupation)}
      </span>
    </div>

  </div>

  {/* AADHAAR */}
  <div className="flex items-end gap-3">
    <span className="w-30 font-bold">आधार नंबर :-</span>
    <span className="flex-1 border-b border-black min-h-[20px]">
      {formatAadhaarHindi(data.client.nominee1Aadhaar)}
    </span>
  </div>

</div>

  </div>

  {/* Nominee 2 */}
  <div className="space-y-3">

    <div className="flex items-end gap-2">
      <span className="w-19 font-bold">(आ) नाम :-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNameWithTitle(data.client.nominee2Name, data.client.nominee2Title)}
      </span>
    </div>

    <div className="space-y-3">

  {/* AGE + YEAR + OCCUPATION */}
  <div className="flex items-end gap-6">

    {/* AGE */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-10 font-bold">आयु :-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNumberToHindi(data.client.nominee2Age)}
      </span>
    </div>

    {/* OCCUPATION */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-19 font-bold">व्यवसाय :-
      </span>
      <span className="flex-1 border-b border-black min-h-[20px]">
       {convertToHindi(data.client.nominee2Occupation)}
      </span>
    </div>

  </div>

  {/* AADHAAR */}
  <div className="flex items-end gap-3">
    <span className="w-30 font-bold">आधार नंबर :-</span>
    <span className="flex-1 border-b border-black min-h-[20px]">
      {formatAadhaarHindi(data.client.nominee2Aadhaar)}
    </span>
  </div>

</div>

  </div>
    </div>
<PrintFooter />
</div>
  
      

  {/* PAGE 8 */}
<div className="a4-page" style={{ position: "relative" }}>
  {renderWatermark()}
  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Signatures */}
<div className="mt-12 text-[15px] space-y-10">

  {/* PARTY SIGNATURES (SIDE BY SIDE) */}
  <div className="grid grid-cols-2 gap-12">

    {/* SELLER / COMPANY */}
    <div className="text-center">
      <p className="font-bold mb-2">१४. लिख कर देने वाले के हस्ताक्षर :-</p>

      <div className="h-20"></div>

      <p className="font-bold">(_____________________)</p>

      <p className="mt-2 font-semibold">प्रबंधक</p>
      <p className="font-semibold">आश्रय ग्रुप (सो. प्रो.)</p>
    </div>

    {/* BUYER / CLIENT */}
    <div className="text-center">
      <p className="font-bold mb-2">१५. लिख कर लेने वाले के हस्ताक्षर :-</p>

      <div className="h-20"></div>

      <p className="font-bold">
        ({convertNameWithTitle(data.client.name, data.client.title) || '_____________________'})
      </p>

      <p className="mt-2 font-semibold">सदस्य</p>
    </div>

  </div>

  {/* WITNESSES */}
  <div className="mt-28">

  <p className="font-bold mb-6">१६. गवाहों के हस्ताक्षर :-</p>

  <div className="space-y-10">

      <div>
        <div className="h-16"></div>
        <p>(अ) __________________________</p>
      </div>

      <div>
        <div className="h-16"></div>
        <p>(ब) __________________________</p>
      </div>

    </div>
  </div>

 {/* END */}
<div className="mt-auto pt-16 text-center space-y-2">

    <p className="text-[18px] tracking-widest font-bold">
    * * * समाप्त * * *
  </p>

  <p className="text-[12px] tracking-wide font-medium break-words">
    {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-P${data?.property?.plotNumber || ''}-${data?.property?.projectName || ''}-${data?.property?.khasraNumber || data?.property?.surveyNumber || ''}-${data?.property?.locality || ''}-${data?.property?.district || ''}-${data?.property?.state || ''}-${data?.property?.pincode || ''}`}
  </p>

</div>
    </div>
    <PrintFooter />
    </div>

        {/* PAGE 9 — FINAL CLEAN SEPARATE PAGE */}
<div className="a4-page" style={{ position: "relative" }}>

  {/* WATERMARK */}
  <div
  style={{
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",

    display: "flex",
    alignItems: "flex-end",   // 🔥 push down
    justifyContent: "center",
    paddingBottom: "120px",   // 🔥 fine control

    opacity: 0.08,
    zIndex: 0,
    pointerEvents: "none",
  }}
>
  <img
    src={companyWatermark || companyLogo || ''}
    style={{
      width: "70%",
      maxWidth: "720px",
      height: "auto",
      objectFit: "contain",
    }}
  />
</div>

  {/* CONTENT */}
  <div style={{ position: "relative", zIndex: 1 }}>

          {/* HEADER */}
  <div className="header-box">

    {/* Top Row */}
    <div className="flex justify-between text-sm font-bold mb-2">
      <div>Reg No : {data.company?.licenseRegistrationNumber}</div>
      <div>EST. 2019</div>
    </div>

    {/* Center Branding */}
    <div className="flex flex-col items-center text-center">

      <div className="flex items-center justify-center gap-3">

  {/* ASHRAY */}
  <span
    className="text-[52px] font-extrabold font-serif leading-tight"
    style={{
      background: "linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Ashray
  </span>

  {/* LOGO */}
  <img
    src={companyLogo || ''}
    style={{
      width: "60px",
      height: "60px",
      objectFit: "contain",
    }}
  />

  {/* GROUP */}
  <span
    className="text-[52px] font-extrabold font-serif leading-tight"
    style={{
      background: "linear-gradient(180deg, #FF3A3A 0%, #FF1E2D 60%, #D9001B 100%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    }}
  >
    Group
  </span>

</div>

      <div className="text-sm font-semibold mt-2">
        Mob: +91 {data.manager?.managerPhone || data.company?.managerPhone} &nbsp;|&nbsp; Mail: {data.company?.companyEmail} &nbsp;|&nbsp; Website: {data.company?.companyWebsite}
      </div>

      <div className="text-sm mt-1">
        {[data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', ')}{data.company.companyPincode? ` - ${data.company.companyPincode}` : ''}.
      </div>

    </div>
  </div>

   {/* TITLE */}
<div className="mt-10 flex items-center justify-center relative">

  {/* CENTER TITLE */}
  <div className="font-serif text-[19px] font-bold tracking-[1.5px] uppercase text-indigo-600 underline underline-offset-4">
     प्रमाण–व–शपथपत्र
  </div>

  {/* RIGHT DATE (NOW PERFECTLY ALIGNED TO TITLE LINE) */}
  <div className="absolute right-0 text-[12px] font-semibold">
    <span className="font-bold mr-1">Date:</span>
    <span>{data.property.bookingDate}</span>
  </div>

</div>

  {/* TOKEN LINE */}
<div className="mt-6 bg-yellow-200 border border-yellow-300 text-[12.5px] font-semibold px-1 py-1 text-center">

  <div className="font-mono leading-tight break-words inline-block text-center max-w-full">
    {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-P${data?.property?.plotNumber || ''}-${data?.property?.projectName || ''}-${data?.property?.khasraNumber || data?.property?.surveyNumber || ''}-${data?.property?.locality || ''}-${data?.property?.district || ''}-${data?.property?.state || ''}-${data?.property?.pincode || ''}`}
  </div>
</div>

  {/* CONTENT BLOCK */}
<div className="mt-6 space-y-4 text-[14px]">

  {/* LINE 1 — NAME + AADHAAR */}
  <div className="field-row flex items-end gap-4">

    {/* NAME */}
    <div className="flex items-end flex-1">
      <span className="field-label mr-2 whitespace-nowrap">१. नाम:-</span>
      <span className="field-value flex-1">
        {convertNameWithTitle(data.client.name, data.client.title)}
      </span>
    </div>

    {/* AADHAAR */}
    <div className="flex items-end w-[260px]">
      <span className="field-label mr-2 whitespace-nowrap">२. आधार नं.:-</span>
      <span className="field-value flex-1">
        {formatAadhaarHindi(data.client.aadhaar)}
      </span>
    </div>

  </div>

  {/* LINE 2 — ADDRESS */}
  <div className="field-row items-start">
    <span className="field-label">३. पता:-</span>

    <div className="flex-1">
      <div className="field-value-wide">
        {convertToHindi(`${data.client.address}, ${data.client.locality}, ${data.client.district}, ${data.client.state} - ${data.client.pincode}`)}
      </div>
    </div>
  </div>

  {/* LINE 3 — MOBILE */}
  <div className="field-row">
    <span className="field-label">४. संपर्क नं.:-</span>
    <span className="field-value">
      {convertNumberToHindi(data.client.phone)}
    </span>
  </div>

</div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[15.5px] leading-[1.9] text-justify">

{`
१.  मैं निम्न हस्ताक्षर करता स्वामित्वधारी, लेखा-व-प्रशासन-मुख्य {(आश्रय ग्रुप)(सो.प्रो.)} यह प्रमाणित करता हूँ की मैंने सम्पूर्ण क़रारनामा पढ़ और समझ लिया है और क़रारनामे मे जो दोनों हस्ताक्षर करता हैं वह सम्पूर्ण रूप से स्वस्थ हैं और बिना किसी प्रकार के नशे/दबाव में मेरे समक्ष स्वेच्छा और प्रसन्नता से हस्ताक्षर किये हैं। 
२.  मैं यह शपथ लेता हूँ कि इस क़रारनामे के समस्त नियमों वा शर्तों के पालन के लिए दोनों पक्षों को सदैव जागरूक रखूँगा इसके बाद भी यदि कोई इस क़रारनामे का उल्लंघन करता है तो प्रशासन-मुख्य {(आश्रय ग्रुप)(सो.प्रो.)} होने के अधिकार से उसको भरतीय संविधान के नियमानुसार दण्ड दिलाने के लिए किसी भी प्रकार से पीछे नहीं हटूँगा किसी भी प्रकार की विवादास्य्पद स्थिति में प्रशासन-मुख्य {(आश्रय ग्रुप)(सो.प्रो.)} का निर्णय ही अंतिम निर्णय होगा जोकि दोनों पक्षों को मान्य है। 
`}
  </div>

  {/* FOOTER BLOCK (PLACE + DATE + AUTHORITY) */}
<div className="mt-auto pt-20">

  <div className="flex justify-between items-end">

    {/* LEFT SIDE — PLACE & DATE */}
<div className="text-[14px] leading-tight">

  <div className="flex items-center gap-2">
    <span className="font-semibold whitespace-nowrap">स्थान :-</span>
    <span className="border-b border-black min-w-[180px] inline-block">
          {convertToHindi(`${data.company.companyLocality || ''}${data.company.companyDistrict ? `, ${data.company.companyDistrict}` : ''}`)}
    </span>
  </div>

  <div className="flex items-center gap-2 mt-3">
    <span className="font-semibold whitespace-nowrap">दिनांक :-</span>
    <span className="border-b border-black min-w-[150px] inline-block">
      {convertNumberToHindi(new Date(data.property.bookingDate).getDate())}/
      {convertNumberToHindi(new Date(data.property.bookingDate).getMonth() + 1)}/
      {convertNumberToHindi(new Date(data.property.bookingDate).getFullYear())}
    </span>
  </div>

</div>

{/* RIGHT SIDE — FIXED AUTHORITY */}
<div className="text-right">

  <div className="font-bold text-[15px] leading-tight">
     {convertToHindi(data.manager?.managerName ? `(${data.manager.managerName})` : '')}
  </div>

  <div className="mt-2 text-[14px] leading-tight">
    मालिक
  </div>

  <div className="text-[14px] leading-tight">
    लेखा एवं प्रशासन प्रमुख
  </div>

  <div className="mt-2 font-semibold text-[14px] leading-tight">
  <div>{convertToHindi(data.company.companyName || '')}</div>
  <div>({convertToHindi(data.company.entityType)})</div>
</div>

</div>

  </div>

</div>

</div> 
</div> 
</div> 
<PrintFooter />
</div> 



); 
};
export default HindiAgreement;