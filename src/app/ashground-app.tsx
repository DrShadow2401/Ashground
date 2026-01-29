'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import PageEditor, { type PageEditorRef } from '@/components/page-editor';
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
import { Flame, Home, Brush, Eye, Upload, MessageSquare, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CelestialSphere } from '@/components/ui/celestial-sphere';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LimelightNav } from '@/components/ui/limelight-nav';
import { useIsMobile } from '@/hooks/use-mobile';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import BurnAnimation from '@/components/ui/burn-animation';
import html2canvas from 'html2canvas';
import UnsentExperience from '@/components/unsent-experience';


type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark';
export type LineStyle = 'solid' | 'dashed' | 'dotted';

const ANIMATION_DURATION = 5000;

export default function AshgroundApp() {
  const [activeToolPanel, setActiveToolPanel] = useState('home');
  const [noteTitle, setNoteTitle] = useState<string>('Untitled Note');
  const [noteContent, setNoteContent] = useState<string>('<p></p>');
  const [pageBackground, setPageBackground] = useState<PageBackground>('plain');
  const [pageTheme, setPageTheme] = useState<PageTheme>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  const [isBurningAnimationActive, setIsBurningAnimationActive] = useState(false);
  const [burnImageUri, setBurnImageUri] = useState<string | null>(null);

  const editorRef = useRef<Editor | null>(null);
  const pageEditorComponentRef = useRef<PageEditorRef>(null);

  const isMobile = useIsMobile();
  const [isMobileSheetOpen, setMobileSheetOpen] = useState(false);

  const [currentDrawTool, setCurrentDrawTool] = useState<string | null>(null);
  const [drawColor, setDrawColor] = useState<string>('#000000');
  const [drawStrokeWidth, setDrawStrokeWidth] = useState<number>(2);
  const [currentLineStyle, setCurrentLineStyle] = useState<LineStyle>('solid');
  const [canUndoDrawing, setCanUndoDrawing] = useState<boolean>(false);

  const isDrawingMode = activeToolPanel === 'draw';

  const navItems = [
    { id: 'home', icon: <Home />, label: 'Home' },
    { id: 'draw', icon: <Brush />, label: 'Draw' },
    { id: 'view', icon: <Eye />, label: 'View' },
    { id: 'export', icon: <Upload />, label: 'Export' },
    { id: 'unsent', icon: <MessageSquare />, label: 'Unsent' },
  ];

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
      htmlClasses.remove('dark');

      if (savedTheme) {
        if (savedTheme === 'dark') {
          htmlClasses.add('dark');
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
      htmlClasses.remove('dark');
      if (pageTheme === 'dark') {
        htmlClasses.add('dark');
      }
    }
  }, [pageTheme, isMounted]);

  useEffect(() => {
    if (!isDrawingMode && currentDrawTool !== null) {
      setCurrentDrawTool(null);
    }
  }, [isDrawingMode, currentDrawTool]);

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
  
  const handleUndoDrawing = () => {
    if (pageEditorComponentRef.current) {
      pageEditorComponentRef.current.undoDrawing();
    }
  };

  const handleDrawingUndoStateChange = useCallback((canUndo: boolean) => {
    setCanUndoDrawing(canUndo);
  }, []);


  const getExportableElementForPdf = () => {
    if (pageEditorComponentRef.current) {
      return pageEditorComponentRef.current.getExportableElement();
    }
    return null;
  };

  const handleBurnEverything = async () => {
    const exportableElement = getExportableElementForPdf();
    if (!exportableElement) return;

    const originalBackgroundColor = exportableElement.style.backgroundColor;
    const computedStyle = window.getComputedStyle(exportableElement);
    const solidBgColor = {
      'light': '#F8F5F0',
      'dark': '#18181b', // Approximation from dark theme vars
    }[pageTheme] || computedStyle.backgroundColor;

    exportableElement.style.backgroundColor = solidBgColor;

    try {
      const canvas = await html2canvas(exportableElement, {
        scale: 2,
        useCORS: true,
        backgroundColor: null, 
        removeContainer: true,
      });
      const imageUri = canvas.toDataURL('image/png');
      setBurnImageUri(imageUri);
      setIsBurningAnimationActive(true);
    } catch (error) {
      console.error("Failed to capture note for burning:", error);
    } finally {
      exportableElement.style.backgroundColor = originalBackgroundColor;
    }

    setTimeout(() => {
      setNoteTitle('Untitled Note');
      setNoteContent('<p></p>');
      if (pageEditorComponentRef.current) {
        pageEditorComponentRef.current.clearCanvas();
      }
      localStorage.removeItem('ashground_title');
      localStorage.removeItem('ashground_note');

      setIsBurningAnimationActive(false);
      setBurnImageUri(null);
    }, ANIMATION_DURATION);
  };
  
  const handleCloseUnsent = () => {
    setActiveToolPanel('home');
  };

  const ToolPanelsContent = (
    <ScrollArea className="h-full p-4">
        {activeToolPanel === 'home' && (isEditorInitialized ? <HomeTools editorRef={editorRef} /> : <p className="text-muted-foreground text-sm px-4">Editor loading...</p>)}
        {activeToolPanel === 'draw' && (
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
                onUndoDrawing={handleUndoDrawing}
                canUndoDrawing={canUndoDrawing}
            />
        )}
        {activeToolPanel === 'view' && (
            <ViewTools
                selectedBackground={pageBackground}
                onBackgroundChange={setPageBackground}
                selectedTheme={pageTheme}
                onThemeChange={setPageTheme}
            />
        )}
         {activeToolPanel === 'export' && (
            <ExportTools noteTitle={noteTitle} getExportableElement={getExportableElementForPdf} />
        )}
    </ScrollArea>
  );

  return (
    <div className="main-app-container h-full w-full">
      <div className={cn("relative w-full h-full")}>
        <CelestialSphere
          hue={250}
          speed={0.2}
          zoom={1.1}
          particleSize={3.0}
          className="fixed top-0 left-0 w-full h-full -z-10 hidden dark:block"
        />

        {isBurningAnimationActive && burnImageUri && (
          <BurnAnimation bgImageUri={burnImageUri} isLightMode={pageTheme === 'light'} />
        )}
        
        <div className={cn(
          "w-full transition-opacity duration-300 z-10 p-4 flex flex-col h-full",
          isBurningAnimationActive ? "opacity-0 pointer-events-none" : "opacity-100"
        )}>
            {isMounted ? (
              <>
                <div className="flex-shrink-0 mb-4">
                  <div className="flex justify-between items-center mb-4">
                    <h1 className="font-headline text-2xl font-bold text-foreground">ASHGROUND</h1>
                    
                    <div className="flex items-center gap-2">
                      {isMobile && activeToolPanel !== 'unsent' && (
                        <Sheet open={isMobileSheetOpen} onOpenChange={setMobileSheetOpen}>
                          <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="h-10 w-10">
                              <Menu className="h-5 w-5"/>
                            </Button>
                          </SheetTrigger>
                          <SheetContent side="left" className="p-0 w-[300px]">
                             <SheetHeader className="p-4 border-b">
                               <SheetTitle className="sr-only">Tool Panel</SheetTitle>
                               <SheetDescription className="sr-only">Select a tool to use.</SheetDescription>
                             </SheetHeader>
                            <div className="flex flex-col h-full">
                              <div className="p-4 flex justify-center border-b">
                                <LimelightNav
                                    items={navItems}
                                    defaultActiveIndex={navItems.findIndex(item => item.id === activeToolPanel)}
                                    onTabChange={(index) => setActiveToolPanel(navItems[index].id)}
                                />
                              </div>
                              <div className="flex-grow">
                                {ToolPanelsContent}
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      )}
                      
                      {activeToolPanel !== 'unsent' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="outline"
                              className="rounded-full h-10 w-10 border-2 border-amber-500 dark:border-amber-400 bg-transparent text-amber-500 dark:text-amber-400 shadow-md hover:shadow-lg hover:bg-amber-500/10 dark:hover:bg-amber-400/10 hover:text-amber-600 dark:hover:text-amber-300"
                              title="Burn it Down"
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
                      )}
                    </div>
                  </div>
                  {!isMobile && (
                    <div className="flex justify-center">
                       <LimelightNav
                          items={navItems}
                          defaultActiveIndex={navItems.findIndex(item => item.id === activeToolPanel)}
                          onTabChange={(index) => setActiveToolPanel(navItems[index].id)}
                          className="mx-auto"
                          />
                    </div>
                  )}
                </div>
                
                <div className="flex-grow min-h-0 flex flex-col">
                  {activeToolPanel === 'unsent' ? (
                    <div className="h-full">
                      <UnsentExperience onClose={handleCloseUnsent} />
                    </div>
                  ) : (
                    <>
                      {isMobile ? (
                         <div className="h-full rounded-lg border bg-card/50 backdrop-blur-sm">
                            <ScrollArea className="h-full">
                              <div className="p-2 sm:p-3 min-h-full">
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
                                      isDrawingMode={isDrawingMode}
                                      currentDrawTool={currentDrawTool}
                                      drawColor={drawColor}
                                      drawStrokeWidth={drawStrokeWidth}
                                      currentLineStyle={currentLineStyle}
                                      onDrawColorChange={setDrawColor}
                                      onUndoStateChange={handleDrawingUndoStateChange}
                                  />
                                </div>
                            </ScrollArea>
                          </div>
                      ) : (
                        <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border bg-card/50 backdrop-blur-sm">
                            <ResizablePanel defaultSize={20} minSize={15} className="!overflow-y-auto p-0">
                               {ToolPanelsContent}
                            </ResizablePanel>
  
                            <ResizableHandle withHandle />
  
                            <ResizablePanel defaultSize={80} className="bg-transparent p-0">
                              <ScrollArea className="h-full">
                                 <div className="p-2 md:p-4 min-h-full">
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
                                        isDrawingMode={isDrawingMode}
                                        currentDrawTool={currentDrawTool}
                                        drawColor={drawColor}
                                        drawStrokeWidth={drawStrokeWidth}
                                        currentLineStyle={currentLineStyle}
                                        onDrawColorChange={setDrawColor}
                                        onUndoStateChange={handleDrawingUndoStateChange}
                                    />
                                  </div>
                              </ScrollArea>
                            </ResizablePanel>
                        </ResizablePanelGroup>
                      )}
                    </>
                  )}
                </div>
              </>
            ) : null}
        </div>
      </div>
    </div>
  );
}
