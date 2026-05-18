import React from 'react';
import { convertToMarathi, convertNumberToMarathi, convertNameWithTitle, formatAadhaarMarathi, } from '../../../engine/EnglishToMarathiEngine';
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

const formatMarathiDate = (dateStr?: string) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return convertNumberToMarathi(dateStr);
  const day = convertNumberToMarathi(date.getDate());
  const month = convertNumberToMarathi(date.getMonth() + 1);
  const year = convertNumberToMarathi(date.getFullYear());
  return `${day}/${month}/${year}`;
};

const safeMarathi = (v?: any) => (!v || v === '') ? '________' : convertToMarathi(String(v));

const formatAmountMarathi = (v?: string | number) => {
  if (!v) return '________';
  return convertNumberToMarathi(Number(v).toLocaleString('en-IN'));
};

export const MarathiPostSaleNOC: React.FC<{ data: AgreementData }> = ({ data }) => {
  const clientName = convertNameWithTitle(data.client.name, data.client.title);
  const companyDisplay = `${convertToMarathi(data.company.companyName || '')} (${convertToMarathi(data.company.entityType || '')})`;
  const issueDate = data.nocDate || data.property.bookingDate;
  const plotArea = safeMarathi(data.property.area);

  return (
    <div id="printable-document" className="flex flex-col items-center">
      <style>{sharedStyles}</style>
      <div className="a4-page">

        <div className="header-box">

          <div className="flex justify-between text-sm font-bold mb-2">
            <div>नोंद क्र. : {data.company?.licenseRegistrationNumber ? convertNumberToMarathi(data.company.licenseRegistrationNumber) : ''}</div>
            <div>स्थापना : {convertNumberToMarathi('2019')}</div>
          </div>

          <div className="flex flex-col items-center text-center">

            <div className="text-red-600 text-[48px] font-extrabold tracking-wide font-serif leading-tight">
              {convertToMarathi(data.company.companyName || '')}
            </div>

            <div className="text-sm font-semibold mt-2">
              मो: +९१ {data.manager?.managerPhone ? convertNumberToMarathi(data.manager.managerPhone) : '________'} &nbsp;|&nbsp; मेल: {data.company?.companyEmail ? convertToMarathi(data.company.companyEmail) : '________'} &nbsp;|&nbsp; संकेतस्थळ: {data.company?.companyWebsite ? convertToMarathi(data.company.companyWebsite) : '________'}
            </div>

            <div className="text-sm mt-1">
              {convertToMarathi([data.company.companyAddress, data.company.companyLocality, data.company.companyDistrict, data.company.companyState].filter(Boolean).join(', '))}{data.company.companyPincode ? ` - ${convertNumberToMarathi(data.company.companyPincode)}` : ''}.
            </div>

          </div>
        </div>

        <div className="mt-10 text-center font-serif text-[19px] font-bold tracking-[1.5px] uppercase text-indigo-600 underline underline-offset-4">
          अनापत्ती प्रमाणपत्र
        </div>
        <div className="text-center text-[13px] font-semibold mt-1 mb-6 text-gray-600">
          (विक्री पश्चात — संपूर्ण व अंतिम देयक प्राप्त — शून्य थकबाकी निर्गत)
        </div>

        <div className="mt-6 px-3 py-2 bg-yellow-200 border border-yellow-300 flex justify-between items-center text-[12px] font-semibold">

          <div className="flex-1 pr-4 whitespace-nowrap font-mono">
            {`${data.client.folderSerial || ''}-${data.client.clientId || ''}-P${data?.property?.plotNumber || ''}-${data?.property?.projectName || ''}-${data?.property?.khasraNumber || data?.property?.surveyNumber || ''}-${data?.property?.locality || ''}-${data?.property?.district || ''}-${data?.property?.state || ''}-${data?.property?.pincode || ''}`}
          </div>

          <div className="whitespace-nowrap text-right">
            <span className="font-bold mr-1">दिनांक:</span>
            <span>{formatMarathiDate(issueDate)}</span>
          </div>

        </div>

        <div className="clause" style={{ marginBottom: '14px', marginTop: '10px' }}>
          <strong>विषय:</strong> अनापत्ती प्रमाणपत्र — संपूर्ण व अंतिम देयक प्राप्त — शून्य थकबाकी निर्गत — भूखंड क्र. <span className="underline-blank">{safeMarathi(data.property.plotNumber)}</span>, प्रकल्प <span className="underline-blank">{safeMarathi(data.property.projectName)}</span>, जिल्हा <span className="underline-blank">{safeMarathi(data.property.district)}</span>.
        </div>

        <div className="clause" style={{ marginBottom: '14px' }}>
          <strong>सेवेसाठी,</strong><br />
          {clientName},<br />
          वय: {data.client.age ? convertNumberToMarathi(data.client.age) : '________'} वर्षे, आधार क्र.: {data.client.aadhaar ? formatAadhaarMarathi(data.client.aadhaar) : '________'}, पॅन: {data.client.pan ? convertToMarathi(data.client.pan) : '________'},<br />
          पत्ता: {convertToMarathi([data.client.address, data.client.locality, data.client.district, data.client.state].filter(Boolean).join(', '))}{data.client.pincode ? ` - ${convertNumberToMarathi(data.client.pincode)}` : ''}.
        </div>

        <table className="property-table">
          <tbody>
            <tr><td>प्रकल्पाचे नाव</td><td>{safeMarathi(data.property.projectName)}</td></tr>
            <tr><td>भूखंड क्रमांक</td><td>{safeMarathi(data.property.plotNumber)}</td></tr>
            <tr><td>क्षेत्रफळ</td><td>{safeMarathi(data.property.area)} चौरस फूट</td></tr>
            <tr><td>मौजा / ठिकाण</td><td>{safeMarathi(data.property.locality)}</td></tr>
            <tr><td>तालुका</td><td>{safeMarathi(data.property.tehsil)}</td></tr>
            <tr><td>जिल्हा</td><td>{convertToMarathi(data.property.district || '________')}</td></tr>
            <tr><td>गट / सर्वे क्र.</td><td>{safeMarathi(data.property.khasraNumber || data.property.surveyNumber)}</td></tr>
            <tr><td>एकूण विक्री किंमत</td><td>₹ {formatAmountMarathi(data.property.totalAmount)} /- मात्र</td></tr>
            <tr><td>देयक पद्धत</td><td>{safeMarathi(data.property.paymentMode)}</td></tr>
            <tr><td>देयक संदर्भ क्र.</td><td>{safeMarathi(data.property.paymentReference)}</td></tr>
            <tr><td>अंतिम देयक दिनांक</td><td>{formatMarathiDate(issueDate)}</td></tr>
          </tbody>
        </table>

        <div className="clause">
          <span className="clause-num">१. </span>
          हे प्रमाणित केले जाते की {companyDisplay} यांनी <strong>{clientName}</strong> कडून भूखंड क्र. {safeMarathi(data.property.plotNumber)}, क्षेत्रफळ {plotArea} चौरस फूट, <strong>{safeMarathi(data.property.projectName)}</strong> प्रकल्प, मौजा {safeMarathi(data.property.locality)}, तालुका {safeMarathi(data.property.tehsil)}, जिल्हा {safeMarathi(data.property.district)} यांच्या संदर्भात {formatMarathiDate(issueDate)} पर्यंत <strong>₹ {formatAmountMarathi(data.property.totalAmount)}/- (रुपये {safeMarathi(data.property.totalAmount)} मात्र) ची संपूर्ण, पूर्ण व अंतिम विक्री रक्कम प्राप्त केली आहे</strong>.
        </div>

        <div className="clause">
          <span className="clause-num">२. </span>
          {companyDisplay} यांनी स्पष्टपणे पुष्टी व घोषणा केली की {formatMarathiDate(issueDate)} च्या स्थितीत उक्त मालमत्तेच्या संदर्भात {clientName} कडून {companyDisplay} यांना देय असलेले <strong>कोणतेही थकबाकी शुल्क नाही, कोणतेही प्रलंबित पेमेंट नाही, कोणतीही शिल्लक रक्कम नाही व कोणतेही आर्थिक दायित्व शिल्लक नाही</strong>. दोन्ही पक्षांमधील खाते पूर्णपणे निकाली व बंद झाले आहे.
        </div>

        <div className="clause">
          <span className="clause-num">३. </span>
          {companyDisplay} यांना <strong>कोणतीही हरकत नाही</strong> की {clientName} वरील भूखंड त्यांच्या नावावर, त्यांच्या नामांकित, वारस किंवा कायदेशीर प्रतिनिधींच्या नावावर संबंधित उप-नोंदणीकर किंवा इतर कोणत्याही सक्षम प्राधिकाऱ्यासमोर नोंदणीकृत करू शकतात, आणि {companyDisplay} कोणत्याही पुढील दावा, मागणी किंवा अटीशिवाय अशा नोंदणीसाठी आवश्यक सर्व सहकार्य प्रदान करण्याचे वचन देतात.
        </div>

        <div className="clause">
          <span className="clause-num">४. </span>
          {companyDisplay} पुढे पुष्टी करतात की मान्य मोबदल्याच्या पूर्ण पेमेंटनंतर {clientName} वर वर्णन केलेल्या भूखंडाचे <strong>कायदेशीर व न्याय्य मालक</strong> आहेत, आणि {companyDisplay} या प्रमाणपत्राच्या तारखेपासून तात्काळ प्रभावाने उक्त मालमत्तेवरील त्यांचे सर्व दावे, हक्क किंवा हित <strong>सोडून देतात</strong>.
        </div>

        <div className="clause">
          <span className="clause-num">५. </span>
          {companyDisplay} यांनी {clientName} यांना उक्त मालमत्तेचे पूर्ण मालक म्हणून {companyDisplay}, त्यांचे संचालक, भागीदार, कर्मचारी, उत्तराधिकारी, वारस किंवा नियुक्ती यांच्याकडून कोणत्याही हस्तक्षेप, हरकत किंवा दाव्याशिवाय उक्त मालमत्तेवर <strong>कोणतेही बांधकाम, विकास, हस्तांतरण, तारण, भेट किंवा इतर कोणतेही कायदेशीर कार्य</strong> करण्याची <strong>बिनशर्त परवानगी</strong> दिली आहे.
        </div>

        <div className="clause">
          <span className="clause-num">६. </span>
          हे अनापत्ती प्रमाणपत्र पूर्ण मोबदला रक्कम प्राप्त झाल्यावर स्वतंत्रपणे, स्वेच्छेने व सद्भावनेने जारी केले जात आहे, आणि ते <strong>पूर्ण पेमेंट व शून्य थकबाकीचा अंतिम दस्तऐवजी पुरावा</strong> मानले जाईल. हे प्रमाणपत्र <strong>अपरिवर्तनीय व कायदेशीररित्या बंधनकारक</strong> आहे आणि भारतातील सर्व न्यायालये व सक्षम प्राधिकाऱ्यांसमोर {companyDisplay} व त्यांच्या उत्तराधिकाऱ्यांविरुद्ध प्रवर्तनीय असेल.
        </div>

        <div className="notice-box" style={{ marginTop: '14px' }}>
          <div className="notice-box-title">⚠ महत्त्वाच्या अटी व प्रलंबित दायित्वे</div>
          <div style={{ fontSize: '12px', color: '#555' }}>
            खालील कलम (७–११) {clientName} यांना भूखंड क्र. {safeMarathi(data.property.plotNumber)} यांच्या संदर्भात लागू होणाऱ्या अटी, दायित्वे व शुल्क निर्धारित करतात. या अटी या अनापत्ती प्रमाणपत्राचा अविभाज्य भाग आहेत आणि खरेदीदारासाठी बंधनकारक आहेत.
          </div>
        </div>

        <div className="clause">
          <span className="clause-num">७. </span>
          वरील विषयाच्या संदर्भात, {companyDisplay} <strong>{clientName}</strong> यांना सूचित करू इच्छितात की या कार्यालयास वरील विषयावर <strong>कोणतीही हरकत नाही</strong>. वरील भूखंडाचे पेमेंट या कार्यालयास प्राप्त झाले आहे. या कार्यालयाच्या नोंदीनुसार सध्या उक्त भूखंडाच्या संदर्भात उक्त व्यक्तीविरुद्ध कोणतीही प्रतिकूल बाब नोंदलेली नाही; तथापि, याचे <strong>करार व पेमेंट पावत्यांच्या आधारे पुन्हा सत्यापन</strong> केले जाईल, व तदनुसार अशा सत्यापनाच्या पूर्णतेवर <strong>अंतिम अनापत्ती प्रमाणपत्र</strong> वेगळे जारी केले जाईल.
        </div>

        <div className="clause">
          <span className="clause-num">८. </span>
          जर <strong>{clientName}</strong> उक्त भूखंडाचा ताबा घेऊ इच्छित असतील, तर त्यांनी प्रथम या कार्यालयास <strong>लिखित स्वरूपात सूचित</strong> करणे आवश्यक आहे व ताबा पत्र शुल्क <strong>₹ २,०००/- (रुपये दोन हजार मात्र)</strong> सह औपचारिक अर्ज सादर करणे आवश्यक आहे. ताबा केवळ <strong>अंतिम अनापत्ती प्रमाणपत्र</strong> जारी झाल्यानंतरच दिला जाईल. या कार्यालयाकडून अंतिम अनापत्ती प्रमाणपत्र मिळण्यापूर्वी कोणताही ताबा वैध मानला जाणार नाही.
        </div>

        <div className="clause">
          <span className="clause-num">९. </span>
          जर <strong>{clientName}</strong> उक्त भूखंड कोणत्याही तृतीय पक्षास विकू, हस्तांतरित करू किंवा अन्यथा विल्हेवाट लावू इच्छित असतील, तर त्यांनी अशा कोणत्याही विक्री किंवा हस्तांतरणाच्या सुरुवात किंवा अंमलबजावणीपूर्वी या कार्यालयास सूचित करणे व {companyDisplay} कडून <strong>पूर्व लिखित परवानगी</strong> घेणे आवश्यक आहे. अशी परवानगी केवळ <strong>अंतिम अनापत्ती प्रमाणपत्र</strong> जारी झाल्यानंतरच दिली जाईल. पूर्व लिखित परवानगीशिवाय केलेली कोणतीही विक्री किंवा हस्तांतरण <strong>शून्य व अवैध</strong> मानले जाईल.
        </div>

        <div className="clause">
          <span className="clause-num">१०. </span>
          उक्त भूखंड <strong>रक्ताच्या नातेवाईकाशिवाय</strong> इतर कोणत्याही व्यक्तीस हस्तांतरित केल्यास <strong>हस्तांतरण शुल्क</strong> लागू होईल. किमान हस्तांतरण शुल्क <strong>₹ २०,०००/- (रुपये वीस हजार मात्र)</strong> आहे, व कमाल शुल्क हस्तांतरण विनंतीच्या वेळी भूखंडाच्या <strong>प्रचलित बाजार दराचे १०% (दहा टक्के)</strong> असेल. लागू हस्तांतरण शुल्काचे निर्धारण {companyDisplay} द्वारे हस्तांतरण अर्ज सादर केल्याच्या वेळी केले जाईल व कोणत्याही हस्तांतरणाची प्रक्रिया होण्यापूर्वी त्याचे पूर्ण पेमेंट करणे अनिवार्य आहे. ही अट केवळ <strong>अंतिम अनापत्ती प्रमाणपत्र</strong> जारी झाल्यानंतरच लागू होईल.
        </div>

        <div className="clause">
          <span className="clause-num">११. </span>
          भूखंड क्र. {safeMarathi(data.property.plotNumber)}, क्षेत्रफळ {plotArea} चौरस फूट यासाठी <strong>लेआउट विकास शुल्क ₹ २०/- (रुपये वीस मात्र) प्रति चौरस फूट</strong> दराने {clientName} यांच्याकडे <strong>प्रलंबित व देय</strong> आहे. आपणास विनंती आहे की ही थकबाकी रक्कम लवकरात लवकर भरावी. कृपया लक्षात घ्यावे की हे शुल्क प्रत्येक तिमाहीत <strong>₹ ३–५ प्रति चौरस फूट</strong> (म्हणजे अंदाजे <strong>₹ १२–२० प्रति चौरस फूट प्रतिवर्ष</strong>) दराने वाढते, म्हणून त्याचे पेमेंट जितके लवकर तितके चांगले. उक्त भूखंडासाठी <strong>अंतिम अनापत्ती प्रमाणपत्र</strong> {companyDisplay} द्वारे केवळ पेमेंटच्या वेळी देय संपूर्ण लेआउट विकास शुल्काच्या पूर्ण व अंतिम पेमेंटनंतरच जारी केले जाईल.
        </div>

        <div className="sig-section">
          <div className="sig-block">
            <div className="sig-label">खरेदीदाराची स्वीकृती :-</div>
            <div className="sig-line" />
            <div>नाव: {clientName}</div>
            <div style={{ marginTop: '4px' }}>दिनांक: {formatMarathiDate(issueDate)}</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'center' }}>
            <div className="noc-stamp-box">कार्यालय शिक्का व स्वाक्षरी</div>
          </div>
          <div className="sig-block" style={{ textAlign: 'right' }}>
            <div className="sig-label">अधिकृत स्वाक्षरीकर्ता :-</div>
            <div className="sig-line" />
            <div>(एम. एच. विकी / विक्रांत राणा)</div>
            <div>मालक व लेखा / प्रशासन प्रमुख</div>
            <div style={{ fontWeight: '700' }}>{companyDisplay}</div>
            <div>दिनांक: {formatMarathiDate(issueDate)}</div>
          </div>
        </div>

        <div style={{ marginTop: '16px', fontSize: '12.5px' }}>
          <strong>साक्षीदार :-</strong>
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

export default MarathiPostSaleNOC;