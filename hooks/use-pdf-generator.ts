import { useState, useCallback } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export const usePdfGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = useCallback(async (translatedText: string, fontSize: number) => {
    setIsGenerating(true);

    try {
      const lineHeight = fontSize * 1.5;
      const pageHeight = 842; // A4 in pt
      const contentHeight = pageHeight - 80; // top & bottom padding
      const linesPerPage = Math.floor(contentHeight / lineHeight);

      const allLines = translatedText.split('\n').flatMap(line => {
        const words = line.split(' ');
        const wrapped = [];
        let current = '';

        words.forEach(word => {
          if ((current + word).length > 100) {
            wrapped.push(current);
            current = word + ' ';
          } else {
            current += word + ' ';
          }
        });

        if (current.trim()) wrapped.push(current.trim());
        return wrapped;
      });

      const pages = [];
      for (let i = 0; i < allLines.length; i += linesPerPage) {
        const pageText = allLines.slice(i, i + linesPerPage).join('\n');
        pages.push(pageText);
      }

      const doc = new jsPDF('p', 'pt', 'a4');

      for (let i = 0; i < pages.length; i++) {
        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.top = '-9999px';
        container.style.left = '-9999px';
        container.style.width = '595px';
        container.style.height = `${contentHeight}px`;
        container.style.fontFamily = 'UMWEROalpha';
        container.style.fontSize = `${fontSize}px`;
        container.style.fontFeatureSettings = '"liga", "rlig", "calt"';
        container.style.whiteSpace = 'pre-wrap';
        container.style.lineHeight = '1.5';
        container.style.padding = '40px';
        container.style.boxSizing = 'border-box';
        container.innerText = pages[i];

        document.body.appendChild(container);
        await document.fonts.ready;
        await new Promise(res => setTimeout(res, 100));

        const canvas = await html2canvas(container, {
          scale: 2,
          useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        if (i > 0) doc.addPage();
        doc.addImage(imgData, 'PNG', 0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight());

        document.body.removeChild(container);
      }

      doc.save('umwero_ligature_pdf.pdf');
    } catch (err) {
      console.error('Error generating paginated PDF:', err);
      alert('PDF generation failed. Try shortening text or refreshing.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return { generatePdf, isGenerating };
};
