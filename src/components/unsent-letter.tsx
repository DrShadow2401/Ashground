
'use client';

import React, { useState, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Flame } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import BurnAnimation from '@/components/ui/burn-animation';
import html2canvas from 'html2canvas';

const ANIMATION_DURATION = 5000;

export default function UnsentLetter() {
  const [to, setTo] = useState('');
  const [opening, setOpening] = useState('');
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState('');
  const [from, setFrom] = useState('');

  const [isBurningAnimationActive, setIsBurningAnimationActive] = useState(false);
  const [burnImageUri, setBurnImageUri] = useState<string | null>(null);

  const letterContentRef = useRef<HTMLDivElement>(null);

  const handleBurnLetter = async () => {
    if (!letterContentRef.current) return;
    
    const elementToCapture = letterContentRef.current.querySelector('.bg-card\\/50') as HTMLElement;
    if (!elementToCapture) return;

    const originalBackgroundColor = elementToCapture.style.backgroundColor;
    const originalBackdropFilter = elementToCapture.style.backdropFilter;

    // Use a solid color that matches the light theme paper for consistency during capture
    elementToCapture.style.backgroundColor = '#F8F5F0';
    elementToCapture.style.backdropFilter = 'none';

    try {
        const canvas = await html2canvas(elementToCapture, {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            removeContainer: true,
        });
        const imageUri = canvas.toDataURL('image/png');
        setBurnImageUri(imageUri);
        setIsBurningAnimationActive(true);
    } catch (error) {
        console.error("Failed to capture letter for burning:", error);
    } finally {
        elementToCapture.style.backgroundColor = originalBackgroundColor;
        elementToCapture.style.backdropFilter = originalBackdropFilter;
    }


    setTimeout(() => {
      // Clear all fields
      setTo('');
      setOpening('');
      setBody('');
      setClosing('');
      setFrom('');

      // Reset animation state
      setIsBurningAnimationActive(false);
      setBurnImageUri(null);
    }, ANIMATION_DURATION);
  };

  return (
    <div className="relative flex-grow flex flex-col overflow-hidden">
        {isBurningAnimationActive && burnImageUri && (
          <BurnAnimation bgImageUri={burnImageUri} isLightMode={true} />
        )}
        
        <div className={cn(
            "flex-grow overflow-y-auto",
            isBurningAnimationActive ? "opacity-0 pointer-events-none" : "opacity-100"
          )}
        >
            <div ref={letterContentRef} className="w-full max-w-2xl mx-auto transition-opacity duration-300 p-4 pt-8 md:pt-12 pb-8">
                <div className="bg-card/50 backdrop-blur-sm p-8 md:p-12 rounded-lg shadow-lg font-body text-foreground">
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-lg text-muted-foreground">To:</span>
                        <Input
                            value={to}
                            onChange={(e) => setTo(e.target.value)}
                            placeholder="Mom, my past self, the void..."
                            className="text-lg p-1 h-auto flex-1 bg-transparent border-0 border-b rounded-none border-border/50 focus-visible:ring-0 focus:border-primary"
                        />
                    </div>
                    
                    <Textarea
                        value={opening}
                        onChange={(e) => setOpening(e.target.value)}
                        placeholder="I never got to say this..."
                        className="text-lg p-1 mb-6 bg-transparent border-0 border-b rounded-none border-border/50 focus-visible:ring-0 focus:border-primary resize-none"
                        rows={1}
                    />

                    <Textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="This is where I let it all out. The unfiltered thoughts, the unspoken words, the weight I'm ready to release. Nothing written here is stored or sent."
                        className="text-lg p-2 min-h-[250px] mb-6 bg-transparent border rounded-md border-border/30 focus-visible:ring-1 focus-visible:ring-primary/50 resize-y overflow-y-auto"
                    />

                    <Textarea
                        value={closing}
                        onChange={(e) => setClosing(e.target.value)}
                        placeholder="This is where I stop carrying this."
                        className="text-lg p-1 mb-8 bg-transparent border-0 border-b rounded-none border-border/50 focus-visible:ring-0 focus:border-primary resize-none"
                        rows={1}
                    />

                    <div className="flex items-baseline gap-2">
                        <span className="text-lg text-muted-foreground">From:</span>
                        <Input
                            value={from}
                            onChange={(e) => setFrom(e.target.value)}
                            placeholder="Anonymous"
                            className="text-lg p-1 h-auto flex-1 bg-transparent border-0 border-b rounded-none border-border/50 focus-visible:ring-0 focus:border-primary"
                        />
                    </div>
                </div>

                <div className="mt-8 text-center">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            className="rounded-full h-14 w-14 p-0 border-2 border-amber-500 dark:border-amber-400 bg-transparent text-amber-500 dark:text-amber-400 shadow-md hover:shadow-lg hover:bg-amber-500/10 dark:hover:bg-amber-400/10 hover:text-amber-600 dark:hover:text-amber-300"
                            title="Burn this letter"
                        >
                            <Flame className="w-6 h-6" />
                        </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you ready to let this go?</AlertDialogTitle>
                            <AlertDialogDescription>
                            This letter will be permanently destroyed. It will not be saved or sent. This action cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                            onClick={handleBurnLetter}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                            Burn
                            </AlertDialogAction>
                        </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                    <p className="text-muted-foreground text-sm mt-4">
                        This letter will never be delivered.
                    </p>
                </div>
            </div>
        </div>
    </div>
  );
}
