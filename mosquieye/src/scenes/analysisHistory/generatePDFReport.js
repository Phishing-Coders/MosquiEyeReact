import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const generatePDFReport = async (displayedRows, users, logoImage) => {
  const userMap = users.reduce((acc, user) => {
    acc[user.clerkUserId] = `${user.firstName} ${user.lastName}`;
    return acc;
  }, {});

  try {
    // 1. Include 'id' and 'ovitrapId' for the table, exclude 'breteauIndex', 'moi', and 'riskLevel'
    const allVisibleColumns = [
      'expand',
      'ovitrapId',
      'imageUrl',
      'imageType',
      'totalEggs',
      'singleEggs',
      'clusterEggs',
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
    const tableHeaders = pdfColumns.map((field) => {
      // Hide header for 'expand' column
      if (field === 'expand') return '';
      
      // Capitalize first letter of each word
      return field
        .replace(/([A-Z])/g, ' $1')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    });

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

      // 2. In the detail part, define a custom sorting for fields, excluding BI, MOI, riskLevel
      // Set up a sorted list of fields we want, in desired order
      const sortedFields = [
        'Date',
        'Ovitrap ID',
        'Image Type',
        'Scan By',
        'Single Eggs',
        'Cluster Eggs',
        'Total Eggs',
        'Singles Total Area',
        'Singles Average Size',
        'Clusters Total Area',
        'Average Cluster Area',
        'Average Eggs Per Cluster',
        'Affected Area (Singles)',
        'Affected Area (Clusters)'
      ];

      // Build detailData based on that order
      const detailData = [];
      for (const label of sortedFields) {
        let value = '';
        let key = label.toLowerCase().replace(/\s|\(|\)/g, ''); // e.g. "Date" -> "date"

        // Adjust key to match row / analysisData if needed
        if (label === 'Date') {
          value = new Date(row.date).toLocaleDateString();
        } else if (label === 'Scan By') {
          const clerkId = row.analysisData?.scan_by;
          value = clerkId ? (userMap[clerkId] || clerkId) : row.scanBy;
        } else if (label === 'Ovitrap ID') {
          value = row.ovitrapId || 'N/A';
        } else if (label === 'Image Type') {
          value = row.imageType || '';
        } else {
          // Map possible analysisData fields
          const dataMap = {
            singleeggs: row.singleEggs?.toString() || row.analysisData?.singleEggs?.toString() || "0",
            clustereggs: row.clusterEggs?.toString() || row.analysisData?.clusterEggs?.toString() || "0",
            totaleggs: row.totalEggs?.toString() || row.analysisData?.totalEggs?.toString() || "0",
            singlestotalarea: `${row.singlesTotalArea?.toFixed(2) || 0} `,
            singlesaveragesize: `${row.singlesAvg?.toFixed(2) || 0} `,
            clusterscount: row.clusterEggs?.toString() || row.analysisData?.clustersCount?.toString() || "0",
            clusterstotalarea: `${row.clustersTotalArea?.toFixed(2) || 0} `,
            averageclusterarea: `${row.avgClusterArea?.toFixed(2) || 0} `,
            averageeggspercluster: row.avgEggsPerCluster?.toFixed(2) || "0",
            affectedareasingles: `${(row.singlesTotalArea / (row.singleEggs || 1)).toFixed(2)} px²`,
            affectedareaclusters: `${(row.clustersTotalArea / (row.clusterEggs || 1)).toFixed(2)} px²`
          };
          value = dataMap[key] || "0"; // Default to "0" instead of empty string
        }
        detailData.push([label, value]);
      }

      doc.autoTable({
        startY: 40,
        head: [['Field', 'Value']],
        body: detailData,
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