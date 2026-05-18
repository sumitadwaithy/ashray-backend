import React from 'react';
import { convertToMarathi, convertNumberToMarathi, convertNameWithTitle, formatAadhaarMarathi, convertGender, } from '../../../engine/EnglishToMarathiEngine';
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

const MarathiAgreement = ({ data, companyLogo, companyWatermark  }: TemplateProps) => {

// 🔥 SAFE NUMERIC CALCULATIONS
const total = Number(data?.property?.totalAmount || 0);
const token = Number(data?.property?.tokenAmount || 0);
const duration = Number(data?.property?.emiDuration || 0);

const remaining = total - token;

const emi =
  Number(data?.property?.emiAmount) ||
  (duration > 0 ? Math.round(remaining / duration) : 0);

// 🔥 DATE
const formatMarathiDate = (dateStr?: string) => {
  if (!dateStr) return '';

  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return convertNumberToMarathi(dateStr);
  }

  const day = convertNumberToMarathi(date.getDate());
  const month = convertNumberToMarathi(date.getMonth() + 1);
  const year = convertNumberToMarathi(date.getFullYear());

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
            <div className="h-[270px]"></div>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold underline decoration-double">विक्री करारनामा</h2>
            </div>

            {/* Party 1: Buyer */}
            <div className="mb-8">
              <div className="flex items-start mb-4">
                <span className="font-bold mr-4">लिहून घेणारे (पक्ष क्र.-०१) – खरेदीदार:-</span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">(१) नाव:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{convertNameWithTitle(data.client.name, data.client.title)}</span>
                  </div>
                  {/* Age + Gender */}
<div className="flex items-end pb-1">
  <span className="w-24 font-bold">वय:-</span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {convertNumberToMarathi(data.client.age)} वर्षे
  </span>

  <span className="w-20 font-bold">लिंग:-</span>
  <span className="w-32 border-b border-black inline-block min-h-[20px]">
    {convertGender(data.client.gender)}
  </span>
</div>

{/* Occupation (Separate Line) */}
<div className="flex items-end pb-1">
  <span className="w-24 font-bold">व्यवसाय:-</span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {convertToMarathi(data.client.occupation)}
  </span>


                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">पत्ता:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">        
                       {convertToMarathi(`${data.client.address}, ${data.client.locality}, ${data.client.district}, ${data.client.state} - ${data.client.pincode}`)}
                    </span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-40 font-bold">आधार क्रमांक:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{formatAadhaarMarathi(data.client.aadhaar)}</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">पॅन क्रमांक:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{String(data.client.pan || '').toUpperCase()}</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">दूरध्वनी क्र.:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">{convertNumberToMarathi(data.client.phone)}</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">ईमेल आयडी:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">
                      {data.client.email}
                    </span>

            </div>
            </div>
            </div>

            </div>

            {/* Party 2: Seller (Ashray Group) */}
            <div className="mb-12">
              <div className="flex items-start mb-4">
                <span className="font-bold mr-4">लिहून देणारे (पक्ष क्र.-०२) – विक्रेता :-</span>
                                  <span className="invisible">a</span>
                <div className="flex-1 space-y-2">
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">(१) नाव:-</span>
                    
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">व्यवस्थापक, {convertToMarathi(data.company.companyName || '')} ({convertToMarathi(data.company.entityType)})</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-24 font-bold">पत्ता:-</span>
<span className="flex-1 border-b border-black inline-block min-h-[20px]">
  {convertToMarathi(
    `${[
      data.company.companyAddress,
      data.company.companyLocality,
      data.company.companyDistrict,
      data.company.companyState
    ]
      .filter(Boolean)
      .join(', ')}${
      data.company.companyPincode ? ` - ${data.company.companyPincode}` : ''
    }.`
  )}
</span>
                  </div>
                  <div className="flex items-end pb-1">
                    <span className="w-32 font-bold">आधार क्रमांक:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">
  {data.manager?.managerAadhaar
    ? formatAadhaarMarathi(data.manager.managerAadhaar)
    : '________________'}
</span>
                  </div>

                  <div className="flex items-end pb-1">
                    <span className="w-32 font-bold">पॅन क्रमांक:-</span>
                   <span className="flex-1 border-b border-black inline-block min-h-[20px]">
  {data.manager?.managerPAN
    ? String(data.manager.managerPAN).toUpperCase()
    : '________________'}
</span>
                  </div>

                  <div className="flex items-end pb-1">
                    <span className="w-32 font-bold">दूरध्वनी क्रमांक:-</span>
                    <span className="flex-1 border-b border-black inline-block min-h-[20px]">८८८८८ ५४९१२</span>
                  </div>

                  {/* LICENSE REGISTRATION — SINGLE LINE */}
<div className="flex items-end pb-1">
  <span className="w-40 font-bold whitespace-nowrap">
    परवाना नोंदणी क्र.:
  </span>
  <span className="flex-1 border-b border-black inline-block min-h-[20px]">
    {convertToMarathi(data.company?.licenseRegistrationNumber)}
  </span>
</div>

  {/* LINE 2 — URC NUMBER */}
  <div className="flex items-end">
    <span className="w-40 font-bold">
      URC क्रमांक:
    </span>
    <span className="flex-1 border-b border-black inline-block min-h-[20px]">
      {convertToMarathi(data.company.urcNumber)}
    </span>
  </div>
                </div>
              </div>
             </div> 
             <PrintFooter />
              </div>
        {/* GAP BETWEEN PAGES */}
<div className="a4-gap" />

       <div className="a4-page" style={{ position: "relative" }}>

  {renderWatermark()}

  <div style={{ position: "relative", zIndex: 1 }}>
  </div>


  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[16px] leading-[1.9] text-justify">

{`
१. हा करारनामा दिनांक ${formatMarathiDate(data.property.bookingDate)} रोजी (दिवस: ${data.property.bookingDay?.hi}) वरील उभय पक्षांच्या संपूर्ण संमतीने व आनंदाने लिहिला जात आहे. त्याचा संपूर्ण तपशील पुढीलप्रमाणे आहे.

२. पक्ष क्र.-०२ यांच्या मालकी व हक्काच्या जमिनीवर, जी त्यांच्याच ताब्यात आहे, त्यावर “${convertToMarathi(data.property.projectName)}” या नावाने व्यावसायिक व निवासी प्लॉट लेआउट विकसित केला आहे. हे मौजे:- ${convertToMarathi(data.property.locality)} , तालुका:- ${convertToMarathi(data.property.tehsil)} , जिल्हा:- ${convertToMarathi(data.property.district)} यांच्या अंतर्गत येते. त्याचा गट नंबर:- ${convertNumberToMarathi(data.property.khasraNumber)} व पटवारी हलका नंबर:- ${convertNumberToMarathi(data.property.surveyNumber)} आहे।

३. वरील लेआउटवर पक्ष क्र.-०१ यांना प्लॉट नंबर:- ${convertNumberToMarathi(data.property.plotNumber)} / (${convertNumberToMarathi(data.property.plotNumber)}), जो ${convertNumberToMarathi(data.property.area)} / (${convertNumberToMarathi(data.property.area)} मात्र) चौरस फूट आहे, तो ${convertNumberToMarathi(data.property.rate)} / (${convertNumberToMarathi(data.property.rate)} मात्र) रुपये प्रति चौरस फूट या दराने देण्याचा करार ठरला आहे. त्याचा सर्व तपशील पुढीलप्रमाणे आहे.

४. पक्ष क्र.-०१ यांनी वरील प्लॉटचे टोकन म्हणून ${convertNumberToMarathi(data.property.tokenAmount)} / (${convertNumberToMarathi(data.property.tokenAmount)} मात्र) रुपये दिनांक:- ${formatMarathiDate(data.property.bookingDate)}. ${convertToMarathi(data.property.paymentMode)} दिले आहेत. (हे कोणत्याही परिस्थितीत परत केले जाणार नाहीत.)

५. पक्ष क्र.-०१ यांनी वरील प्लॉटची आगाऊ रक्कम ${convertNumberToMarathi(data.property.tokenAmount)} / (${convertNumberToMarathi(data.property.tokenAmount)} मात्र) रुपये दिनांक:- ${formatMarathiDate(data.property.bookingDate)} पर्यंत ${convertToMarathi(data.property.paymentMode)} दिनांक:- ${formatMarathiDate(data.property.bookingDate)}, ${data.property.paymentMode === 'Cash' ? 'नगद' : data.property.paymentMode === 'Cheque' ? 'चेक' : 'ई-ट्रान्सफर'} द्वारे दिली आहे.  त्याचा स्लिप क्र.:- ${data.property.paymentMode !== 'Cash' ? (data.property.paymentReference || '___________') : '___________'} आहे. (व्यवहार रद्द झाल्यास केवळ ७०% रक्कमच परत केली जाईल.)

६. वरील ${convertNumberToMarathi(data.property.area)} चौरस फुटांच्या प्लॉटची एकूण किंमत ${convertNumberToMarathi(data.property.totalAmount)} / ((${convertNumberToMarathi(data.property.totalAmount)} मात्र) रुपये आहे. त्यापैकी पक्ष क्र.-०१ यांनी करारनाम्याच्या दिनांकापर्यंत पक्ष क्र.-०२ यांना ${convertNumberToMarathi(data.property.tokenAmount)} / (${convertNumberToMarathi(data.property.tokenAmount)} मात्र) रुपये दिले आहेत. उर्वरित रक्कम ${convertNumberToMarathi(Number(data.property.totalAmount || 0) - Number(data.property.tokenAmount || 0))} / (${convertNumberToMarathi(Number(data.property.totalAmount || 0) - Number(data.property.tokenAmount || 0))} मात्र) रुपये पक्ष क्र.-०१ हे पक्ष क्र.-०२ यांना ${convertNumberToMarathi(data.property.emiDuration)} (${convertNumberToMarathi(data.property.emiDuration)}) महिन्यांच्या सोप्या हप्त्यांमध्ये अदा करतील. पक्ष क्र.-०१ यांचा प्रत्येक मासिक हप्ता (${convertNumberToMarathi(emi)} मात्र) रुपये असेल.
`}
  </div>
<PrintFooter />
</div>


<div className="a4-page" style={{ position: "relative" }}>

  {renderWatermark()}

  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[16px] leading-[1.9] text-justify">

{`
७. वरील प्लॉटचा शेवटचा मासिक हप्ता दिनांक:- ${formatMarathiDate(lastInstallmentDate)} रोजी येईल, दिनांक:- ${formatMarathiDate(agreementEndDate)} रोजी हा करारनामा संपुष्टात येईल आणि त्यानंतर कोणताही हप्ता स्वीकारला जाणार नाही. जर वरील प्लॉटची रक्कम शिल्लक असेल तर त्याबाबत पक्ष क्र.-०२ यांचा निर्णय अंतिम असेल — की पक्ष क्र.-०१ कडून उर्वरित रक्कम घेऊन प्लॉट द्यायचा, किंवा करारनाम्याच्या नियमानुसार कपात करून शिल्लक रक्कम करारनाम्याची मुदत संपल्यानंतर जास्तीत जास्त सहा महिन्यांत चेकद्वारे परत करायची, किंवा उर्वरित रकमेवर १०% मासिक चक्रवाढ व्याज आकारून प्लॉट द्यायचा. हे पक्ष क्र.-०१ यांना आत्तापासूनच सर्व प्रकारे मान्य आहे.
८. वरील प्लॉटचा संपूर्ण तपशील पुढीलप्रमाणे आहे:
    वरील प्लॉट:- ${convertNumberToMarathi(data.property.plotNumber)} / (${convertNumberToMarathi(data.property.plotNumber)}), एकूण ${convertNumberToMarathi(data.property.area)} चौरस फूट)
    पूर्व दिशेस:- _______
    पश्चिम दिशेस:- ______ प्लॉट नं.- _______
    उत्तर दिशेस:- _______ प्लॉट नं.- _______
	(उ) दक्षिण दिशेस:- ______ खसरा नं.______					
९. वरील लेआउटवर वरील निश्चित किमतीत आश्रय ग्रुपकडून केले जाणारे विकास कार्य:
	(अ) वरील लेआउटचे सर्व रस्ते केवळ मुरूम (खडी/माती) श्रेणीचे दिले जातील.
	(आ) वरील लेआउटच्या सार्वजनिक उपयोगिता स्थळाचा विकास केला जाईल, ज्यात झाडे, वनस्पती इत्यादींचा समावेश आहे.
    (इ) वरील लेआउटवर केवळ वीज खांबच लावले जातील.
१०. पक्ष क्र.-०१ यांना दिले जाणारे लाभ:
	(अ) जर पक्ष क्र.-०१ यांनी प्लॉट बुकिंगच्या दिनांकापासून  ${formatMarathiDate(data.property.bookingDate)} १ (एक) वर्षाच्या शेवटच्या दिवसापर्यंत वरील प्लॉटची संपूर्ण रक्कम भरली तर पक्ष क्र.-०१ यांना बोनस म्हणून प्लॉटच्या एकूण किमतीत ५% सूट दिली जाईल.
	(आ) जर पक्ष क्र.-०१ यांनी प्लॉट बुकिंगच्या दिनांकापासून ${formatMarathiDate(data.property.bookingDate)} २ (दोन) वर्षांच्या शेवटच्या दिवसापर्यंत वरील प्लॉटची संपूर्ण रक्कम भरली तर पक्ष क्र.-०१ यांना बोनस म्हणून प्लॉटच्या एकूण किमतीत ३% सूट दिली जाईल.
    (इ) जर पक्ष क्र.-०१ यांनी प्लॉट बुकिंगच्या दिनांकापासून ${formatMarathiDate(agreementEndDate)} करारनाम्याच्या शेवटच्या दिवसापर्यंत वरील प्लॉटची संपूर्ण रक्कम भरली तर पक्ष क्र.-०१ यांना बोनस म्हणून प्लॉटच्या एकूण किमतीत १.००% सूट दिली जाईल.
`}
  </div>
<PrintFooter />
</div>


<div className="a4-page" style={{ position: "relative" }}>

  {renderWatermark()}

  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[16px] leading-[1.9] text-justify">

{`
  ११. करारनाम्याचे नियम व अटी पुढीलप्रमाणे आहेत:
  (अ) पक्ष क्र.-०१ यांना नियमानुसार दर महिन्याच्या १० तारखेपर्यंत वरील प्लॉटचा हप्ता प्रत्येक परिस्थितीत भरावा लागेल. ११ तारखेला भरल्यास हप्त्याच्या एकूण रकमेवर १०% व्याज अतिरिक्त विलंब शुल्क म्हणून अनिवार्यपणे भरावे लागेल. पक्ष क्र.-०१ हप्ता भरण्यासाठी नेट बँकिंग, मोबाइल वॉलेट, बँक चेक किंवा इतर कोणत्याही माध्यमाचा वापर करू शकतात.
  (आ) जर पक्ष क्र.-०१ एखाद्या महिन्यात हप्ता भरण्यास असमर्थ असतील तर त्यांनी कार्यालयाच्या संपर्क क्रमांकावर किंवा कार्यालयाच्या अधिकाऱ्यांच्या संपर्क क्रमांकावर संपर्क करून अवश्य कळवावे; अन्यथा हप्त्याच्या रकमेवर १०% व्याज अतिरिक्त विलंब शुल्क म्हणून अनिवार्यपणे भरावे लागेल.
  (इ) जर पक्ष क्र.-०१ यांनी कोणत्याही परिस्थितीत न कळवता सलग तीन महिने हप्ता भरला नाही तर हा करारनामा रद्द होईल आणि पक्ष क्र.-०१ यांना न कळवता वरील प्लॉट दुसऱ्या कोणाला वाटप केला जाईल व पक्ष क्र.-०१ यांना प्लॉट दिला जाणार नाही. परंतु जोपर्यंत पक्ष क्र.-०१ रद्द करण्यासाठी स्वहस्ताक्षरित अर्ज या कार्यालयात जमा करत नाहीत तोपर्यंत पक्ष क्र.-०१ यांच्यावर मासिक हप्त्याचे विलंब शुल्क लागत राहील. जर पक्ष क्र.-०१ यांनी याविरुद्ध न्यायालयात अर्ज केला तर ते या करारनाम्याच्या उल्लंघनाच्या गुन्ह्यासाठी भारतीय दंड संहितेनुसार शिक्षेस पात्र होतील.
  (ई) जर पक्ष क्र.-०१ यांनी करारनामा रद्द झाल्यानंतरही कलम-११ च्या उपकलम-(इ) चे उल्लंघन करून वरील प्लॉटसाठी पुन्हा या कार्यालयात अर्ज केला आणि वरील प्लॉट त्यावेळी दुसऱ्या कोणाला वाटप झालेला नसेल तर पक्ष क्र.-०१ यांना चुकलेल्या सर्व हप्त्यांवर १०% (दहा टक्के) मासिक चक्रवाढ व्याज दराने अतिरिक्त विलंब शुल्क अनिवार्यपणे भरावे लागेल आणि भविष्यात अशी चूक पुन्हा न करण्याचे प्रतिज्ञापत्रही लिहून द्यावे लागेल.
  (उ) पक्ष क्र.-०१ यांच्याकडून कोणत्याही कारणास्तव हा करारनामा रद्द झाल्यानंतर, वरील कलम क्र.-०४ व ०५ नुसार आगाऊ रक्कम व टोकन रक्कम वजा करून उर्वरित रकमेतून ३०% (तीस टक्के) रक्कम दंड म्हणून कापली जाईल. तसेच पक्ष क्र.-०१ यांनी न भरलेल्या अंतिम हप्त्यांवरील विलंब शुल्क देखील उर्वरित ७०% (सत्तर टक्के) रकमेतून वजा करून शिल्लक राहिलेली रक्कम करारनाम्याची मुदत संपल्यानंतर जास्तीत जास्त सहा महिन्यांत चेकद्वारे परत दिली जाईल. पक्ष क्र.-०१ यादरम्यान कोणत्याही प्रकारचा हस्तक्षेप करणार नाहीत. तसे केल्यास पक्ष क्र.-०१ या करारनाम्याच्या उल्लंघनाच्या गुन्ह्यासाठी भारतीय दंड संहितेनुसार शिक्षेस पात्र होतील.
  (ऊ) वरील प्लॉटचे विक्री पत्र/विक्री करारनामा/मुखत्यारपत्र यांचा सर्व खर्च पक्ष क्र.-०१ यांनाच करावा लागेल. तसेच शासन, ग्रामपंचायत, नगरपंचायत यांचे इतर जे काही सरकारी कर असतील ते देखील पक्ष क्र.-०१ यांनाच भरावे लागतील.
`}
  </div>
<PrintFooter />
</div>

<div className="a4-page" style={{ position: "relative" }}>

  {renderWatermark()}

  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री का करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[16px] leading-[1.9] text-justify">

{`
  (ऋ) संपूर्ण लेआउटला NMRDA/गुंठेवारी कायद्याच्या नियमानुसार मंजुरी मिळवण्याची संपूर्ण जबाबदारी तसेच संपूर्ण लेआउट NMRDA/गुंठेवारी कायद्यानुसार रस्ते, वीज, पाणी, मलनिःसारण व इतर सर्व कामे पूर्ण करण्याची संपूर्ण जबाबदारी पक्ष क्र.-०२ यांची आहे. परंतु या सर्व कामांसाठी होणाऱ्या संपूर्ण खर्चाचे प्रति चौरस फूट प्रमाणे भुगतान पक्ष क्र.-०१ यांना वेगळे करावे लागेल. हे भुगतान पक्ष क्र.-०२ विकास कामांवर खर्च करतील आणि उर्वरित रक्कम NMRDA/गुंठेवारी कार्यालयात नियमानुसार सरकारी शुल्क म्हणून जमा करतील.
  (ए) वरील प्लॉटचे विक्री पत्र/विक्री करारनामा/मुखत्यारपत्र या करारनाम्याचे कलम ११ चे उपकलम (ऋ) पूर्ण झाल्यानंतर जास्तीत जास्त सहा महिन्यांत करून दिले जाईल. पक्ष क्र.-०१ विकास कामे पूर्ण होण्यापूर्वी व सरकारी शुल्क भरणे पूर्ण होण्यापूर्वी विक्री पत्र/विक्री करारनामा/मुखत्यारपत्रासाठी कोणत्याही प्रकारे बाध्य करणार नाहीत.
  (ऐ) वरील प्लॉटचे विक्री पत्र/विक्री करारनामा/मुखत्यारपत्र केवळ पक्ष क्र.-०१ किंवा त्यांचे रक्ताचे नातेवाईक/पती/पत्नी यांच्या नावावर होईल. जर पक्ष क्र.-०१ यांना दुसऱ्या कोणाच्या नावावर करायचे असेल तर त्यासाठी त्या वेळच्या प्लॉटच्या बाजारभावानुसार १०% हस्तांतरण शुल्क अतिरिक्त पक्ष क्र.-०१ यांनी पक्ष क्र.-०२ यांना अनिवार्यपणे द्यावे लागेल. हे पक्ष क्र.-०१ यांना मान्य आहे.
  (ओ) वरील प्लॉटचे विक्री पत्र/विक्री करारनामा/मुखत्यारपत्र करण्यापूर्वी हा करारनामा आणि भुगतानाच्या सर्व पावत्या तसेच या व्यवहाराशी संबंधित जे काही कागद/पत्र या कार्यालयाकडून पक्ष क्र.-०१ यांना दिले गेले आहेत ते सर्व कोणत्याही प्रश्नाशिवाय या कार्यालयात जमा करणे अनिवार्य आहे.
  (औ) जर पक्ष क्र.-०१ यांच्याकडे भुगतान पावती नसेल तर प्रति पावती १००/-(एकशे मात्र) रुपये जमा करून त्याची दुसरी प्रत या कार्यालयातून बनवून जमा करणे अनिवार्य आहे. त्यानंतरच विक्री पत्र/विक्री करारनामा/मुखत्यारपत्र करून दिले जाईल. सर्व कागदपत्रे जमा केल्याशिवाय या कामासाठी कोणत्याही प्रकारे बाध्य केले जाणार नाही. तसे केल्यास या करारनाम्याच्या उल्लंघनाच्या गुन्ह्यासाठी भारतीय दंड संहितेनुसार शिक्षेस पात्र होईल.
  (अं) जर वरील प्लॉटचा हा करारनामाच हरवला असेल तर त्याबाबत या कार्यालयाच्या प्रशासकीय अधिकाऱ्यांचा निर्णय अंतिम असेल, जो पक्ष क्र.-०१ यांना आत्तापासूनच सर्व प्रकारे मान्य आहे.
  (अः) वरील प्लॉटचा हा करारनामा केवळ पक्ष क्र.-०१ यांच्याशीच केला आहे. जर भविष्यात पक्ष क्र.-०२ यांनी पक्ष क्र.-०१ यांचा करारनामा वैध असताना या प्लॉटचा करारनामा दुसऱ्या कोणाशी केला किंवा आधीच केला असेल आणि तो करारनामा या करारनाम्याची मुदत संपेपर्यंत वैध असेल तर पक्ष क्र.-०२ भारतीय दंड संहितेनुसार शिक्षेस पात्र होतील.
`}
  </div>
<PrintFooter />
</div>


<div className="a4-page" style={{ position: "relative" }}>

  {renderWatermark()}

  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री करारनामा</h2>
  </div>

  {/* Page Content */}
  <div className="flex-1 whitespace-pre-line text-[16px] leading-[1.9] text-justify">

{`
  (क) वरील प्लॉटचे विक्री पत्र/विक्री करारनामा/मुखत्यारपत्र पक्ष क्र.-०१ यांच्या नावावर नोंदणी होण्यापूर्वी पक्ष क्र.-०२ यांना काही झाल्यास, पक्ष क्र.-०२ यांचे वारसदार या करारनाम्यानुसारच हे काम पूर्ण करून पक्ष क्र.-०१ यांना वरील प्लॉटचे विक्री पत्र/विक्री करारनामा/मुखत्यारपत्र करून देतील. पक्ष क्र.-०२ यांचे उत्तराधिकाऱ्यांना हा अधिकार या करारनाम्यातच आत्तापासून दिला जात आहे, जेणेकरून भविष्यात पक्ष क्र.-०१ यांना कोणत्याही प्रकारची अडचण येऊ नये.
  (ख) पक्ष क्र.-०१ यांना सध्या जो प्लॉट नंबर दिला आहे तो भविष्यात बदलू शकतो; परंतु प्लॉटचे स्थान बदलणार नाही. मात्र NMRDA/गुंठेवारी कायद्यानुसार संपूर्ण लेआउटमध्ये अपरिहार्यपणे काही बदल करावे लागल्यास आणि त्यामुळे स्थान बदलल्यास पक्ष क्र.-०१ संपूर्ण सहकार्य करतील, या कामासाठी पूर्णपणे सहमत आहेत आणि भविष्यात कोणताही वाद करणार नाहीत. तसे केल्यास करारनामा उल्लंघनाच्या गुन्ह्यासाठी भारतीय दंड संहितेनुसार शिक्षेस पात्र होतील, जे पक्ष क्र.-०१ यांना आत्तापासूनच मान्य आहे.
  (ग) पक्ष क्र.-०१ यांना एका व्हॉट्सअॅप ब्रॉडकास्ट ग्रुपवर जोडले जाईल. जर पक्ष क्र.-०१ व्हॉट्सअॅप वापरत नसतील तर एसएमएस किंवा फोन कॉलद्वारे हप्ता भरण्याचे स्मरणपत्र, कागदपत्रांशी संबंधित माहिती, करारनाम्याशी संबंधित माहिती, नोटीस व इतर सर्व माहिती दिली जाईल. ही सर्व माहिती कार्यालयाकडून दिली जाईल आणि पूर्णपणे प्रमाणित असेल. पक्ष क्र.-०१ यांनी ती सर्व पूर्ण गांभीर्याने घ्यावी. जर पक्ष क्र.-०१ गांभीर्याने घेतली नाही आणि करारनाम्याविरुद्ध कार्यवाही केली तर पक्ष क्र.-०१ करारनामा उल्लंघनाचे दोषी ठरतील आणि त्यानुसार त्यांच्यावर कार्यवाही केली जाईल.
  (घ) करारनाम्याच्या वेळी पक्ष क्र.-०१ यांनी जो संपर्क क्रमांक नोंदणी केला आहे तो कोणत्याही कारणास्तव बदलला किंवा कायमचा बंद झाला तर पक्ष क्र.-०१ यांनी त्वरित या कार्यालयाला कळवावे आणि नवीन संपर्क क्रमांक नोंदणी करावा. तसे न केल्यास आणि कार्यालयाकडून संबंधित माहिती पक्ष क्र.-०१ यांच्यापर्यंत न पोहोचल्यास त्याची संपूर्ण जबाबदारी पक्ष क्र.-०१ यांचीच राहील.
  (ङ) भविष्यात वरील संपूर्ण लेआउटच्या जमिनीवर कोणत्याही प्रकारची कायदेशीर अडचण किंवा इतर कोणतीही कायदेशीर समस्या कोणत्याही तृतीय व्यक्ती/व्यक्तींकडून निर्माण झाल्यास पक्ष क्र.-०१ शांततेने अडचण/समस्या सुटेपर्यंत पूर्ण सहकार्य करतील आणि वरील नियमानुसार भुगतान सुरू ठेवतील. भुगतान थांबवल्यास वरील नियमानुसार विलंब शुल्क भरतील आणि कोणत्याही प्रकारे कोणताही वाद करणार नाहीत.
  (च) आम्ही उभय पक्ष पूर्ण शुद्ध भानावर आहोत, आम्ही कोणत्याही प्रकारचे व्यसन केलेले नाही, आमच्यापैकी कोणीही मानसिकदृष्ट्या आजारी नाही, आम्ही पूर्णपणे निरोगी अवस्थेत आहोत आणि शपथ घेतो की आम्ही या करारनाम्याचे सर्व नियम व अटी पूर्ण जबाबदारीने पाळू. आमच्यापैकी कोणी या करारनाम्याविरुद्ध गेल्यास तो कायदेशीररीत्या शिक्षेस पात्र होईल आणि आम्ही उभय पक्ष यावर पूर्णपणे सहमत आहोत.
`}
  </div>
<PrintFooter />
</div>



<div className="a4-page" style={{ position: "relative" }}>

  {renderWatermark()}

  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री करारनामा</h2>
  </div>

  {/* Section 12 */}
<div className="text-[15px] leading-[1.9] text-justify">

  <p className="font-bold mb-2">
    १२. विशेष नोंद (असल्यास):-
  </p>

  {/* 🔥 HANDWRITING SPACE (HALF PAGE) */}
  <div className="h-[45vh] border border-black mt-2"></div>

</div>
{/* Nominee Section */}
<div className="mt-6 text-[15px] space-y-6">

  <p className="font-bold">१३. नामनिर्देशित:-</p>

  {/* Nominee 1 */}
  <div className="space-y-3">

    <div className="flex items-end gap-2">
      <span className="w-19 font-bold">(अ) नाव:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNameWithTitle(data.client.nominee1Name, data.client.nominee1Title)}
      </span>
    </div>

    <div className="space-y-3">

  {/* AGE + YEAR + OCCUPATION */}
  <div className="flex items-end gap-6">

    {/* AGE */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-10 font-bold">वय:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNumberToMarathi(data.client.nominee1Age)}
      </span>
    </div>

    {/* OCCUPATION */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-19 font-bold">व्यवसाय:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertToMarathi(data.client.nominee1Occupation)}
      </span>
    </div>

  </div>

  {/* AADHAAR */}
  <div className="flex items-end gap-3">
    <span className="w-30 font-bold">आधार क्रमांक:-</span>
    <span className="flex-1 border-b border-black min-h-[20px]">
      {formatAadhaarMarathi(data.client.nominee1Aadhaar)}
    </span>
  </div>

</div>

  </div>

  {/* Nominee 2 */}
  <div className="space-y-3">

    <div className="flex items-end gap-2">
      <span className="w-19 font-bold">(आ) नाव:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNameWithTitle(data.client.nominee2Name, data.client.nominee2Title)}
      </span>
    </div>

    <div className="space-y-3">

  {/* AGE + YEAR + OCCUPATION */}
  <div className="flex items-end gap-6">

    {/* AGE */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-10 font-bold">वय:-</span>
      <span className="flex-1 border-b border-black min-h-[20px]">
        {convertNumberToMarathi(data.client.nominee2Age)}
      </span>
    </div>

    {/* OCCUPATION */}
    <div className="flex items-end gap-2 flex-1">
      <span className="w-19 font-bold">व्यवसाय:-
      </span>
      <span className="flex-1 border-b border-black min-h-[20px]">
       {convertToMarathi(data.client.nominee2Occupation)}
      </span>
    </div>

  </div>

  {/* AADHAAR */}
  <div className="flex items-end gap-3">
    <span className="w-30 font-bold">आधार क्रमांक:-</span>
    <span className="flex-1 border-b border-black min-h-[20px]">
      {formatAadhaarMarathi(data.client.nominee2Aadhaar)}
    </span>
  </div>

</div>

  </div>
    </div>
<PrintFooter />
</div>
  
      

 <div className="a4-page" style={{ position: "relative" }}>

  {renderWatermark()}

  <div style={{ position: "relative", zIndex: 1 }}>
  </div>

  {/* Page Title */}
  <div className="text-center mb-6">
    <h2 className="text-[20px] font-bold underline tracking-wide">विक्री करारनामा</h2>
  </div>

  {/* Signatures */}
<div className="mt-12 text-[15px] space-y-10">

  {/* PARTY SIGNATURES (SIDE BY SIDE) */}
  <div className="grid grid-cols-2 gap-12">

    {/* SELLER / COMPANY */}
    <div className="text-center">
      <p className="font-bold mb-2">१४. लिहून देणाऱ्यांची (पक्ष क्र. ०१) स्वाक्षरी:-</p>

      <div className="h-20"></div>

      <p className="font-bold">(_____________________)</p>

      <p className="mt-2 font-semibold">पव्यवस्थापक</p>
      <p className="font-semibold">आश्रय ग्रुप (एकल मालकी)</p>
    </div>

    {/* BUYER / CLIENT */}
    <div className="text-center">
      <p className="font-bold mb-2">१५. लिहून घेणाऱ्यांची (पक्ष क्र. ०२) स्वाक्षरी:-</p>

      <div className="h-20"></div>

      <p className="font-bold">
        ({convertNameWithTitle(data.client.name, data.client.title) || '_____________________'})
      </p>

      <p className="mt-2 font-semibold">सदस्य / खरेदीदार</p>
    </div>

  </div>

  {/* WITNESSES */}
  <div className="mt-28">

  <p className="font-bold mb-6">१६. साक्षीदारांच्या स्वाक्षऱ्या:-</p>

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
       <span className="field-label mr-2 whitespace-nowrap">१. नाव:-</span>
       <span className="field-value flex-1">
         {convertNameWithTitle(data.client.name, data.client.title)}
       </span>
     </div>
 
     {/* AADHAAR */}
     <div className="flex items-end w-[260px]">
       <span className="field-label mr-2 whitespace-nowrap">२. आधार नं.:-</span>
       <span className="field-value flex-1">
         {formatAadhaarMarathi(data.client.aadhaar)}
       </span>
     </div>
 
   </div>
 
   {/* LINE 2 — ADDRESS */}
   <div className="field-row items-start">
     <span className="field-label">३. पत्ता:-</span>
 
     <div className="flex-1">
       <div className="field-value-wide">
         {convertToMarathi(`${data.client.address}, ${data.client.locality}, ${data.client.district}, ${data.client.state} - ${data.client.pincode}`)}
       </div>
     </div>
   </div>
 
   {/* LINE 3 — MOBILE */}
   <div className="field-row">
     <span className="field-label">४. दूरध्वनी क्रमांक:-</span>
     <span className="field-value">
       {convertNumberToMarathi(data.client.phone)}
     </span>
   </div>
 
 </div>
 
   {/* Page Content */}
   <div className="flex-1 whitespace-pre-line text-[15.5px] leading-[1.9] text-justify">
 
 {`
   १. मी, खालील सही करणारा मालक, लेखा-व-प्रशासन-प्रमुख {(आश्रय ग्रुप)(सो.प्रो.)}, हे प्रमाणित करतो की मी संपूर्ण करार वाचला आणि समजून घेतला आहे आणि करारावर जे दोन्ही सही करतात ते संपूर्णपणे सुदृढ आहेत आणि माझ्यासमक्ष कोणत्याही प्रकारच्या नशा/दबावाशिवाय स्वेच्छेने व आनंदाने सही केली आहे।
   २. मी हे शपथ घेतो की या करारातील सर्व नियम व अटींचे पालन करण्यासाठी दोन्ही पक्षांना सदैव जागरूक ठेवीन। तरीही जर कोणी या कराराचे उल्लंघन केले तर प्रशासन-प्रमुख {(आश्रय ग्रुप)(सो.प्रो.)} या नात्याने त्याला भारतीय संविधानाच्या नियमानुसार शिक्षा मिळवून देण्यासाठी कोणत्याही प्रकारे मागे हटणार नाही। कोणत्याही प्रकारच्या वादग्रस्त परिस्थितीत प्रशासन-प्रमुख {(आश्रय ग्रुप)(सो.प्रो.)} यांचा निर्णयच अंतिम निर्णय असेल जो दोन्ही पक्षांना मान्य आहे।
 `}
   </div>
 
   {/* FOOTER BLOCK (PLACE + DATE + AUTHORITY) */}
 <div className="mt-auto pt-20">
 
   <div className="flex justify-between items-end">
 
     {/* LEFT SIDE — PLACE & DATE */}
 <div className="text-[14px] leading-tight">
 
   <div className="flex items-center gap-2">
     <span className="font-semibold whitespace-nowrap">ठिकाण:-</span>
     <span className="border-b border-black min-w-[180px] inline-block">
        {convertToMarathi(`${data.company.companyLocality || ''}${data.company.companyDistrict ? `, ${data.company.companyDistrict}` : ''}`)}
     </span>
   </div>
 
   <div className="flex items-center gap-2 mt-3">
     <span className="font-semibold whitespace-nowrap">तारीख:-</span>
     <span className="border-b border-black min-w-[150px] inline-block">
       {convertNumberToMarathi(new Date(data.property.bookingDate).getDate())}/
       {convertNumberToMarathi(new Date(data.property.bookingDate).getMonth() + 1)}/
       {convertNumberToMarathi(new Date(data.property.bookingDate).getFullYear())}
     </span>
   </div>
 
 </div>
 
 {/* RIGHT SIDE — FIXED AUTHORITY */}
 <div className="text-right">
 
   <div className="font-bold text-[15px] leading-tight">
     {convertToMarathi(data.manager?.managerName ? `(${data.manager.managerName})` : '')}
   </div>
 
   <div className="mt-2 text-[14px] leading-tight">
     मालक
   </div>
 
   <div className="text-[14px] leading-tight">
     लेखा एवं प्रशासन प्रमुख
   </div>
 
   <div className="mt-2 font-semibold text-[14px] leading-tight">
     <div>{convertToMarathi(data.company.companyName || '')}</div>
       <div>(सो. प्रो.)</div>
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

export default MarathiAgreement;