import { useState, useCallback } from 'react';
import { jsPDF } from "jspdf";

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async (translatedText: string, fontSize: number) => {
    setIsGenerating(true);
    try {
      const doc = new jsPDF();

      // Add the UMWEROalpha font to the PDF
      doc.addFileToVFS('UMWEROPUAnumbers.otf', '/UMWEROPUAnumbers.otf');
      doc.addFont('UMWEROPUAnumbers.otf', 'UMWEROalpha', 'normal');

      // Set the font and ensure it's loaded before using it
      doc.setFont('UMWEROalpha', 'normal');
      doc.setFontSize(fontSize);

      // Use a fallback method for text wrapping
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - 2 * margin;
      const lines = doc.splitTextToSize(translatedText, maxWidth);

      doc.text(lines, margin, 20);

      // Save the PDF
      doc.save("umwero_translation.pdf");
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('An error occurred while generating the PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generatePdf, isGenerating };
};

