
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import AshgroundHeader from '@/components/ashground-header';
import PageEditor, { type PageEditorRef } from '@/components/page-editor';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
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
import HomeTools from '@/components/tool-sections/home-tools';
import DrawTools from '@/components/tool-sections/draw-tools';
import ViewTools from '@/components/tool-sections/view-tools';
import ExportTools from '@/components/tool-sections/export-tools';
import { useToast } from "@/hooks/use-toast";


type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';
export type LineStyle = 'solid' | 'dashed' | 'dotted';


export default function Home() {
  const [noteTitle, setNoteTitle] = useState<string>('Untitled Note');
  const [noteContent, setNoteContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pageBackground, setPageBackground] = useState<PageBackground>('plain');
  const [pageTheme, setPageTheme] = useState<PageTheme>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);

  const editorRef = useRef<Editor | null>(null);
  const pageEditorComponentRef = useRef<PageEditorRef>(null);
  const { toast } = useToast();


  const [currentDrawTool, setCurrentDrawTool] = useState<string | null>(null);
  const [drawColor, setDrawColor] = useState<string>('#000000');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState<number>(2);
  const [currentLineStyle, setCurrentLineStyle] = useState<LineStyle>('solid');


  useEffect(() => {
    setIsMounted(true);
    const savedTitle = localStorage.getItem('ashground_title');
    const savedNote = localStorage.getItem('ashground_note');
    const savedBg = localStorage.getItem('ashground_bg') as PageBackground | null;
    const savedTheme = localStorage.getItem('ashground_theme') as PageTheme | null;

    if (savedTitle) setNoteTitle(savedTitle);
    if (savedNote) setNoteContent(savedNote);
    else setNoteContent('<p></p>'); 

    if (savedBg) setPageBackground(savedBg);

    const htmlClasses = document.documentElement.classList;
    if (savedTheme) {
      setPageTheme(savedTheme);
      if (savedTheme === 'dark') {
        htmlClasses.remove('theme-pastel');
        htmlClasses.add('dark');
      } else if (savedTheme === 'pastel') {
        htmlClasses.remove('dark');
        htmlClasses.add('theme-pastel');
      } else {
        htmlClasses.remove('dark');
        htmlClasses.remove('theme-pastel');
      }
    } else {
       htmlClasses.remove('dark');
       htmlClasses.remove('theme-pastel');
    }
  }, []);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_title', noteTitle);
    }
  }, [noteTitle, isMounted]);

  useEffect(() => {
    if(isMounted && noteContent !== undefined) { 
      localStorage.setItem('ashground_note', noteContent);
    }
  }, [noteContent, isMounted]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_bg', pageBackground);
    }
  }, [pageBackground, isMounted]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_theme', pageTheme);
      const htmlClasses = document.documentElement.classList;
      if (pageTheme === 'dark') {
        htmlClasses.remove('theme-pastel');
        htmlClasses.add('dark');
      } else if (pageTheme === 'pastel') {
        htmlClasses.remove('dark');
        htmlClasses.add('theme-pastel');
      } else {
        htmlClasses.remove('dark');
        htmlClasses.remove('theme-pastel');
      }
    }
  }, [pageTheme, isMounted]);

  useEffect(() => {
    if (activeTab !== 'draw' && currentDrawTool !== 'eyedropper') {
      setCurrentDrawTool(null);
    }
  }, [activeTab, currentDrawTool]);

  const handleEditorReady = useCallback(() => {
    setIsEditorInitialized(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const handleClearCanvas = () => {
    if (pageEditorComponentRef.current) {
      pageEditorComponentRef.current.clearCanvas();
    }
    setCurrentDrawTool(null); 
  };

  const handleAfterColorPick = () => {
    setCurrentDrawTool(null);
  };

  const getExportableElementForPdf = () => {
    if (pageEditorComponentRef.current) {
      return pageEditorComponentRef.current.getExportableElement();
    }
    return null;
  };

  const handleBurnEverything = () => {
    setNoteTitle('Untitled Note');
    setNoteContent('<p></p>'); 
    if (editorRef.current) {
      editorRef.current.commands.setContent('<p></p>', true); 
    }
    if (pageEditorComponentRef.current) {
      pageEditorComponentRef.current.clearCanvas();
    }
    localStorage.removeItem('ashground_title');
    localStorage.removeItem('ashground_note');
    toast({
      title: "Ashes to Ashes",
      description: "Your note has been cleared.",
    });
  };

  const tabItems = [
    { value: 'home', label: 'Home' },
    { value: 'draw', label: 'Draw' },
    { value: 'view', label: 'View' },
    { value: 'export', label: 'Export' },
  ];

  const BurningMatchstickIcon = () => (
    <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" transform="rotate(-15 10 10)">
      <rect x="9" y="6" width="2" height="9" rx="0.5" fill="currentColor" />
      <path d="M10 1C9.53043 1 9.08043 1.18429 8.75325 1.51147C8.42607 1.83866 8.25 2.28866 8.25 2.75C8.25 4.25 9.25 5.25 10 6.5C10.75 5.25 11.75 4.25 11.75 2.75C11.75 2.28866 11.5739 1.83866 11.2467 1.51147C10.9196 1.18429 10.4696 1 10 1Z" fill="#FF8C00"/>
      <path d="M10 1.75C9.79565 1.75 9.60054 1.83179 9.45919 1.97313C9.31784 2.11448 9.2375 2.30959 9.2375 2.5125C9.2375 3.5125 9.7375 4.0125 10 5.0125C10.2625 4.0125 10.7625 3.5125 10.7625 2.5125C10.7625 2.30959 10.6822 2.11448 10.5408 1.97313C10.3995 1.83179 10.2043 1.75 10 1.75Z" fill="#FFD700"/>
      <circle cx="8.5" cy="16.5" r="0.8" fill="currentColor" opacity="0.5" />
      <circle cx="11.5" cy="17" r="0.6" fill="currentColor" opacity="0.4" />
      <circle cx="10" cy="17.5" r="1" fill="currentColor" opacity="0.6" />
    </svg>
  );


  return (
    <main className="flex flex-col items-center min-h-screen py-6 px-4">
      <AshgroundHeader />

      <div className="flex items-center justify-center w-full max-w-4xl mx-auto mb-8">
        <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="flex-grow max-w-md">
          <TabsList className="mx-auto w-full bg-card rounded-xl shadow-lg p-1.5 flex justify-around">
            {tabItems.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="px-3 py-1.5 data-[state=active]:text-foreground data-[state=active]:font-semibold data-[state=active]:bg-transparent data-[state=active]:shadow-none text-muted-foreground hover:text-foreground/80 transition-colors rounded-md text-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="icon"
              className="ml-4 p-2.5 rounded-full 
                         bg-muted/30 dark:bg-muted/20 
                         text-amber-500 dark:text-amber-400 
                         shadow-md hover:shadow-lg
                         ring-1 ring-inset ring-amber-500/50 dark:ring-amber-400/50
                         hover:bg-amber-500/10 dark:hover:bg-amber-400/10 
                         hover:text-amber-600 dark:hover:text-amber-300 
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                         transition-all duration-150 ease-in-out"
              title="Burn Everything"
            >
              <BurningMatchstickIcon />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Burn Everything?</AlertDialogTitle>
              <AlertDialogDescription>
                This will clear your current note title, content, and any drawings.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBurnEverything}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Burn
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>


      <Tabs value={activeTab} className="w-full max-w-4xl"> 
        <div className="max-w-3xl mx-auto mb-6">
          <div className="bg-muted p-3 rounded-lg shadow-inner min-h-[52px] flex justify-center items-start">
            {activeTab === 'home' && (isEditorInitialized ? <HomeTools editorRef={editorRef} /> : <p className="text-muted-foreground text-sm">Editor loading...</p>)}
            {activeTab === 'draw' && (
              <DrawTools
                activeTool={currentDrawTool}
                onToolChange={setCurrentDrawTool}
                currentDrawColor={drawColor}
                onDrawColorChange={setDrawColor}
                currentStrokeWidth={drawStrokeWidth}
                onStrokeWidthChange={setDrawStrokeWidth}
                currentLineStyle={currentLineStyle}
                onLineStyleChange={setCurrentLineStyle}
                onClearCanvas={handleClearCanvas}
              />
            )}
            {activeTab === 'view' && (
              <ViewTools
                selectedBackground={pageBackground}
                onBackgroundChange={setPageBackground}
                selectedTheme={pageTheme}
                onThemeChange={setPageTheme}
              />
            )}
            {activeTab === 'export' && <ExportTools noteTitle={noteTitle} getExportableElement={getExportableElementForPdf} />}
          </div>
        </div>

        <PageEditor
          ref={pageEditorComponentRef}
          editorTiptapRef={editorRef}
          onEditorReady={handleEditorReady}
          noteTitle={noteTitle}
          onNoteTitleChange={setNoteTitle}
          noteContent={noteContent}
          onNoteChange={setNoteContent}
          backgroundStyle={pageBackground}
          pageTheme={pageTheme}
          isDrawingMode={activeTab === 'draw'}
          currentDrawTool={currentDrawTool}
          drawColor={drawColor}
          drawStrokeWidth={drawStrokeWidth}
          currentLineStyle={currentLineStyle}
          onDrawColorChange={setDrawColor} 
          onAfterColorPick={handleAfterColorPick}
        />
      </Tabs>
    </main>
  );
}

