'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UnsentMessages from '@/components/unsent-messages';
import UnsentLetter from '@/components/unsent-letter';

export default function UnsentPanel() {
  return (
    <Tabs defaultValue="messages" className="w-full flex-grow flex flex-col bg-card/50 backdrop-blur-sm rounded-lg border">
      <div className="flex justify-center flex-shrink-0 p-4 border-b">
        <TabsList>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="letter">Letter</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="messages" className="flex-grow mt-0 data-[state=inactive]:hidden">
        <UnsentMessages />
      </TabsContent>
      <TabsContent value="letter" className="flex-grow mt-0 data-[state=inactive]:hidden">
        <UnsentLetter />
      </TabsContent>
    </Tabs>
  );
}
