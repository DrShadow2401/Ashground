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

type Mode = 'messages' | 'letter';
type MessageLayout = 'minimal' | 'classic' | 'green' | 'photo';

interface UnsentExperienceProps {
  onClose: () => void;
}

const UnsentExperience: React.FC<UnsentExperienceProps> = ({ onClose }) => {
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

    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#000000', // Match the dark background
        removeContainer: true,
      });
      const imageUri = canvas.toDataURL('image/png');
      setBurnImageUri(imageUri);
      setIsBurning(true);
    } catch (error) {
      console.error("Failed to capture for burning:", error);
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
    minimal: { bubbleBg: 'bg-blue-600/60', bubbleText: 'text-white' },
    classic: { bubbleBg: 'bg-gray-700/60', bubbleText: 'text-gray-100' },
    green: { bubbleBg: 'bg-green-700/60', bubbleText: 'text-white' },
    photo: { bubbleBg: 'bg-black/30', bubbleText: 'text-white' },
  };

  const currentMessageLayout = messageLayouts[messageLayout];

  const renderMessagesUI = () => (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-grow">
        <div className="p-4 md:p-6 flex flex-col justify-end min-h-full">
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
      <div className="flex-shrink-0 p-3 md:p-4 border-t border-white/10">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Write what you can't say..."
          className="w-full bg-transparent border-0 focus-visible:ring-0 text-gray-200 placeholder:text-gray-500 resize-none text-base p-2"
          rows={1}
        />
        <button onClick={handlePseudoSend} className="hidden">Send</button>
      </div>
    </div>
  );

  const renderLetterUI = () => (
    <ScrollArea className="flex-grow">
      <div className="p-4 md:p-8 flex flex-col font-body text-gray-300">
        <Textarea
          value={opening}
          onChange={(e) => setOpening(e.target.value)}
          placeholder="Dear..."
          className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none p-1 mb-6"
          rows={1}
        />
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Let it all out..."
          className="text-lg bg-transparent border-0 focus-visible:ring-0 resize-y min-h-[40vh] flex-grow p-1 mb-6"
        />
        <Textarea
          value={closing}
          onChange={(e) => setClosing(e.target.value)}
          placeholder="Yours,"
          className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none p-1 mb-8"
          rows={1}
        />
         <Input
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            placeholder="Anonymous"
            className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 p-1 h-auto"
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
        "relative w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a] text-gray-200",
        isExiting && "opacity-0"
      )}
    >
      <NeuralBackground className="absolute inset-0 opacity-25" trailOpacity={0.08} particleCount={300} speed={0.7} />
      <Button
        onClick={handleClose}
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 z-20 text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-full"
      >
        <X size={22} />
      </Button>

      {isBurning && burnImageUri && (
        <BurnAnimation bgImageUri={burnImageUri} isLightMode={false} />
      )}

      <div className={cn(
        "relative z-10 w-full h-full flex flex-col justify-center items-center transition-opacity duration-300 p-4 sm:p-6 md:p-8",
        isBurning && "opacity-0 pointer-events-none"
      )}>

        {/* Writing Surface */}
        <div ref={captureRef} className="w-full max-w-2xl h-full flex flex-col bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex-shrink-0 p-4 flex justify-between items-center border-b border-white/10">
                <Input
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="To: A person, a memory, the void…"
                    className="text-lg bg-transparent border-0 h-auto p-1 text-gray-400 placeholder:text-gray-500 focus-visible:ring-0 flex-grow"
                />
                <Button
                    onClick={handleBurn}
                    variant="ghost"
                    size="icon"
                    className="text-amber-400/70 hover:text-amber-400 hover:bg-white/5 rounded-full"
                    title="Burn this message"
                >
                    <Flame size={20} />
                </Button>
            </div>
            
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
            <footer className="flex-shrink-0 p-3 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 border-t border-white/10">
               <div className="flex items-center gap-4">
                    <button
                        onClick={() => setMode('messages')}
                        className={cn("transition-colors px-2 py-1 rounded-md", mode === 'messages' ? 'text-gray-200 bg-white/10' : 'hover:text-gray-300')}
                    >
                        Messages
                    </button>
                     <button
                        onClick={() => setMode('letter')}
                        className={cn("transition-colors px-2 py-1 rounded-md", mode === 'letter' ? 'text-gray-200 bg-white/10' : 'hover:text-gray-300')}
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
                                className={cn("capitalize transition-colors text-xs sm:text-sm px-2 py-1 rounded-md", messageLayout === layoutKey ? 'text-gray-200 bg-white/10' : 'hover:text-gray-300')}
                            >
                                {layoutKey}
                            </button>
                         ))}
                       </motion.div>
                   </AnimatePresence>
                )}
            </footer>
        </div>

        <p className="text-center text-xs text-gray-600 pt-6">
            You don’t have to send this to let it go.
        </p>
      </div>
    </motion.div>
  );
};

export default UnsentExperience;
