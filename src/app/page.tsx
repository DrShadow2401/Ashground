
'use client';

import React, { useState, useEffect } from 'react';
import AshgroundHeader from '@/components/ashground-header';
import PageEditor from '@/components/page-editor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HomeTools from '@/components/tool-sections/home-tools';
import DrawTools from '@/components/tool-sections/draw-tools';
import ViewTools from '@/components/tool-sections/view-tools';
import ExportTools from '@/components/tool-sections/export-tools';
import { cn } from '@/lib/utils';

type PageBackground = 'plain' | 'lined' | 'grid';
type PageTheme = 'light' | 'dark' | 'pastel';

export default function Home() {
  const [noteContent, setNoteContent] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [pageBackground, setPageBackground] = useState<PageBackground>('plain');
  const [pageTheme, setPageTheme] = useState<PageTheme>('light');

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const savedNote = localStorage.getItem('ashground_note');
    const savedBg = localStorage.getItem('ashground_bg') as PageBackground | null;
    const savedTheme = localStorage.getItem('ashground_theme') as PageTheme | null;

    if (savedNote) setNoteContent(savedNote);
    if (savedBg) setPageBackground(savedBg);

    const htmlClasses = document.documentElement.classList;
    if (savedTheme) {
      setPageTheme(savedTheme); // Set state first
      if (savedTheme === 'dark') {
        htmlClasses.remove('theme-pastel');
        htmlClasses.add('dark');
      } else if (savedTheme === 'pastel') {
        htmlClasses.remove('dark');
        htmlClasses.add('theme-pastel');
      } else { // 'light'
        htmlClasses.remove('dark');
        htmlClasses.remove('theme-pastel');
      }
    } else {
      // Default to light app theme if no saved theme
       htmlClasses.remove('dark');
       htmlClasses.remove('theme-pastel');
    }
  }, []);

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
      } else { // 'light'
        htmlClasses.remove('dark');
        htmlClasses.remove('theme-pastel');
      }
    }
  }, [pageTheme, isMounted]);

  if (!isMounted) {
    // Render nothing or a loading indicator SSR/hydration mismatch
    return null;
  }

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
        <TabsList className="mx-auto w-full max-w-sm bg-card rounded-xl shadow-lg p-1.5 mb-8 flex justify-around items-center">
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
          <div className="bg-muted p-3 rounded-lg shadow-inner">
            {activeTab === 'home' && <HomeTools />}
            {activeTab === 'draw' && <DrawTools />}
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

        <TabsContent value="home" className="mt-0">
          <PageEditor
            noteContent={noteContent}
            onNoteChange={setNoteContent}
            backgroundStyle={pageBackground}
            pageTheme={pageTheme}
          />
        </TabsContent>
        <TabsContent value="draw" className="mt-0">
          <PageEditor
            noteContent={noteContent}
            onNoteChange={setNoteContent}
            backgroundStyle={pageBackground}
            pageTheme={pageTheme}
          />
        </TabsContent>
        <TabsContent value="view" className="mt-0">
           <PageEditor
            noteContent={noteContent}
            onNoteChange={setNoteContent}
            backgroundStyle={pageBackground}
            pageTheme={pageTheme}
          />
        </TabsContent>
        <TabsContent value="export" className="mt-0">
          <PageEditor
            noteContent={noteContent}
            onNoteChange={setNoteContent}
            backgroundStyle={pageBackground}
            pageTheme={pageTheme}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}
