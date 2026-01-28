'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flame, ThumbsUp, Camera, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import BurnAnimation from '@/components/ui/burn-animation';
import html2canvas from 'html2canvas';

type LayoutType = 'minimal' | 'classic' | 'green' | 'photo';

const UnsentMessages = () => {
  const [layout, setLayout] = useState<LayoutType>('minimal');
  const [to, setTo] = useState('');
  const [message, setMessage] = useState('');
  const [messagesToShow, setMessagesToShow] = useState<string[]>([]);
  const [isBurning, setIsBurning] = useState(false);
  const messageEndRef = useRef<HTMLDivElement>(null);
  
  const [isBurningAnimationActive, setIsBurningAnimationActive] = useState(false);
  const [burnImageUri, setBurnImageUri] = useState<string | null>(null);
  const messageAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesToShow]);

  const handlePseudoSend = () => {
    if (message.trim() === '') return;
    setMessagesToShow(prev => [...prev, message.trim()]);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handlePseudoSend();
    }
  };

  const handleBurn = async () => {
    if (!messageAreaRef.current) return;
    
    // Temporarily set a solid background for capture
    const originalBg = messageAreaRef.current.style.backgroundColor;
    messageAreaRef.current.style.backgroundColor = layout === 'photo' ? '#000' : '#FFF';
    
    try {
      const canvas = await html2canvas(messageAreaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const imageUri = canvas.toDataURL('image/png');
      setBurnImageUri(imageUri);
      setIsBurningAnimationActive(true);
    } catch (error) {
      console.error("Failed to capture for burning:", error);
    } finally {
       messageAreaRef.current.style.backgroundColor = originalBg;
    }

    setTimeout(() => {
      setMessagesToShow([]);
      setTo('');
      setIsBurningAnimationActive(false);
      setBurnImageUri(null);
    }, 5000); // ANIMATION_DURATION
  };

  const layouts: Record<LayoutType, {
    name: string;
    bg: string;
    bubbleBg: string;
    bubbleText: string;
    inputIcon: React.ReactNode;
    inputBg: string;
    inputText: string;
    placeholderText: string;
  }> = {
    minimal: {
      name: 'Minimalist',
      bg: 'bg-white dark:bg-black',
      bubbleBg: 'bg-blue-500',
      bubbleText: 'text-white',
      inputIcon: <Send size={20} />,
      inputBg: 'bg-gray-100 dark:bg-gray-900',
      inputText: 'text-foreground',
      placeholderText: 'This message will never be delivered.',
    },
    classic: {
      name: 'Classic',
      bg: 'bg-white dark:bg-gray-900',
      bubbleBg: 'bg-sky-600',
      bubbleText: 'text-white',
      inputIcon: <ThumbsUp size={20} />,
      inputBg: 'bg-gray-200 dark:bg-gray-800',
      inputText: 'text-foreground',
      placeholderText: 'This is just a simulation.',
    },
    green: {
      name: 'Verdant',
      bg: 'bg-gray-200 dark:bg-slate-800',
      bubbleBg: 'bg-teal-600',
      bubbleText: 'text-white',
      inputIcon: <Send size={20} />,
      inputBg: 'bg-white dark:bg-slate-900',
      inputText: 'text-foreground',
      placeholderText: 'Nothing written here is stored.',
    },
    photo: {
      name: 'Vivid',
      bg: 'bg-gradient-to-br from-yellow-200 via-pink-300 to-purple-400',
      bubbleBg: 'bg-black/20 backdrop-blur-sm',
      bubbleText: 'text-white',
      inputIcon: <Camera size={20} />,
      inputBg: 'bg-white/30',
      inputText: 'text-white',
      placeholderText: 'This layout is a visual simulation only.',
    },
  };

  const currentLayout = layouts[layout];

  return (
    <div className="relative flex flex-col h-full w-full">
       {isBurningAnimationActive && burnImageUri && (
          <BurnAnimation bgImageUri={burnImageUri} isLightMode={layout !== 'photo'} />
        )}
      <div className={cn(
          "flex flex-col h-full w-full transition-opacity duration-300",
           isBurningAnimationActive ? "opacity-0 pointer-events-none" : "opacity-100"
      )}>
        <div className="flex-shrink-0 p-4 border-b rounded-t-lg bg-card/60 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-foreground">Unsent Messages</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Choose a familiar layout to write what you feel. Messages are never sent or stored.
          </p>
          <RadioGroup value={layout} onValueChange={(value) => setLayout(value as LayoutType)} className="flex flex-wrap gap-x-6 gap-y-2 mt-4">
            {Object.entries(layouts).map(([key, value]) => (
              <div key={key} className="flex items-center space-x-2">
                <RadioGroupItem value={key} id={key} />
                <Label htmlFor={key}>{value.name}</Label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div className={cn("flex-grow flex flex-col rounded-b-lg p-2 sm:p-4 transition-colors duration-300", currentLayout.bg)} ref={messageAreaRef}>
          <div className="flex items-center gap-2 border-b pb-2 mb-4 mx-2">
              <span className="text-sm text-muted-foreground font-medium">To:</span>
              <Input
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="A person, a memory, the void..."
                  className={cn("text-sm h-auto p-1 flex-1 bg-transparent border-0 rounded-none focus-visible:ring-0", currentLayout.inputText, `placeholder:${currentLayout.inputText}/70`)}
              />
              <Button onClick={handleBurn} size="icon" variant="ghost" className="rounded-full w-9 h-9 text-amber-500 hover:bg-amber-500/10 hover:text-amber-500">
                <Flame size={18} />
                <span className="sr-only">Burn All Messages</span>
              </Button>
          </div>

          <div className="flex-grow overflow-y-auto px-2 space-y-3">
            {messagesToShow.map((msg, index) => (
              <div key={index} className="flex justify-end animate-in fade-in-20 slide-in-from-bottom-2">
                <div className={cn(
                    "py-2 px-3 rounded-2xl max-w-[80%] break-words",
                    currentLayout.bubbleBg,
                    currentLayout.bubbleText,
                  )}>
                  <p className="text-sm">{msg}</p>
                </div>
              </div>
            ))}
            <div ref={messageEndRef} />
          </div>

          <div className="flex-shrink-0 mt-2 sm:mt-4">
            <div className={cn("flex items-center gap-2 rounded-full border p-1", currentLayout.inputBg)}>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={currentLayout.placeholderText}
                className={cn("flex-grow bg-transparent border-0 resize-none focus-visible:ring-0 p-2 text-sm", currentLayout.inputText, `placeholder:${currentLayout.inputText}/70`)}
                rows={1}
              />
              <Button onClick={handlePseudoSend} size="icon" variant="ghost" className={cn("rounded-full w-9 h-9", currentLayout.bubbleText, currentLayout.bubbleBg, `hover:${currentLayout.bubbleBg}/90`)}>
                {currentLayout.inputIcon}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnsentMessages;
