import React, { useRef, useState, useEffect, useLayoutEffect, useCallback, createContext, useContext } from "react";
import { createPortal } from "react-dom";

// ─────────────────────────────────────────────────────────────────────────────
// CONTEXT
// ─────────────────────────────────────────────────────────────────────────────

interface PrintContextType {
  settings: PrintSettings;
  generatedAt: Date;
}

const PrintContext = createContext<PrintContextType | null>(null);

export const usePrint = () => {
  const context = useContext(PrintContext);
  if (!context) {
    // Fallback for when used outside PrintPreview (e.g. in direct template view)
    return {
      settings: DEFAULT_SETTINGS,
      generatedAt: new Date(),
    };
  }
  return context;
};

export const PrintFooter: React.FC = () => {
  const { settings, generatedAt } = usePrint();

  if (!settings.showPageNumbers && !settings.showDate) return null;

  return (
    <div
      id="ashray-footer-container"
      style={{
        position: "absolute",
        bottom: "10mm",
        left: 0,
        right: 0,
        textAlign: "center",
        fontSize: "10px",
        color: "#666",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "2px",
        pointerEvents: "none",
      }}
    >
      {settings.showPageNumbers && (
        <div className="page-number-container">
          Page <span className="page-number"></span>
        </div>
      )}
      {settings.showDate && (
        <div className="print-date">
          Printed on: {formatDate(generatedAt)} {formatTime(generatedAt)}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────────────────────────────────────

export type PrintOrientation = "portrait" | "landscape";
export type PrintPageSize = "A4" | "A3" | "Letter" | "Legal" | "Check";
export type PrintColorMode = "color" | "grayscale" | "blackwhite";

export type PrintDestination = "pdf" | string; // "pdf" = Save as PDF, any other string = printer name

export interface DetectedPrinter {
  id: string;
  name: string;
  isDefault?: boolean;
  status?: "ready" | "busy" | "offline" | "unknown";
}

export interface PrintSettings {
  orientation: PrintOrientation;
  pageSize: PrintPageSize;
  colorMode: PrintColorMode;
  showPageNumbers: boolean;
  showDate: boolean;
  margins: "normal" | "narrow" | "wide" | "custom",
  marginTop: number;
  marginRight: number;
  marginBottom: number;
  marginLeft: number;
  copies: number;
  scale: number; // percentage 50–150
  destination: PrintDestination; // "pdf" or printer name
  pages: "all" | "custom";
  pageRange: string;
}

export interface PrintPreviewProps {
  /** Title shown in the print header and dialog title */
  title?: string;
  /** Subtitle / document type label */
  subtitle?: string;
  /** Company / organisation name */
  companyName?: string;
  /** Tax ID or any secondary company label */
  taxId?: string;
  /** Period label e.g. "This Year", "Apr 2026" */
  period?: string;
  /** Summary cards shown below the header strip */
  summaryCards?: Array<{
    label: string;
    value: string | number;
    valueColor?: string; // CSS color
  }>;
  /** The actual content to be printed – rendered inside the paper sheet */
  children: React.ReactNode;
  /** Footer text / balance line printed at the bottom of the page */
  footerText?: string;
  /** Footer value (e.g. "₹20,000.00 Dr") */
  footerValue?: string;
  /** Color for footerValue text */
  footerValueColor?: string;
  /** Callback fired when dialog is closed / cancelled */
  onClose?: () => void;
  /** Override default settings */
  defaultSettings?: Partial<PrintSettings>;
  /** Whether the dialog is open */
  open?: boolean;
  /** Whether to center the content horizontally and vertically on the printed page */
  centerContent?: boolean;
  /** Optional UI to show at the top of the settings sidebar for custom configuration */
  configPanel?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const PAGE_SIZES: Record<PrintPageSize, { w: number; h: number }> = {
  A4: { w: 210, h: 297 },
  A3: { w: 297, h: 420 },
  Letter: { w: 216, h: 279 },
  Legal: { w: 216, h: 356 },
  Check: { w: 203, h: 95 },
};

const MARGIN_MAP: Record<PrintSettings["margins"], string> = {
  narrow: "6mm",
  normal: "12mm",
  wide: "20mm",
  custom: "0mm", // Not used if custom is selected anyway
};

const DEFAULT_SETTINGS: PrintSettings = {
  orientation: "portrait",
  pageSize: "A4",
  colorMode: "color",
  showPageNumbers: false,
  showDate: false,
  margins: "normal",
  marginTop: 25,
  marginRight: 25,
  marginBottom: 25,
  marginLeft: 35,
  copies: 1,
  scale: 100,
  destination: "pdf",
  pages: "all",
  pageRange: "",
};

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRINT STYLES (injected once into <head>)
// ─────────────────────────────────────────────────────────────────────────────

const PRINT_STYLE_ID = "ashray-print-preview-styles";

function injectPrintStyles(settings: PrintSettings, generatedAt: Date, centerContent?: boolean) {
  let el = document.getElementById(PRINT_STYLE_ID) as HTMLStyleElement | null;
  if (!el) {
    el = document.createElement("style");
    el.id = PRINT_STYLE_ID;
    document.head.appendChild(el);
  }

  const size = PAGE_SIZES[settings.pageSize as PrintPageSize] || PAGE_SIZES["A4"];
  const isLandscape = settings.orientation === "landscape";
  const w = isLandscape ? size.h : size.w;
  const h = isLandscape ? size.w : size.h;
  const marginValue = MARGIN_MAP[settings.margins === 'custom' ? 'normal' : settings.margins];

  let marginTop, marginRight, marginBottom, marginLeft;

  if (settings.margins === "custom") {
    marginTop = `${settings.marginTop}mm`;
    marginRight = `${settings.marginRight}mm`;
    marginBottom = `${settings.marginBottom}mm`;
    marginLeft = `${settings.marginLeft}mm`;
  } else {
    marginTop = marginValue;
    marginRight = marginValue;
    marginBottom = marginValue;
    marginLeft = marginValue;
  }

  const filter =
    settings.colorMode === "grayscale"
      ? "filter: grayscale(100%);"
      : settings.colorMode === "blackwhite"
      ? "filter: grayscale(100%) contrast(200%);"
      : "";

  el.textContent = `
    .preview-scroll-container {
      counter-reset: page;
      background: #525659;
      padding: 40px 0;
    }

    .a4-page, .sheet {
      --ashray-print-margin-top: ${marginTop};
      --ashray-print-margin-right: ${marginRight};
      --ashray-print-margin-bottom: ${marginBottom};
      --ashray-print-margin-left: ${marginLeft};
      counter-increment: page;
      position: relative;
      width: ${w}mm !important;
      min-height: ${h}mm !important;
      height: auto !important;
      padding: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important;
      margin: 0 auto 20px !important;
      background: white !important;
      box-sizing: border-box !important;
      box-shadow: 0 0 10px rgba(0,0,0,0.3) !important;
      display: ${centerContent ? 'flex' : 'block'} !important;
      ${centerContent ? `
      align-items: center !important;
      justify-content: center !important;
      ` : ''}
      overflow: visible !important;
    }

    .a4-page:last-child, .sheet:last-child {
      page-break-after: auto !important;
      margin-bottom: 0 !important;
    }

    .agreement-watermark {
      position: absolute !important;
      left: var(--ashray-print-margin-left) !important;
      top: var(--ashray-print-margin-top) !important;
      width: calc(
        100% 
        - var(--ashray-print-margin-left) 
        - var(--ashray-print-margin-right)
      ) !important;
      height: calc(
        100% 
        - var(--ashray-print-margin-top) 
        - var(--ashray-print-margin-bottom)
      ) !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }

    .page-number::after {
      content: counter(page);
    }

    @media print {
      @page {
        size: ${w}mm ${h}mm;
        margin: ${marginTop} ${marginRight} ${marginBottom} ${marginLeft} !important;
      }

    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: white !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
    }

    body > *:not(.print-reset-wrapper):not(script):not(style) {
      display: none !important;
    }

    /* Force visibility and overflow for multi-page support */
    .print-reset-wrapper {
      overflow: visible !important;
      height: auto !important;
      min-height: 0 !important;
      width: auto !important;
      max-width: none !important;
      max-height: none !important;
      position: static !important;
      display: block !important;
      transform: none !important;
      margin: 0 !important;
      padding: 0 !important;
      border: none !important;
      box-shadow: none !important;
      background: transparent !important;
    }

    #ashray-printable-area {
      position: static !important;
      left: 0 !important;
      top: 0 !important;
      width: ${w}mm !important;
      height: auto !important;
      min-height: 0 !important;
      margin: 0 !important;
      padding: 0 !important;
      box-sizing: border-box;
      ${filter}
      display: block !important;
      transform: none !important;
      overflow: visible !important;
    }

    #printable-document {
      display: block !important;
      position: static !important;
      width: ${w}mm !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
    }

    .no-print {
      display: none !important;
    }

    * {
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    #ashray-footer-container {
      display: none !important;
    }

    .a4-page, .sheet {
      --ashray-print-margin-top: ${marginTop};
      --ashray-print-margin-right: ${marginRight};
      --ashray-print-margin-bottom: ${marginBottom};
      --ashray-print-margin-left: ${marginLeft};
      margin: 0 !important;
      box-shadow: none !important;
      page-break-after: always !important;
      break-after: page !important;
      break-inside: auto !important;
      display: ${centerContent ? 'flex' : 'block'} !important;
      ${centerContent ? `
      align-items: center !important;
      justify-content: center !important;
      ` : ''}
      position: relative !important;
      width: 100% !important;
      height: auto !important;
      min-height: calc(${h}mm - var(--ashray-print-margin-top) - var(--ashray-print-margin-bottom)) !important;
      padding: 0 !important;
      overflow: visible !important;
      box-sizing: border-box !important;
    }

    .a4-page:last-child, .sheet:last-child {
      page-break-after: auto !important;
      break-after: auto !important;
    }

    .agreement-watermark {
      position: fixed !important;
      left: 50% !important;
      top: 50% !important;
      transform: translate(-50%, -50%) !important;
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      pointer-events: none !important;
      z-index: 0 !important;
    }
    
    /* Force content inside to stay within bounds if possible */
    .a4-page > *:not(.agreement-watermark) {
      max-width: 100% !important;
    }

    ${(!settings.showPageNumbers && !settings.showDate) ? `
    .a4-page::after, .sheet::after {
      display: none !important;
    }
    ` : `
    .a4-page::after, .sheet::after {
      content: "${settings.showPageNumbers ? `Page " counter(page) "` : ""}${settings.showPageNumbers && settings.showDate ? "  |  " : ""}${settings.showDate ? `Printed on: ${formatDate(generatedAt)} ${formatTime(generatedAt)}` : ""}";
      position: absolute;
      bottom: 10mm;
      left: 0;
      right: 0;
      text-align: center;
      font-size: 10px;
      color: #666;
      visibility: visible !important;
      display: block !important;
    }
    `}

    .page-number::after {
      content: counter(page);
    }
  }
`;
}

// ─────────────────────────────────────────────────────────────────────────────
// DESTINATION SELECTOR  (printer picker + scan)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Attempts to enumerate physical printers via the experimental
 * window.matchMedia / Chromium Printer API if available, otherwise
 * falls back to a static "Save as PDF" only list.
 *
 * The Web Printing API (navigator.printing) is still behind a flag in most
 * browsers, so we simulate scan behaviour with a realistic loading state and
 * provide a clean fallback.
 */

const STATIC_PDF_PRINTER: DetectedPrinter = {
  id: "pdf",
  name: "Save as PDF",
  status: "ready",
};

async function scanForPrinters(): Promise<DetectedPrinter[]> {
  console.log("Starting printer scan...");
  // 1. Try Electron API if available
  if (typeof window !== "undefined" && window.api && window.api.getPrinters) {
    try {
      console.log("Attempting Electron getPrinters...");
      const printers = await window.api.getPrinters();
      console.log("Electron getPrinters result:", printers);
      
      if (printers && Array.isArray(printers)) {
        const mapStatus = (status: any): DetectedPrinter["status"] => {
  if (status === 0 || status === "0") return "ready";
  if (status === 1 || status === "1") return "busy";
  if (status === 2 || status === "2") return "offline";
  return "unknown";
};

const mapped: DetectedPrinter[] = printers.map((p: any, i: number) => ({
  id: p.name || p.displayName || `printer-${i}`,
  name: p.displayName || p.name || "Unknown Printer",
  isDefault: Boolean(p.isDefault),
  status: mapStatus(p.status),
}));
        console.log("Mapped printers:", mapped);
        return mapped;
      }
    } catch (err) {
      console.warn("Electron getPrinters failed:", err);
    }
  }

  // 2. Fallback for Web/Browser Preview (Non-Electron)
  // If we're in a browser and not in Electron, we can't get physical printers,
  // but we can provide a better mock experience for the user to see how it works.
  const isElectron = typeof window !== "undefined" && (window.api || navigator.userAgent.includes("Electron"));
  
  if (!isElectron) {
    // Only return mocks if we're clearly in a browser environment to show it works
    return [
      { id: "mock-hp-officejet", name: "HP OfficeJet 8010 (Simulated)", status: "ready" },
      { id: "mock-epson-l3210", name: "Epson L3210 Series (Simulated)", status: "offline" },
    ];
  }

  // 3. Try the experimental Web Printing API as a last resort
  try {
    // @ts-ignore – experimental API
    if (navigator.printing) {
      // @ts-ignore
      const printers: any[] = await navigator.printing.getPrinters();
      if (printers && Array.isArray(printers)) {
        return printers.map((p: any, i: number) => ({
          id: p.id ?? `printer-${i}`,
          name: p.name ?? `Printer ${i + 1}`,
          isDefault: p.isDefault ?? i === 0,
          status: p.status ?? "unknown",
        }));
      }
    }
  } catch (_) { /* not available */ }

  return [];
}

interface DestinationSelectorProps {
  value: PrintDestination;
  onChange: (dest: PrintDestination) => void;
  printers: DetectedPrinter[];
  scanning: boolean;
  onScan: () => void;
  scanned: boolean;
}

const DestinationSelector: React.FC<DestinationSelectorProps> = ({ 
  value, 
  onChange, 
  printers, 
  scanning, 
  onScan,
  scanned
}) => {
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleScan = (e: React.MouseEvent) => {
    e.stopPropagation();
    onScan();
  };

  const selectedPrinter = printers.find((p) => p.id === value) ?? STATIC_PDF_PRINTER;

  const statusDot = (status: DetectedPrinter["status"]) => {
    const color =
      status === "ready" ? "#2ecc71"
      : status === "busy" ? "#f39c12"
      : status === "offline" ? "#e74c3c"
      : "#888";
    return (
      <span style={{ display: "inline-block", width: 7, height: 7, borderRadius: "50%", background: color, marginRight: 6, flexShrink: 0 }} />
    );
  };

  const PrinterIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );

  const PDFIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );

  return (
    <div ref={dropRef} style={{ position: "relative", width: "100%" }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          background: "#3d3d3d",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: 6,
          color: "#fff",
          fontSize: 12,
          padding: "5px 10px",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          minWidth: 140,
        }}
      >
        {selectedPrinter.id === "pdf" ? <PDFIcon /> : <PrinterIcon />}
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selectedPrinter.name}
        </span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            right: 0,
            left: 0,
            background: "#2a2a2a",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            zIndex: 100,
            overflow: "hidden",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
            minWidth: 200,
          }}
        >
          {/* Printer list */}
          {printers.map((p) => (
            <button
              key={p.id}
              onClick={() => { onChange(p.id); setOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "9px 12px",
                background: value === p.id ? "rgba(74,144,217,0.18)" : "transparent",
                border: "none",
                color: value === p.id ? "#4a90d9" : "#ddd",
                fontSize: 12,
                cursor: "pointer",
                textAlign: "left",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {p.id === "pdf" ? <PDFIcon /> : <PrinterIcon />}
              {p.status && statusDot(p.status)}
              <span style={{ flex: 1 }}>{p.name}</span>
              {p.isDefault && (
                <span style={{ fontSize: 9, color: "#888", background: "rgba(255,255,255,0.08)", padding: "1px 5px", borderRadius: 3 }}>
                  Default
                </span>
              )}
              {value === p.id && (
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4a90d9" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </button>
          ))}

          {/* Scan row */}
          <button
            onClick={handleScan}
            disabled={scanning}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "9px 12px",
              background: "transparent",
              border: "none",
              color: scanning ? "#888" : "#4a90d9",
              fontSize: 12,
              cursor: scanning ? "not-allowed" : "pointer",
              textAlign: "left",
            }}
          >
            {scanning ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                  style={{ animation: "ashray-spin 1s linear infinite" }}>
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Scanning for printers…
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {scanned ? "Scan again" : "Scan for printers"}
              </>
            )}
            {scanned && !scanning && printers.length === 1 && (
              <span style={{ fontSize: 9, color: "#888", marginLeft: "auto" }}>Add printer in macOS Settings</span>
            )}
          </button>

          {scanned && !scanning && printers.length === 1 && (
            <div style={{
              padding: "8px 12px 10px",
              color: "#aaa",
              fontSize: 10,
              lineHeight: 1.35,
              borderTop: "1px solid rgba(255,255,255,0.05)",
            }}>
              No installed printer was reported by the system. Add or reconnect it in Printers & Scanners, then scan again.
            </div>
          )}
        </div>
      )}

      {/* Spin keyframe – injected once */}
      <style>{`@keyframes ashray-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SETTINGS PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  settings: PrintSettings;
  onChange: (patch: Partial<PrintSettings>) => void;
  printers: DetectedPrinter[];
  scanning: boolean;
  onScan: () => void;
  scanned: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  onChange, 
  printers, 
  scanning, 
  onScan,
  scanned
}) => {
  const row = (label: string, children: React.ReactNode) => (
    <div style={styles.settingRow}>
      <span style={styles.settingLabel}>{label}</span>
      <div style={styles.settingControl}>{children}</div>
    </div>
  );

  const select = <K extends keyof PrintSettings>(
    key: K,
    options: Array<{ value: PrintSettings[K]; label: string }>
  ) => (
    <select
      style={styles.select}
      value={settings[key] as string}
      onChange={(e) => onChange({ [key]: e.target.value } as Partial<PrintSettings>)}
    >
      {options.map((o) => (
        <option key={String(o.value)} value={String(o.value)}>
          {o.label}
        </option>
      ))}
    </select>
  );

  const toggle = (key: keyof PrintSettings, label: string) => (
    <label style={styles.toggleLabel}>
      <input
        type="checkbox"
        checked={settings[key] as boolean}
        onChange={(e) => onChange({ [key]: e.target.checked } as Partial<PrintSettings>)}
        style={styles.checkbox}
      />
      {label}
    </label>
  );

  return (
    <div style={styles.settingsPanel}>
      <p style={styles.settingsTitle}>Print Settings</p>

      {/* ── Destination (printer selector) ── */}
      <div style={{ ...styles.settingRow, flexDirection: "column", alignItems: "flex-start", gap: 6 }}>
        <span style={styles.settingLabel}>Destination</span>
        <div style={{ width: "100%", paddingRight: 0 }}>
          <DestinationSelector
            value={settings.destination}
            onChange={(dest) => onChange({ destination: dest })}
            printers={printers}
            scanning={scanning}
            onScan={onScan}
            scanned={scanned}
          />
        </div>
      </div>

      {row(
        "Page size",
        select("pageSize", [
          { value: "A4", label: "A4" },
          { value: "A3", label: "A3" },
          { value: "Letter", label: "Letter" },
          { value: "Legal", label: "Legal" },
          { value: "Check", label: "Standard Check" },
        ])
      )}

      {row(
        "Orientation",
        select("orientation", [
          { value: "portrait", label: "Portrait" },
          { value: "landscape", label: "Landscape" },
        ])
      )}

      {row(
        "Margins",
        select("margins", [
          { value: "normal", label: "Normal" },
          { value: "narrow", label: "Narrow" },
          { value: "wide", label: "Wide" },
          { value: "custom", label: "Custom" },
        ])
      )}

      {settings.margins === "custom" && (
        <div style={{ padding: "0 10px 10px 10px", background: "rgba(0,0,0,0.2)", borderRadius: 6, marginTop: -8, marginBottom: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", paddingTop: 10 }}>
            <div>
              <span style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 4 }}>Top (mm)</span>
              <input
                type="number"
                value={settings.marginTop}
                onChange={(e) => onChange({ marginTop: parseInt(e.target.value) || 0 })}
                style={{ ...styles.select, width: "100%" }}
              />
            </div>
            <div>
              <span style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 4 }}>Bottom (mm)</span>
              <input
                type="number"
                value={settings.marginBottom}
                onChange={(e) => onChange({ marginBottom: parseInt(e.target.value) || 0 })}
                style={{ ...styles.select, width: "100%" }}
              />
            </div>
            <div>
              <span style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 4 }}>Left (mm)</span>
              <input
                type="number"
                value={settings.marginLeft}
                onChange={(e) => onChange({ marginLeft: parseInt(e.target.value) || 0 })}
                style={{ ...styles.select, width: "100%" }}
              />
            </div>
            <div>
              <span style={{ fontSize: 10, color: "#888", display: "block", marginBottom: 4 }}>Right (mm)</span>
              <input
                type="number"
                value={settings.marginRight}
                onChange={(e) => onChange({ marginRight: parseInt(e.target.value) || 0 })}
                style={{ ...styles.select, width: "100%" }}
              />
            </div>
          </div>
        </div>
      )}

      {row(
        "Color",
        select("colorMode", [
          { value: "color", label: "Color" },
          { value: "grayscale", label: "Grayscale" },
          { value: "blackwhite", label: "Black & White" },
        ])
      )}

      {row(
        "Scale",
        <div style={styles.scaleRow}>
          <input
            type="range"
            min={50}
            max={150}
            step={5}
            value={settings.scale}
            onChange={(e) => onChange({ scale: Number(e.target.value) })}
            style={styles.slider}
          />
          <span style={styles.scaleValue}>{settings.scale}%</span>
        </div>
      )}

      {row(
        "Copies",
        <input
          type="number"
          min={1}
          max={99}
          value={settings.copies}
          onChange={(e) => onChange({ copies: Math.max(1, parseInt(e.target.value) || 1) })}
          style={{ ...styles.select, width: 64 }}
        />
      )}

      {row(
        "Pages",
        select("pages", [
          { value: "all", label: "All" },
          { value: "custom", label: "Custom" },
        ])
      )}

      {settings.pages === "custom" && (
        <div style={{ padding: "0 20px 12px" }}>
          <input
            type="text"
            placeholder="e.g. 1-5, 8"
            value={settings.pageRange}
            onChange={(e) => onChange({ pageRange: e.target.value })}
            style={{ ...styles.select, width: "100%" }}
          />
          <span style={{ fontSize: 10, color: "#888", marginTop: 4, display: "block" }}>
            Separate with commas (1, 3, 5-8)
          </span>
        </div>
      )}

      <div style={styles.divider} />
      <p style={styles.settingsSectionTitle}>Options</p>

      {toggle("showPageNumbers", "Page numbers")}
      {toggle("showDate", "Print date/time")}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PAPER SHEET (the white printable area preview)
// ─────────────────────────────────────────────────────────────────────────────

interface PaperSheetProps {
  settings: PrintSettings;
  title?: string;
  subtitle?: string;
  companyName?: string;
  taxId?: string;
  period?: string;
  summaryCards?: PrintPreviewProps["summaryCards"];
  children: React.ReactNode;
  footerText?: string;
  footerValue?: string;
  footerValueColor?: string;
  generatedAt: Date;
}

const PaperSheet = React.forwardRef<HTMLDivElement, PaperSheetProps>(
  (
    {
      settings,
      title,
      subtitle,
      companyName,
      taxId,
      period,
      summaryCards,
      children,
      footerText,
      footerValue,
      footerValueColor = "#c0392b",
      generatedAt,
    },
    ref
  ) => {
    const size = PAGE_SIZES[settings.pageSize as PrintPageSize] || PAGE_SIZES["A4"];
    const isLandscape = settings.orientation === "landscape";
    const widthMm = isLandscape ? size.h : size.w;
    const heightMm = isLandscape ? size.w : size.h;
    
    // We want the preview to be roughly 560px wide on screen for A4 portrait
    // 210mm is ~794px at 96dpi. 560/794 = 0.705
    const previewScale = 560 / (210 * 3.78); 

    const colorFilter =
      settings.colorMode === "grayscale"
        ? "grayscale(100%)"
        : settings.colorMode === "blackwhite"
        ? "grayscale(100%) contrast(200%)"
        : "none";

    const marginPx = 0; // 5cm left visual match

    return (
      <div
        style={{
          width: `${widthMm}mm`,
          height: "auto",
          minHeight: `${heightMm}mm`,
          background: "transparent",
          display: "flex",
          flexDirection: "column",
          filter: colorFilter,
          transform: `scale(${previewScale * (settings.scale / 100)})`,
          transformOrigin: "top center",
          transition: "transform 0.2s",
          fontSize: 11,
          color: "#111",
          fontFamily: "'Georgia', serif",
          overflow: "visible",
        }}
        id="ashray-printable-area"
        ref={ref}
      >
                {/* ── SUMMARY CARDS ── */}
        {summaryCards && summaryCards.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: 0,
              padding: `8px ${marginPx}px`,
              borderBottom: "1px solid #e0e0e0",
            }}
          >
            {summaryCards.map((card, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  textAlign: "center",
                  borderRight:
                    i < summaryCards.length - 1
                      ? "1px solid #e0e0e0"
                      : "none",
                  padding: "0 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 8,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    color: "#888",
                    marginBottom: 2,
                  }}
                >
                  {card.label}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: card.valueColor ?? "#111",
                  }}
                >
                  {card.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── BODY CONTENT ── */}
        <div
          style={{
            flex: 1,
            padding: `0`, // Removed padding to allow children to control their own pages
            overflow: "visible",
            position: "relative",
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);
PaperSheet.displayName = "PaperSheet";

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

const PrintPreview: React.FC<PrintPreviewProps> = ({
  title,
  subtitle,
  companyName = "Ashray Group",
  taxId,
  period,
  summaryCards,
  children,
  footerText,
  footerValue,
  footerValueColor,
  onClose,
  defaultSettings,
  open = true,
  centerContent = false,
  configPanel,
}) => {
  const [settings, setSettings] = useState<PrintSettings>({
    ...DEFAULT_SETTINGS,
    ...defaultSettings,
  });
  const [generatedAt] = useState(new Date());
  const paperRef = useRef<HTMLDivElement>(null);

  // Printer matching logic
  const [printers, setPrinters] = useState<DetectedPrinter[]>([STATIC_PDF_PRINTER]);
  const [scanning, setScanning] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const performScan = useCallback(async (isInitial = false) => {
    setScanning(true);
    try {
      const [found] = await Promise.all([
        scanForPrinters(),
        // Keep scanning visible for at least 800ms for UX feel, or longer if initial
        new Promise<void>((r) => setTimeout(r, isInitial ? 400 : 1200)),
      ]);

      const list: DetectedPrinter[] = [STATIC_PDF_PRINTER, ...found];
      setPrinters(list);
      
      // If we found a default printer and current destination is still PDF, 
      // maybe we should switch? Or stay on PDF for safety. 
      // Let's stay on current but make printers available in list.
    } catch (err) {
      console.error("Scan error:", err);
    } finally {
      setScanning(false);
      setScanned(true);
    }
  }, []);

  // Initial scan on mount
  useEffect(() => {
    if (open) {
      performScan(true);
    }
  }, [open, performScan]);

  const patchSettings = useCallback((patch: Partial<PrintSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch }));
  }, []);

  useLayoutEffect(() => {
    if (open) {
      injectPrintStyles(settings, generatedAt, centerContent);
    }
    return () => {
      const el = document.getElementById(PRINT_STYLE_ID);
      if (el) el.remove();
    };
  }, [settings, open, generatedAt, centerContent]);

  useLayoutEffect(() => {
    if (!open || !paperRef.current) return;

    const updatePageCount = () => {
      const pages = paperRef.current?.querySelectorAll(".a4-page, .sheet").length || 1;
      setPageCount(Math.max(1, pages));
    };

    updatePageCount();
    const raf = window.requestAnimationFrame(updatePageCount);
    const observer = new MutationObserver(updatePageCount);
    observer.observe(paperRef.current, {
      childList: true,
      subtree: true,
    });

    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [open, children]);

  const handlePrint = async () => {
    injectPrintStyles(settings, generatedAt, centerContent);
    
    const marginMap: Record<PrintSettings["margins"], number> = {
      narrow: 1,
      normal: 2,
      wide: 3,
      custom: 2 
    };

    const options: any = {
      printBackground: true,
      landscape: settings.orientation === "landscape",
      pageSize: settings.pageSize,
      marginsType: 0, // 0 = default, respects @page margins
      scale: settings.scale / 100, // Pass scale to printToPDF
    };

    if (settings.pages === 'custom' && settings.pageRange) {
      options.pageRanges = settings.pageRange;
    }

    // ── CASE 1: ELECTRON + SAVE AS PDF ──
    if (typeof window !== "undefined" && settings.destination === "pdf" && window.api && window.api.savePDF) {
      console.log("Entering Electron savePDF case...");
      try {
        // Shorter delay before calling Electron API to ensure styles are ready
        await new Promise(r => setTimeout(r, 150));
        const result = await window.api.savePDF(options);
        if (result && result.success) {
          console.log("PDF Save successful:", result.filePath);
        } else if (result?.error !== "Save cancelled") {
          console.error("PDF Save failed:", result?.error);
          setTimeout(() => window.print(), 80);
        }
      } catch (err) {
        console.error("Electron savePDF error:", err);
        setTimeout(() => window.print(), 80);
      }
      return;
    }

    // ── CASE 2: ELECTRON + PHYSICAL PRINTER ──
    if (typeof window !== "undefined" && settings.destination !== "pdf" && window.api && window.api.print) {
      options.silent = false;
      options.deviceName = settings.destination;
      options.color = settings.colorMode === "color";
      options.copies = settings.copies;

      try {
        await new Promise(r => setTimeout(r, 150));
        const result = await window.api.print(options);
        if (result && result.success) {
          console.log("Print successful");
        } else {
          console.error("Print failed:", result?.error);
          setTimeout(() => window.print(), 80);
        }
      } catch (err) {
        console.error("Electron print error:", err);
        setTimeout(() => window.print(), 80);
      }
      return;
    }

    // ── CASE 3: BROWSER FALLBACK ──
    console.log("Falling through to browser print. window.api exists:", !!window.api, "savePDF exists:", !!window.api?.savePDF);
    setTimeout(() => window.print(), 80);
  };

  if (!open) return null;

  const pageCountLabel = `${pageCount} ${pageCount === 1 ? "page" : "pages"}`;

  const content = (
    <PrintContext.Provider value={{ settings, generatedAt }}>
      <div style={styles.overlay} className="print-reset-wrapper">
        <div style={styles.dialog} className="print-reset-wrapper">
          {/* ── LEFT: PAPER PREVIEW ── */}
          <div style={styles.previewPanel} className="print-reset-wrapper">
            <div style={styles.previewScroll} className="preview-scroll-container print-reset-wrapper">
              <PaperSheet
                ref={paperRef}
                settings={settings}
                title={title}
                subtitle={subtitle}
                companyName={companyName}
                taxId={taxId}
                period={period}
                summaryCards={summaryCards}
                footerText={footerText}
                footerValue={footerValue}
                footerValueColor={footerValueColor}
                generatedAt={generatedAt}
              >
                {children}
              </PaperSheet>
            </div>
          </div>

          {/* ── RIGHT: SETTINGS ── */}
          <div style={styles.rightPanel} className="no-print">
            <div style={styles.dialogHeader}>
              <div>
                <span style={styles.dialogTitle}>Print</span>
              </div>
              <span style={styles.pageCount}>{pageCountLabel}</span>
            </div>

            {configPanel && (
              <div style={{ background: '#1a1a1a', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                {configPanel}
              </div>
            )}

            <div style={styles.settingsScroll}>
              <SettingsPanel 
                settings={settings} 
                onChange={patchSettings} 
                printers={printers}
                scanning={scanning}
                onScan={() => performScan(false)}
                scanned={scanned}
              />
            </div>

            <div style={styles.dialogActions}>
              <button style={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              <button style={styles.saveBtn} onClick={handlePrint}>
                {settings.destination === 'pdf' ? 'Save' : 'Print'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PrintContext.Provider>
  );

  return typeof document !== 'undefined' ? createPortal(content, document.body) : content;
};

export default PrintPreview;

// ─────────────────────────────────────────────────────────────────────────────
// STYLES (inline – no CSS file dependency, works in any context)
// ─────────────────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.55)",
    backdropFilter: "blur(2px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
  },
  dialog: {
    display: "flex",
    width: "min(1100px, 96vw)",
    height: "min(780px, 94vh)",
    background: "#2b2b2b",
    borderRadius: 10,
    overflow: "hidden",
    boxShadow: "0 20px 60px rgba(0,0,0,0.5)",
  },
  previewPanel: {
    flex: 1,
    background: "#3a3a3a",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  previewScroll: {
    flex: 1,
    overflowY: "auto",
    overflowX: "auto",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "28px 20px",
  },
  rightPanel: {
    width: 280,
    minWidth: 260,
    background: "#2b2b2b",
    display: "flex",
    flexDirection: "column",
    borderLeft: "1px solid rgba(255,255,255,0.08)",
  },
  dialogHeader: {
    padding: "18px 20px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
  },
  dialogTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 600,
    fontFamily: "system-ui, sans-serif",
  },
  pageCount: {
    color: "#aaa",
    fontSize: 12,
    fontFamily: "system-ui, sans-serif",
  },
  settingsScroll: {
    flex: 1,
    overflowY: "auto",
  },
  settingsPanel: {
    padding: "8px 0",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  settingsTitle: {
    color: "#ccc",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    padding: "6px 20px 2px",
    margin: 0,
  },
  settingsSectionTitle: {
    color: "#ccc",
    fontSize: 11,
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    padding: "4px 20px 2px",
    margin: 0,
  },
  settingRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "7px 20px",
  },
  settingLabel: {
    color: "#ddd",
    fontSize: 13,
  },
  settingControl: {
    display: "flex",
    alignItems: "center",
  },
  select: {
    background: "#3d3d3d",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 6,
    color: "#fff",
    fontSize: 12,
    padding: "4px 8px",
    cursor: "pointer",
    outline: "none",
    minWidth: 120,
  },
  scaleRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  slider: {
    width: 90,
    accentColor: "#4a90d9",
    cursor: "pointer",
  },
  scaleValue: {
    color: "#ccc",
    fontSize: 12,
    width: 36,
    textAlign: "right",
  },
  toggleLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "5px 20px",
    cursor: "pointer",
    color: "#ddd",
    fontSize: 13,
  },
  checkbox: {
    accentColor: "#4a90d9",
    width: 14,
    height: 14,
    cursor: "pointer",
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.08)",
    margin: "8px 20px",
  },
  dialogActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    padding: "14px 20px",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  cancelBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#ccc",
    borderRadius: 20,
    padding: "7px 20px",
    fontSize: 13,
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
  },
  saveBtn: {
    background: "#4a90d9",
    border: "none",
    color: "#fff",
    borderRadius: 20,
    padding: "7px 22px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "system-ui, sans-serif",
  },
};
