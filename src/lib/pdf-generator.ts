import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Session, RegionID, DataPoint } from "./store";

const REGION_NAMES: Record<RegionID, string> = {
  default: "Local Edge (CDN)",
  mumbai: "Mumbai (Asia Pacific)",
  washington: "Washington DC (North America)",
  stockholm: "Stockholm (Europe)"
};

function calculateRegionMetrics(data: DataPoint[]) {
  const total = data.length;
  const valid = data.filter(d => d.s);
  const bad = data.filter(d => !d.s || d.l > 300).length;
  const reliability = total > 0 ? ((total - bad) / total) * 100 : 100;
  const avgL = valid.length > 0 ? valid.reduce((a, b) => a + b.l, 0) / valid.length : 0;
  const avgJ = valid.length > 0 ? valid.reduce((a, b) => a + b.j, 0) / valid.length : 0;
  const maxL = valid.length > 0 ? Math.max(...valid.map(d => d.l)) : 0;
  const maxJ = valid.length > 0 ? Math.max(...valid.map(d => d.j)) : 0;
  const minL = valid.length > 0 ? Math.min(...valid.map(d => d.l)) : 0;
  
  return { total, valid: valid.length, bad, reliability, avgL, avgJ, maxL, maxJ, minL };
}

export function generateSessionPDF(session: Session) {
  const doc = new jsPDF();
  let currentY = 20;

  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Net-Sentinel: Multi-Region Network Audit", 14, currentY);
  currentY += 8;
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Session ID: ${session.id}`, 14, currentY);
  currentY += 6;
  doc.text(`Start: ${new Date(session.startTime).toLocaleString()}`, 14, currentY);
  currentY += 6;
  doc.text(`End: ${new Date(session.endTime).toLocaleString()}`, 14, currentY);
  currentY += 6;
  const duration = ((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 1000).toFixed(0);
  doc.text(`Duration: ${duration} seconds`, 14, currentY);
  currentY += 10;

  const regions: RegionID[] = ['default', 'mumbai', 'washington', 'stockholm'];
  
  regions.forEach((regionId, index) => {
    const regionData = session.regionData[regionId];
    const recentData = regionData.slice(-30);
    const metrics = calculateRegionMetrics(regionData);
    
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text(REGION_NAMES[regionId], 14, currentY);
    currentY += 8;

    autoTable(doc, {
      startY: currentY,
      head: [['Metric', 'Value']],
      body: [
        ['Total Samples', `${metrics.total}`],
        ['Valid Samples', `${metrics.valid}`],
        ['Avg Latency', `${Math.round(metrics.avgL)} ms`],
        ['Avg Jitter', `${Math.round(metrics.avgJ)} ms`],
        ['Min Latency', `${Math.round(metrics.minL)} ms`],
        ['Max Latency', `${Math.round(metrics.maxL)} ms`],
        ['Max Jitter', `${Math.round(metrics.maxJ)} ms`],
        ['Reliability', `${metrics.reliability.toFixed(1)}%`],
      ],
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { left: 14, right: 14 }
    });

    currentY = (doc as any).lastAutoTable.finalY + 10;

    if (recentData.length > 0) {
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text(`Recent Telemetry (Last ${recentData.length} samples)`, 14, currentY);
      currentY += 6;

      const logs = recentData.reverse();
      
      autoTable(doc, {
        startY: currentY,
        head: [['Time', 'Latency', 'Jitter', 'Status']],
        body: logs.map(p => [
          new Date(p.t).toLocaleTimeString(),
          p.s ? `${p.l} ms` : "-",
          p.s ? `${p.j} ms` : "-",
          !p.s ? "LOSS" : p.l > 200 ? "HIGH LAT" : "OK"
        ]),
        theme: 'striped',
        headStyles: { fillColor: [51, 65, 85] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 },
        didParseCell: function(data) {
          if (data.section === 'body') {
            const status = (data.row.raw as any)[3];
            if (status === "LOSS") {
              data.cell.styles.textColor = [220, 38, 38];
            } else if (status === "HIGH LAT") {
              data.cell.styles.textColor = [234, 179, 8];
            }
          }
        }
      });

      currentY = (doc as any).lastAutoTable.finalY + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text("No data available for this region", 14, currentY);
      currentY += 10;
    }

    if (index < regions.length - 1) {
      currentY += 5;
    }
  });

  doc.save(`net-sentinel-${session.id}.pdf`);
}