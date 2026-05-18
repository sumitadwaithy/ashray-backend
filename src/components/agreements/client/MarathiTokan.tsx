import React from 'react';
import { PrintFooter } from '../../../../components/Printpreview';
import { convertToMarathi, convertNumberToMarathi, convertNameWithTitle, formatMarathiDate, } from './../../../engine/EnglishToMarathiEngine';

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

const MarathiTokan = ({ data, companyLogo, companyWatermark  }: TemplateProps) => {

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
    <span className="font-semibold whitespace-nowrap">१. नाव:-</span>
    <span className="ml-2 border-b border-black flex-1 text-center leading-tight">
      {convertNameWithTitle(data.client.name, data.client.title)}
    </span>
  </div>

  {/* Age */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">२. वय:-</span>
    <span className="ml-2 border-b border-black w-full text-center">
      {convertNumberToMarathi(data.client.age)}
    </span>
    <span className="ml-1 whitespace-nowrap">वर्षे</span>
  </div>

  {/* Occupation */}
  <div className="flex items-end">
    <span className="font-semibold whitespace-nowrap">३. व्यवसाय:-</span>
    <span className="ml-2 border-b border-black flex-1 text-center">
      {convertNameWithTitle(data.client.occupation)}
    </span>
  </div>

</div>

            {/* Address */}
           <div className="field-row items-start">
  <span className="field-label">४. पत्ता:-</span>

  <div className="flex-1">
    <div className="field-value-wide leading-[1.6] break-words">
      {[
  data.client.address,
  data.client.locality,
  data.client.district,
  data.client.state
]
  .map(v => convertNameWithTitle(v || ''))
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
  <span className="font-semibold whitespace-nowrap">५. आधार क्र.:-</span>

  <span className="ml-2 border-b border-black px-2 flex-1 text-center whitespace-nowrap overflow-hidden">
    {convertNameWithTitle(data.client.aadhaar || '')}
  </span>
</div>

  {/* PAN */}
  <div className="flex items-center flex-1">
    <span className="font-semibold whitespace-nowrap">६. पॅन क्र.:-</span>
    <span className="ml-2 border-b border-black px-2 w-full text-center uppercase tracking-wide">
      {(data.client.pan || '')}
    </span>
  </div>

  {/* Contact */}
  <div className="flex items-center flex-1">
    <span className="font-semibold whitespace-nowrap">७. संपर्क क्र.:-</span>
    <span className="ml-2 border-b border-black px-2 w-full text-center tracking-wide">
      {convertNameWithTitle(data.client.phone || '')}
    </span>
  </div>

</div>


          {/* Clause 8 */}
          <div className="clause">
            <span className="clause-num">८.</span> हे की मी वरील नमूद केलेली व खालील सही करणारी व्यक्ती पूर्ण शुद्ध मनाने <strong>आश्रय ग्रुप</strong> कडून त्यांच्या
            &ldquo;<strong>{convertToMarathi(data.property.projectName)}</strong>&rdquo; प्रकल्पासाठी, ज्याचा गट नंबर:- <span className="underline-blank">{convertNumberToMarathi(data.property.khasraNumber)}</span>,&nbsp;
            मौजे:- <span className="underline-blank">{convertToMarathi(data.property.locality)}</span>,&nbsp;
            तालुका:- <span className="underline-blank">{convertToMarathi(data.property.tehsil)}</span>, जिल्हा:- नागपूर, येथील भूखंड क्रमांक:- <span className="underline-blank">{convertNumberToMarathi(data.property.plotNumber)}</span>/-(
            <span className="underline-blank">{convertNumberToMarathi(data.property.plotNumber)}</span> मात्र) जो <span className="underline-blank">{convertNumberToMarathi(data.property.area)}</span>/-(
            <span className="underline-blank">{convertNumberToMarathi(data.property.area)}</span> मात्र) चौरस फूट आहे, त्याचे टोकन/बयाना पत्र/विक्री करार स्वखुशीने व आनंदाने करीत आहे/आहे।
          </div>

          {/* Clause 9 */}
          <div className="clause">
            <span className="clause-num">९.</span> हे की मी वरील भूखंड <span className="underline-blank">{convertNumberToMarathi(data.property.rate)}</span>/-(
            <span className="underline-blank">{convertNumberToMarathi(data.property.rate)}</span> मात्र) रुपये प्रति चौरस फूट दराने खरेदी करण्याचे ठरवले आहे, ज्याची एकूण किंमत&nbsp;
            <span className="underline-blank">{convertNumberToMarathi(data.property.totalAmount)}</span>/-(
            <span className="underline-blank">{convertNumberToMarathi(data.property.totalAmount)}</span> मात्र) रुपये आहे, आणि आश्रय ग्रुपला आगाऊ रक्कम दिल्यानंतर उर्वरित रक्कम ३६/-(छत्तीस मात्र) महिन्यांच्या सोप्या हप्त्यांमध्ये भरीन/भरेन।
          </div>

          {/* Clause 10 */}
          <div className="clause">
            <span className="clause-num">१०.</span> हे की मी वरील भूखंडाचे टोकन/बयाना पत्र/विक्री करार म्हणून आज आश्रय ग्रुपला <strong>{data.property.paymentMode}</strong> (पावती क्रमांक: <strong>{data.property.paymentMode !== 'Cash' ? (data.property.paymentReference || '___________') : '___________'}</strong>) माध्यमाने&nbsp;
            <span className="underline-blank">{convertNumberToMarathi(data.property.tokenAmount)}</span>/-(
            <span className="underline-blank">{convertNumberToMarathi(data.property.tokenAmount)}</span> मात्र) रुपये दिले आहेत। आज हे टोकन/बयाना पत्र/विक्री करार पूर्ण झाल्यानंतर या टोकन/बयाना पत्र/विक्री कराराच्या आधारे परंतु मुद्रांक पत्र-विक्री कराराआधी जे काही भरणे केले जातील ते सर्व या टोकन/बयाना पत्र/विक्री करारावरच नोंदवले जातील। जर मी वरील भूखंडाचा मुद्रांक पत्र-विक्री करार पूर्ण करून व्यवहार पुढे सुरू ठेवला/ठेवली तर या टोकन/बयाना पत्र/विक्री करार पत्रावर नोंदवलेली सर्व जमा रक्कम भूखंडाच्या एकूण रकमेच्या गणनेत जोडली जाईल। आणि जर मी व्यवहार पुढे सुरू ठेवला/ठेवली नाही तर ही सर्व रक्कम कोणत्याही स्वरूपात परत केली जाणार नाही — ही रक्कम दोन्ही पक्षांनी परस्पर संमतीने निश्चित केलेली वास्तविक हानी मानली गेली आहे, हे कोणत्याही स्वरूपात दंड मानले जाणार नाही। मी या अटीची पूर्णपणे जाण असून सहमत आहे/आहे।
          </div>

          {/* Clause 11 */}
          <div className="clause">
            <span className="clause-num">११.</span> हे की हे टोकन/बयाना पत्र/विक्री करार केवळ <strong>०७/-(सात)</strong> दिवसांसाठी वैध आहे। ०८-व्या/-(आठव्या) दिवशी आश्रय ग्रुप वरील भूखंडाचा व्यवहार कोणत्याही अन्य व्यक्तीशी करण्यास पूर्णपणे स्वतंत्र आहे आणि मला कोणत्याही प्रकारे हस्तक्षेप करण्याचा अधिकार नाही। जर मी हस्तक्षेप केला/केली तर या टोकन/बयाना पत्र/विक्री कराराच्या उल्लंघनाच्या गुन्ह्यात भारतीय संविधानाच्या दंड नियमावलीनुसार शिक्षेस पात्र होईन/होईन। परंतु जर मी भूखंडाचा मुद्रांक पत्र-विक्री करार केला/केली नाही आणि या टोकन/बयाना पत्र/विक्री कराराच्या आधारेच पुढील भरणा हप्त्यांमध्ये करत थेट नोंदणीकृत दस्तऐवज स्वतःच्या नावाने करायचा असेल किंवा मुद्रांक पत्र-विक्री करार स्वतःच्या इच्छेनुसार स्वतःच्या वेळी करायचा असेल तर हे ०७/-(सात) दिवसांची अट लागू होत नाही। परंतु त्या स्थितीत हे टोकन/बयाना पत्र/विक्री करारच दोन्ही पक्षांमधील व्यवहाराचा मुख्य आधार आहे।
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
            टोकन/बयाना पत्र/विक्री करार
          </div>
          <div className="clause" style={{ marginTop: '8px' }}></div>
          <span className="clause-num"></span>या टोकन/बयाना पत्र/विक्री कराराची मुदत माझ्याद्वारे दर महिन्याला केलेल्या भरण्यावर अवलंबून आहे जी वरील भूखंडाच्या एकूण किंमतीच्या छत्तीसाव्या भागापेक्षा कमी नसेल। त्यामुळे मला दर महिन्याला वरील भूखंडाच्या एकूण किंमतीचा छत्तीसावा भाग भरणे अनिवार्य आहे आणि केलेल्या सर्व भरण्यांचा तपशील या टोकन/बयाना पत्र/विक्री करारावरच नोंदवला जाईल। जागा शिल्लक न राहिल्यास पुढील पान जोडले जाईल जे दोन्ही पक्षांनी सही केलेले असेल। माझ्याकडून भरण्यात कोणत्याही प्रकारचा विलंब, टाळाटाळ किंवा चूक झाल्यास खंड क्र.-१० ची अट आपोआप पूर्णपणे लागू होईल। मी या अटीची पूर्णपणे जाण असून सहमत आहे/आहे।

          {/* Clause 12 */}
          <div className="clause" style={{ marginTop: '8px' }}>
            <span className="clause-num">१२.</span> हे की हे टोकन/बयाना पत्र/विक्री करारच दोन्ही पक्षांमधील संपूर्ण समझोता आहे। याव्यतिरिक्त कोणतीही तोंडी, लिखित, वकिलाची नोटीस किंवा इलेक्ट्रॉनिक संवाद या टोकन/बयाना पत्रावर कोणत्याही स्वरूपात प्रभावी होणार नाही आणि यात कोणताही बदल केवळ लिखित स्वरूपात दोन्ही पक्षांच्या सहीनेच वैध असेल। परंतु जर मी मुद्रांक-पत्र विक्री करार केला/केली तर प्रक्रिया संसाधन शुल्क २०००/-(दोन हजार मात्र) रुपये प्रति भूखंड वेगळे द्यावे लागतील, ज्याची कोणतीही पावती मिळणार नाही आणि ही रक्कम भूखंडाच्या एकूण रकमेच्या गणनेतही जोडली जाणार नाही।
          </div>

          {/* Clause 13 */}
          <div className="clause">
            <span className="clause-num">१३.</span> हे की मी या टोकन/बयाना पत्र/विक्री कराराचे वरील सर्व नियम व अटी नीट वाचल्या व समजून घेतल्या आहेत आणि मी पूर्णपणे सहमत व समाधानी आहे/आहे। आणि मी घोषित करतो/करते की मी कोणत्याही प्रकारचे कोणतेही व्यसन केलेले नाही आणि मी कोणत्याही जोर-दबाव, प्रलोभन, गैरसमज किंवा फसवणुकीत नाही। मी या टोकन/बयाना पत्र/विक्री करारावर सही पूर्णपणे विचारपूर्वक, शांत मनाने, स्वतःच्या व कुटुंबाच्या भविष्याचा विचार करून फायद्यासाठी केली आहे। मी भविष्यात कोणत्याही अटीबाबत आक्षेप घेण्यापासून परावृत्त राहीन/राहीन।
          </div>

          {/* Clause 14 — Payment table */}
          <div style={{ marginBottom: '8px' }}>
            <div style={{ fontWeight: '700', fontSize: '13px', marginBottom: '6px' }}>
              १४. टोकन/बयाना पत्राच्या आधारे आगाऊ भरणा पूर्ण करण्यासाठी हप्त्यांमध्ये केलेल्या भरण्यांचा तपशील:-
            </div>

            {/* Payment rows अ through उ */}
            {['अ', 'आ', 'इ', 'ई', 'उ'].map((letter, idx) => (
              <div key={idx} className="payment-row">

    <span className="payment-label">({letter})</span>

    {/* Amount */}
<div className="payment-field">
  <span className="payment-field-label">रक्कम:-</span>
  <span className="payment-field-value">
    {idx === 0 ? convertNumberToMarathi(data.property.tokenAmount) : ''}
  </span>
</div>

{/* Mode */}
<div className="payment-field" style={{ marginLeft: '6px' }}>
  <span className="payment-field-label">भरणा पद्धत:-</span>
  <span className="payment-field-value">
    {idx === 0 ? (data.property.paymentMode || '') : ''}
  </span>
</div>

{/* Reference */}
<div className="payment-field" style={{ marginLeft: '6px' }}>
  <span className="payment-field-label">अद्वितीय ओळख:-</span>
  <span className="payment-field-value">
    {idx === 0
      ? (data.property.paymentMode !== 'Cash'
          ? (data.property.paymentReference || '')
          : '')
      : ''}
  </span>
</div>

  </div>
))}

          {/* Signatures */}
          <div className="sig-section">

            {/* Buyer signature */}
            <div className="sig-block">
              <div className="sig-label">१५. लिहून घेणाऱ्याचे नाव, सही व डाव्या हाताच्या अंगठ्याचा ठसा :-</div>
              <div style={{ marginTop: '6px', fontSize: '12.5px' }}>
                <div className="field-row" style={{ marginBottom: '4px' }}>
                  <span className="field-label">नाव:-</span>
                  <span className="field-value">{convertNameWithTitle(data.client.name, data.client.title)}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '20px', marginTop: '6px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>सही:-</div>
                  <div className="sig-line" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '700' }}>डाव्या हाताच्या अंगठ्याचा ठसा:-</div>
                  <div className="sig-line" />
                </div>
              </div>
            </div>

          </div>

          {/* Seller signature */}
          <div style={{ marginTop: '14px', fontSize: '12.5px' }}>
            <div className="sig-label">१६. लिहून देणाऱ्याचे नाव, सही व डाव्या हाताच्या अंगठ्याचा ठसा :-</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '12.5px' }}>
                  ठिकाण :- {`${data.company.companyLocality || ''}${data.company.companyDistrict ? `, ${data.company.companyDistrict}` : ''}`}
                </div>
                <div style={{ marginTop: '4px', fontSize: '12.5px' }}>
                  दिनांक :- {formatMarathiDate(data.property.bookingDate)}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ minHeight: '40px' }} />
                <div style={{ fontWeight: '700', fontSize: '12.5px' }}>व्यवस्थापक</div>
                <div style={{ fontWeight: '700', fontSize: '12.5px' }}>{convertToMarathi(data.company.companyName || '')} ({convertToMarathi(data.company.entityType)})</div>
              </div>
            </div>
          </div>

          {/* Witnesses */}
          <div style={{ marginTop: '12px', fontSize: '12.5px' }}>
            <span style={{ fontWeight: '700' }}>१७. साक्षीदार:- </span>
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

export default MarathiTokan;
