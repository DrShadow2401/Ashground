
'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Editor } from '@tiptap/react';
import AshgroundHeader from '@/components/ashground-header';
import PageEditor from '@/components/page-editor';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomeTools from '@/components/tool-sections/home-tools';
import DrawTools from '@/components/tool-sections/draw-tools';
import ViewTools from '@/components/tool-sections/view-tools';
import ExportTools from '@/components/tool-sections/export-tools';


type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';

export default function Home() {
  const [noteTitle, setNoteTitle] = useState<string>('Untitled Note');
  const [noteContent, setNoteContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pageBackground, setPageBackground] = useState<PageBackground>('plain');
  const [pageTheme, setPageTheme] = useState<PageTheme>('light');
  const [isMounted, setIsMounted] = useState(false);
  const [isEditorInitialized, setIsEditorInitialized] = useState(false);
  
  const editorRef = useRef<Editor | null>(null);
  const pageEditorRef = useRef<{ clearCanvas: () => void }>(null);


  // Drawing specific state
  const [currentDrawTool, setCurrentDrawTool] = useState<string | null>(null);
  const [drawColor, setDrawColor] = useState<string>('#000000'); 
  const [drawStrokeWidth, setDrawStrokeWidth] = useState<number>(2); 


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
    if(isMounted) {
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
    if (activeTab !== 'draw') {
      setCurrentDrawTool(null); // Deselect drawing tool if not on draw tab
    }
  }, [activeTab]);

  const handleEditorReady = useCallback(() => {
    setIsEditorInitialized(true);
  }, []);

  if (!isMounted) {
    return null; 
  }

  const handleClearCanvas = () => {
    if (pageEditorRef.current) {
      pageEditorRef.current.clearCanvas();
    }
  };

  const tabItems = [
    { value: 'home', label: 'Home' },
    { value: 'draw', label: 'Draw' },
    { value: 'view', label: 'View' },
    { value: 'export', label: 'Export' },
  ];

  return (
    <main className="flex flex-col items-center min-h-screen py-6 px-4">
      <AshgroundHeader />

      <Tabs defaultValue="home" value={activeTab} onValueChange={setActiveTab} className="w-full max-w-4xl mt-3 md:mt-4">
        <TabsList className="mx-auto w-full max-w-sm bg-card rounded-xl shadow-lg p-1.5 mb-8 flex justify-around">
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
            {activeTab === 'export' && <ExportTools noteContent={noteContent} />}
          </div>
        </div>
        
        <PageEditor
          ref={pageEditorRef}
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
        />
      </Tabs>
    </main>
  );
}

