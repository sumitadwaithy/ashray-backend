import React from 'react';
import { convertToHindi, convertNumberToHindi, convertNameWithTitle, formatAadhaarHindi, } from '../../../engine/EnglishToHindiEngine';
import { PrintFooter } from '../../../../components/Printpreview';

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

interface ManagerData {
  managerName?: string;
  managerPosition?: string;
  managerAddress?: string;
  managerPAN?: string;
  managerAadhaar?: string;
  managerPhone?: string;
  managerCountryCode?: string;
}

interface AgreementData {
  client: ClientData;
  property: PropertyData;
  company: CompanyData;
  manager?: ManagerData;

  nocSerial?: string;
  nocDate?: string;
  transferNote?: string;
}

const sharedStyles = `
  .a4-page {
    width: 210mm;
    min-height: 297mm;
    margin: 0 auto;
    background: white;
    padding: 12mm 15mm;
    box-sizing: border-box;
    page-break-after: always;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    font-family: 'Noto Sans Devanagari', 'Mangal', 'Arial Unicode MS', serif;
    position: relative;
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
    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
  }
  .header-box {
    border: 2.5px solid #000;
    padding: 8px 12px;
    margin-bottom: 6px;
  }
  .doc-title {
    text-align: center;
    font-weight: 800;
    text-decoration: underline;
    letter-spacing: 0.5px;
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
    font-size: 13px;
    line-height: 2;
    text-align: justify;
    margin-bottom: 10px;
  }
  .clause-num {
    font-weight: 800;
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
  .sig-section {
    display: flex;
    justify-content: space-between;
    margin-top: 30px;
    gap: 20px;
  }
  .sig-block {
    flex: 1;
    font-size: 12.5px;
  }
  .sig-line {
    border-bottom: 1px solid #000;
    min-height: 44px;
    margin: 6px 0;
  }
  .sig-label {
    font-weight: 700;
    font-size: 12.5px;
  }
  .noc-stamp-box {
    border: 1.5px dashed #555;
    width: 90px;
    height: 90px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    color: #555;
    text-align: center;
    margin: 0 auto;
  }
  .end-text {
    text-align: center;
    font-weight: 800;
    font-size: 14px;
    margin-top: 24px;
    letter-spacing: 3px;
  }
  .property-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 14px;
    font-size: 12.5px;
  }
  .property-table td {
    padding: 4px 8px;
    border-bottom: 1px solid #ddd;
  }
  .property-table td:first-child {
    font-weight: 700;
    width: 42%;
  }
  .noc-serial {
    font-size: 12px;
    font-weight: 700;
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
    border-bottom: 1px solid #000;
    padding-bottom: 4px;
  }
  .a4-gap {
    height: 40px;
  }
  .notice-box {
    border: 1.5px solid #c0392b;
    border-left: 4px solid #c0392b;
    background: #fff8f7;
    padding: 8px 12px;
    margin: 10px 0 6px 0;
    font-size: 12.5px;
    line-height: 1.8;
  }
  .notice-box-title {
    font-weight: 800;
    color: #c0392b;
    font-size: 12px;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
    text-transform: uppercase;
  }
  @media print {
    .a4-gap { display: none; }
  }
`;

const formatHindiDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return convertNumberToHindi(dateStr);
  const day = convertNumberToHindi(date.getDate());
  const month = convertNumberToHindi(date.getMonth() + 1);
  const year = convertNumberToHindi(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const safeHindi = (v?: any) => (!v || v === '') ? '________' : convertToHindi(String(v));

const formatAmountHindi = (v?: string | number) => {
  if (!v) return '________';
  return convertNumberToHindi(Number(v).toLocaleString('en-IN'));
};

export const HindiPreSaleNOC: React.FC<{ data: AgreementData }> = ({ data }) => {
  const clientName = convertNameWithTitle(data.client.name, data.client.title);
  const companyDisplay = `${convertToHindi(data.company.companyName || '')} (${convertToHindi(data.company.entityType || '')})`;
  const issueDate = data.nocDate || data.property.bookingDate;
  const plotArea = safeHindi(data.property.area);

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
      <div className="a4-page">

        <div className="header-box">

          <div className="flex justify-between text-sm font-bold mb-2">
            <div>पंजी. क्र. : {data.company?.licenseRegistrationNumber ? convertNumberToHindi(data.company.licenseRegistrationNumber) : ''}</div>
            <div>स्थापना : {convertNumberToHindi('2019')}</div>
          </div>

          <div className="flex flex-col items-center text-center">

            <div className="text-red-600 text-[48px] font-extrabold tracking-wide font-serif leading-tight">
              {convertToHindi(data.company.companyName || '')}
            </div>

            <div className="text-sm font-semibold mt-2">
              मोब: +91 {data.manager?.managerPhone ? convertNumberToHindi(data.manager.managerPhone) : '________'} &nbsp;|&nbsp; मेल: {data.company?.companyEmail ? convertToHindi(data.company.companyEmail) : '________'} &nbsp;|&nbsp; वेबसाइट: {data.company?.companyWebsite ? convertToHindi(data.company.companyWebsite) : '________'}
            </div>

            <div className="text-sm mt-1">
              {convertToHindi([data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', '))}{data.company.companyPincode ? ` - ${convertNumberToHindi(data.company.companyPincode)}` : ''}.
            </div>

          </div>
        </div>

        <div className="mt-10 text-center font-serif text-[19px] font-bold tracking-[1.5px] uppercase text-indigo-600 underline underline-offset-4">
          अनापत्ति प्रमाण पत्र / अनंतिम
        </div>
        <div className="text-center text-[13px] font-semibold mt-1 mb-6 text-gray-600">
          (विक्रय पूर्व — विक्रय पत्र के निष्पादन से पूर्व)
        </div>

        <div className="mt-6 px-3 py-2 bg-yellow-200 border border-yellow-300 flex justify-between items-center text-[12px] font-semibold">

          <div className="flex-1 pr-4 whitespace-nowrap font-mono">
            {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-P${data?.property?.plotNumber || ''}-${data?.property?.projectName || ''}-${data?.property?.khasraNumber || data?.property?.surveyNumber || ''}-${data?.property?.locality || ''}-${data?.property?.district || ''}-${data?.property?.state || ''}-${data?.property?.pincode || ''}`}
          </div>

          <div className="whitespace-nowrap text-right">
            <span className="font-bold mr-1">दिनांक:</span>
            <span>{formatHindiDate(issueDate)}</span>
          </div>

        </div>

        <div className="clause" style={{ marginBottom: '14px', marginTop: '10px' }}>
          <strong>विषय:</strong> भूखण्ड क्र. <span className="underline-blank">{safeHindi(data.property.plotNumber)}</span>, परियोजना <span className="underline-blank">{safeHindi(data.property.projectName)}</span>, मौजा <span className="underline-blank">{safeHindi(data.property.locality)}</span>, तहसील <span className="underline-blank">{safeHindi(data.property.tehsil)}</span>, जिला <span className="underline-blank">{safeHindi(data.property.district)}</span> के क्रय एवं पंजीकरण हेतु अनापत्ति प्रमाण पत्र।
        </div>

        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>सेवा में,</strong><br />
          {clientName},<br />
          आयु: {data.client.age ? convertNumberToHindi(data.client.age) : '________'} वर्ष, आधार क्र.: {data.client.aadhaar ? formatAadhaarHindi(data.client.aadhaar) : '________'}, पैन: {data.client.pan ? convertToHindi(data.client.pan) : '________'},<br />
          पता: {convertToHindi([data.client.address, data.client.locality, data.client.district, data.client.state].filter(Boolean).join(', '))}{data.client.pincode ? ` - ${convertNumberToHindi(data.client.pincode)}` : ''}.
        </div>

        <table className="property-table">
          <tbody>
            <tr><td>परियोजना का नाम</td><td>{safeHindi(data.property.projectName)}</td></tr>
            <tr><td>भूखण्ड क्रमांक</td><td>{safeHindi(data.property.plotNumber)}</td></tr>
            <tr><td>क्षेत्रफल</td><td>{safeHindi(data.property.area)} वर्ग फुट</td></tr>
            <tr><td>मौजा / स्थान</td><td>{safeHindi(data.property.locality)}</td></tr>
            <tr><td>तहसील</td><td>{safeHindi(data.property.tehsil)}</td></tr>
            <tr><td>जिला</td><td>{convertToHindi(data.property.district || '________')}</td></tr>
            <tr><td>खसरा / सर्वे क्र.</td><td>{safeHindi(data.property.khasraNumber || data.property.surveyNumber)}</td></tr>
            <tr><td>सहमत विक्रय मूल्य</td><td>₹ {formatAmountHindi(data.property.totalAmount)} /- मात्र</td></tr>
            <tr><td>टोकन / अग्रिम राशि</td><td>₹ {formatAmountHindi(data.property.tokenAmount)} /- मात्र</td></tr>
            <tr><td>बुकिंग दिनांक</td><td>{formatHindiDate(data.property.bookingDate)}</td></tr>
          </tbody>
        </table>

        <div className="clause">
          <span className="clause-num">१. </span>
          यह प्रमाणित किया जाता है कि {companyDisplay}, उपरोक्त वर्णित संपत्ति के स्वामी एवं विकासकर्ता, <strong>{clientName}</strong> के पक्ष में भूखण्ड क्र. {safeHindi(data.property.plotNumber)}, क्षेत्रफल {plotArea} वर्ग फुट, स्थित <strong>{safeHindi(data.property.projectName)}</strong> परियोजना, मौजा {safeHindi(data.property.locality)}, तहसील {safeHindi(data.property.tehsil)}, जिला {safeHindi(data.property.district)} के क्रय, पंजीकरण एवं समस्त विधिसम्मत व्यवहारों हेतु यह अनापत्ति प्रमाण पत्र जारी करते हैं।
        </div>

        <div className="clause">
          <span className="clause-num">२. </span>
          {companyDisplay} एतद्द्वारा घोषणा एवं पुष्टि करते हैं कि उपरोक्त संपत्ति इस प्रमाण पत्र के जारी होने की तिथि तक समस्त <strong>भार, शुल्क, ग्रहणाधिकार, बंधक, विवाद, मुकदमेबाजी, कुर्की</strong> एवं किसी भी अन्य विधिक अथवा वित्तीय दायित्वों से मुक्त है। किसी तृतीय पक्ष का उक्त संपत्ति पर कोई पूर्व दावा, अधिकार अथवा हित नहीं है।
        </div>

        <div className="clause">
          <span className="clause-num">३. </span>
          {companyDisplay} आगे घोषणा करते हैं कि उक्त भूखण्ड को पूर्व में किसी अन्य व्यक्ति अथवा संस्था को बेचा, हस्तांतरित, उपहार में दिया, बंधक रखा अथवा समनुदेशित नहीं किया गया है, तथा {companyDisplay} के पास उक्त संपत्ति का विधिसम्मत, स्पष्ट एवं विपणनयोग्य स्वामित्व है और उन्हें इसे बेचने तथा हस्तांतरित करने का पूर्ण अधिकार प्राप्त है।
        </div>

        <div className="clause">
          <span className="clause-num">४. </span>
          {companyDisplay} को <strong>कोई आपत्ति नहीं है</strong> कि {clientName} विक्रय पत्र के निष्पादन, संबंधित उप-पंजीयक के समक्ष उनके नाम पर संपत्ति के पंजीकरण, तथा उचित पंजीकरण के पश्चात उक्त भूखण्ड पर किसी भी निर्माण, विकास अथवा अन्य विधिसम्मत गतिविधि को संचालित करें।
        </div>

        <div className="clause">
          <span className="clause-num">५. </span>
          {companyDisplay} यह वचन देते हैं कि इस प्रमाण पत्र के जारी होने के पश्चात किसी तृतीय पक्ष द्वारा उक्त संपत्ति पर किसी भी विधिक विवाद, दावे अथवा भार उत्पन्न होने की स्थिति में {companyDisplay} पूर्णतः उत्तरदायी होंगे एवं {clientName} को होने वाली समस्त हानि, व्यय एवं क्षति की क्षतिपूर्ति करेंगे।
        </div>

        <div className="clause">
          <span className="clause-num">६. </span>
          यह अनापत्ति प्रमाण पत्र दोनों पक्षों के मध्य {formatHindiDate(data.property.bookingDate)} को निष्पादित विक्रय करार / टोकन रसीद के आधार पर सद्भावनापूर्वक जारी किया जा रहा है, तथा यह पक्षकारों के मध्य विक्रय पत्र के निष्पादन एवं पंजीकरण तक वैध रहेगा। यह प्रमाण पत्र {companyDisplay}, उनके उत्तराधिकारियों, वारिसों एवं विधिक प्रतिनिधियों पर बाध्यकारी है।
        </div>

        <div className="notice-box" style={{ marginTop: '14px' }}>
          <div className="notice-box-title">⚠ महत्वपूर्ण शर्तें एवं लंबित दायित्व</div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            निम्नलिखित खण्ड (७–११) {clientName} पर भूखण्ड क्र. {safeHindi(data.property.plotNumber)} के संबंध में लागू होने वाली शर्तों, दायित्वों एवं शुल्कों को निर्धारित करते हैं। ये शर्तें इस अनंतिम अनापत्ति प्रमाण पत्र का अभिन्न अंग हैं और क्रेता पर बाध्यकारी हैं।
          </div>
        </div>

        <div className="clause">
          <span className="clause-num">७. </span>
          उपरोक्त विषय के संदर्भ में, {companyDisplay} <strong>{clientName}</strong> को सूचित करना चाहते हैं कि इस कार्यालय को उपरोक्त विषय पर <strong>कोई आपत्ति नहीं है</strong>। उपरोक्त भूखण्ड का भुगतान इस कार्यालय को प्राप्त हो चुका है। इस कार्यालय के अभिलेखों के अनुसार वर्तमान में उक्त भूखण्ड के संबंध में उक्त व्यक्ति के विरुद्ध कोई प्रतिकूल तथ्य दर्ज नहीं है; तथापि, इसकी <strong>करार एवं भुगतान पर्चियों के आधार पर पुनः सत्यापन</strong> किया जाएगा, एवं तदनुसार ऐसे सत्यापन की पूर्णता पर <strong>अंतिम अनापत्ति प्रमाण पत्र</strong> अलग से जारी किया जाएगा।
        </div>

        <div className="clause">
          <span className="clause-num">८. </span>
          यदि <strong>{clientName}</strong> उक्त भूखण्ड का कब्जा लेना चाहते हैं, तो उन्हें प्रथमतः इस कार्यालय को <strong>लिखित में सूचित</strong> करना होगा एवं कब्जा पत्र शुल्क <strong>₹ २,०००/- (रुपये दो हजार मात्र)</strong> सहित औपचारिक आवेदन प्रस्तुत करना होगा। कब्जा केवल <strong>अंतिम अनापत्ति प्रमाण पत्र</strong> जारी होने के पश्चात ही प्रदान किया जाएगा। इस कार्यालय से अंतिम अनापत्ति प्रमाण पत्र प्राप्त होने से पूर्व कोई भी कब्जा वैध नहीं माना जाएगा।
        </div>

        <div className="clause">
          <span className="clause-num">९. </span>
          यदि <strong>{clientName}</strong> उक्त भूखण्ड को किसी तृतीय पक्ष को बेचने, हस्तांतरित करने अथवा अन्यथा निपटाने का इरादा रखते हैं, तो उन्हें ऐसी किसी भी बिक्री अथवा हस्तांतरण की शुरुआत अथवा निष्पादन से पूर्व इस कार्यालय को सूचित करना होगा एवं {companyDisplay} से <strong>पूर्व लिखित अनुमति</strong> प्राप्त करनी होगी। ऐसी अनुमति केवल <strong>अंतिम अनापत्ति प्रमाण पत्र</strong> जारी होने के पश्चात ही दी जाएगी। बिना पूर्व लिखित अनुमति के की गई कोई भी बिक्री अथवा हस्तांतरण <strong>शून्य एवं अमान्य</strong> मानी जाएगी।
        </div>

        <div className="clause">
          <span className="clause-num">१०. </span>
          उक्त भूखण्ड को <strong>रक्त संबंधी के अतिरिक्त</strong> किसी अन्य व्यक्ति को हस्तांतरित करने की स्थिति में <strong>हस्तांतरण शुल्क</strong> लागू होगा। न्यूनतम हस्तांतरण शुल्क <strong>₹ २०,०००/- (रुपये बीस हजार मात्र)</strong> है, तथा अधिकतम शुल्क हस्तांतरण अनुरोध के समय भूखण्ड की <strong>प्रचलित बाजार दर का १०% (दस प्रतिशत)</strong> होगा। लागू हस्तांतरण शुल्क का निर्धारण {companyDisplay} द्वारा हस्तांतरण आवेदन प्रस्तुत करने के समय किया जाएगा एवं किसी भी हस्तांतरण की प्रक्रिया होने से पूर्व इसका पूर्ण भुगतान किया जाना अनिवार्य है। यह शर्त केवल <strong>अंतिम अनापत्ति प्रमाण पत्र</strong> जारी होने के पश्चात ही लागू होगी।
        </div>

        <div className="clause">
          <span className="clause-num">११. </span>
          भूखण्ड क्र. {safeHindi(data.property.plotNumber)}, क्षेत्रफल {plotArea} वर्ग फुट हेतु <strong>लेआउट विकास शुल्क ₹ २०/- (रुपये बीस मात्र) प्रति वर्ग फुट</strong> की दर से {clientName} पर <strong>लंबित एवं देय</strong> है। आपसे अनुरोध है कि इस बकाया राशि का यथाशीघ्र भुगतान करें। कृपया ध्यान दें कि यह शुल्क प्रत्येक तिमाही में <strong>₹ ३–५ प्रति वर्ग फुट</strong> (अर्थात् लगभग <strong>₹ १२–२० प्रति वर्ग फुट प्रतिवर्ष</strong>) की दर से बढ़ता है, अतः इसका भुगतान जितना शीघ्र हो उतना बेहतर है। उक्त भूखण्ड हेतु <strong>अंतिम अनापत्ति प्रमाण पत्र</strong> {companyDisplay} द्वारा केवल भुगतान के समय देय संपूर्ण लेआउट विकास शुल्क के पूर्ण एवं अंतिम भुगतान के पश्चात ही जारी किया जाएगा।
        </div>

        <div className="sig-section">
          <div className="sig-block">
            <div className="sig-label">क्रेता की स्वीकृति :-</div>
            <div className="sig-line" />
            <div>नाम: {clientName}</div>
            <div style={{ marginTop: '4px' }}>दिनांक: {formatHindiDate(issueDate)}</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'center' }}>
            <div className="noc-stamp-box">कार्यालय मुहर एवं हस्ताक्षर</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'right' }}>
            <div className="sig-label">अधिकृत हस्ताक्षरकर्ता :-</div>
            <div className="sig-line" />
            <div>(एम. एच. विकी / विक्रांत राणा)</div>
            <div>स्वामी एवं लेखा / प्रशासन प्रमुख</div>
            <div style={{ fontWeight: '700' }}>{companyDisplay}</div>
            <div>दिनांक: {formatHindiDate(issueDate)}</div>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '12.5px' }}>
          <strong>साक्षी :-</strong>
          <div style={{ display: 'flex', gap: '40px', marginTop: '8px' }}>
            <div style={{ flex: 1 }}>
              (अ) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
            </div>
            <div style={{ flex: 1 }}>
              (ब) <span style={{ borderBottom: '1px solid #000', display: 'inline-block', minWidth: '160px' }} />
            </div>
          </div>
        </div>

        <div className="end-text">* * * समाप्त * * *</div>

        <PrintFooter />
      </div>
    </div>
  );
};

export default HindiPreSaleNOC;