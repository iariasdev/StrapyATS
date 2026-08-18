'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, Footer, HistoryModal, ChromeExtensionModal } from '@/components';
import { ProfileView } from '@/features/profile';
import { getSavedAnalyses, deleteSavedAnalysis, clearSavedAnalyses } from '@/lib/utils';
import { SavedAnalysis } from '@/lib/types';

export default function ProfilePage() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExtensionGuideOpen, setIsExtensionGuideOpen] = useState(false);
  const [savedAnalyses, setSavedAnalyses] = useState<SavedAnalysis[]>([]);

  useEffect(() => {
    setSavedAnalyses(getSavedAnalyses());
  }, []);

  const handleDeleteHistoryItem = (id: string) => {
    const updated = deleteSavedAnalysis(id);
    setSavedAnalyses(updated);
  };

  const handleClearHistory = () => {
    clearSavedAnalyses();
    setSavedAnalyses([]);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between font-sans">
      <Navbar
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenExtensionGuide={() => setIsExtensionGuideOpen(true)}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        <ProfileView />
      </main>

      <Footer />

      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedAnalyses={savedAnalyses}
        onSelectAnalysis={() => {}}
        onClearHistory={handleClearHistory}
        onDeleteAnalysis={handleDeleteHistoryItem}
      />

      <ChromeExtensionModal
        isOpen={isExtensionGuideOpen}
        onClose={() => setIsExtensionGuideOpen(false)}
      />
    </div>
  );
}
