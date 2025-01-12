import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const generatePDFReport = async (displayedRows, users, logoImage) => {
  const userMap = users.reduce((acc, user) => {
    acc[user.clerkUserId] = `${user.firstName} ${user.lastName}`;
    return acc;
  }, {});

  try {
    // 2. Filter out columns you don’t need (e.g. 'image')
    const allVisibleColumns = [
      'expand',
      'imageUrl',
      'imageType',
      'totalEggs',
      'singleEggs',
      'clusterEggs',
      'breteauIndex',
      'moi',
      'riskLevel',
      'date',
      'scanBy',
      'singlesTotalArea',
      'singlesAvg',
      'clustersTotalArea',
      'avgClusterArea',
      'avgEggsPerCluster',
      'affectedAreaSingles',
      'affectedAreaClusters'
    ];
    const pdfColumns = allVisibleColumns.filter((field) => field !== 'imageUrl'); // Exclude imageUrl
    const tableHeaders = pdfColumns.map((field) => field.replace(/([A-Z])/g, ' $1').trim());
    const tableFields = pdfColumns;

    const doc = new jsPDF({ orientation: 'landscape' });

    // Load and add logo to title
    const logo = new Image();
    logo.src = logoImage;
    await new Promise((resolve) => {
      logo.onload = resolve;
    });

    // Add logo next to title
    doc.addImage(logo, 'PNG', 14, 10, 20, 20);
    doc.setFontSize(16);
    doc.text('Analysis History Report', 40, 20);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 40, 30);

    // Add watermark with opacity
    const watermarkWidth = 40;
    const watermarkHeight = 40;
    doc.setGState(new doc.GState({ opacity: 0.1 }));
    doc.addImage(
      logo,
      'PNG',
      doc.internal.pageSize.width - watermarkWidth - 10,
      doc.internal.pageSize.height - watermarkHeight - 10,
      watermarkWidth,
      watermarkHeight
    );
    doc.setGState(new doc.GState({ opacity: 1 }));

    // Build table data using only visible columns
    const mainTableData = displayedRows.map((row, index) => {
      return tableFields.map((field, colIndex) => {
        // Example: if first column is index, we might show (index + 1)
        if (colIndex === 0 && field === 'expand') {
          return String(index + 1);
        }
        if (field === 'imageUrl') {
          return ''; // Exclude imageUrl from CSV export
        }
        return String(row[field] ?? '');
      });
    });

    doc.autoTable({
      startY: 40,
      head: [tableHeaders],
      body: mainTableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] }
    });

    // Additional pages for each analysis
    for (let i = 0; i < displayedRows.length; i++) {
      const row = displayedRows[i];
      const analysisId = row.id || 'N/A';

      // Image page (portrait)
      doc.addPage('portrait');
      // Add watermark to new page with opacity
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.addImage(
        logo,
        'PNG',
        doc.internal.pageSize.width - watermarkWidth - 10,
        doc.internal.pageSize.height - watermarkHeight - 10,
        watermarkWidth,
        watermarkHeight
      );
      doc.setGState(new doc.GState({ opacity: 1 }));

      doc.setFontSize(14);
      doc.text(`No. ${i + 1}`, 14, 20);
      doc.text(`Analysis ID: ${analysisId}`, 14, 30);

      try {
        const response = await axios.get(`${window.location.origin}/api/images/${analysisId}`, { responseType: 'arraybuffer' });
        const base64Image = Buffer.from(response.data, 'binary').toString('base64');
        
        // Calculate dimensions to fit page
        const pageWidth = doc.internal.pageSize.width;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const maxWidth = pageWidth - (2 * margin);
        const maxHeight = pageHeight - 60; // Account for header text
        
        // Create temporary image to get dimensions
        const img = new Image();
        img.src = `data:image/jpeg;base64,${base64Image}`;
        await new Promise((resolve) => {
          img.onload = resolve;
        });
        
        // Calculate scaled dimensions
        let imgWidth = maxWidth;
        let imgHeight = (img.height * maxWidth) / img.width;
        
        if (imgHeight > maxHeight) {
          imgHeight = maxHeight;
          imgWidth = (img.width * maxHeight) / img.height;
        }
        
        // Center the image horizontally
        const xOffset = (pageWidth - imgWidth) / 2;
        
        doc.addImage(
          `data:image/jpeg;base64,${base64Image}`,
          'JPEG',
          xOffset,
          40,
          imgWidth,
          imgHeight
        );
      } catch (error) {
        doc.text('Image not available.', 14, 40);
      }

      // Data table page (portrait)
      doc.addPage('portrait');
      // Add watermark to new page with opacity
      doc.setGState(new doc.GState({ opacity: 0.1 }));
      doc.addImage(
        logo,
        'PNG',
        doc.internal.pageSize.width - watermarkWidth - 10,
        doc.internal.pageSize.height - watermarkHeight - 10,
        watermarkWidth,
        watermarkHeight
      );
      doc.setGState(new doc.GState({ opacity: 1 }));

      doc.setFontSize(14);
      doc.text(`No. ${i + 1}`, 14, 20);
      doc.text(`Analysis ID: ${analysisId}`, 14, 30);

      // Use row.analysisData instead of analysis.analysisData
      const fields = Object.entries(row.analysisData || {});
      const extraData = fields.map(([key, value]) => [key, String(value)]);

      doc.autoTable({
        startY: 40,
        head: [['Field', 'Value']],
        body: extraData,
        theme: 'striped',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [39, 174, 96] }
      });
    }

    doc.save('analysis-history-report.pdf');
  } catch (error) {
    console.error('Error generating report:', error);
    // You might want to show an error message to the user here
  }
};

export default generatePDFReport;