import React from 'react';
import { Button } from '@/components/ui/button';
import { Download, Copy } from 'lucide-react';
import { useToast } from "@/hooks/use-toast"

interface ExportToolsProps {
  noteContent: string;
}

const ExportTools: React.FC<ExportToolsProps> = ({ noteContent }) => {
  const { toast } = useToast();

  const handleDownload = () => {
    const blob = new Blob([noteContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'Untitled Note.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
    toast({ title: "Note Downloaded", description: "Your note has been downloaded as a .txt file." });
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(noteContent);
      toast({ title: "Copied to Clipboard", description: "Note content has been copied." });
    } catch (err) {
      console.error('Failed to copy: ', err);
      toast({ title: "Copy Failed", description: "Could not copy content to clipboard.", variant: "destructive" });
    }
  };

  return (
    <div className="flex flex-wrap gap-4 p-2 items-center">
      <Button onClick={handleDownload} variant="outline" className="hover:bg-accent/50">
        <Download className="mr-2 h-4 w-4" />
        Download as .txt
      </Button>
      <Button onClick={handleCopyToClipboard} variant="outline" className="hover:bg-accent/50">
        <Copy className="mr-2 h-4 w-4" />
        Copy to Clipboard
      </Button>
    </div>
  );
};

export default ExportTools;
