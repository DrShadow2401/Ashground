
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportToolsProps {
  noteTitle: string; // Keep noteTitle prop if PDF filename should use it
  getExportableElement: () => HTMLElement | null;
}

const ExportTools: React.FC<ExportToolsProps> = ({ noteTitle, getExportableElement }) => {
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    const exportableElement = getExportableElement();
    if (!exportableElement) {
      toast({ title: "Export Error", description: "Could not find content to export.", variant: "destructive" });
      return;
    }

    toast({ title: "Generating PDF...", description: "Please wait while your note is being prepared." });

    try {
      // Temporarily ensure Tiptap editor is not focused to avoid cursor in screenshot
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement && typeof activeElement.blur === 'function') {
        activeElement.blur();
      }
      await new Promise(resolve => setTimeout(resolve, 100)); // Short delay for blur to take effect


      const canvas = await html2canvas(exportableElement, {
        scale: 2, // Increase scale for better quality
        useCORS: true, // If you have external images
        logging: false,
        onclone: (document) => {
          // Attempt to make text selectable in PDF - might not always work perfectly
          const elements = document.querySelectorAll<HTMLElement>('.ProseMirror p, .ProseMirror h1, .ProseMirror h2, .ProseMirror h3, .ProseMirror li');
          elements.forEach(el => {
            el.style.userSelect = 'text'; // or 'auto'
            el.style.webkitUserSelect = 'text';
          });
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width, canvas.height] // Use canvas dimensions for PDF page size
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${noteTitle || 'Untitled Note'}.pdf`);

      toast({ title: "PDF Downloaded", description: "Your note has been downloaded as a PDF file." });

    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({ title: "Export Failed", description: "Could not generate PDF.", variant: "destructive" });
    }
  };

  const handleCopyToClipboard = async () => {
    // This will copy the HTML content of the Tiptap editor, not the visual drawing.
    const editorContentElement = document.querySelector('.ProseMirror');
    if (editorContentElement) {
        try {
            // A more robust way might be to get the HTML directly from the Tiptap editor instance if available
            // For now, using innerText for a simpler text copy.
            await navigator.clipboard.writeText( (editorContentElement as HTMLElement).innerText );
            toast({ title: "Text Copied", description: "Note text content has been copied." });
        } catch (err) {
            console.error('Failed to copy text: ', err);
            toast({ title: "Copy Failed", description: "Could not copy text content.", variant: "destructive" });
        }
    } else {
        toast({ title: "Copy Failed", description: "Could not find editor content.", variant: "destructive" });
    }
  };


  return (
    <div className="flex flex-wrap gap-4 items-center justify-center sm:justify-start">
      <Button onClick={handleDownloadPdf} variant="outline" className="hover:bg-accent/50">
        <Download className="mr-2 h-4 w-4" />
        Download as PDF
      </Button>
      <Button onClick={handleCopyToClipboard} variant="outline" className="hover:bg-accent/50">
        <Copy className="mr-2 h-4 w-4" />
        Copy Text
      </Button>
    </div>
  );
};

export default ExportTools;
