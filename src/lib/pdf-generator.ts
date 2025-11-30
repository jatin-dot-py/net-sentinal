import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type Session } from "../lib/store";

export function generateSessionPDF(session: Session) {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Net-Sentinel: Network Stability Audit", 14, 22);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Session ID: ${session.id}`, 14, 30);
  doc.text(`Date: ${new Date(session.startTime).toLocaleString()}`, 14, 36);

  const total = session.data.length;
  const bad = session.data.filter(d => !d.success || d.latency > 300).length;
  const reliability = total > 0 ? ((total - bad) / total) * 100 : 100;

  autoTable(doc, {
    startY: 45,
    head: [['Metric', 'Value']],
    body: [
      ['Duration', `${((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000 / 60).toFixed(2)} Minutes`],
      ['Avg Latency', `${session.avgLatency} ms`],
      ['Avg Jitter', `${session.avgJitter} ms`],
      ['Reliability Score', `${reliability.toFixed(1)}%`],
      ['Total Samples', `${total}`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [22, 163, 74] }, 
    styles: { fontSize: 10 },
    tableWidth: 'wrap'
  });

  const slicedData = session.data.slice(-100).reverse(); 

  doc.text(`Telemetry Logs (Last ${slicedData.length} Heartbeats)`, 14, (doc as any).lastAutoTable.finalY + 15);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Time', 'Latency', 'Jitter', 'Status']],
    body: slicedData.map(point => [
      new Date(point.timestamp).toLocaleTimeString(),
      point.success ? `${point.latency} ms` : "---",
      point.success ? `${point.jitter} ms` : "---",
      !point.success ? "PACKET LOSS" : point.latency > 200 ? "HIGH LATENCY" : "STABLE"
    ]),
    theme: 'striped',
    headStyles: { fillColor: [51, 65, 85] },
    styles: { fontSize: 9 },
    didParseCell: function(data) {
      if (data.section === 'body' && (data.row.raw as any)[3] !== "STABLE") {
        data.cell.styles.textColor = [220, 38, 38]; 
      }
    }
  });

  doc.save(`net-sentinel-report-${session.id.slice(0, 8)}.pdf`);
}