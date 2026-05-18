
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Search, Download, Printer, Trash2, Pencil,
  FileText, ArrowUpRight, ArrowDownLeft,
  X, CheckCircle, FileSpreadsheet, File
} from 'lucide-react';
import { gstDbService } from '../services/gstDb';
import { GSTEntry } from '../types';
import { Accounting } from '../services/accounting';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { subMonths, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns';

export const GSTBook: React.FC = () => {
  const [entries, setEntries] = useState<GSTEntry[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INWARD' | 'OUTWARD'>('ALL');
  
  const [formData, setFormData] = useState<Partial<GSTEntry & { isIgst: boolean }>>({
    date: new Date().toISOString().split('T')[0],
    type: 'OUTWARD',
    gstRate: 18,
    taxableValue: 0,
    cgst: 0,
    sgst: 0,
    igst: 0,
    totalAmount: 0,
    isIgst: false
  });

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    const data = await gstDbService.getEntries();
    setEntries(data);
  };

  const calculateTaxes = (taxable: number, rate: number, isIgst: boolean) => {
    const totalTax = (taxable * rate) / 100;
    if (isIgst) {
      return { cgst: 0, sgst: 0, igst: totalTax, totalAmount: taxable + totalTax };
    } else {
      const half = totalTax / 2;
      return { cgst: half, sgst: half, igst: 0, totalAmount: taxable + totalTax };
    }
  };

  const handleTaxableChange = (val: number) => {
    const taxes = calculateTaxes(val, formData.gstRate || 18, !!formData.isIgst);
    setFormData({ ...formData, taxableValue: val, ...taxes });
  };

  const handleRateChange = (rate: number) => {
    const taxes = calculateTaxes(formData.taxableValue || 0, rate, !!formData.isIgst);
    setFormData({ ...formData, gstRate: rate, ...taxes });
  };

  const toggleIgst = (useIgst: boolean) => {
    const taxes = calculateTaxes(formData.taxableValue || 0, formData.gstRate || 18, useIgst);
    setFormData({ ...formData, isIgst: useIgst, ...taxes });
  };

  const handleEdit = (entry: GSTEntry) => {
    setFormData({
      ...entry,
      isIgst: entry.igst > 0
    });
    setEditingId(entry.id);
    setIsEditing(true);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.gstin && formData.gstin.length !== 15 && formData.gstin.length > 0) {
      alert('GSTIN must be exactly 15 characters long.');
      return;
    }

    const entryData: GSTEntry = {
      id: isEditing && editingId ? editingId : Date.now().toString(),
      date: formData.date || '',
      billNumber: formData.billNumber || '',
      partyName: formData.partyName || '',
      gstin: formData.gstin || '',
      itemDescription: formData.itemDescription || '',
      taxableValue: formData.taxableValue || 0,
      gstRate: formData.gstRate || 0,
      cgst: formData.cgst || 0,
      sgst: formData.sgst || 0,
      igst: formData.igst || 0,
      totalAmount: formData.totalAmount || 0,
      type: formData.type as 'INWARD' | 'OUTWARD'
    };

    if (isEditing) {
      await gstDbService.updateEntry(entryData);
    } else {
      await gstDbService.addEntry(entryData);
    }

    setShowAddForm(false);
    setIsEditing(false);
    setEditingId(null);
    loadEntries();
    setFormData({
      date: new Date().toISOString().split('T')[0],
      type: 'OUTWARD',
      gstRate: 18,
      taxableValue: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      totalAmount: 0,
      isIgst: false
    });
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (deletingId) {
      await gstDbService.deleteEntry(deletingId);
      loadEntries();
      setShowDeleteConfirm(false);
      setDeletingId(null);
    }
  };

  const filteredEntries = useMemo(() => {
    return entries.filter(e => {
      const matchesSearch = 
        (e.partyName || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (e.billNumber || '').toLowerCase().includes((searchQuery || '').toLowerCase()) ||
        (e.gstin || '').toLowerCase().includes((searchQuery || '').toLowerCase());
      const matchesType = filterType === 'ALL' || e.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [entries, searchQuery, filterType]);

  const stats = useMemo(() => {
    const outward = entries.filter(e => e.type === 'OUTWARD');
    const inward = entries.filter(e => e.type === 'INWARD');
    
    return {
      totalOutwardTax: outward.reduce((acc, e) => acc + e.cgst + e.sgst + e.igst, 0),
      totalInwardTax: inward.reduce((acc, e) => acc + e.cgst + e.sgst + e.igst, 0),
      totalTaxableOut: outward.reduce((acc, e) => acc + e.taxableValue, 0),
      totalTaxableIn: inward.reduce((acc, e) => acc + e.taxableValue, 0)
    };
  }, [entries]);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportType, setExportType] = useState<'PRINT' | 'PDF' | 'EXCEL' | null>(null);
  const [durationOption, setDurationOption] = useState<'3M' | '6M' | '12M' | 'CUSTOM'>('3M');
  const [customRange, setCustomRange] = useState({
    start: new Date().toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const getFilteredDataForExport = () => {
    let startDate: Date;
    let endDate: Date = endOfDay(new Date());

    if (durationOption === 'CUSTOM') {
      startDate = startOfDay(parseISO(customRange.start));
      endDate = endOfDay(parseISO(customRange.end));
    } else {
      const months = durationOption === '3M' ? 3 : durationOption === '6M' ? 6 : 12;
      startDate = startOfDay(subMonths(new Date(), months));
    }

    return filteredEntries.filter(e => {
      const entryDate = parseISO(e.date);
      return isWithinInterval(entryDate, { start: startDate, end: endDate });
    });
  };

  const handlePrint = (data: GSTEntry[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      window.print();
      return;
    }

    const exportStats = {
      totalOutwardTax: data.filter(e => e.type === 'OUTWARD').reduce((acc, e) => acc + e.cgst + e.sgst + e.igst, 0),
      totalInwardTax: data.filter(e => e.type === 'INWARD').reduce((acc, e) => acc + e.cgst + e.sgst + e.igst, 0),
    };

    const tableRows = data.map(e => `
      <tr>
        <td>${e.date}</td>
        <td>${e.billNumber}</td>
        <td>${e.type === 'OUTWARD' ? 'Sales' : 'Purchase'}</td>
        <td>${e.partyName}</td>
        <td>${e.gstin}</td>
        <td class="text-right">₹${Accounting.formatIndian(e.taxableValue)}</td>
        <td class="text-right">${e.gstRate}%</td>
        <td class="text-right">₹${Accounting.formatIndian(e.cgst + e.sgst + e.igst)}</td>
        <td class="text-right">₹${Accounting.formatIndian(e.totalAmount)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>GST Book Report - Ashray Group</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; }
            .header { border-bottom: 3px solid #7f1d1d; padding-bottom: 15px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
            .header h1 { color: #7f1d1d; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
            .header p { color: #64748b; margin: 5px 0 0 0; font-size: 14px; font-weight: 500; }
            .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 30px; }
            .summary-card { border: 1px solid #e2e8f0; padding: 20px; border-radius: 12px; background: #f8fafc; }
            .summary-card p { margin: 0; font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
            .summary-card h3 { margin: 5px 0 0 0; font-size: 20px; font-weight: 700; color: #1e293b; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f1f5f9; color: #475569; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; padding: 12px 15px; text-align: left; border-bottom: 2px solid #e2e8f0; }
            td { padding: 12px 15px; font-size: 12px; border-bottom: 1px solid #f1f5f9; color: #334155; }
            .text-right { text-align: right; }
            @page { size: landscape; margin: 1cm; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>ASHRAY GROUP</h1>
              <p>GST BOOK - OFFICIAL TRANSACTION REPORT</p>
            </div>
            <div style="text-align: right">
              <p>Date: ${new Date().toLocaleDateString()}</p>
              <p>Duration: ${durationOption === 'CUSTOM' ? `${customRange.start} to ${customRange.end}` : durationOption}</p>
            </div>
          </div>
          <div class="summary-grid">
            <div class="summary-card">
              <p>Total Output GST (Sales)</p>
              <h3>₹${Accounting.formatIndian(exportStats.totalOutwardTax)}</h3>
            </div>
            <div class="summary-card">
              <p>Total Input GST (Purchase)</p>
              <h3>₹${Accounting.formatIndian(exportStats.totalInwardTax)}</h3>
            </div>
            <div class="summary-card" style="background: #eef2ff; border-color: #c7d2fe;">
              <p style="color: #4f46e5;">Net GST Payable / Credit</p>
              <h3 style="color: #4338ca;">₹${Accounting.formatIndian(Math.abs(exportStats.totalOutwardTax - exportStats.totalInwardTax))}</h3>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Bill #</th>
                <th>Type</th>
                <th>Party Name</th>
                <th>GSTIN</th>
                <th class="text-right">Bill Amt</th>
                <th class="text-right">GST %</th>
                <th class="text-right">Tax Amt</th>
                <th class="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
            </tbody>
          </table>
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleExportExcel = (data: GSTEntry[]) => {
    if (data.length === 0) return;

    const worksheet = XLSX.utils.json_to_sheet(data.map(e => ({
      Date: e.date,
      'Bill Number': e.billNumber,
      Type: e.type,
      'Party Name': e.partyName,
      GSTIN: e.gstin,
      Description: e.itemDescription,
      'Bill Amount': e.taxableValue,
      'GST Rate': e.gstRate,
      CGST: e.cgst,
      SGST: e.sgst,
      IGST: e.igst,
      'Total Amount': e.totalAmount
    })));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "GST Entries");
    XLSX.writeFile(workbook, `Ashray_GST_Book_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleExportPDF = (data: GSTEntry[]) => {
    if (data.length === 0) return;

    const doc = new jsPDF('landscape');
    
    // Header Banner
    doc.setFillColor(127, 29, 29); // Spiritual Maroon
    doc.rect(0, 0, 297, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('ASHRAY GROUP', 14, 20);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text('GST BOOK - OFFICIAL TRANSACTION REPORT', 14, 30);
    
    doc.setTextColor(255, 255, 255);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 283, 30, { align: 'right' });

    // Summary Section
    const exportStats = {
      totalOutwardTax: data.filter(e => e.type === 'OUTWARD').reduce((acc, e) => acc + e.cgst + e.sgst + e.igst, 0),
      totalInwardTax: data.filter(e => e.type === 'INWARD').reduce((acc, e) => acc + e.cgst + e.sgst + e.igst, 0),
    };

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('SUMMARY', 14, 55);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 58, 283, 58);

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Sales GST: Rs. ${Accounting.formatIndian(exportStats.totalOutwardTax)}`, 14, 68);
    doc.text(`Total Purchase GST: Rs. ${Accounting.formatIndian(exportStats.totalInwardTax)}`, 100, 68);
    
    doc.setFont(undefined, 'bold');
    const netLabel = exportStats.totalOutwardTax >= exportStats.totalInwardTax ? 'Net Payable' : 'Input Credit (ITC)';
    doc.text(`${netLabel}: Rs. ${Accounting.formatIndian(Math.abs(exportStats.totalOutwardTax - exportStats.totalInwardTax))}`, 200, 68);

    const tableColumn = ["Date", "Bill #", "Type", "Party Name", "GSTIN", "Bill Amt", "GST %", "Tax Amt", "Total"];
    const tableRows = data.map(e => [
      e.date,
      e.billNumber,
      e.type === 'OUTWARD' ? 'Sales' : 'Purchase',
      e.partyName,
      e.gstin,
      Accounting.formatIndian(e.taxableValue),
      `${e.gstRate}%`,
      Accounting.formatIndian(e.cgst + e.sgst + e.igst),
      Accounting.formatIndian(e.totalAmount)
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 75,
      theme: 'grid',
      headStyles: { fillColor: [127, 29, 29], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: {
        5: { halign: 'right' },
        7: { halign: 'right' },
        8: { halign: 'right' }
      }
    });

    doc.save(`Ashray_GST_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const executeExport = () => {
    const data = getFilteredDataForExport();
    if (data.length === 0) {
      alert('No entries found for the selected duration.');
      return;
    }

    if (exportType === 'PRINT') handlePrint(data);
    else if (exportType === 'PDF') handleExportPDF(data);
    else if (exportType === 'EXCEL') handleExportExcel(data);

    setShowExportModal(false);
  };

  const openExportModal = (type: 'PRINT' | 'PDF' | 'EXCEL') => {
    setExportType(type);
    setShowExportModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center">
          </h1>
        </div>
        
        <div className="flex items-center space-x-3 no-print">
          <button 
            onClick={() => {
              setIsEditing(false);
              setEditingId(null);
              setFormData({
                date: new Date().toISOString().split('T')[0],
                type: 'OUTWARD',
                gstRate: 18,
                taxableValue: 0,
                cgst: 0,
                sgst: 0,
                igst: 0,
                totalAmount: 0,
                isIgst: false
              });
              setShowAddForm(true);
            }}
            className="flex items-center bg-orange-600 text-white px-5 py-2.5 rounded-xl hover:bg-orange-700 font-bold shadow-lg shadow-orange-100 transition-all transform hover:-translate-y-0.5 active:scale-95"
          >
            <Plus size={20} className="mr-2" /> New GST Entry
          </button>
          
          <div className="flex items-center bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <button 
              onClick={() => openExportModal('PRINT')}
              title="Print Report"
              className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 border-r border-slate-100 transition-colors group"
            >
              <Printer size={18} className="mr-2 text-slate-400 group-hover:text-orange-600" />
              <span className="text-xs font-bold">Print</span>
            </button>
            <button 
              onClick={() => openExportModal('PDF')}
              title="Export PDF"
              className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 border-r border-slate-100 transition-colors group"
            >
              <File size={18} className="mr-2 text-slate-400 group-hover:text-red-600" />
              <span className="text-xs font-bold">PDF</span>
            </button>
            <button 
              onClick={() => openExportModal('EXCEL')}
              title="Export Excel (.xlsx)"
              className="flex items-center px-4 py-2.5 text-slate-700 hover:bg-slate-50 transition-colors group"
            >
              <FileSpreadsheet size={18} className="mr-2 text-slate-400 group-hover:text-emerald-600" />
              <span className="text-xs font-bold">Excel</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div id="gst-stats-summary" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Output GST (Sales)</p>
          <h3 className="text-2xl font-bold text-orange-600 font-mono">₹{Accounting.formatIndian(stats.totalOutwardTax)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 italic">On bill amount of ₹{Accounting.formatIndian(stats.totalTaxableOut)}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Input GST (Purchase)</p>
          <h3 className="text-2xl font-bold text-emerald-600 font-mono">₹{Accounting.formatIndian(stats.totalInwardTax)}</h3>
          <p className="text-[10px] text-slate-400 mt-1 italic">On bill amount of ₹{Accounting.formatIndian(stats.totalTaxableIn)}</p>
        </div>
        <div className="bg-orange-600 p-5 rounded-2xl shadow-lg shadow-orange-100 text-white">
          <p className="text-[10px] font-bold text-orange-100 uppercase tracking-widest mb-1">Net GST Payable / Credit</p>
          <h3 className="text-2xl font-bold font-mono">₹{Accounting.formatIndian(Math.abs(stats.totalOutwardTax - stats.totalInwardTax))}</h3>
          <p className="text-[10px] text-orange-100 mt-1 italic">
            {stats.totalOutwardTax >= stats.totalInwardTax ? 'Payable to Govt' : 'Input Tax Credit (ITC)'}
          </p>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search by party, bill or GSTIN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all"
            />
          </div>
          
          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
            {['ALL', 'OUTWARD', 'INWARD'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t as any)}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  filterType === t 
                    ? 'bg-white text-orange-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'ALL' ? 'All' : t === 'OUTWARD' ? 'Sales' : 'Purchase'}
              </button>
            ))}
          </div>
        </div>

        <div id="gst-main-table" className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date / Bill</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Party Details</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Description</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Bill Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">GST (%)</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">Total Amount</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800">{e.date}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono">#{e.billNumber}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-bold text-slate-800 flex items-center">
                      {e.type === 'OUTWARD' ? <ArrowUpRight size={12} className="text-orange-500 mr-1" /> : <ArrowDownLeft size={12} className="text-emerald-500 mr-1" />}
                      {e.partyName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 font-mono uppercase tracking-tighter">{e.gstin || 'No GSTIN'}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-slate-600">{e.itemDescription}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-slate-700 font-mono">
                    ₹{Accounting.formatIndian(e.taxableValue)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="text-sm font-bold text-orange-600 font-mono">₹{Accounting.formatIndian(e.cgst + e.sgst + e.igst)}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{e.gstRate}% GST</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-right text-slate-900 font-mono">
                    ₹{Accounting.formatIndian(e.totalAmount)}
                  </td>
                  <td className="px-6 py-4 text-right no-print">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(e)}
                        className="p-1.5 text-slate-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                        title="Edit Entry"
                      >
                        <Pencil size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(e.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all md:opacity-0 group-hover:opacity-100"
                        title="Delete Entry"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <FileText size={48} className="mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium">No GST entries found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Delete Entry?</h3>
              <p className="text-slate-500 text-sm mb-6">This action cannot be undone. Are you sure you want to delete this GST entry?</p>
              
              <div className="flex space-x-3">
                <button 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                <Download className="mr-2 text-orange-600" size={20} /> 
                Export {exportType === 'PRINT' ? 'Report' : exportType}
              </h3>
              <button onClick={() => setShowExportModal(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Select Duration</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: '3M', label: 'Last 3 Months' },
                    { id: '6M', label: 'Last 6 Months' },
                    { id: '12M', label: 'Last 12 Months' },
                    { id: 'CUSTOM', label: 'Custom Range' }
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => setDurationOption(opt.id as any)}
                      className={`px-4 py-3 rounded-xl text-xs font-bold border transition-all ${
                        durationOption === opt.id 
                          ? 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-100' 
                          : 'bg-white border-slate-200 text-slate-600 hover:border-orange-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {durationOption === 'CUSTOM' && (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-200">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date" 
                      value={customRange.start}
                      onChange={e => setCustomRange({...customRange, start: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">End Date</label>
                    <input 
                      type="date" 
                      value={customRange.end}
                      onChange={e => setCustomRange({...customRange, end: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button 
                  onClick={executeExport}
                  className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center"
                >
                  {exportType === 'PRINT' ? <Printer size={18} className="mr-2" /> : <Download size={18} className="mr-2" />}
                  Confirm & {exportType === 'PRINT' ? 'Print' : 'Download'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Form Modal */}
      {showAddForm && (
        <div className="fixed -inset-6 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-orange-50/30">
              <h3 className="text-xl font-bold text-slate-800 flex items-center">
                {isEditing ? <Pencil className="mr-2 text-orange-600" size={20} /> : <Plus className="mr-2 text-orange-600" size={20} />}
                {isEditing ? 'Edit GST Entry' : 'New GST Entry'}
              </h3>
              <button onClick={() => setShowAddForm(false)} className="p-2 hover:bg-white rounded-full text-slate-400 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Transaction Type</label>
                  <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'OUTWARD'})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === 'OUTWARD' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Sales (Outward)
                    </button>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, type: 'INWARD'})}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${formData.type === 'INWARD' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                    >
                      Purchase (Inward)
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date</label>
                  <input 
                    type="date" 
                    required
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Party Name</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. ABC Construction"
                    value={formData.partyName}
                    onChange={e => setFormData({...formData, partyName: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GSTIN</label>
                    {formData.gstin && (
                      <span className={`text-[9px] font-bold ${(formData.gstin || '').length === 15 ? 'text-emerald-500' : 'text-red-500'}`}>
                        {(formData.gstin || '').length}/15
                      </span>
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="27XXXXX..."
                    maxLength={15}
                    value={formData.gstin}
                    onChange={e => setFormData({...formData, gstin: e.target.value.toUpperCase()})}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all uppercase ${
                      formData.gstin && formData.gstin.length !== 15 
                        ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500' 
                        : 'border-slate-200 focus:ring-orange-500/20 focus:border-orange-500'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill / Invoice Number</label>
                  <input 
                    type="text" 
                    required
                    placeholder="INV/2024/001"
                    value={formData.billNumber}
                    onChange={e => setFormData({...formData, billNumber: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Item Description</label>
                  <input 
                    type="text" 
                    required
                    placeholder="e.g. Cement, Consultation"
                    value={formData.itemDescription}
                    onChange={e => setFormData({...formData, itemDescription: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Bill Amount</label>
                    <input 
                      type="number" 
                      required
                      value={formData.taxableValue}
                      onChange={e => handleTaxableChange(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">GST Rate (%)</label>
                    <select 
                      value={formData.gstRate}
                      onChange={e => handleRateChange(Number(e.target.value))}
                      className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tax Type</label>
                    <div className="flex bg-white p-1 rounded-xl border border-slate-200">
                      <button 
                        type="button"
                        onClick={() => toggleIgst(false)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${!formData.isIgst ? 'bg-orange-600 text-white' : 'text-slate-500'}`}
                      >
                        CGST+SGST
                      </button>
                      <button 
                        type="button"
                        onClick={() => toggleIgst(true)}
                        className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all ${formData.isIgst ? 'bg-orange-600 text-white' : 'text-slate-500'}`}
                      >
                        IGST
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slate-200">
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">CGST</p>
                    <p className="text-sm font-bold text-slate-700">₹{Accounting.formatIndian(formData.cgst || 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">SGST</p>
                    <p className="text-sm font-bold text-slate-700">₹{Accounting.formatIndian(formData.sgst || 0)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">IGST</p>
                    <p className="text-sm font-bold text-slate-700">₹{Accounting.formatIndian(formData.igst || 0)}</p>
                  </div>
                  <div className="text-center bg-orange-100 rounded-lg py-1">
                    <p className="text-[9px] font-bold text-orange-600 uppercase">Total</p>
                    <p className="text-sm font-bold text-orange-700">₹{Accounting.formatIndian(formData.totalAmount || 0)}</p>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-orange-100 hover:bg-orange-700 transition-all flex items-center justify-center"
              >
                <CheckCircle size={20} className="mr-2" /> {isEditing ? 'Update GST Entry' : 'Save GST Entry'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};