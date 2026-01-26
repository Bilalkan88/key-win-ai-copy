import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { base44 } from '@/api/base44Client';
import { FileText, Loader2, Download, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportGenerator({ data, stats, excludedKeywords, keywordGroups, category }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sections, setSections] = useState({
    executiveSummary: true,
    keywordResearch: true,
    keywordClassification: true,
    competitorAnalysis: true,
    reviewAnalysis: true,
    charts: true,
    recommendations: true
  });

  const toggleSection = (section) => {
    setSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const generateReport = async () => {
    if (data.length === 0) {
      toast.error('No data available to generate report');
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare data summaries
      const topKeywords = [...data]
        .sort((a, b) => b.searchVolume - a.searchVolume)
        .slice(0, 10);
      
      const profitableKeywords = data.filter(row => 
        row.searchVolume >= 1500 && row.competingProducts <= 800 && row.titleDensity <= 15
      );

      // Generate AI analysis
      const analysisPrompt = `Analyze this Amazon keyword research data${category ? ` for the ${category} category` : ''}:

Total Keywords Analyzed: ${stats.totalUploaded}
Keywords Passing Filters: ${stats.finalCount}
Top Opportunity Keywords: ${profitableKeywords.length}

Top 10 Keywords by Volume:
${topKeywords.map(k => `- ${k['Keyword Phrase']} (Vol: ${k.searchVolume}, Comp: ${k.competingProducts}, Density: ${k.titleDensity})`).join('\n')}

${sections.keywordClassification ? `Excluded Keywords:
- Unclear Intent: ${excludedKeywords.unclear.length}
- Too Short: ${excludedKeywords.short.length}
- Branded: ${excludedKeywords.branded.length}` : ''}

${sections.competitorAnalysis ? `Average Competition: ${Math.round(data.reduce((sum, k) => sum + k.competingProducts, 0) / data.length)}
Low Competition Keywords (<500): ${data.filter(k => k.competingProducts < 500).length}` : ''}

Provide a comprehensive analysis covering:
${sections.executiveSummary ? '1. Executive Summary: Key insights and overall market opportunity' : ''}
${sections.keywordResearch ? '2. Keyword Research Findings: Volume trends, search patterns, top opportunities' : ''}
${sections.keywordClassification ? '3. Keyword Classification Insights: Why keywords were excluded, patterns observed' : ''}
${sections.competitorAnalysis ? '4. Competitor Analysis: Competition levels, market saturation, gaps, positioning opportunities' : ''}
${sections.reviewAnalysis ? '5. Customer Pain Points & Product Opportunities: Based on keyword intent, identify common problems customers are trying to solve, unmet needs, and product improvement opportunities' : ''}
${sections.recommendations ? '6. Actionable Recommendations: Specific next steps for product development, marketing, and Amazon optimization' : ''}

Format as structured sections with clear headings.`;

      const analysis = await base44.integrations.Core.InvokeLLM({
        prompt: analysisPrompt,
        add_context_from_internet: false
      });

      // Generate PDF
      await generatePDF(analysis, topKeywords, profitableKeywords);
      
      toast.success('Report generated successfully!');
    } catch (error) {
      toast.error('Failed to generate report');
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const generatePDF = async (analysis, topKeywords, profitableKeywords) => {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    let yPosition = margin;

    // Helper function to add text with word wrap
    const addText = (text, fontSize = 10, isBold = false) => {
      pdf.setFontSize(fontSize);
      pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
      const lines = pdf.splitTextToSize(text, pageWidth - 2 * margin);
      
      lines.forEach(line => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin, yPosition);
        yPosition += fontSize * 0.5;
      });
      yPosition += 5;
    };

    // Title Page
    pdf.setFillColor(67, 56, 202);
    pdf.rect(0, 0, pageWidth, 60, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Keyword Research Report', pageWidth / 2, 30, { align: 'center' });
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(category ? `Category: ${category}` : 'Comprehensive Analysis', pageWidth / 2, 40, { align: 'center' });
    pdf.text(new Date().toLocaleDateString(), pageWidth / 2, 48, { align: 'center' });
    
    yPosition = 80;
    pdf.setTextColor(0, 0, 0);

    // Overview Stats
    addText('OVERVIEW', 16, true);
    addText(`Total Keywords Analyzed: ${stats.totalUploaded}`);
    addText(`Keywords After Filtering: ${stats.finalCount}`);
    addText(`Top Opportunity Keywords: ${profitableKeywords.length}`);
    addText(`Success Rate: ${Math.round((stats.finalCount / stats.totalUploaded) * 100)}%`);
    yPosition += 10;

    // AI Analysis Sections
    const analysisSections = analysis.split('\n\n');
    analysisSections.forEach(section => {
      if (!section.trim()) return;
      
      // Check if it's a heading (contains numbers like "1.", "2." or is all caps)
      const isHeading = /^\d+\./.test(section.trim()) || section.trim() === section.trim().toUpperCase();
      
      if (isHeading) {
        yPosition += 5;
        addText(section.trim(), 14, true);
      } else {
        addText(section.trim(), 10, false);
      }
    });

    // Top Keywords Table
    if (sections.keywordResearch) {
      yPosition += 10;
      addText('TOP 10 KEYWORDS BY SEARCH VOLUME', 14, true);
      yPosition += 5;

      // Table header
      pdf.setFillColor(240, 240, 240);
      pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Keyword', margin + 2, yPosition);
      pdf.text('Volume', margin + 100, yPosition);
      pdf.text('Comp', margin + 130, yPosition);
      pdf.text('Density', margin + 155, yPosition);
      yPosition += 8;

      // Table rows
      pdf.setFont('helvetica', 'normal');
      topKeywords.slice(0, 10).forEach((keyword, idx) => {
        if (yPosition > pageHeight - margin - 10) {
          pdf.addPage();
          yPosition = margin;
        }
        
        if (idx % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 8, 'F');
        }
        
        const keywordText = keyword['Keyword Phrase'].length > 35 
          ? keyword['Keyword Phrase'].substring(0, 35) + '...' 
          : keyword['Keyword Phrase'];
        
        pdf.text(keywordText, margin + 2, yPosition);
        pdf.text(keyword.searchVolume.toLocaleString(), margin + 100, yPosition);
        pdf.text(keyword.competingProducts.toLocaleString(), margin + 130, yPosition);
        pdf.text(keyword.titleDensity.toString(), margin + 155, yPosition);
        yPosition += 8;
      });
    }

    // Charts Section
    if (sections.charts) {
      const chartsElement = document.getElementById('report-charts');
      if (chartsElement) {
        pdf.addPage();
        yPosition = margin;
        addText('DATA VISUALIZATIONS', 14, true);
        
        try {
          const canvas = await html2canvas(chartsElement, { scale: 2 });
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          
          if (imgHeight > pageHeight - yPosition - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          
          pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        } catch (error) {
          console.error('Failed to add charts to PDF:', error);
        }
      }
    }

    // Save PDF
    const fileName = `Keyword_Report_${category || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  return (
    <>
      <Card>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full text-left hover:bg-slate-50 transition-colors"
        >
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  Comprehensive Report Generator
                </CardTitle>
                <p className="text-sm text-slate-500 mt-1">
                  Generate a detailed PDF report with insights, analysis, and recommendations
                </p>
              </div>
              {isExpanded ? (
                <ChevronUp className="w-5 h-5 text-slate-400" />
              ) : (
                <ChevronDown className="w-5 h-5 text-slate-400" />
              )}
            </div>
          </CardHeader>
        </button>

        {isExpanded && (
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-slate-700 mb-3">Select Report Sections:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="executiveSummary"
                    checked={sections.executiveSummary}
                    onCheckedChange={() => toggleSection('executiveSummary')}
                  />
                  <label htmlFor="executiveSummary" className="text-sm cursor-pointer">
                    Executive Summary
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keywordResearch"
                    checked={sections.keywordResearch}
                    onCheckedChange={() => toggleSection('keywordResearch')}
                  />
                  <label htmlFor="keywordResearch" className="text-sm cursor-pointer">
                    Keyword Research Findings
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="keywordClassification"
                    checked={sections.keywordClassification}
                    onCheckedChange={() => toggleSection('keywordClassification')}
                  />
                  <label htmlFor="keywordClassification" className="text-sm cursor-pointer">
                    Keyword Classification
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="competitorAnalysis"
                    checked={sections.competitorAnalysis}
                    onCheckedChange={() => toggleSection('competitorAnalysis')}
                  />
                  <label htmlFor="competitorAnalysis" className="text-sm cursor-pointer">
                    Competitor Analysis
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="reviewAnalysis"
                    checked={sections.reviewAnalysis}
                    onCheckedChange={() => toggleSection('reviewAnalysis')}
                  />
                  <label htmlFor="reviewAnalysis" className="text-sm cursor-pointer">
                    Review & Pain Points Analysis
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="charts"
                    checked={sections.charts}
                    onCheckedChange={() => toggleSection('charts')}
                  />
                  <label htmlFor="charts" className="text-sm cursor-pointer">
                    Charts & Visualizations
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recommendations"
                    checked={sections.recommendations}
                    onCheckedChange={() => toggleSection('recommendations')}
                  />
                  <label htmlFor="recommendations" className="text-sm cursor-pointer">
                    Actionable Recommendations
                  </label>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button
                onClick={generateReport}
                disabled={isGenerating || Object.values(sections).every(v => !v)}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4 mr-2" />
                    Generate & Download PDF Report
                  </>
                )}
              </Button>
              {Object.values(sections).every(v => !v) && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  Please select at least one section
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Hidden charts for PDF generation */}
      {sections.charts && (
        <div id="report-charts" style={{ position: 'absolute', left: '-9999px', width: '800px' }}>
          <div style={{ background: 'white', padding: '20px' }}>
            <h3 style={{ marginBottom: '20px', fontSize: '18px', fontWeight: 'bold' }}>Keyword Distribution</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Volume Distribution</h4>
                {data.filter(k => k.searchVolume < 1000).length > 0 && (
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                    {'<1000: ' + data.filter(k => k.searchVolume < 1000).length}
                  </div>
                )}
                {data.filter(k => k.searchVolume >= 1000 && k.searchVolume < 5000).length > 0 && (
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                    {'1000-5000: ' + data.filter(k => k.searchVolume >= 1000 && k.searchVolume < 5000).length}
                  </div>
                )}
                {data.filter(k => k.searchVolume >= 5000).length > 0 && (
                  <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                    {'5000+: ' + data.filter(k => k.searchVolume >= 5000).length}
                  </div>
                )}
              </div>
              <div>
                <h4 style={{ fontSize: '14px', marginBottom: '10px' }}>Competition Levels</h4>
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                  {'Low (<500): ' + data.filter(k => k.competingProducts < 500).length}
                </div>
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                  {'Medium (500-1500): ' + data.filter(k => k.competingProducts >= 500 && k.competingProducts < 1500).length}
                </div>
                <div style={{ fontSize: '12px', marginBottom: '5px' }}>
                  {'High (1500+): ' + data.filter(k => k.competingProducts >= 1500).length}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}