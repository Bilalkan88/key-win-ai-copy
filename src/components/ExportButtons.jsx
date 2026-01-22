import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet, Table } from 'lucide-react';

export default function ExportButtons({ data }) {
  const exportToCSV = () => {
    if (data.length === 0) return;

    const headers = [
      'Keyword',
      'Search Volume',
      'Competing Products',
      'Title Density',
      'Keyword Sales',
      'Organic Rank',
      'Selection Reason',
      'Amazon Search Link'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        `"${row['Keyword Phrase'].replace(/"/g, '""')}"`,
        row.searchVolume,
        row.competingProducts,
        row.titleDensity,
        row.keywordSales || '',
        row.organicRank || '',
        `"${(row.selectionReason || '').replace(/"/g, '""')}"`,
        `"${row.amazonLink}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profitable-keywords-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToExcel = () => {
    if (data.length === 0) return;

    // Create Excel-compatible XML
    const headersXml = [
      'Keyword Phrase',
      'Search Volume',
      'Competing Products',
      'Title Density',
      'Keyword Sales',
      'Organic Rank',
      'Selection Reason',
      'Amazon Search Link'
    ];

    let xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Profitable Keywords">
<Table>
<Row>`;

    headersXml.forEach(header => {
      xmlContent += `<Cell><Data ss:Type="String">${header}</Data></Cell>`;
    });
    xmlContent += `</Row>`;

    data.forEach(row => {
      xmlContent += `<Row>
        <Cell><Data ss:Type="String">${escapeXml(row['Keyword Phrase'])}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.searchVolume}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.competingProducts}</Data></Cell>
        <Cell><Data ss:Type="Number">${row.titleDensity}</Data></Cell>
        <Cell><Data ss:Type="${row.keywordSales ? 'Number' : 'String'}">${row.keywordSales || ''}</Data></Cell>
        <Cell><Data ss:Type="${row.organicRank ? 'Number' : 'String'}">${row.organicRank || ''}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(row.selectionReason || '')}</Data></Cell>
        <Cell><Data ss:Type="String">${escapeXml(row.amazonLink)}</Data></Cell>
      </Row>`;
    });

    xmlContent += `</Table></Worksheet></Workbook>`;

    const blob = new Blob([xmlContent], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `profitable-keywords-${new Date().toISOString().split('T')[0]}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const escapeXml = (str) => {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="h-11 border-slate-200 hover:bg-slate-50"
          disabled={data.length === 0}
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer">
          <Table className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer">
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}