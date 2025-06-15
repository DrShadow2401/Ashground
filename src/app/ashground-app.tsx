
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import AshgroundHeader from '@/components/ashground-header';
import PageEditor, { type PageEditorRef } from '@/components/page-editor';
import NoteBurningEffect from '@/components/note-burning-effect';
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
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';
import html2canvas from 'html2canvas';


type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

const ANIMATION_DURATION = 3000;

export default function AshgroundApp() {
  const [noteTitle, setNoteTitle] = useState<string>('Untitled Note');
  const [noteContent, setNoteContent] = useState<string>('<p></p>');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pageBackground, setPageBackground] = useState<PageBackground>('plain');
  const [pageTheme, setPageTheme] = useState<PageTheme>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const [isBurningAnimationActive, setIsBurningAnimationActive] = useState(false);
  const [animationTargetRect, setAnimationTargetRect] = useState<DOMRect | null>(null);
  const [animationSourceElement, setAnimationSourceElement] = useState<HTMLElement | null>(null);
  const [contentForBurn, setContentForBurn] = useState<string>('');


  const editorRef = useRef<Editor | null>(null);
  const pageEditorComponentRef = useRef<PageEditorRef>(null);
  const { toast } = useToast();


  const [currentDrawTool, setCurrentDrawTool] = useState<string | null>(null);
  const [drawColor, setDrawColor] = useState<string>('#000000');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState<number>(2);
  const [currentLineStyle, setCurrentLineStyle] = useState<LineStyle>('solid');


  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const savedTitle = localStorage.getItem('ashground_title');
      const savedNote = localStorage.getItem('ashground_note');
      const savedBg = localStorage.getItem('ashground_bg') as PageBackground | null;
      const savedTheme = localStorage.getItem('ashground_theme') as PageTheme | null;

      if (savedTitle) setNoteTitle(savedTitle);
      setNoteContent(savedNote || '<p></p>');

      if (savedBg) setPageBackground(savedBg);

      const htmlClasses = document.documentElement.classList;
      htmlClasses.remove('dark', 'theme-pastel'); 

      if (savedTheme) {
        if (savedTheme === 'dark') {
          htmlClasses.add('dark');
        } else if (savedTheme === 'pastel') {
          htmlClasses.add('theme-pastel');
        }
        setPageTheme(savedTheme);
      } else {
        setPageTheme('light'); 
      }
    }
  }, [isMounted]);


  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_title', noteTitle);
    }
  }, [noteTitle, isMounted]);

  useEffect(() => {
    if(isMounted && noteContent !== undefined && isEditorInitialized) {
      localStorage.setItem('ashground_note', noteContent);
    }
  }, [noteContent, isMounted, isEditorInitialized]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_bg', pageBackground);
    }
  }, [pageBackground, isMounted]);

  useEffect(() => {
    if(isMounted) {
      localStorage.setItem('ashground_theme', pageTheme);
      const htmlClasses = document.documentElement.classList;
      htmlClasses.remove('dark', 'theme-pastel'); 
      if (pageTheme === 'dark') {
        htmlClasses.add('dark');
      } else if (pageTheme === 'pastel') {
        htmlClasses.add('theme-pastel');
      }
    }
  }, [pageTheme, isMounted]);

  useEffect(() => {
    if (activeTab !== 'draw') {
      setCurrentDrawTool(null);
    }
  }, [activeTab]);

  const handleEditorReady = useCallback(() => {
    setIsEditorInitialized(true);
  }, []);

  const handleNoteContentChange = useCallback((newContent: string) => {
    setNoteContent(prevContent => {
      if (prevContent === newContent) {
        return prevContent; 
      }
      return newContent;
    });
  }, []);


  const handleClearCanvas = () => {
    if (pageEditorComponentRef.current) {
      pageEditorComponentRef.current.clearCanvas();
    }
    setCurrentDrawTool(null);
  };

  const getExportableElementForPdf = () => {
    if (pageEditorComponentRef.current) {
      return pageEditorComponentRef.current.getExportableElement();
    }
    return null;
  };

  const handleBurnEverything = async () => {
    const exportableElement = pageEditorComponentRef.current?.getExportableElement();
    if (exportableElement) {
      
      if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
        (document.activeElement as HTMLElement).blur();
      }
      await new Promise(resolve => setTimeout(resolve, 100));

      try {
        const canvas = await html2canvas(exportableElement, {
          scale: 1.5,
          useCORS: true,
          backgroundColor: null, 
        });
        const imageDataUri = canvas.toDataURL('image/png');
        
        setContentForBurn(imageDataUri);
        setAnimationTargetRect(exportableElement.getBoundingClientRect());
        setAnimationSourceElement(exportableElement); 
        setIsBurningAnimationActive(true);

        setTimeout(() => {
          setNoteTitle('Untitled Note');
          setNoteContent('<p></p>');
          if (pageEditorComponentRef.current) {
            pageEditorComponentRef.current.clearCanvas();
          }
          localStorage.removeItem('ashground_title');
          localStorage.removeItem('ashground_note');

          setIsBurningAnimationActive(false);
          setAnimationTargetRect(null);
          setAnimationSourceElement(null);
          setContentForBurn('');

          
        }, ANIMATION_DURATION);

      } catch (error) {
        console.error("Error capturing note for burning:", error);
        toast({
          title: "Burn Failed",
          description: "Could not capture the note content for burning.",
          variant: "destructive",
        });
        
        setNoteTitle('Untitled Note');
        setNoteContent('<p></p>');
        if (pageEditorComponentRef.current) pageEditorComponentRef.current.clearCanvas();
        localStorage.removeItem('ashground_title');
        localStorage.removeItem('ashground_note');
      }
    } else {
       
      setNoteTitle('Untitled Note');
      setNoteContent('<p></p>');
      if (pageEditorComponentRef.current) pageEditorComponentRef.current.clearCanvas();
      localStorage.removeItem('ashground_title');
      localStorage.removeItem('ashground_note');
      
    }
  };

  const tabItems = [
    { value: 'home', label: 'Home' },
    { value: 'draw', label: 'Draw' },
    { value: 'view', label: 'View' },
    { value: 'export', label: 'Export' },
  ];

  const appContent = (
    <>
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
              variant="outline"
              className="ml-4 rounded-full h-10 w-10
                         border-2 border-amber-500 dark:border-amber-400
                         bg-muted/30 dark:bg-muted/20
                         text-amber-500 dark:text-amber-400
                         shadow-md hover:shadow-lg
                         hover:bg-amber-500/10 dark:hover:bg-amber-400/10
                         hover:text-amber-600 dark:hover:text-amber-300
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:focus-visible:ring-amber-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background
                         transition-all duration-150 ease-in-out flex items-center justify-center"
              title="Yeet Note"
              disabled={!isEditorInitialized || isBurningAnimationActive}
            >
              <Flame className="w-5 h-5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle> Burn it down like my GPA </AlertDialogTitle>
              <AlertDialogDescription>
                No more EmOtIoNaL DaMaGe
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
          onNoteChange={handleNoteContentChange}
          backgroundStyle={pageBackground}
          pageTheme={pageTheme}
          isDrawingMode={activeTab === 'draw'}
          currentDrawTool={currentDrawTool}
          drawColor={drawColor}
          drawStrokeWidth={drawStrokeWidth}
          currentLineStyle={currentLineStyle}
          onDrawColorChange={setDrawColor}
        />
      </Tabs>
    </>
  );


  return (
    <main className="flex flex-col items-center min-h-screen py-6 px-4 overflow-x-hidden">
      <AshgroundHeader />

      {isBurningAnimationActive && animationTargetRect && animationSourceElement && contentForBurn && (
        <NoteBurningEffect
          isActive={isBurningAnimationActive}
          targetRect={animationTargetRect}
          duration={ANIMATION_DURATION}
          sourceElement={animationSourceElement}
          noteImageUri={contentForBurn}
        />
      )}

      <div className={cn("w-full transition-opacity duration-300", isBurningAnimationActive ? "opacity-0 pointer-events-none" : "opacity-100")}>
        {isMounted ? appContent : null} 
      </div>
    </main>
  );
}
