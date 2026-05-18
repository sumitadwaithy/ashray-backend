import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import { convertToHindi, convertNumberToHindi, convertNameWithTitle, formatHindiDate, } from './../../../engine/EnglishToHindiEngine';

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

const HindiTokan = ({ data, companyLogo, companyWatermark }: TemplateProps) => {

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{`
        .a4-page {
          width: 210mm;
          min-height: 297mm;
          margin: 0 auto;
          background: white;
          padding: 12mm 15mm;
          box-sizing: border-box;
          page-break-after: always;
          box-shadow: 0 0 10px rgba(0,0,0,0.1);
          font-family: 'Noto Sans Devanagari', 'Mangal', sans-serif;
        }
        @media print {
          @page { size: A4; margin: 0; }
          html, body { width: 210mm; margin: 0; padding: 0; background: white; }
          body * { visibility: hidden; }
          #printable-document, #printable-document * { visibility: visible; }
          #printable-document { position: absolute; left: 0; top: 0; width: 210mm; }
          .a4-page {
            width: 210mm;
            min-height: 297mm;
            padding: 12mm 15mm;
            margin: 0;
            box-shadow: none;
            page-break-after: always;
          }
          .a4-page:last-child { page-break-after: auto; }
          .no-print { display: none !important; }
        }
        .header-box {
          border: 2.5px solid #000;
          padding: 8px 12px;
          margin-bottom: 6px;
        }
        .company-name {
          font-size: 22px;
          font-weight: 900;
          letter-spacing: 1px;
          color: #000;
          font-style: italic;
        }
        .reg-line {
          font-size: 11px;
          font-weight: 700;
          color: #000;
        }
        .since-line {
          font-size: 11px;
          font-weight: 700;
          color: #000;
        }
        .address-line {
          font-size: 10.5px;
          font-weight: 600;
          color: #000;
          margin-top: 4px;
        }
        .doc-title {
          text-align: center;
          font-weight: 800;
          text-decoration: underline;
          letter-spacing: 0.5px;
        }
        .token-number {
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }
        .field-row {
          display: flex;
          align-items: flex-end;
          margin-bottom: 5px;
          font-size: 13px;
          flex-wrap: wrap;
          gap: 4px;
        }
        .field-label {
          font-weight: 700;
          white-space: nowrap;
          font-size: 13px;
        }
        .field-value {
          border-bottom: 1px solid #000;
          min-width: 80px;
          flex: 1;
          min-height: 18px;
          font-size: 13px;
          padding: 0 2px;
        }
        .field-value-wide {
          border-bottom: 1px solid #000;
          width: 100%;
          min-height: 18px;
          font-size: 13px;
          padding: 0 2px;
          margin-top: 2px;
        }
        .clause {
          font-size: 12.5px;
          line-height: 1.75;
          text-align: justify;
          margin-bottom: 7px;
        }
        .clause-num {
          font-weight: 700;
        }
        .payment-table {
          width: 100%;
          font-size: 12px;
          margin-top: 4px;
        }
        .payment-row {
          display: flex;
          align-items: flex-end;
          gap: 6px;
          margin-bottom: 4px;
        }
        .payment-label {
          font-weight: 700;
          white-space: nowrap;
          font-size: 12.5px;
          min-width: 28px;
        }
        .payment-field {
          display: flex;
          align-items: flex-end;
          gap: 3px;
          flex: 1;
        }
        .payment-field-label {
          font-weight: 600;
          white-space: nowrap;
          font-size: 12px;
        }
        .payment-field-value {
          border-bottom: 1px solid #000;
          flex: 1;
          min-height: 16px;
          min-width: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
        font-size: 12px;      /* ↓ reduced from default */
  font-weight: 500;     /* keeps readability */
  letter-spacing: 0.3px;
}
        .sig-section {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          gap: 20px;
        }
        .sig-block {
          flex: 1;
          font-size: 12.5px;
        }
        .sig-line {
          border-bottom: 1px solid #000;
          min-height: 40px;
          margin: 6px 0;
        }
        .sig-label {
          font-weight: 700;
          font-size: 12.5px;
        }
        .witness-row {
          display: flex;
          gap: 20px;
          margin-top: 8px;
          font-size: 12.5px;
        }
        .divider {
          text-align: center;
          font-weight: 700;
          font-size: 12px;
          margin: 6px 0;
        }
        .end-text {
          text-align: center;
          font-weight: 700;
          font-size: 14px;
          margin-top: 12px;
          letter-spacing: 2px;
        }
        .underline-blank {
         border-bottom: 1px solid #000;
         display: inline-flex;
         justify-content: center;
         align-items: center;
         min-width: 80px;
         min-height: 16px;
         text-align: center;
         padding: 0 4px;
       }
        .doc-title-secondary {
         font-size: 15px;
         margin-top: 6px;
         margin-bottom: 14px;
         text-align: center;
         font-weight: 800;
         letter-spacing: 0.6px;
        }


.a4-gap {
  height: 40px; /* visual gap on screen */
}

@media print {
  .a4-gap {
    display: none;
  }

  .a4-page {
    page-break-after: always;
  }

  .a4-page:last-child {
    page-break-after: auto;
  }
}
        @media print {
           * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
           }
         }
      `}</style>

      <div style={{ fontFamily: "'Noto Sans Devanagari', 'Mangal', sans-serif" }}>

          </div>


        {/* ── PAGE 1 ─────────────────────────────────────────────── */}
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
    paddingBottom: "170px",   // 🔥 fine control

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
      <div>Since : 2019</div>
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
        Mob: +91 {data.manager?.managerPhone} &nbsp;|&nbsp; Mail: {data.company?.companyEmail} &nbsp;|&nbsp; Website: {data.company?.companyWebsite}
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
    टोकन/बयाना पत्र
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

          <div className="mt-4 grid grid-cols-[2fr_1fr_2fr] items-end gap-x-6 text-[12px]">

  {/* Name */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">१ नाम :-</span>
    <span className="ml-2 border-b border-black flex-1 text-center leading-tight">
      {data.client.name}
    </span>
  </div>

  {/* Age */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">२. आयु :-</span>
    <span className="ml-2 border-b border-black w-full text-center">
      {data.client.age}
    </span>
    <span className="ml-1 whitespace-nowrap">वर्ष</span>
  </div>

  {/* Occupation */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">३. व्यवसाय:-</span>
    <span className="ml-2 border-b border-black flex-1 text-center">
      {data.client.occupation}
    </span>
  </div>

</div>

            {/* Address */}
           <div className="field-row items-start">
  <span className="field-label">४. पता:-</span>

  <div className="flex-1">
    <div className="field-value-wide leading-[1.6] break-words">
      {[
        data.client.address,
        data.client.locality,
        data.client.district,
        data.client.state
      ]
        .filter(Boolean)
        .join(', ')}
      {data.client.pincode ? ` - ${data.client.pincode}` : ''}
	          </div>
</div>
</div>

            <div className="mt-3 flex items-center justify-between text-[13px] gap-6">

  {/* Aadhaar */}
{/* Aadhaar */}
<div className="flex items-center flex-[1.8] min-w-0">
  <span className="font-semibold whitespace-nowrap">५. आधार नंबर:-</span>

  <span className="ml-2 border-b border-black px-2 flex-1 text-center whitespace-nowrap overflow-hidden">
    {data.client.aadhaar || ''}
  </span>
</div>

  {/* PAN */}
  <div className="flex items-center flex-1">
    <span className="font-semibold whitespace-nowrap">६. पैन नंबर:-</span>
    <span className="ml-2 border-b border-black px-2 w-full text-center uppercase tracking-wide">
      {data.client.pan || ''}
    </span>
  </div>

  {/* Contact */}
  <div className="flex items-center flex-1">
    <span className="font-semibold whitespace-nowrap">७. ध्वनि क्रमांक:-</span>
    <span className="ml-2 border-b border-black px-2 w-full text-center tracking-wide">
      {data.client.phone || ''}
    </span>
  </div>

</div>

          {/* Clause 8 */}
          <div className="clause">
            <span className="clause-num">८.</span> यह कि मैं उपरोक्त उल्लिखित एवं निम्न हस्ताक्षरित व्यक्ति अपने पूरे होश व हवास में <strong>आश्रय ग्रुप</strong> से इनके
            &ldquo;<strong>{convertToHindi(data.property.projectName)}</strong>&rdquo; प्रोजेक्ट जिसका खसरा नंबर:- <span className="underline-blank">{convertNumberToHindi(data.property.khasraNumber)}</span>,&nbsp;
            मौज़ा:- <span className="underline-blank">{convertToHindi(data.property.locality)}</span>,&nbsp;
            तहसील:- <span className="underline-blank">{convertToHindi(data.property.tehsil)}</span>, जिल्हा:- नागपुर, पर प्लॉट नंबर:- <span className="underline-blank">{convertNumberToHindi(data.property.plotNumber)}</span>/-(
            <span className="underline-blank">{convertNumberToHindi(data.property.plotNumber)}</span> मात्र) जोकि <span className="underline-blank">{convertNumberToHindi(data.property.area)}</span>/-(
            <span className="underline-blank">{convertNumberToHindi(data.property.area)}</span> मात्र) चौरस फूट है का टोकन/बयाना पत्र/विक्री का करारनामा अपनी सम्पूर्ण राज़ी-खुशी से कर रहा/रही हूँ।
          </div>

          {/* Clause 9 */}
          <div className="clause">
            <span className="clause-num">९.</span> यह कि मैंने उपरोक्त प्लॉट <span className="underline-blank">{convertNumberToHindi(data.property.rate)}</span>/-(
            <span className="underline-blank">{convertNumberToHindi(data.property.rate)}</span> मात्र) रुपया प्रति चौरस फूट के दर से खरीदना तय किया है जिसकी समस्त कीमत&nbsp;
            <span className="underline-blank">{convertNumberToHindi(data.property.totalAmount)}</span>/-(
            <span className="underline-blank">{convertNumberToHindi(data.property.totalAmount)}</span> मात्र) रुपया है जोकि मैं आश्रय ग्रुप को अग्रिम भुगतान देने के बाद बाकी बचा पैसा ३६/-(छत्तीस मात्र) माह की आसान किश्तों में भुगतान करूंगा/करूंगी।
          </div>

          {/* Clause 10 */}
          <div className="clause">
            <span className="clause-num">१०.</span> यह कि मैंने उपरोक्त प्लॉट के टोकन/बयाना पत्र/विक्री का करारनामा के रूप में आज आश्रय ग्रुप को <strong>{data.property.paymentMode}</strong> (पावती क्रमांक: <strong>{data.property.paymentMode !== 'Cash' ? (data.property.paymentReference || '___________') : '___________'}</strong>) के माध्यम से&nbsp;
            <span className="underline-blank">{convertNumberToHindi(data.property.tokenAmount)}</span>/-(
            <span className="underline-blank">{convertNumberToHindi(data.property.tokenAmount)}</span> मात्र) रुपया दिया है। आज इस टोकन/बयाना पत्र/विक्री का करारनामा पूर्ण होने बाद इस टोकन/बयाना पत्र/विक्री का करारनामा के आधार पर परन्तु स्टाम्प पत्र-बिक्री के करारनामे से पहले जितने भी भुगतान किए जाएंगे वह सभी इस टोकन/बयाना पत्र/विक्री का करारनामा पर ही अंकित किए जायेंगे। यदि मैं उपरोक्त प्लॉट का स्टाम्प पत्र-बिक्री का करारनामा पूर्ण करके सौदे को आगे भी जारी रखता/रखती हूँ तो यह समस्त जमा राशि जो इस टोकन/बयाना पत्र/विक्री का करारनामा पत्र पर अंकित है वह सभी प्लॉट की समस्त राशि की गणना में जोड़ी जाएगी। और यदि मैं सौदा आगे जारी नहीं रखता/रखती हूँ तो यह समस्त राशि किसी भी रूप में वापस नहीं होगी — यह राशि दोनों पक्षों द्वारा आपसी सहमति से निर्धारित वास्तविक हानि मानी गयी है, यह किसी भी रूप में दंड नहीं माना जाएगा। मैं इस शर्त से पूर्ण रूप से अवगत और सहमत हूँ।
          </div>

          {/* Clause 11 */}
          <div className="clause">
            <span className="clause-num">११.</span> यह कि यह टोकन/बयाना पत्र/विक्री का करारनामा केवल <strong>०७/-(सात)</strong> दिन के लिए मान्य है। ०८-वें/-(आठ वें) दिन आश्रय ग्रुप उपरोक्त प्लॉट का सौदा किसी अन्य व्यक्ति के साथ करने के लिए सम्पूर्ण रूप से स्वतंत्र है और मैं किसी भी प्रकार से हस्तक्षेप करने का अधिकार नहीं रखता/रखती हूँ। यदि मैं हस्तक्षेप करता/करती हूँ तो इस टोकन/बयाना पत्र/विक्री का करारनामा के उल्लंघन के अपराध में भारतीय संविधान की दंड नियमावली के आधार पर दंड का/की भोगी होंगा/होंगी। परन्तु यदि मैं प्लॉट का स्टाम्प पत्र-बिक्री का करारनामा नहीं करता/करती हूँ और इस टोकन/बयाना पत्र/विक्री का करारनामा के आधार पर ही आगे का भुगतान किश्तों के रूप में करते हुए सीधा पंजीकृत दस्ताबेज़ अपने नाम में करना चाहता/चाहती हूँ या मैं स्टाम्प पत्र-बिक्री का करारनामा अपनी इच्छानुसार अपने समय से करना चाहता/चाहती हूँ तो यह ०७/-(सात) दिन की शर्त लागू नहीं है। परन्तु इस अवस्था में यह टोकन/बयाना पत्र/विक्री का करारनामा ही दोनों पक्षों बीच के सौदे का मुख्य आधार है। 
	          </div>
</div>
<PrintFooter />
</div>

        
                 {/* GAP BETWEEN PAGES */}
<div className="a4-gap" />

        {/* ── PAGE 2 ─────────────────────────────────────────────── */}
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

          {/* Page 2 divider */}
           <div className="divider">. . . 2 . . .</div>
           <div className="doc-title doc-title-secondary">
            टोकन/बयाना पत्र/विक्री का करारनामा
          </div>
          <div className="clause" style={{ marginTop: '8px' }}></div>
          <span className="clause-num"></span>इस टोकन/बयाना पत्र/विक्री का करारनामा की समय सीमा मेरे द्वारा हर माह किये गए भुगतान पर निर्भर है जोकि उपरोक्त प्लाट की समस्त कीमत के छत्तीसवें भाग से कम नहीं होगा। अतः मुझे हर माह में उपरोक्त प्लाट की समस्त कीमत के छत्तीसवें भाग का भुगतान करना अनिवार्य है और किये गए समस्त भुगतानों का विवरण इस टोकन/बयाना पत्र/विक्री का करारनामा पर ही अंकित होगा। स्थान शेष न रहने पर अगला पेज जोड़ा जायेगा जोकि दोनों पक्षों द्वारा हस्ताक्षरित होगा। मेरे द्वारा भुगतान में किसी भी प्रकार की देरी, टाल-मटोल या चूक होने पर खंड नं.-१० की शर्त पूर्ण रूप से स्वतः लागू हो जाएगी। मैं इस शर्त से पूर्ण रूप से अवगत हूँ और सहमत भी हूँ।

          {/* Clause 12 */}
          <div className="clause" style={{ marginTop: '8px' }}>
            <span className="clause-num">१२.</span> यह कि यह टोकन/बयाना पत्र/विक्री का करारनामा ही दोनों पक्षकारों के बीच सम्पूर्ण समझौता है। इसके अतिरिक्त कोई भी मौखिक, लिखित, वकील का नोटिस या इलेक्ट्रोनिक वार्ता इस टोकन/बयाना पत्र पर किसी भी रूप में प्रभावी नहीं होगा और इसमें कोई भी संशोधन केवल लिखित रूप में दोनों पक्षों के हस्ताक्षर से ही मान्य होगा। परन्तु यदि मैं स्टाम्प-पत्र बिक्री का करारनामा करता/करती हूँ तो प्रक्रमण संसाधन शुल्क २०००/-(दो हज़ार मात्र) रुपया प्रति प्लाट अलग से देना अनिवार्य होगा जिसकी कोई भी पावती नहीं मिलेगी और न ही इस राशि को प्लॉट की समस्त राशि की गणना में जोड़ा जाएगा।
          </div>

          {/* Clause 13 */}
          <div className="clause">
            <span className="clause-num">१३.</span> यह कि मैंने इस टोकन/बयाना पत्र/विक्री का करारनामा के उपरोक्त समस्त नियम व शर्तों को अच्छे पढ़ व समझ लिया है और मैं सम्पूर्ण रूप से सहमत एवं संतुष्ट हूँ। और यह घोषणा करता/करती हूँ कि मैंने किसी भी प्रकार का कोई भी नशा नहीं किया हुआ है और ना ही मैं किसी जोर-दबाब, प्रलोभन, ग़लतफहमी या धोकाधड़ी में हूँ। मैंने इस टोकन/बयाना पत्र/विक्री का करारनामा पर हस्ताक्षर सम्पूर्ण रूप से सोच-समझ कर शांत मस्तिष्क से अपने और अपने परिवार के भविष्य को ध्यान में रखते हुए लाभ प्राप्ति के लिए किए हैं। मैं भविष्य में किसी भी शर्त को लेकर आपत्ति उठाने से विरत रहूँगा/रहूंगी।
          </div>

          {/* Clause 14 — Payment table */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
              १४. टोकन/बयाना पत्र के आधार पर अग्रिम भुगतान पूर्ण करने हेतु किश्तों में किये गए भुगतानों का विवरण:-
            </div>

            {/* Payment rows अ through उ */}
            {['अ', 'आ', 'इ', 'ई', 'उ'].map((letter, idx) => (
              <div key={idx} className="payment-row">

    <span className="payment-label">({letter})</span>

    {/* Amount */}
    <div className="payment-field">
      <span className="payment-field-label">रकम:-</span>
      <span className="payment-field-value">
        {convertNumberToHindi(idx === 0 ? data.property.tokenAmount : '')}
      </span>
    </div>

    {/* Mode */}
    <div className="payment-field" style={{ marginLeft: '6px' }}>
      <span className="payment-field-label">भुगतान का तरीका:-</span>
      <span className="payment-field-value">
        {idx === 0 ? (data.property.paymentMode || '') : ''}
      </span>
    </div>

    {/* Reference */}
    <div className="payment-field" style={{ marginLeft: '6px' }}>
      <span className="payment-field-label">भुगतान संदर्भ संख्या:-</span>
      <span className="payment-field-value">
        {idx === 0 ? (data.property.paymentMode !== 'Cash' ? data.property.paymentReference : '') : ''}
      </span>
    </div>

  </div>
))}

          {/* Signatures */}
          <div className="sig-section">

            {/* Buyer signature */}
            <div className="sig-block">
              <div className="sig-label">१५. लिख कर लेने वाले का नाम, हस्ताक्षर एवं बाएं हाथ के अंगूठे का निशान :-</div>
              <div style={{ marginTop: '6px', fontSize: '12.5px' }}>
                <div className="field-row" style={{ marginBottom: '4px' }}>
                  <span className="field-label">नाम:-</span>
                  <span className="field-value">{convertNameWithTitle(data.client.name, data.client.title)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>हस्ताक्षर:-</div>
                  <div className="sig-line" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>बाएं हाथ के अंगूठे का निशान:-</div>
                  <div className="sig-line" />
                </div>
              </div>
            </div>

          </div>

          {/* Seller signature */}
          <div style={{ marginTop: '14px', fontSize: '12.5px' }}>
            <div className="sig-label">१६. लिखकर कर देने वाले का नाम, हस्ताक्षर एवं बाएं हाथ के अंगूठे का निशान :-</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '12.5px' }}>
                  स्थान :- {convertToHindi(`${data.company.companyLocality || ''}${data.company.companyDistrict ? `, ${data.company.companyDistrict}` : '' }`)}
                </div>
                <div style={{ marginTop: '4px', fontSize: '12.5px' }}>
                  दिनांक :- {formatHindiDate(data.property.bookingDate)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ minHeight: '40px' }} />
                <div style={{ fontWeight: '700', fontSize: '12.5px' }}>स्प्रबंधक</div>
                <div style={{ fontWeight: '700', fontSize: '12.5px' }}>{convertToHindi(data.company.companyName || '')} ({convertToHindi(data.company.entityType)})</div>
              </div>
            </div>
          </div>

          {/* Witnesses */}
          <div style={{ marginTop: '12px', fontSize: '12.5px' }}>
            <span style={{ fontWeight: '700' }}>१७. गवाह:- </span>
            <span style={{ marginLeft: '6px' }}>
              (अ) <span className="underline-blank" style={{ minWidth: '120px' }} />&nbsp;&nbsp;&nbsp;
              (आ) <span className="underline-blank" style={{ minWidth: '120px' }} />
            </span>
          </div>

          {/* End */}
            <div style={{ marginTop: 'auto', paddingTop: '50px' }}>
          <div className="end-text">* * * समाप्त * * *</div>

        </div>
      </div>
      <PrintFooter />

      </div>

      </div>
  
  );
};

export default HindiTokan;
