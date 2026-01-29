'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Flame, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import BurnAnimation from '@/components/ui/burn-animation';
import html2canvas from 'html2canvas';
import NeuralBackground from '@/components/ui/neural-background';
import { AnimatePresence, motion } from 'framer-motion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

type Mode = 'messages' | 'letter';
type MessageLayout = 'minimal' | 'classic' | 'green' | 'photo';
type Theme = 'light' | 'dark';

interface UnsentExperienceProps {
  onClose: () => void;
  theme: Theme;
}

const UnsentExperience: React.FC<UnsentExperienceProps> = ({ onClose, theme }) => {
  const [mode, setMode] = useState<Mode>('messages');
  const [messageLayout, setMessageLayout] = useState<MessageLayout>('minimal');

  const [isBurning, setIsBurning] = useState(false);
  const [burnImageUri, setBurnImageUri] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [to, setTo] = useState('');

  const [message, setMessage] = useState('');
  const [messagesToShow, setMessagesToShow] = useState<string[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const [opening, setOpening] = useState('');
  const [body, setBody] = useState('');
  const [closing, setClosing] = useState('');
  const [from, setFrom] = useState('');
  
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messagesToShow]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 500); 
  };

  const handleBurn = async () => {
    if (!captureRef.current) return;
    
    const originalBackgroundColor = captureRef.current.style.backgroundColor;
    captureRef.current.style.backgroundColor = theme === 'dark' ? '#000000' : '#FFFFFF';


    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: theme === 'dark' ? '#000000' : '#FFFFFF',
        removeContainer: true,
      });
      const imageUri = canvas.toDataURL('image/png');
      setBurnImageUri(imageUri);
      setIsBurning(true);
    } catch (error) {
      console.error("Failed to capture for burning:", error);
    } finally {
        if(captureRef.current) {
           captureRef.current.style.backgroundColor = originalBackgroundColor;
        }
    }

    setTimeout(() => {
      setTo('');
      setMessage('');
      setMessagesToShow([]);
      setOpening('');
      setBody('');
      setClosing('');
      setFrom('');
      
      setIsBurning(false);
      setBurnImageUri(null);
    }, 5000);
  };
  
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

  const messageLayouts = {
    minimal: { bubbleBg: 'bg-primary/80', bubbleText: 'text-primary-foreground' },
    classic: { bubbleBg: 'bg-secondary', bubbleText: 'text-secondary-foreground' },
    green: { bubbleBg: 'dark:bg-green-900/70 bg-green-200/90', bubbleText: 'dark:text-green-100 text-green-900' },
    photo: { bubbleBg: 'dark:bg-black/30 bg-white/30', bubbleText: 'text-foreground' },
  };

  const currentMessageLayout = messageLayouts[messageLayout];

  const renderMessagesUI = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="p-4 pt-2 md:p-6 flex flex-col justify-end min-h-full">
          {messagesToShow.map((msg, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex justify-end mb-3"
            >
              <div className={cn(
                "py-3 px-4 rounded-2xl max-w-[80%] break-words shadow-md backdrop-blur-sm",
                currentMessageLayout.bubbleBg,
                currentMessageLayout.bubbleText,
              )}>
                <p className="text-sm md:text-base leading-relaxed">{msg}</p>
              </div>
            </motion.div>
          ))}
          <div ref={messageEndRef} />
        </div>
      </ScrollArea>
      <div className="flex-shrink-0 p-3 md:p-4 border-t border-border">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write what you can't say..."
          className="w-full bg-transparent border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground resize-none text-base p-2 min-h-[44px] max-h-[150px]"
          rows={1}
        />
        <button onClick={handlePseudoSend} className="hidden">Send</button>
      </div>
    </div>
  );

  const renderLetterUI = () => (
    <ScrollArea className="flex-grow">
      <div className="p-4 md:p-6 flex flex-col font-body text-foreground">
        <Textarea
          value={opening}
          onChange={(e) => setOpening(e.target.value)}
          placeholder="Dear..."
          className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none p-1 mb-6 placeholder:text-muted-foreground"
          rows={1}
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Let it all out..."
          className="text-lg bg-transparent border-0 focus-visible:ring-0 resize-y min-h-[40vh] flex-grow p-1 mb-6 placeholder:text-muted-foreground"
        />
        <Textarea
          value={closing}
          onChange={(e) => setClosing(e.target.value)}
          placeholder="Yours,"
          className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none p-1 mb-8 placeholder:text-muted-foreground"
          rows={1}
        />
         <Input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Anonymous"
            className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 p-1 h-auto placeholder:text-muted-foreground"
        />
      </div>
    </ScrollArea>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "w-full h-full flex flex-col",
        theme === 'dark' ? 'bg-[#0a0a0a]/50 text-gray-200' : 'bg-background/50 text-foreground',
        isExiting && "opacity-0"
      )}
    >
      {theme === 'dark' && <NeuralBackground className="absolute inset-0 opacity-25" trailOpacity={0.08} particleCount={300} speed={0.7} />}
      <Button
        onClick={handleClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 text-muted-foreground hover:text-foreground hover:bg-accent rounded-full"
      >
        <X size={22} />
      </Button>

      {isBurning && burnImageUri && (
        <BurnAnimation bgImageUri={burnImageUri} isLightMode={theme === 'light'} />
      )}

      <div className={cn(
        "relative z-10 w-full flex-grow min-h-0 flex flex-col transition-opacity duration-300 p-2 md:p-4",
        isBurning && "opacity-0 pointer-events-none"
      )}>

        {/* Writing Surface */}
        <div ref={captureRef} className={cn(
          "w-full flex-grow min-h-0 flex flex-col rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-xl",
           theme === 'dark' ? 'bg-[#111111]/90 border-white/10' : 'bg-background/95 border-border'
        )}>
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-4 pb-2 md:px-6 md:pt-6 md:pb-3 flex justify-between items-center">
                <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="To: A person, a memory, the void…"
                    className="text-lg bg-transparent border-0 h-auto p-1 text-foreground placeholder:text-muted-foreground focus-visible:ring-0 flex-grow"
                />
                <Button
                    onClick={handleBurn}
                    variant="ghost"
                    size="icon"
                    className="text-amber-500/80 dark:text-amber-400/70 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-accent rounded-full"
                    title="Burn this message"
                >
                    <Flame size={20} />
                </Button>
            </div>
            <Separator className="mx-4 md:mx-6 w-auto bg-border/50 mb-2 md:mb-4" />
            
            {/* Main Content */}
            <main className="flex-grow flex flex-col min-h-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={mode}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex-grow flex flex-col h-full"
                    >
                        {mode === 'messages' ? renderMessagesUI() : renderLetterUI()}
                    </motion.div>
                </AnimatePresence>
            </main>
            
            {/* Footer */}
            <footer className="flex-shrink-0 p-3 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground border-t border-border">
               <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMode('messages')}
                        className={cn("transition-colors px-2 py-1 rounded-md", mode === 'messages' ? 'text-foreground bg-muted' : 'hover:text-foreground/80')}
                    >
                        Messages
                    </button>
                     <button
                        onClick={() => setMode('letter')}
                        className={cn("transition-colors px-2 py-1 rounded-md", mode === 'letter' ? 'text-foreground bg-muted' : 'hover:text-foreground/80')}
                    >
                        Letter
                    </button>
                </div>
                
                {mode === 'messages' && (
                    <AnimatePresence>
                       <motion.div 
                         initial={{ opacity: 0 }}
                         animate={{ opacity: 1 }}
                         exit={{ opacity: 0 }}
                         className="flex items-center gap-2 sm:gap-3"
                       >
                         <span className="hidden sm:inline">Mood:</span>
                         {Object.keys(messageLayouts).map((layoutKey) => (
                            <button
                                key={layoutKey}
                                onClick={() => setMessageLayout(layoutKey as MessageLayout)}
                                className={cn("capitalize transition-colors text-xs sm:text-sm px-2 py-1 rounded-md", messageLayout === layoutKey ? 'text-foreground bg-muted' : 'hover:text-foreground/80')}
                            >
                                {layoutKey}
                            </button>
                         ))}
                       </motion.div>
                   </AnimatePresence>
                )}
            </footer>
        </div>

        <p className="text-center text-xs text-muted-foreground pt-4 flex-shrink-0">
            You don’t have to send this to let it go.
        </p>
      </div>
    </motion.div>
  );
};

export default UnsentExperience;
