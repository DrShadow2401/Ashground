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

type Mode = 'messages' | 'letter';
type MessageLayout = 'minimal' | 'classic' | 'green' | 'photo';

interface UnsentExperienceProps {
  onClose: () => void;
}

const UnsentExperience: React.FC<UnsentExperienceProps> = ({ onClose }) => {
  const [mode, setMode] = useState<Mode>('messages');
  const [messageLayout, setMessageLayout] = useState<MessageLayout>('minimal');

  // Common state
  const [isBurning, setIsBurning] = useState(false);
  const [burnImageUri, setBurnImageUri] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);
  const [to, setTo] = useState('');

  // Messages state
  const [message, setMessage] = useState('');
  const [messagesToShow, setMessagesToShow] = useState<string[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Letter state
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
    setTimeout(onClose, 500); // Match animation duration
  };

  const handleBurn = async () => {
    if (!captureRef.current) return;

    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: '#0a0a0a', // Match the dark background
        removeContainer: true,
      });
      const imageUri = canvas.toDataURL('image/png');
      setBurnImageUri(imageUri);
      setIsBurning(true);
    } catch (error) {
      console.error("Failed to capture for burning:", error);
    }

    setTimeout(() => {
      // Clear all state
      setTo('');
      setMessage('');
      setMessagesToShow([]);
      setOpening('');
      setBody('');
      setClosing('');
      setFrom('');
      
      // Reset animation
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
    minimal: { bubbleBg: 'bg-blue-600/80', bubbleText: 'text-white' },
    classic: { bubbleBg: 'bg-gray-700/80', bubbleText: 'text-gray-100' },
    green: { bubbleBg: 'bg-green-700/80', bubbleText: 'text-white' },
    photo: { bubbleBg: 'bg-black/40', bubbleText: 'text-white' },
  };

  const currentMessageLayout = messageLayouts[messageLayout];

  const renderMessagesUI = () => (
    <div className="flex flex-col h-full">
      <div className="flex-grow overflow-y-auto p-4 md:p-8 flex flex-col justify-end">
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
              <p className="text-sm leading-relaxed">{msg}</p>
            </div>
          </motion.div>
        ))}
        <div ref={messageEndRef} />
      </div>
      <div className="flex-shrink-0 p-4 md:p-6">
        <Textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="This message will never be delivered."
          className="w-full bg-white/5 border-0 focus-visible:ring-0 text-gray-200 placeholder:text-gray-500 resize-none text-base p-3 rounded-lg"
          rows={1}
        />
        <button onClick={handlePseudoSend} className="hidden">Send</button>
      </div>
    </div>
  );

  const renderLetterUI = () => (
    <div className="flex-grow overflow-y-auto p-4 md:p-12 flex flex-col font-body text-gray-300">
      <Textarea
        value={opening}
        onChange={(e) => setOpening(e.target.value)}
        placeholder="I never got to say this..."
        className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none p-1 mb-6 border-b border-white/10"
        rows={1}
      />
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Let it all out..."
        className="text-lg bg-transparent border-0 focus-visible:ring-0 resize-y min-h-[30vh] flex-grow p-1 mb-6"
      />
      <Textarea
        value={closing}
        onChange={(e) => setClosing(e.target.value)}
        placeholder="This is where I stop carrying this."
        className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 resize-none p-1 mb-8 border-b border-white/10"
        rows={1}
      />
       <Input
          value={from}
          onChange={(e) => setFrom(e.target.value)}
          placeholder="From: Anonymous"
          className="text-lg bg-transparent border-0 rounded-none focus-visible:ring-0 p-1 h-auto"
      />
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed inset-0 z-50 flex flex-col bg-[#0a0a0a] text-gray-200",
        isExiting && "opacity-0"
      )}
    >
      <NeuralBackground className="absolute inset-0 opacity-20" trailOpacity={0.05} particleCount={200} speed={0.5} />

      {isBurning && burnImageUri && (
        <BurnAnimation bgImageUri={burnImageUri} isLightMode={false} />
      )}

      <div ref={captureRef} className={cn(
        "relative z-10 flex-grow flex flex-col transition-opacity duration-300",
        isBurning && "opacity-0"
      )}>
        <header className="flex-shrink-0 p-4 md:p-6 flex justify-between items-start">
          <Input
            value={to}
            onChange={(e) => setTo(e.target.value)}
            placeholder="To: A person, a memory, the void…"
            className="text-xl md:text-2xl bg-transparent border-0 h-auto p-1 text-gray-400 placeholder:text-gray-600 focus-visible:ring-0 w-2/3"
          />
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBurn}
              variant="ghost"
              size="icon"
              className="text-amber-400/70 hover:text-amber-400 hover:bg-white/5 rounded-full"
            >
              <Flame size={20} />
            </Button>
            <Button
              onClick={handleClose}
              variant="ghost"
              size="icon"
              className="text-gray-500 hover:text-gray-200 hover:bg-white/5 rounded-full"
            >
              <X size={22} />
            </Button>
          </div>
        </header>

        <main className="flex-grow flex flex-col min-h-0">
            <AnimatePresence mode="wait">
                <motion.div
                    key={mode}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-grow flex flex-col"
                >
                    {mode === 'messages' ? renderMessagesUI() : renderLetterUI()}
                </motion.div>
            </AnimatePresence>
        </main>
        
        <footer className="flex-shrink-0 p-4 md:p-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
           <div className="flex items-center gap-4">
                <button
                    onClick={() => setMode('messages')}
                    className={cn(
                        "transition-colors",
                        mode === 'messages' ? 'text-gray-300' : 'hover:text-gray-400'
                    )}
                >
                    Messages
                </button>
                 <button
                    onClick={() => setMode('letter')}
                    className={cn(
                        "transition-colors",
                        mode === 'letter' ? 'text-gray-300' : 'hover:text-gray-400'
                    )}
                >
                    Letter
                </button>
            </div>
            
            {mode === 'messages' && (
               <div className="flex items-center gap-4">
                 <span className="hidden sm:inline">Mood:</span>
                 {Object.keys(messageLayouts).map((layoutKey) => (
                    <button
                        key={layoutKey}
                        onClick={() => setMessageLayout(layoutKey as MessageLayout)}
                        className={cn(
                            "capitalize transition-colors",
                            messageLayout === layoutKey ? 'text-gray-300' : 'hover:text-gray-400'
                        )}
                    >
                        {layoutKey}
                    </button>
                 ))}
               </div>
            )}
        </footer>
        <p className="text-center text-xs text-gray-700 pb-4">
            You don’t have to send this to let it go.
        </p>
      </div>
    </motion.div>
  );
};

export default UnsentExperience;
