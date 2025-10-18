import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import logoImage from '@/assets/hempvest-logo.png';

interface BatchData {
  batch_number: string;
  strain_id?: string;
  dome_no?: string;
  mother_no?: string;
  clone_germination_date?: string;
  total_clones_plants?: number;
  clonator_1?: string;
  rack_no?: string;
  clonator_mortalities?: number;
  expected_rooting_date?: string;
  actual_rooting_date?: string;
  move_to_hardening_date?: string;
  clonator_2_number_clones?: number;
  hardening_area_placed?: string;
  clonator_2?: string;
  clonator_2_rack_no?: string;
  clonator_2_no_of_days?: number;
  hardening_mortalities?: any;
  hardening_number_clones?: number;
  hardening_grower_sign?: string;
  hardening_manager_sign?: string;
  hardening_qa_sign?: string;
  move_to_veg_date?: string;
  veg_number_plants?: number;
  veg_table_no?: string;
  veg_mortalities?: any;
  veg_diseases?: boolean;
  veg_pests?: boolean;
  veg_expected_days?: number;
  veg_actual_days?: number;
  move_to_flowering_date?: string;
  flowering_number_plants?: number;
  flowering_table_no?: string;
  flowering_grower_sign?: string;
  flowering_manager_sign?: string;
  flowering_qa_sign?: string;
  nutrients_used?: string;
  using_extra_lights?: boolean;
  extra_lights_from_day?: number;
  extra_lights_no_of_days?: number;
  increase_in_yield?: string;
  eight_nodes?: boolean;
  expected_flowering_date?: string;
  actual_flowering_date?: string;
  estimated_days?: number;
  actual_days?: number;
  flowering_mortalities?: any;
  flowering_diseases?: boolean;
  flowering_pests?: boolean;
  harvest_date?: string;
  harvest_number_plants?: number;
  harvest_table_no?: string;
  harvest_grower_sign?: string;
  harvest_manager_sign?: string;
  harvest_qa_sign?: string;
  drying_date?: string;
  drying_total_plants?: number;
  drying_rack_no?: string;
  no_of_days_drying?: number;
  total_wet_weight?: number;
  total_plants_processed?: number;
  processor_sign?: string;
  processing_manager_sign?: string;
  processing_qa_sign?: string;
  dry_weight_date?: string;
  total_dry_weight?: number;
  dry_weight_no_plants?: number;
  packing_date?: string;
  packing_a_grade?: number;
  packing_b_grade?: number;
  packing_c_grade?: number;
  packing_bag_ids?: string;
  packing_storage_area?: string;
  final_manager_sign?: string;
  final_qa_sign?: string;
  status?: string;
  current_stage?: string;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'dd/MM/yyyy');
  } catch {
    return 'N/A';
  }
};

const formatMortality = (mortalityData: any) => {
  if (!mortalityData) return 'N/A';
  if (Array.isArray(mortalityData)) {
    return mortalityData.map((m: any) => 
      `${m.quantity || 0} (${m.reason || 'N/A'})`
    ).join(', ') || 'N/A';
  }
  return 'N/A';
};

export const generateBatchRecordPDF = async (batch: BatchData, getUserName: (id: string) => string, getDisplayValue: (id: string) => string) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let currentY = 15;

  // Helper to add new page if needed
  const checkAddPage = (requiredHeight: number) => {
    if (currentY + requiredHeight > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
      addHeader();
    }
  };

  // Header with logo
  const addHeader = () => {
    try {
      const img = new Image();
      img.src = logoImage;
      doc.addImage(img, 'PNG', 15, currentY, 30, 12);
    } catch (error) {
      console.error('Error loading logo:', error);
    }

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('BATCH RECORD', pageWidth / 2, currentY + 5, { align: 'center' });
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('SOF No: HVCSOF009', pageWidth - 15, currentY + 3, { align: 'right' });
    doc.text(`Date: ${format(new Date(), 'dd/MM/yyyy')}`, pageWidth - 15, currentY + 8, { align: 'right' });
    
    currentY += 20;
  };

  addHeader();

  // Section: Batch Information
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('BATCH INFORMATION', 15, currentY);
  currentY += 7;

  const batchInfoData = [
    ['Batch Number', batch.batch_number || 'N/A'],
    ['Strain ID', getDisplayValue(batch.strain_id || '')],
    ['Dome No', getDisplayValue(batch.dome_no || '')],
    ['Mother No', getDisplayValue(batch.mother_no || '')],
    ['Status', batch.status?.toUpperCase() || 'N/A'],
    ['Current Stage', batch.current_stage?.replace(/_/g, ' ').toUpperCase() || 'N/A'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: batchInfoData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 50 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section: Clone/Germination
  checkAddPage(50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('CLONE / GERMINATION', 15, currentY);
  currentY += 6;

  const cloneData = [
    ['Date', formatDate(batch.clone_germination_date)],
    ['Total Clones/Plants', batch.total_clones_plants?.toString() || 'N/A'],
    ['Clonator 1', batch.clonator_1 || 'N/A'],
    ['Rack No', batch.rack_no || 'N/A'],
    ['Mortalities', batch.clonator_mortalities?.toString() || '0'],
    ['Expected Rooting Date', formatDate(batch.expected_rooting_date)],
    ['Actual Rooting Date', formatDate(batch.actual_rooting_date)],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: cloneData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section: Move to Hardening
  checkAddPage(60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MOVE TO HARDENING', 15, currentY);
  currentY += 6;

  const hardeningData = [
    ['Date', formatDate(batch.move_to_hardening_date)],
    ['Number of Clones', batch.clonator_2_number_clones?.toString() || 'N/A'],
    ['Area Placed', batch.hardening_area_placed || 'N/A'],
    ['Clonator 2', batch.clonator_2 || 'N/A'],
    ['Rack No', batch.clonator_2_rack_no || 'N/A'],
    ['No of Days', batch.clonator_2_no_of_days?.toString() || 'N/A'],
    ['Hardening Mortalities', formatMortality(batch.hardening_mortalities)],
    ['No of Clones', batch.hardening_number_clones?.toString() || 'N/A'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: hardeningData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Signature fields
  doc.setFontSize(9);
  doc.text('Grower Sign: _____________________', 15, currentY);
  doc.text('Manager Sign: _____________________', 80, currentY);
  doc.text('QA Sign: _____________________', 145, currentY);
  currentY += 10;

  // Section: Moved to Veg Area
  checkAddPage(60);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MOVED TO VEG AREA', 15, currentY);
  currentY += 6;

  const vegData = [
    ['Date', formatDate(batch.move_to_veg_date)],
    ['Number of Plants', batch.veg_number_plants?.toString() || 'N/A'],
    ['Table No', batch.veg_table_no || 'N/A'],
    ['Mortalities', formatMortality(batch.veg_mortalities)],
    ['Diseases', batch.veg_diseases ? 'Yes' : 'No'],
    ['Pests', batch.veg_pests ? 'Yes' : 'No'],
    ['Expected Veg Days', batch.veg_expected_days?.toString() || 'N/A'],
    ['Actual Veg Days', batch.veg_actual_days?.toString() || 'N/A'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: vegData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section: Moved to Flowering
  checkAddPage(80);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('MOVED TO GROW ROOM (FLOWERING)', 15, currentY);
  currentY += 6;

  const floweringData = [
    ['Date', formatDate(batch.move_to_flowering_date)],
    ['Number of Plants', batch.flowering_number_plants?.toString() || 'N/A'],
    ['Table No', batch.flowering_table_no || 'N/A'],
    ['Nutrients Used', batch.nutrients_used || 'N/A'],
    ['Using Extra Lights', batch.using_extra_lights ? 'Yes' : 'No'],
    ['Extra Lights From Day', batch.extra_lights_from_day?.toString() || 'N/A'],
    ['Extra Lights No of Days', batch.extra_lights_no_of_days?.toString() || 'N/A'],
    ['Increase in Yield', batch.increase_in_yield || 'N/A'],
    ['8 Nodes', batch.eight_nodes ? 'Yes' : 'No'],
    ['Expected Flowering Date', formatDate(batch.expected_flowering_date)],
    ['Actual Flowering Date', formatDate(batch.actual_flowering_date)],
    ['Estimated Days', batch.estimated_days?.toString() || 'N/A'],
    ['Actual Days', batch.actual_days?.toString() || 'N/A'],
    ['Mortalities', formatMortality(batch.flowering_mortalities)],
    ['Diseases', batch.flowering_diseases ? 'Yes' : 'No'],
    ['Pests', batch.flowering_pests ? 'Yes' : 'No'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: floweringData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Signature fields
  doc.setFontSize(9);
  doc.text('Grower Sign: _____________________', 15, currentY);
  doc.text('Manager Sign: _____________________', 80, currentY);
  doc.text('QA Sign: _____________________', 145, currentY);
  currentY += 10;

  // Section: Harvest
  checkAddPage(50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('HARVEST', 15, currentY);
  currentY += 6;

  const harvestData = [
    ['Date', formatDate(batch.harvest_date)],
    ['Number of Plants', batch.harvest_number_plants?.toString() || 'N/A'],
    ['Table No', batch.harvest_table_no || 'N/A'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: harvestData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Signature fields
  doc.setFontSize(9);
  doc.text('Grower Sign: _____________________', 15, currentY);
  doc.text('Manager Sign: _____________________', 80, currentY);
  doc.text('QA Sign: _____________________', 145, currentY);
  currentY += 10;

  // Section: Processing/Drying
  checkAddPage(50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PROCESSING / DRYING', 15, currentY);
  currentY += 6;

  const processingData = [
    ['Drying Date', formatDate(batch.drying_date)],
    ['Total Plants', batch.drying_total_plants?.toString() || 'N/A'],
    ['Drying Rack No', batch.drying_rack_no || 'N/A'],
    ['No of Days Drying', batch.no_of_days_drying?.toString() || 'N/A'],
    ['Total Wet Weight (kg)', batch.total_wet_weight?.toString() || 'N/A'],
    ['Total Plants Processed', batch.total_plants_processed?.toString() || 'N/A'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: processingData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Signature fields
  doc.setFontSize(9);
  doc.text('Processor Sign: _____________________', 15, currentY);
  doc.text('Manager Sign: _____________________', 80, currentY);
  doc.text('QA Sign: _____________________', 145, currentY);
  currentY += 10;

  // Section: Dry Weight
  checkAddPage(40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DRY WEIGHT', 15, currentY);
  currentY += 6;

  const dryWeightData = [
    ['Date', formatDate(batch.dry_weight_date)],
    ['Total Dry Weight (kg)', batch.total_dry_weight?.toString() || 'N/A'],
    ['No of Plants', batch.dry_weight_no_plants?.toString() || 'N/A'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: dryWeightData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Section: Packing
  checkAddPage(50);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('PACKING / STORAGE', 15, currentY);
  currentY += 6;

  const packingData = [
    ['Date', formatDate(batch.packing_date)],
    ['A Grade (kg)', batch.packing_a_grade?.toString() || 'N/A'],
    ['B Grade (kg)', batch.packing_b_grade?.toString() || 'N/A'],
    ['C Grade (kg)', batch.packing_c_grade?.toString() || 'N/A'],
    ['Bag IDs', batch.packing_bag_ids || 'N/A'],
    ['Storage Area', batch.packing_storage_area || 'N/A'],
  ];

  autoTable(doc, {
    startY: currentY,
    head: [],
    body: packingData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 60 } },
  });

  currentY = (doc as any).lastAutoTable.finalY + 5;

  // Final Signature fields
  doc.setFontSize(9);
  doc.text('Manager Sign: _____________________', 15, currentY);
  doc.text('QA Sign: _____________________', 110, currentY);

  // Save PDF
  doc.save(`Batch_Record_${batch.batch_number}_${format(new Date(), 'yyyyMMdd')}.pdf`);
};
