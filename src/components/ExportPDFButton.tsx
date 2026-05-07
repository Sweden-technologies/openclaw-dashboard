'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { UserOptions } from 'jspdf-autotable';

interface Employee {
  name: string;
  agentId: string;
  weeklyHours: number;
  estimatedHours: number;
  totalTokens: number;
  weeklyTokens: number;
  tokensIn: number;
  tokensOut: number;
  totalCost: number;
  weeklyCost: number;
  streak: number;
  rank: number;
  lastActive: string;
  sessionCount: number;
}

interface Props {
  employees: Employee[];
  viewMode: 'weekly' | 'total';
}

export default function ExportPDFButton({ employees, viewMode }: Props) {
  const [exporting, setExporting] = useState(false);

  const handleExport = () => {
    setExporting(true);
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });

      const pageW = doc.internal.pageSize.getWidth();
      const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Calcutta' });
      const isWeekly = viewMode === 'weekly';

      // ── Header gradient bar ──
      doc.setFillColor(30, 27, 75); // dark purple
      doc.rect(0, 0, pageW, 32, 'F');

      // Gradient overlay
      doc.setFillColor(88, 28, 135);
      doc.rect(0, 0, pageW * 0.6, 32, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Livio AI Dashboard', 12, 16);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(196, 181, 253);
      doc.text(`HR Analytics Report — ${isWeekly ? 'Weekly' : 'All Time'}`, 12, 24);

      // Timestamp
      doc.setFontSize(9);
      doc.setTextColor(168, 162, 200);
      doc.text(`Generated: ${now} IST`, pageW - 12, 24, { align: 'right' });

      // ── Summary Cards ──
      const totalEmp = employees.length;
      const totalHrs = isWeekly
        ? employees.reduce((a, e) => a + e.weeklyHours, 0)
        : employees.reduce((a, e) => a + e.estimatedHours, 0);
      const goalMet = employees.filter(e => e.weeklyHours >= 10).length;
      const totalCost = isWeekly
        ? employees.reduce((a, e) => a + e.weeklyCost, 0)
        : employees.reduce((a, e) => a + e.totalCost, 0);
      const savedVsChatGPT = (totalEmp * 30) - totalCost;

      const cardY = 37;
      const cardW = (pageW - 24 - 12) / 4;
      const cards = [
        { label: 'Employees', value: String(totalEmp), color: [59, 130, 246] },
        { label: isWeekly ? 'Weekly Hours' : 'Total Hours', value: totalHrs.toFixed(1), color: [34, 197, 94] },
        { label: 'Goal Met (10hr)', value: `${goalMet}/${totalEmp}`, color: [234, 179, 8] },
        { label: 'Cost', value: `$${totalCost.toFixed(2)}`, color: [251, 191, 36] },
      ];

      cards.forEach((card, i) => {
        const x = 12 + i * (cardW + 4);
        // Card background
        doc.setFillColor(30, 27, 75);
        doc.roundedRect(x, cardY, cardW, 18, 2, 2, 'F');
        // Color accent bar at top
        doc.setFillColor(card.color[0], card.color[1], card.color[2]);
        doc.rect(x, cardY, cardW, 1.5, 'F');
        // Value
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(255, 255, 255);
        doc.text(card.value, x + cardW / 2, cardY + 10, { align: 'center' });
        // Label
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(168, 162, 200);
        doc.text(card.label, x + cardW / 2, cardY + 15.5, { align: 'center' });
      });

      // ── Savings banner ──
      const bannerY = cardY + 22;
      doc.setFillColor(34, 197, 94, 0.15);
      doc.roundedRect(12, bannerY, pageW - 24, 10, 2, 2, 'F');
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(34, 197, 94);
      doc.text(`💰 Saved $${savedVsChatGPT.toFixed(2)} vs ChatGPT Team ($30/user/mo)`, pageW / 2, bannerY + 6.5, { align: 'center' });

      // ── Employee Table ──
      const sorted = isWeekly
        ? [...employees].sort((a, b) => b.weeklyHours - a.weeklyHours)
        : [...employees].sort((a, b) => b.estimatedHours - a.estimatedHours);

      const tableData = sorted.map((emp, idx) => {
        const hours = isWeekly ? emp.weeklyHours : emp.estimatedHours;
        const tokens = isWeekly ? emp.weeklyTokens : emp.totalTokens;
        const cost = isWeekly ? emp.weeklyCost : emp.totalCost;
        const badge = hours >= 20 ? '🚀 Pioneer' : hours >= 15 ? '⚡ Voltage' : hours >= 10 ? '🎯 Sniper' : hours >= 5 ? '💎 Diamond' : '🔥 Flame';
        const goal = hours >= 10 ? '✅' : '❌';

        return [
          String(idx + 1),
          emp.name,
          badge,
          hours.toFixed(1),
          `${((hours / 10) * 100).toFixed(0)}%`,
          goal,
          tokens > 1000000 ? `${(tokens / 1000000).toFixed(1)}M` : `${(tokens / 1000).toFixed(0)}k`,
          `$${cost.toFixed(2)}`,
          String(emp.sessionCount),
        ];
      });

      autoTable(doc, {
        startY: bannerY + 14,
        head: [['#', 'Employee', 'Badge', 'Hours', 'Progress', '10hr Goal', 'Tokens', 'Cost', 'Sessions']],
        body: tableData,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 3,
          textColor: [196, 181, 253],
          lineColor: [88, 28, 135],
          lineWidth: 0.2,
        },
        headStyles: {
          fillColor: [30, 27, 75],
          textColor: [196, 181, 253],
          fontStyle: 'bold',
          fontSize: 9,
        },
        alternateRowStyles: {
          fillColor: [20, 18, 50],
        },
        columnStyles: {
          0: { cellWidth: 10, halign: 'center' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          7: { textColor: [251, 191, 36] },
        },
        didDrawCell: (data: any) => {
          // Highlight power users (10+ hours) with left border
          if (data.section === 'body') {
            const hours = parseFloat(String(data.row.raw[3]));
            if (hours >= 10 && data.column.index === 0) {
              const { cell } = data;
              doc.setDrawColor(168, 85, 247);
              doc.setLineWidth(1);
              doc.line(cell.x, cell.y, cell.x, cell.y + cell.height);
            }
          }
        },
      } as any);

      // ── Footer ──
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFillColor(30, 27, 75);
      doc.rect(0, pageH - 10, pageW, 10, 'F');
      doc.setFontSize(7);
      doc.setTextColor(168, 162, 200);
      doc.text('Livio AI · OpenClaw Dashboard · Confidential', 12, pageH - 4);
      doc.text(`Page 1 of 1 · ${now}`, pageW - 12, pageH - 4, { align: 'right' });

      // Save
      const filename = `livio-hr-report-${isWeekly ? 'weekly' : 'alltime'}-${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(filename);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:bg-purple-800 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-xl transition-colors text-sm shadow-lg shadow-purple-500/20"
    >
      {exporting ? (
        <>
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Generating...
        </>
      ) : (
        <>📄 Export to PDF</>
      )}
    </button>
  );
}
