import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  FileText,
  MessageSquare,
  Image as ImageIcon,
  Sparkles,
  MousePointer,
  HelpCircle,
  Copy,
  Languages,
  ScanText,
  Mic,
  Maximize2,
  Minus,
  X,
  ExternalLink,
  Code2,
  FolderOpen,
} from 'lucide-react';
import { Coordinates } from '../types';

interface SimulatorDesktopProps {
  cursorPos: Coordinates;
  onOpenHUD: (pos?: Coordinates) => void;
  activeTargetText: string;
  onTargetTextChange: (text: string) => void;
  onTranslateSelected: (text: string) => void;
  onStartOCR: () => void;
  onOpenWindowsExport: () => void;
  onOpenAIChat: () => void;
  isWindowPinned?: boolean;
}

export const SimulatorDesktop: React.FC<SimulatorDesktopProps> = ({
  cursorPos,
  onOpenHUD,
  activeTargetText,
  onTargetTextChange,
  onTranslateSelected,
  onStartOCR,
  onOpenWindowsExport,
  onOpenAIChat,
  isWindowPinned = false,
}) => {
  // Selection handling for instant translation
  const handleMouseUpSelection = () => {
    const selection = window.getSelection()?.toString().trim();
    if (selection && selection.length > 2) {
      // User selected text on screen!
    }
  };

  return (
    <div
      id="simulator-desktop-canvas"
      onMouseUp={handleMouseUpSelection}
      className="relative w-full h-[calc(100vh-68px-56px)] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 select-text"
    >
      {/* Subtle Desktop Background Mesh & Windows Wallpaper Aesthetic */}
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px]" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Desktop Grid Layout with Realistic Floating Windows */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 h-full max-w-7xl mx-auto pb-2">
        
        {/* ========================================================
            WINDOW 1: DOKUMENT / FAKTURA (Tekst do OCR i Tłumaczenia)
            ======================================================== */}
        <div className="lg:col-span-4 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Window Titlebar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-semibold text-slate-200">
                Dokument_Faktura_EN.pdf
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-amber-500 cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-emerald-500 cursor-pointer" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-700 hover:bg-rose-500 cursor-pointer" />
            </div>
          </div>

          {/* Window Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs leading-relaxed text-slate-300">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
              <div className="flex justify-between font-bold text-slate-100">
                <span>INVOICE #9821</span>
                <span className="text-emerald-400">TOTAL: $1,450.00 USD</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Recipient: John Doe Software Sp. z o.o.
              </p>
              <div className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1.5">
                <p><b>Description:</b> Cloud server hosting and AI processing units.</p>
                <p><b>Payment Terms:</b> Please pay the total amount within 14 days of receipt.</p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
              <h5 className="font-bold text-amber-300 text-xs">Achtung! Wichtiger Hinweis (DE)</h5>
              <p className="text-[11px]">
                Bitte beachten Sie, dass alle unbezahlten Rechnungen nach dem Fälligkeitsdatum automatisch Mahngebühren verursachen.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 text-slate-300">
              <h5 className="font-bold text-cyan-300 text-xs">Information importante (FR)</h5>
              <p className="text-[11px]">
                Merci de confirmer la réception de ce document par retour de courrier électronique.
              </p>
            </div>

            {/* Quick action bar */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() =>
                  onTranslateSelected(
                    'Please pay the total amount within 14 days of receipt.'
                  )
                }
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 font-semibold text-[11px] transition-colors cursor-pointer"
              >
                <Languages className="w-3.5 h-3.5" />
                Tłumacz ten dokument
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================
            WINDOW 2: AKTYWNY NOTATNIK / KOMUNIKATOR (Pasting Target)
            ======================================================== */}
        <div className="lg:col-span-5 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Window Titlebar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-semibold text-slate-200">
                Aktywny Edytor / Pole Tekstowe (Wklejanie z mowy i OCR)
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
              Aktywny Kursor
            </span>
          </div>

          {/* Window Content */}
          <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 flex items-center justify-between">
                <span>Zawartość dokumentu (tutaj trafia tekst z mikrofonu i OCR):</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {activeTargetText.length} znaków
                </span>
              </label>
              <textarea
                value={activeTargetText}
                onChange={(e) => onTargetTextChange(e.target.value)}
                placeholder="Tutaj pojawi się tekst, gdy użyjesz opcji 'Wklej w kursor' z Mowy na tekst (STT) lub OCR..."
                rows={8}
                className="w-full flex-1 p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 placeholder:text-slate-600 text-sm focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500/30 resize-none font-sans leading-relaxed"
              />
            </div>

            {/* Quick Action Tools in Editor */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onOpenHUD(cursorPos)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-blue-500/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Otwórz Menu (Alt+Q)
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => onTargetTextChange('')}
                  className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 text-xs hover:bg-slate-800"
                >
                  Wyczyść
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(activeTargetText);
                  }}
                  disabled={!activeTargetText}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 disabled:opacity-40"
                >
                  <Copy className="w-3 h-3" />
                  Kopiuj
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            WINDOW 3: OBRAZ ZE ZNAKAMI DO OCR & INSTRUKCJA SKRÓTÓW
            ======================================================== */}
        <div className="lg:col-span-3 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl backdrop-blur-xl overflow-hidden">
          {/* Titlebar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 select-none">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Zrzut Obrazu (Do OCR)
              </span>
            </div>
            <button
              onClick={onStartOCR}
              className="text-[10px] text-emerald-400 font-bold hover:underline"
            >
              Wytnij
            </button>
          </div>

          {/* Window Content */}
          <div className="flex-1 p-3.5 space-y-3 overflow-y-auto">
            {/* Visual Graphic Mock representing an image with embedded text */}
            <div className="relative p-3 rounded-xl bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 border border-slate-800 text-center space-y-2 overflow-hidden group">
              <div className="w-full py-3 px-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold">
                ⚠️ WARNING: RESTRICTED ACCESS AREA
              </div>
              <p className="text-[11px] text-slate-300 font-medium leading-tight">
                Authorized Personnel Only. Contact support@techcorp.com for security badge clearance.
              </p>

              <button
                onClick={onStartOCR}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <ScanText className="w-3.5 h-3.5" />
                Odczytaj tekst z tego obrazu
              </button>
            </div>

            {/* Quick Hotkey Cheat Sheet */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-2 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-blue-400" />
                <span>Skróty Klawiszowe:</span>
              </div>
              <ul className="space-y-1.5 text-[11px] text-slate-400 font-mono">
                <li className="flex items-center justify-between">
                  <span>Menu przy kursorze:</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 text-blue-300 rounded border border-slate-700">
                    Alt + Q
                  </kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Mowa na tekst:</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 text-amber-300 rounded border border-slate-700">
                    Klawisz 1
                  </kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>Tłumacz na PL:</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">
                    Klawisz 2
                  </kbd>
                </li>
                <li className="flex items-center justify-between">
                  <span>OCR z obrazu:</span>
                  <kbd className="px-1.5 py-0.5 bg-slate-800 text-emerald-300 rounded border border-slate-700">
                    Klawisz 3
                  </kbd>
                </li>
              </ul>
            </div>

            {/* Native Windows Export Callout */}
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Code2 className="w-3.5 h-3.5 text-indigo-400" />
                  Program na Windows
                </span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded font-mono">
                  Python
                </span>
              </div>
              <p className="text-[11px] text-indigo-300/80 leading-tight">
                Chcesz ten HUD bezpośrednio na swoim pulpicie Windows?
              </p>
              <button
                onClick={onOpenWindowsExport}
                className="w-full flex items-center justify-center gap-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Pobierz kod (.py / .bat)
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Floating Cursor Position Radar & Summon Trigger (Bottom Right) */}
      <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2">
        <button
          id="summon-hud-floating-btn"
          onClick={() => onOpenHUD(cursorPos)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-2xl shadow-blue-500/30 border border-white/20 transition-all transform hover:scale-105 cursor-pointer"
        >
          <MousePointer className="w-4 h-4 animate-bounce" />
          <span>Otwórz Menu przy Kursorze (Alt+Q)</span>
        </button>
      </div>
    </div>
  );
};
