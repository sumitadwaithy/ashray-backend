import React, { useRef, useState, useEffect } from 'react';
import { X, Printer, Phone, Mail, MapPin, Calendar, Droplets, Building2, Download, Loader2, Building } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { CompanyAddress } from '../types';
import PrintPreview from './Printpreview';

interface IDCardProps {
  data: {
    staff?: {
      name: string;
      role: string;
      staffId: string;
      phone: string;
      email: string;
      address: string;
      bloodGroup?: string;
      joiningDate?: string;
      photo?: string;
      officeLocality?: string;
      officeAddressId?: string | number;
    };
    person?: {
      title?: string;
      name?: string;
      role?: string;
      id?: string;
      staffId?: string;
      phone?: string;
      email?: string;
      address?: string;
      bloodGroup?: string;
      joiningDate?: string;
      photo?: string;
      officeLocality?: string;
      officeAddressId?: string | number;
      type?: string;
    };
    company: {
      companyName: string;
      companyAddress: string;
      companyPhone?: string;
      companyEmail?: string;
      companyLogo?: string;
    };
  };
  officeAddresses?: CompanyAddress[];
  onClose: () => void;
}

// ─── COLOUR TOKENS ────────────────────────────────────────────────────────────
// Card background: warm off-white so your yellow/red/blue logo reads cleanly.
// Primary accent: deep navy (drawn from the blue family in your logo).
// Secondary accent: slate-blue mid-tone for subtle detail.
// All dark text is near-black navy, not pure black — softer and more refined.
const C = {
  // card surfaces
  cardFront:    '#F7F5F1',   // warm off-white
  cardBack:     '#EFF2F7',   // very light blue-tinted white
  cardBorder:   '#D6D0C8',   // warm light grey border
  // page shell
  pageBg:       '#0F172A',   // deep slate navy — high contrast for cards
  topBarBg:     '#1E293B',   // slate 800
  topBarBorder: 'rgba(255, 255, 255, 0.1)',
  // primary accent — deep navy (from logo blue family)
  accent:       '#1B3A6B',   // deep navy
  accentMid:    '#2E5FAA',   // mid navy-blue for icons / rules
  accentLight:  '#D6E3F5',   // pale blue for photo bg, dividers
  // text
  textPrimary:  '#12223F',   // near-black navy
  textSecondary:'#4A5A78',   // slate-blue body text
  textMuted:    '#8A96AE',   // muted blue-grey labels
  textFaint:    '#B0BBCC',   // very faint — watermark, legal lines
  // stripes — 3-colour header bar echoing logo palette
  stripeYellow: '#F5C800',
  stripeBlue:   '#1B3A6B',
  stripeRed:    '#C0281E',
};

// Inline SVG logo — fully offline, no external file needed
const AshrayMonogram: React.FC<{ size?: number; gold?: boolean }> = ({ size = 40, gold = false }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon
      points="40,6 74,62 6,62"
      fill="none"
      stroke={gold ? C.accentMid : C.accent}
      strokeWidth="4"
      strokeLinejoin="round"
    />
    <line x1="20" y1="62" x2="60" y2="62" stroke={gold ? C.accentMid : C.accent} strokeWidth="4" />
    <line x1="40" y1="6" x2="40" y2="44" stroke={gold ? C.accentMid : C.accent} strokeWidth="2.5" strokeDasharray="3 3" />
    <circle cx="40" cy="47" r="3.5" fill={gold ? C.accentMid : C.accent} />
  </svg>
);

// Vertical column lines watermark
const WatermarkLines: React.FC = () => (
  <svg
    width="100%"
    height="100%"
    style={{ position: 'absolute', inset: 0, opacity: 0.06, pointerEvents: 'none' }}
    xmlns="http://www.w3.org/2000/svg"
    preserveAspectRatio="none"
  >
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <line key={i} x1={`${10 + i * 10}%`} y1="0" x2={`${10 + i * 10}%`} y2="100%" stroke={C.accentMid} strokeWidth="1" />
    ))}
    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => (
      <line key={`h${i}`} x1="0" y1={`${10 + i * 10}%`} x2="100%" y2={`${10 + i * 10}%`} stroke={C.accentMid} strokeWidth="0.5" />
    ))}
  </svg>
);

export const IDCardEngine: React.FC<IDCardProps> = ({ data, officeAddresses = [], onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const rawStaff = data.staff || data.person || {};
  const company = data.company || {
    companyName: 'Ashray Group',
    companyAddress: 'Corporate Office',
  };
  
  // Find initial branch object using ID if available, otherwise fallback to locality
  const initialBranch = officeAddresses.find(a => 
    (rawStaff.officeAddressId && String(a.id) === String(rawStaff.officeAddressId)) ||
    (rawStaff.officeLocality && a.locality === rawStaff.officeLocality)
  ) || null;
  
  const [selectedBranch, setSelectedBranch] = useState<CompanyAddress | null>(initialBranch);

  // Sync with parent state if it changes
  useEffect(() => {
    const branch = officeAddresses.find(a => 
      (rawStaff.officeAddressId && String(a.id) === String(rawStaff.officeAddressId)) ||
      (rawStaff.officeLocality && a.locality === rawStaff.officeLocality)
    );
    if (branch) {
      setSelectedBranch(branch);
    } else if (!rawStaff.officeAddressId && !rawStaff.officeLocality) {
      setSelectedBranch(null);
    }
  }, [rawStaff.officeLocality, rawStaff.officeAddressId, officeAddresses]);

  const handlePrint = () => {
    setShowPrintPreview(true);
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    setIsDownloading(true);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff', // Render on white for the PDF
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`ID_Card_${(rawStaff.name || 'Staff').replace(/\s+/g, '_')}.pdf`);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

const staff = {
  title: (rawStaff as any).title || '',
  name: rawStaff.name || (rawStaff as any).fullName || '',
  role: rawStaff.role || '',
  staffId: rawStaff.staffId || (rawStaff as any).id || '',
  phone: rawStaff.phone || '',
  email: rawStaff.email || '',
  address: rawStaff.address || '',
  bloodGroup: rawStaff.bloodGroup,
  joiningDate: rawStaff.joiningDate,
  photo: rawStaff.photo,
  officeLocality: rawStaff.officeLocality,
  officeAddressId: rawStaff.officeAddressId,
};

  const companyName = company.companyName;

  // Card dimensions — CR80 standard proportions (Vertical)
  const CARD_W = 214;
  const CARD_H = 340;

  const cardBaseStyle: React.CSSProperties = {
    width: CARD_W,
    height: CARD_H,
    borderRadius: '12px',
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0,
  };

  const lightText: React.CSSProperties = { color: C.textPrimary };
  const mutedText: React.CSSProperties = { color: C.textMuted, fontSize: '9px', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase' as const };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: C.pageBg,
        zIndex: 200,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Jost', 'Segoe UI', sans-serif",
        overflowY: 'auto',
      }}
    >
      {/* Google Fonts — offline fallback to serif/sans if no internet */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Jost:wght@300;400;500;600&display=swap');
        .ag-serif { font-family: 'Playfair Display', Georgia, 'Times New Roman', serif; }
        .ag-sans { font-family: 'Jost', 'Segoe UI', system-ui, sans-serif; }
      `}</style>

      {/* Top bar */}
      <div
        style={{
          borderBottom: `1px solid ${C.topBarBorder}`,
          background: C.topBarBg,
          padding: '24px 48px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
        }}
      >
        <div>
          <p style={{ fontSize: '12px', letterSpacing: '0.4em', textTransform: 'uppercase', color: C.stripeYellow, fontWeight: 700, marginBottom: 6 }}>
            {companyName}
          </p>
          <h2 className="ag-serif" style={{ color: '#FFFFFF', fontSize: '28px', fontWeight: 600, letterSpacing: '-0.02em' }}>
            Staff Identity Card
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {officeAddresses.length > 0 && (
            <div style={{ marginRight: '12px' }}>
              <p style={{ ...mutedText, color: C.textFaint, fontSize: '8px', marginBottom: '4px' }}>Select Branch</p>
              <select
                value={selectedBranch?.id || ''}
                onChange={(e) => {
                  const branch = officeAddresses.find(a => String(a.id) === e.target.value);
                  setSelectedBranch(branch || null);
                }}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#FFFFFF',
                  border: `1px solid rgba(255,255,255,0.15)`,
                  padding: '8px 12px',
                  fontSize: '11px',
                  borderRadius: '6px',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="" style={{ background: C.topBarBg }}>Main Office</option>
                {officeAddresses.map(addr => (
                  <option key={addr.id} value={addr.id} style={{ background: C.topBarBg }}>
                    {addr.locality} ({addr.name})
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255,255,255,0.05)',
              color: '#FFFFFF',
              border: `1px solid rgba(255,255,255,0.15)`,
              padding: '12px 24px',
              fontWeight: 600,
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: isDownloading ? 'not-allowed' : 'pointer',
              borderRadius: '8px',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
          >
            {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: `linear-gradient(135deg, ${C.stripeYellow}, #E5B200)`,
              color: '#000000',
              border: 'none',
              padding: '12px 28px',
              fontWeight: 800,
              fontSize: '12px',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              borderRadius: '8px',
              boxShadow: `0 4px 15px rgba(245, 200, 0, 0.3)`,
              transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 6px 20px rgba(245, 200, 0, 0.4)`; }}
            onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 15px rgba(245, 200, 0, 0.3)`; }}
          >
            <Printer size={16} /> Print Card
          </button>
          <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.1)', margin: '0 8px' }} />
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: `1px solid rgba(255,255,255,0.1)`,
              color: '#FFFFFF',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              borderRadius: '50%',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#EF4444'; e.currentTarget.style.borderColor = '#EF4444'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Card Preview Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '40px',
          padding: '60px 40px',
        }}
      >
        {/* Label */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ ...mutedText, color: C.textMuted }}>Preview — actual print size may vary by printer</p>
        </div>

        {/* Both cards in a row */}
        <div
          ref={printRef}
          style={{ display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}
        >

          {/* ────────────────────────────────────────────────
              FRONT CARD
          ──────────────────────────────────────────────── */}
          <div>
            <p style={{ ...mutedText, marginBottom: '12px', textAlign: 'center' }}>Front</p>
            <div style={{ ...cardBaseStyle, background: C.cardFront, boxShadow: `0 8px 32px rgba(27,58,107,0.12), 0 0 0 1px ${C.cardBorder}` }}>
              <WatermarkLines />

              {/* 3-colour top stripe — yellow | navy | red — mirrors logo palette */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeYellow }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeRed }} />
              </div>

              {/* Content */}
              <div style={{ padding: '16px 14px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center', textAlign: 'center' }}>

                {/* 1. Header Section - Logo + 2. Company Name */}
                <div
  style={{
    marginTop: '-4px',        // 🔼 move UP
    marginBottom: '18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  }}
>
  {/* BIGGER LOGO */}
  <div
    style={{
      width: '64px',         // 🔥 increased from 42 → 64
      height: '64px',
      borderRadius: '50%',
      background: '#FFFFFF',
      border: `1px solid ${C.accentLight}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
      marginBottom: '10px'
    }}
  >
    {company.companyLogo ? (
      <img
        src={company.companyLogo}
        alt="Logo"
        style={{
          width: '90%',       // 🔥 more fill
          height: '90%',
          objectFit: 'contain'
        }}
        referrerPolicy="no-referrer"
      />
    ) : (
      <AshrayMonogram size={40} gold={false} /> // 🔥 scaled fallback
    )}
  </div>

  {/* COMPANY NAME */}
  <p
    style={{
      fontSize: '12px',      // slightly bigger for balance
      fontWeight: 800,
      letterSpacing: '0.18em',
      textTransform: 'uppercase',
      color: C.accent,
      marginBottom: '2px'
    }}
  >
    {companyName}
  </p>

  <p
    style={{
      fontSize: '7px',
      color: C.textMuted,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
      fontWeight: 500
    }}
  >
    Real Estate Services
  </p>
</div>

                <div style={{ width: '100%', height: '0.5px', background: `linear-gradient(to right, transparent, ${C.accentLight}, transparent)`, marginBottom: '15px' }} />

                {/* Main Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, width: '100%' }}>
                  
                  {/* 3. Photo */}
                  <div
                    style={{
                      width: '80px',
                      height: '100px',
                      border: `1px solid ${C.cardBorder}`,
                      flexShrink: 0,
                      overflow: 'hidden',
                      background: C.accentLight,
                      position: 'relative',
                      marginBottom: '4px', 
                      marginTop: '-25px',
                    }}
                  >
                    {[
                      { top: 0, left: 0, borderTop: `2px solid ${C.accent}`, borderLeft: `2px solid ${C.accent}` },
                      { top: 0, right: 0, borderTop: `2px solid ${C.accent}`, borderRight: `2px solid ${C.accent}` },
                      { bottom: 0, left: 0, borderBottom: `2px solid ${C.accent}`, borderLeft: `2px solid ${C.accent}` },
                      { bottom: 0, right: 0, borderBottom: `2px solid ${C.accent}`, borderRight: `2px solid ${C.accent}` },
                    ].map((s, i) => (
                      <div key={i} style={{ position: 'absolute', width: '8px', height: '8px', ...s }} />
                    ))}
                    {staff.photo ? (
                      <img
                        src={staff.photo}
                        alt={staff.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AshrayMonogram size={32} gold />
                      </div>
                    )}
                  </div>

                  {/* 4. Full Name + 5. Role */}
                  <h1
                    className="ag-serif"
                    style={{ color: C.textPrimary, fontSize: '16px', fontWeight: 600, lineHeight: 1.2, marginBottom: '2px' }}
                  >
                    {[staff.title, staff.name].filter(Boolean).join(' ') || '—'}
                  </h1>
                  <p style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accentMid, marginBottom: '8px' }}>
                    {staff.role}
                  </p>

                  <div style={{ width: '100%', height: '0.5px', background: C.accentLight, marginBottom: '-4px' }} />

                  {/* 6. Branch (SMART 2-LINE LAYOUT) */}
<div style={{ marginBottom: '6px', marginTop: '-2px' }}>
  {selectedBranch ? (
    <>
      {/* LINE 1 → ALWAYS LEFT */}
      <p
        style={{
          fontSize: '8.2px',
          color: C.textSecondary,
          lineHeight: 1.2,
          maxWidth: '160px',
          textAlign: 'left',
          fontWeight: 500,
        }}
      >
        <span style={{ fontWeight: 700, color: C.accent }}>
          Branch Office:
        </span>{' '}
        {selectedBranch.addressLine}, {selectedBranch.locality},
      </p>

      {/* LINE 2 → AUTO CENTER IF SHORT */}
      <p
        style={{
          fontSize: '8.2px',
          color: C.textSecondary,
          lineHeight: 1.2,
          maxWidth: '160px',
          marginTop: '1px',
          fontWeight: 500,

          // 🔥 MAGIC
          width: 'fit-content',   // shrink to content
          marginLeft: 'auto',
          marginRight: 'auto',    // center ONLY if short
          textAlign: 'center',
        }}
      >
        {selectedBranch.district}, {selectedBranch.state}, {selectedBranch.pinCode}
      </p>
    </>
  ) : (
    <p
      style={{
        fontSize: '7.2px',
        color: C.textSecondary,
        textAlign: 'left',
      }}
    >
      <span style={{ fontWeight: 700, color: C.accent }}>
        Head Office:
      </span>{' '}
      {company.companyAddress || '—'}
    </p>
  )}
</div>
                  {/* 7. Employee ID & Blood Group */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', padding: '0 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ ...mutedText, fontSize: '7.5px' }}>Employee ID</p>
                      <p style={{ ...lightText, fontSize: '9px', fontWeight: 700, marginTop: '1px' }}>
                        {staff.staffId || 'AG-0001'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ ...mutedText, fontSize: '7.5px' }}>Blood</p>
                      <p style={{ color: C.stripeRed, fontSize: '9px', fontWeight: 700, marginTop: '1px' }}>
                        {staff.bloodGroup || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-colour bottom stripe */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeRed }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeYellow }} />
              </div>
            </div>
          </div>

          {/* ────────────────────────────────────────────────
              BACK CARD
          ──────────────────────────────────────────────── */}
          <div>
            <p style={{ ...mutedText, marginBottom: '12px', textAlign: 'center' }}>Back</p>
            <div style={{ ...cardBaseStyle, background: C.cardBack, boxShadow: `0 8px 32px rgba(27,58,107,0.12), 0 0 0 1px ${C.cardBorder}` }}>
              <WatermarkLines />

              {/* 3-colour top stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeYellow }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeRed }} />
              </div>

              <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Back header */}
                <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.accentMid }}>
                    Identity Record
                  </p>
                  <p className="ag-serif" style={{ color: C.textPrimary, fontSize: '15px', marginTop: '4px', fontWeight: 600 }}>
                    {[staff.title, staff.name].filter(Boolean).join(' ') || '—'}
                  </p>
                </div>

                <div style={{ height: '0.5px', background: C.accentLight, marginBottom: '12px' }} />

                {/* Details grid */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { icon: <Phone size={12} color={C.accentMid} />, label: 'Mobile', val: staff.phone || '—' },
                    { icon: <Mail size={12} color={C.accentMid} />, label: 'Email', val: staff.email || '—' },
                    { icon: <MapPin size={12} color={C.accentMid} />, label: 'Address', val: staff.address || '—' },
                    { icon: <Calendar size={12} color={C.accentMid} />, label: 'Joining', val: staff.joiningDate || '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {row.icon}
                        <p style={{ ...mutedText, fontSize: '8px' }}>{row.label}</p>
                      </div>
                      <p
                        style={{
                          color: C.textSecondary,
                          fontSize: '10px',
                          fontWeight: 500,
                          paddingLeft: '18px',
                          wordBreak: 'break-word' as const,
                          lineHeight: 1.4,
                        }}
                      >
                        {row.val}
                      </p>
                    </div>
                  ))}

                  {/* ✅ AUTHORISED SIGNATORY - RIGHT ALIGNED */}
                  <div style={{ marginTop: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '4px' }}>
                    <div style={{ height: '15px' }} /> {/* Added space for signature */}
                    <div
                      style={{
                        borderTop: `1px solid ${C.accentLight}`,
                        width: '80px',
                        marginBottom: '3px',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '7px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: C.accentMid,
                        textAlign: 'right'
                      }}
                    >
                      AUTHORISED SIGNATORY
                    </p>
                  </div>
                </div>


                {/* Back footer */}
                <div
  style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',                 // tighter vertical control
    textAlign: 'center',
    marginTop: '-6px',          // 🔥 pull everything UP
  }}
>
  <p
    style={{
      ...mutedText,
      color: C.textFaint,
      fontSize: '7.5px',
      lineHeight: 1.3,
      marginBottom: '0px',      // 🔥 remove extra push
    }}
  >
    This card is property of {companyName}.<br />
    Misuse is subject to legal action.
  </p>

    {/* LOGO */}
    <div
      style={{
        width: '22px',
        height: '22px',
        borderRadius: '50%',
        background: '#FFFFFF',
        border: `1px solid ${C.accentLight}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        marginTop: '2px',         // 🔥 controlled spacing
        marginBottom: '2px'
      }}
    >
      {company.companyLogo ? (
        <img
          src={company.companyLogo}
          alt="Logo"
          style={{ width: '80%', height: '80%', objectFit: 'contain' }}
        />
      ) : (
        <AshrayMonogram size={14} gold={false} />
      )}
    </div>
  </div>
              </div>

              {/* 3-colour bottom stripe */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeRed }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeYellow }} />
              </div>
            </div>
          </div>
        </div>

        {/* Instruction note */}
        <div
          style={{
            border: `1px solid ${C.topBarBorder}`,
            padding: '16px 32px',
            maxWidth: '800px',
            width: '100%',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '12px',
          }}
        >
          <p style={{ fontSize: '12px', color: '#94A3B8', lineHeight: 1.8, textAlign: 'center' }}>
            <span style={{ color: C.stripeYellow, fontWeight: 700 }}>Print Recommendation: </span>
            For professional results, print on 300gsm matte archival stock at 100% scale. Use a high-resolution inkjet or laser printer. Lamination or PVC printing is recommended for daily durability.
          </p>
        </div>
      </div>

      {/* Print Preview Modal */}
      {showPrintPreview && (
        <PrintPreview
          title={`Staff ID Card - ${staff.name || 'Staff'}`}
          subtitle="Identity Document"
          companyName={companyName}
          onClose={() => setShowPrintPreview(false)}
          defaultSettings={{
            orientation: 'portrait',
            pageSize: 'A4',
            margins: 'none'
          }}
        >
          <div style={{ padding: '60px', display: 'flex', gap: '32px', flexWrap: 'wrap', justifyContent: 'center', background: '#F1F5F9', minHeight: '100%' }}>
            {/* Reuse card layouts in print mode */}
            <div style={{ ...cardBaseStyle, background: C.cardFront, boxShadow: `0 8px 32px rgba(27,58,107,0.12), 0 0 0 1px ${C.cardBorder}` }}>
              <WatermarkLines />

              {/* 3-colour top stripe — yellow | navy | red — mirrors logo palette */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeYellow }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeRed }} />
              </div>

              {/* Content */}
              <div style={{ padding: '16px 14px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', alignItems: 'center', textAlign: 'center' }}>

                {/* 1. Header Section - Logo + 2. Company Name */}
                <div
                  style={{
                    marginTop: '-4px',        // 🔼 move UP
                    marginBottom: '18px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                  }}
                >
                  {/* BIGGER LOGO */}
                  <div
                    style={{
                      width: '64px',         // 🔥 increased from 42 → 64
                      height: '64px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: `1px solid ${C.accentLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                      marginBottom: '10px'
                    }}
                  >
                    {company.companyLogo ? (
                      <img
                        src={company.companyLogo}
                        alt="Logo"
                        style={{
                          width: '90%',       // 🔥 more fill
                          height: '90%',
                          objectFit: 'contain'
                        }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <AshrayMonogram size={40} gold={false} /> // 🔥 scaled fallback
                    )}
                  </div>

                  {/* COMPANY NAME */}
                  <p
                    style={{
                      fontSize: '12px',      // slightly bigger for balance
                      fontWeight: 800,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: C.accent,
                      marginBottom: '2px'
                    }}
                  >
                    {companyName}
                  </p>

                  <p
                    style={{
                      fontSize: '7px',
                      color: C.textMuted,
                      letterSpacing: '0.1em',
                      textTransform: 'uppercase',
                      fontWeight: 500
                    }}
                  >
                    Real Estate Services
                  </p>
                </div>

                <div style={{ width: '100%', height: '0.5px', background: `linear-gradient(to right, transparent, ${C.accentLight}, transparent)`, marginBottom: '15px' }} />

                {/* Main Identity */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, width: '100%' }}>
                  
                  {/* 3. Photo */}
                  <div
                    style={{
                      width: '80px',
                      height: '100px',
                      border: `1px solid ${C.cardBorder}`,
                      flexShrink: 0,
                      overflow: 'hidden',
                      background: C.accentLight,
                      position: 'relative',
                      marginBottom: '4px', 
                      marginTop: '-25px',
                    }}
                  >
                    {[
                      { top: 0, left: 0, borderTop: `2px solid ${C.accent}`, borderLeft: `2px solid ${C.accent}` },
                      { top: 0, right: 0, borderTop: `2px solid ${C.accent}`, borderRight: `2px solid ${C.accent}` },
                      { bottom: 0, left: 0, borderBottom: `2px solid ${C.accent}`, borderLeft: `2px solid ${C.accent}` },
                      { bottom: 0, right: 0, borderBottom: `2px solid ${C.accent}`, borderRight: `2px solid ${C.accent}` },
                    ].map((s, i) => (
                      <div key={i} style={{ position: 'absolute', width: '8px', height: '8px', ...s }} />
                    ))}
                    {staff.photo ? (
                      <img
                        src={staff.photo}
                        alt={staff.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <AshrayMonogram size={32} gold />
                      </div>
                    )}
                  </div>

                  {/* 4. Full Name + 5. Role */}
                  <h1
                    className="ag-serif"
                    style={{ color: C.textPrimary, fontSize: '16px', fontWeight: 600, lineHeight: 1.2, marginBottom: '2px' }}
                  >
                    {[staff.title, staff.name].filter(Boolean).join(' ') || '—'}
                  </h1>
                  <p style={{ fontSize: '8px', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: C.accentMid, marginBottom: '8px' }}>
                    {staff.role}
                  </p>

                  <div style={{ width: '100%', height: '0.5px', background: C.accentLight, marginBottom: '-4px' }} />

                  {/* 6. Branch (SMART 2-LINE LAYOUT) */}
                  <div style={{ marginBottom: '6px', marginTop: '-2px' }}>
                    {selectedBranch ? (
                      <>
                        {/* LINE 1 → ALWAYS LEFT */}
                        <p
                          style={{
                            fontSize: '8.2px',
                            color: C.textSecondary,
                            lineHeight: 1.2,
                            maxWidth: '160px',
                            textAlign: 'left',
                            fontWeight: 500,
                          }}
                        >
                          <span style={{ fontWeight: 700, color: C.accent }}>
                            Branch Office:
                          </span>{' '}
                          {selectedBranch.addressLine}, {selectedBranch.locality},
                        </p>

                        {/* LINE 2 → AUTO CENTER IF SHORT */}
                        <p
                          style={{
                            fontSize: '8.2px',
                            color: C.textSecondary,
                            lineHeight: 1.2,
                            maxWidth: '160px',
                            marginTop: '1px',
                            fontWeight: 500,

                            // 🔥 MAGIC
                            width: 'fit-content',   // shrink to content
                            marginLeft: 'auto',
                            marginRight: 'auto',    // center ONLY if short
                            textAlign: 'center',
                          }}
                        >
                          {selectedBranch.district}, {selectedBranch.state}, {selectedBranch.pinCode}
                        </p>
                      </>
                    ) : (
                      <p
                        style={{
                          fontSize: '7.2px',
                          color: C.textSecondary,
                          textAlign: 'left',
                        }}
                      >
                        <span style={{ fontWeight: 700, color: C.accent }}>
                          Head Office:
                        </span>{' '}
                        {company.companyAddress || '—'}
                      </p>
                    )}
                  </div>
                  {/* 7. Employee ID & Blood Group */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', padding: '0 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ ...mutedText, fontSize: '7.5px' }}>Employee ID</p>
                      <p style={{ ...lightText, fontSize: '9px', fontWeight: 700, marginTop: '1px' }}>
                        {staff.staffId || 'AG-0001'}
                      </p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <p style={{ ...mutedText, fontSize: '7.5px' }}>Blood</p>
                      <p style={{ color: C.stripeRed, fontSize: '9px', fontWeight: 700, marginTop: '1px' }}>
                        {staff.bloodGroup || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3-colour bottom stripe */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeRed }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeYellow }} />
              </div>
            </div>

            <div style={{ ...cardBaseStyle, background: C.cardBack, boxShadow: `0 8px 32px rgba(27,58,107,0.12), 0 0 0 1px ${C.cardBorder}` }}>
              <WatermarkLines />

              {/* 3-colour top stripe */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeYellow }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeRed }} />
              </div>

              <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}>

                {/* Back header */}
                <div style={{ marginBottom: '8px', textAlign: 'center' }}>
                  <p style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: C.accentMid }}>
                    Identity Record
                  </p>
                  <p className="ag-serif" style={{ color: C.textPrimary, fontSize: '15px', marginTop: '4px', fontWeight: 600 }}>
                    {[staff.title, staff.name].filter(Boolean).join(' ') || '—'}
                  </p>
                </div>

                <div style={{ height: '0.5px', background: C.accentLight, marginBottom: '12px' }} />

                {/* Details grid */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { icon: <Phone size={12} color={C.accentMid} />, label: 'Mobile', val: staff.phone || '—' },
                    { icon: <Mail size={12} color={C.accentMid} />, label: 'Email', val: staff.email || '—' },
                    { icon: <MapPin size={12} color={C.accentMid} />, label: 'Address', val: staff.address || '—' },
                    { icon: <Calendar size={12} color={C.accentMid} />, label: 'Joining', val: staff.joiningDate || '—' },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {row.icon}
                        <p style={{ ...mutedText, fontSize: '8px' }}>{row.label}</p>
                      </div>
                      <p
                        style={{
                          color: C.textSecondary,
                          fontSize: '10px',
                          fontWeight: 500,
                          paddingLeft: '18px',
                          wordBreak: 'break-word' as const,
                          lineHeight: 1.4,
                        }}
                      >
                        {row.val}
                      </p>
                    </div>
                  ))}

                  {/* ✅ AUTHORISED SIGNATORY - RIGHT ALIGNED */}
                  <div style={{ marginTop: 'auto', marginBottom: '12px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', paddingRight: '4px' }}>
                    <div style={{ height: '15px' }} /> {/* Added space for signature */}
                    <div
                      style={{
                        borderTop: `1px solid ${C.accentLight}`,
                        width: '80px',
                        marginBottom: '3px',
                      }}
                    />
                    <p
                      style={{
                        fontSize: '7px',
                        fontWeight: 700,
                        letterSpacing: '0.12em',
                        color: C.accentMid,
                        textAlign: 'right'
                      }}
                    >
                      AUTHORISED SIGNATORY
                    </p>
                  </div>
                </div>


                {/* Back footer */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',                 // tighter vertical control
                    textAlign: 'center',
                    marginTop: '-6px',          // 🔥 pull everything UP
                  }}
                >
                  <p
                    style={{
                      ...mutedText,
                      color: C.textFaint,
                      fontSize: '7.5px',
                      lineHeight: 1.3,
                      marginBottom: '0px',      // 🔥 remove extra push
                    }}
                  >
                    This card is property of {companyName}.<br />
                    Misuse is subject to legal action.
                  </p>

                  {/* LOGO */}
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      border: `1px solid ${C.accentLight}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      marginTop: '2px',         // 🔥 controlled spacing
                      marginBottom: '2px'
                    }}
                  >
                    {company.companyLogo ? (
                      <img
                        src={company.companyLogo}
                        alt="Logo"
                        style={{ width: '80%', height: '80%', objectFit: 'contain' }}
                      />
                    ) : (
                      <AshrayMonogram size={14} gold={false} />
                    )}
                  </div>
                </div>
              </div>

              {/* 3-colour bottom stripe */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', display: 'flex' }}>
                <div style={{ flex: 1, background: C.stripeRed }} />
                <div style={{ flex: 2, background: C.stripeBlue }} />
                <div style={{ flex: 1, background: C.stripeYellow }} />
              </div>
            </div>
          </div>
        </PrintPreview>
      )}
    </div>

  );
};

export default IDCardEngine;
