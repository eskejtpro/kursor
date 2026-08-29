"""
================================================================================
KURSORASSIST - INTELIGENTNY HUD UŁATWIEŃ DOSTĘPU & PASEK ZADAŃ DLA WINDOWS
Wersja: 2.0 (Offline AI / Bez API)
================================================================================
Instrukcja uruchomienia:
  1. Wymagane podstawowe pakiety (opcjonalnie PyQt5 dla nowoczesnego wyglądu):
     pip install keyboard pyautogui pyperclip

  2. Pakiety dla funkcji AI & Multimediów (opcjonalne):
     pip install PyQt5 pytesseract pillow speechrecognition deep-translator pyttsx3

  3. Uruchomienie programu:
     python kursor_assist.py

  4. Skrót aktywacji:
     Wciśnij [Alt + Q] lub [Ctrl + Spacja] w dowolnym miejscu systemu Windows!
================================================================================
"""

import sys
import os
import time
import threading
import webbrowser
import ctypes
import subprocess
from datetime import datetime

# Próba importu modułów pomocniczych
try:
    import keyboard
    HAS_KEYBOARD = True
except ImportError:
    HAS_KEYBOARD = False

try:
    import pyautogui
    HAS_PYAUTOGUI = True
except ImportError:
    HAS_PYAUTOGUI = False

try:
    import pyperclip
    HAS_PYPERCLIP = True
except ImportError:
    HAS_PYPERCLIP = False

try:
    from PIL import ImageGrab, Image
    import pytesseract
    HAS_OCR = True
except ImportError:
    HAS_OCR = False

try:
    import speech_recognition as sr
    HAS_SR = True
except ImportError:
    HAS_SR = False

try:
    from deep_translator import GoogleTranslator
    HAS_TRANSLATOR = True
except ImportError:
    HAS_TRANSLATOR = False

try:
    import pyttsx3
    HAS_TTS = True
except ImportError:
    HAS_TTS = False


# ==============================================================================
# FUNKCJE SYSTEMOWE WINDOWS (WIN32 API)
# ==============================================================================
PINNED_HWNDS = set()
IS_MIC_MUTED = False
CLIPBOARD_HISTORY = []

def win32_get_foreground_window():
    if sys.platform == "win32":
        return ctypes.windll.user32.GetForegroundWindow()
    return 0

def win32_toggle_always_on_top():
    """Przypina lub odpina aktywne okno Windows (Always on Top)"""
    if sys.platform != "win32":
        print("[Info] Funkcja Always on Top jest dostępna w systemie Windows.")
        return False

    user32 = ctypes.windll.user32
    hwnd = user32.GetForegroundWindow()
    if not hwnd:
        return False

    HWND_TOPMOST = -1
    HWND_NOTOPMOST = -2
    SWP_NOMOVE = 0x0002
    SWP_NOSIZE = 0x0001
    SWP_SHOWWINDOW = 0x0040

    is_pinned = hwnd in PINNED_HWNDS
    target_flag = HWND_NOTOPMOST if is_pinned else HWND_TOPMOST
    user32.SetWindowPos(hwnd, target_flag, 0, 0, 0, 0, SWP_NOMOVE | SWP_NOSIZE | SWP_SHOWWINDOW)

    if is_pinned:
        PINNED_HWNDS.remove(hwnd)
        print(f"[KursorAssist] Odpięto okno HWND: {hwnd}")
        return False
    else:
        PINNED_HWNDS.add(hwnd)
        print(f"[KursorAssist] Przypięto okno na wierzch HWND: {hwnd}")
        return True

def win32_force_kill_foreground():
    """Wymusza natychmiastowe zabicie procesu aktywnego okna (taskkill /F)"""
    if sys.platform != "win32":
        return False

    user32 = ctypes.windll.user32
    hwnd = user32.GetForegroundWindow()
    if not hwnd:
        return False

    pid = ctypes.c_ulong()
    user32.GetWindowThreadProcessId(hwnd, ctypes.byref(pid))
    if pid.value > 0:
        try:
            subprocess.run(f"taskkill /F /PID {pid.value}", shell=True, check=True)
            print(f"[KursorAssist] Zabito zawieszony proces PID: {pid.value}")
            return True
        except Exception as e:
            print(f"[Błąd] Nie udało się zabić procesu: {e}")
    return False

def win32_toggle_mic_mute():
    """Globalne wyciszenie / aktywacja mikrofonu w Windows"""
    global IS_MIC_MUTED
    IS_MIC_MUTED = not IS_MIC_MUTED
    if sys.platform == "win32":
        VK_VOLUME_MUTE = 0xAD
        ctypes.windll.user32.keybd_event(VK_VOLUME_MUTE, 0, 0, 0)
        ctypes.windll.user32.keybd_event(VK_VOLUME_MUTE, 0, 2, 0)
    print(f"[KursorAssist] Mikrofon: {'WYCISZONY' if IS_MIC_MUTED else 'AKTYWNY'}")
    return IS_MIC_MUTED


# ==============================================================================
# IMPLEMENTACJA 1: NOWOCZESNY INTERFEJS PYQT5 (FLUENT DARK DESIGN)
# ==============================================================================
try:
    from PyQt5 import QtCore, QtGui, QtWidgets
    from PyQt5.QtCore import Qt, QPoint, pyqtSignal, QObject
    from PyQt5.QtWidgets import (
        QApplication, QWidget, QVBoxLayout, QHBoxLayout, QGridLayout,
        QPushButton, QLabel, QLineEdit, QTextEdit, QScrollArea, QFrame,
        QSystemTrayIcon, QMenu, QAction, QMessageBox
    )
    USE_PYQT5 = True
except ImportError:
    USE_PYQT5 = False


if USE_PYQT5:
    class Communicator(QObject):
        trigger_show = pyqtSignal(int, int)
        trigger_hide = pyqtSignal()
        trigger_mic = pyqtSignal()

    class ModernHUDWindow(QWidget):
        def __init__(self):
            super().__init__()
            self.setWindowFlags(Qt.FramelessWindowHint | Qt.WindowStaysOnTopHint | Qt.SubWindow)
            self.setAttribute(Qt.WA_TranslucentBackground, True)
            self.comm = Communicator()
            self.comm.trigger_show.connect(self.show_at_pos)
            self.comm.trigger_hide.connect(self.hide)
            self.comm.trigger_mic.connect(self.handle_mic_toggle)

            self.init_ui()

        def init_ui(self):
            self.setStyleSheet("""
                QWidget#MainContainer {
                    background-color: #0b132b;
                    border: 1px solid #1e3a8a;
                    border-radius: 16px;
                }
                QLabel#TitleLabel {
                    color: #38bdf8;
                    font-size: 13px;
                    font-weight: bold;
                    font-family: 'Segoe UI', Arial;
                }
                QLabel#SubtitleLabel {
                    color: #94a3b8;
                    font-size: 10px;
                    font-family: 'Segoe UI', Arial;
                }
                QPushButton.ActionButton {
                    background-color: #1c2541;
                    color: #f8fafc;
                    border: 1px solid #334155;
                    border-radius: 10px;
                    padding: 8px 12px;
                    font-size: 11px;
                    font-weight: bold;
                    font-family: 'Segoe UI', Arial;
                    text-align: left;
                }
                QPushButton.ActionButton:hover {
                    background-color: #2563eb;
                    border-color: #60a5fa;
                    color: #ffffff;
                }
                QPushButton.ActionButton:pressed {
                    background-color: #1d4ed8;
                }
                QPushButton.CloseButton {
                    background-color: transparent;
                    color: #94a3b8;
                    border: none;
                    font-size: 14px;
                    font-weight: bold;
                }
                QPushButton.CloseButton:hover {
                    color: #f43f5e;
                }
            """)

            main_layout = QVBoxLayout(self)
            main_layout.setContentsMargins(0, 0, 0, 0)

            container = QFrame(self)
            container.setObjectName("MainContainer")
            container_layout = QVBoxLayout(container)
            container_layout.setContentsMargins(14, 12, 14, 14)
            container_layout.setSpacing(10)

            # Nagłówek HUD
            header_layout = QHBoxLayout()
            title_box = QVBoxLayout()
            title_box.setSpacing(1)

            title_lbl = QLabel("✨ KursorAssist HUD", self)
            title_lbl.setObjectName("TitleLabel")
            subtitle_lbl = QLabel("Ułatwienia dostępu Windows [Alt+Q]", self)
            subtitle_lbl.setObjectName("SubtitleLabel")

            title_box.addWidget(title_lbl)
            title_box.addWidget(subtitle_lbl)
            header_layout.addLayout(title_box)

            header_layout.addStretch()

            close_btn = QPushButton("✕", self)
            close_btn.setObjectName("CloseButton")
            close_btn.setCursor(Qt.PointingHandCursor)
            close_btn.clicked.connect(self.hide)
            header_layout.addWidget(close_btn)

            container_layout.addLayout(header_layout)

            # Siatka przycisków
            grid = QGridLayout()
            grid.setSpacing(8)

            actions = [
                ("📋 [1] Inteligentny Schowek", self.action_clipboard, 0, 0),
                ("🤖 [2] Czat Gemini / AI", self.action_gemini, 0, 1),
                ("🎙️ [3] Mowa na Tekst (STT)", self.action_speech, 1, 0),
                ("🌐 [4] Tłumacz na Polski", self.action_translate, 1, 1),
                ("✂️ [5] OCR ze Zrzutu Ekranu", self.action_ocr, 2, 0),
                ("📌 [6] Przypnij na Wierzch", self.action_pin_top, 2, 1),
                ("💀 [7] Zamknij Zawieszony (Kill)", self.action_kill, 3, 0),
                ("🎙️ [8] Wycisz Mikrofon (Mute)", self.action_mic, 3, 1),
                ("📝 [9] Szybka Notatka (Memo)", self.action_memo, 4, 0),
                ("💬 [0] Czat ChatGPT", self.action_chatgpt, 4, 1),
            ]

            for label, func, r, c in actions:
                btn = QPushButton(label, self)
                btn.setProperty("class", "ActionButton")
                btn.setCursor(Qt.PointingHandCursor)
                btn.clicked.connect(func)
                grid.addWidget(btn, r, c)

            container_layout.addLayout(grid)
            main_layout.addWidget(container)

            self.resize(380, 290)

        def keyPressEvent(self, event):
            if event.key() == Qt.Key_Escape:
                self.hide()
            elif event.key() == Qt.Key_1:
                self.action_clipboard()
            elif event.key() == Qt.Key_2:
                self.action_gemini()
            elif event.key() == Qt.Key_3:
                self.action_speech()
            elif event.key() == Qt.Key_4:
                self.action_translate()
            elif event.key() == Qt.Key_5:
                self.action_ocr()
            elif event.key() == Qt.Key_6:
                self.action_pin_top()
            elif event.key() == Qt.Key_7:
                self.action_kill()
            elif event.key() == Qt.Key_8:
                self.action_mic()
            elif event.key() == Qt.Key_9:
                self.action_memo()
            elif event.key() == Qt.Key_0:
                self.action_chatgpt()
            else:
                super().keyPressEvent(event)

        def show_at_pos(self, x, y):
            screen = QApplication.primaryScreen().geometry()
            w, h = self.width(), self.height()
            target_x = max(10, min(x - (w // 2), screen.width() - w - 10))
            target_y = max(10, min(y - (h // 2), screen.height() - h - 10))
            self.move(target_x, target_y)
            self.show()
            self.raise_()
            self.activateWindow()

        # AKCJE NARZĘDZI
        def action_clipboard(self):
            self.hide()
            if HAS_PYPERCLIP:
                txt = pyperclip.paste()
                QMessageBox.information(None, "Inteligentny Schowek", f"Zawartość schowka:\n\n{txt[:400]}")
            else:
                QMessageBox.warning(None, "Schowek", "Zainstaluj bibliotekę pyperclip: pip install pyperclip")

        def action_gemini(self):
            self.hide()
            webbrowser.open("https://gemini.google.com/app")

        def action_chatgpt(self):
            self.hide()
            webbrowser.open("https://chatgpt.com")

        def action_pin_top(self):
            self.hide()
            is_pinned = win32_toggle_always_on_top()
            status = "Przypięto na wierzch (Always on Top)" if is_pinned else "Odpięto okno"
            print(f"[KursorAssist] {status}")

        def action_kill(self):
            self.hide()
            win32_force_kill_foreground()

        def action_mic(self):
            self.hide()
            win32_toggle_mic_mute()

        def handle_mic_toggle(self):
            win32_toggle_mic_mute()

        def action_translate(self):
            self.hide()
            if not HAS_PYAUTOGUI or not HAS_PYPERCLIP:
                QMessageBox.warning(None, "Błąd", "Wymagane moduły: pyautogui i pyperclip")
                return

            pyautogui.hotkey('ctrl', 'c')
            time.sleep(0.1)
            text = pyperclip.paste()

            if text and HAS_TRANSLATOR:
                try:
                    translated = GoogleTranslator(source='auto', target='pl').translate(text)
                    pyperclip.copy(translated)
                    QMessageBox.information(None, "Tłumaczenie na Polski", f"Tekst oryginalny:\n{text[:200]}\n\n🇵🇱 Tłumaczenie:\n{translated}")
                except Exception as e:
                    QMessageBox.critical(None, "Błąd Tłumacza", f"Szczegóły: {e}")
            else:
                QMessageBox.information(None, "Tłumacz", "Zaznacz tekst przed wywołaniem skrótu.")

        def action_ocr(self):
            self.hide()
            if not HAS_OCR or not HAS_PYAUTOGUI or not HAS_PYPERCLIP:
                QMessageBox.warning(None, "OCR", "Wymagane: pip install pytesseract pillow pyautogui pyperclip")
                return

            x, y = pyautogui.position()
            bbox = (max(0, x - 250), max(0, y - 100), x + 250, y + 100)
            img = ImageGrab.grab(bbox)
            try:
                recognized = pytesseract.image_to_string(img, lang='pol+eng')
                if recognized.strip():
                    pyperclip.copy(recognized.strip())
                    QMessageBox.information(None, "OCR Wynik", f"Odczytano tekst:\n\n{recognized.strip()}")
                else:
                    QMessageBox.information(None, "OCR", "Nie wykryto tekstu na zrzucie.")
            except Exception as e:
                QMessageBox.critical(None, "Błąd OCR", f"Upewnij się, że Tesseract jest zainstalowany.\n{e}")

        def action_speech(self):
            self.hide()
            if not HAS_SR or not HAS_PYPERCLIP or not HAS_PYAUTOGUI:
                QMessageBox.warning(None, "Mowa na Tekst", "Wymagane: pip install speechrecognition pyautogui pyperclip")
                return

            r = sr.Recognizer()
            with sr.Microphone() as source:
                try:
                    r.adjust_for_ambient_noise(source, duration=0.3)
                    audio = r.listen(source, timeout=4, phrase_time_limit=8)
                    text = r.recognize_google(audio, language="pl-PL")
                    if text:
                        pyperclip.copy(text)
                        pyautogui.hotkey('ctrl', 'v')
                except Exception as e:
                    print(f"Błąd rozpoznawania mowy: {e}")

        def action_memo(self):
            self.hide()
            if HAS_PYPERCLIP:
                memo = pyperclip.paste()
                with open("KursorAssist_Notes.txt", "a", encoding="utf-8") as f:
                    f.write(f"\n--- {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---\n{memo}\n")
                QMessageBox.information(None, "Szybka Notatka", "Zapisano do pliku KursorAssist_Notes.txt")


# ==============================================================================
# IMPLEMENTACJA 2: FALLBACK TKINTER (JEŚLI BRAK PYQT5)
# ==============================================================================
else:
    import tkinter as tk
    from tkinter import messagebox

    class TkinterHUDWindow:
        def __init__(self):
            self.root = tk.Tk()
            self.root.title("KursorAssist HUD")
            self.root.overrideredirect(True)
            self.root.attributes("-topmost", True)
            self.root.configure(bg="#0b132b")
            self.is_visible = False
            self.build_ui()
            self.root.withdraw()
            self.root.bind("<Escape>", lambda e: self.hide())

        def build_ui(self):
            frame = tk.Frame(self.root, bg="#0b132b", bd=2, relief="solid", highlightbackground="#38bdf8", highlightthickness=1)
            frame.pack(padx=2, pady=2, fill="both", expand=True)

            header = tk.Frame(frame, bg="#1c2541")
            header.pack(fill="x", padx=6, pady=(6, 4))
            tk.Label(header, text="✨ KursorAssist HUD", font=("Segoe UI", 9, "bold"), fg="#38bdf8", bg="#1c2541").pack(side="left", padx=4)
            tk.Label(header, text="[Alt+Q]", font=("Consolas", 8), fg="#94a3b8", bg="#1c2541").pack(side="right", padx=4)

            grid = tk.Frame(frame, bg="#0b132b")
            grid.pack(padx=6, pady=4)

            actions = [
                ("📋 1. Schowek", self.action_clipboard),
                ("🤖 2. Czat Gemini", self.action_gemini),
                ("🎙️ 3. Mowa na tekst", self.action_speech),
                ("🌐 4. Tłumacz na PL", self.action_translate),
                ("✂️ 5. OCR zrzutu", self.action_ocr),
                ("📌 6. Przypnij (Top)", self.action_pin_top),
                ("💀 7. Zabij proces", self.action_kill),
                ("🎙️ 8. Wycisz Mic", self.action_mic),
                ("📝 9. Notatka Memo", self.action_memo),
                ("❌ ESC. Zamknij", self.hide),
            ]

            for idx, (label, cmd) in enumerate(actions):
                r = idx // 2
                c = idx % 2
                btn = tk.Button(
                    grid, text=label, font=("Segoe UI", 9, "bold"),
                    fg="#f8fafc", bg="#1c2541", activebackground="#2563eb",
                    activeforeground="#ffffff", bd=0, padx=8, pady=5, width=16,
                    anchor="w", cursor="hand2", command=cmd
                )
                btn.grid(row=r, column=c, padx=3, pady=3)

        def show_at_pos(self, x, y):
            w, h = 360, 240
            pos_x = max(10, min(x - (w // 2), self.root.winfo_screenwidth() - w - 10))
            pos_y = max(10, min(y - (h // 2), self.root.winfo_screenheight() - h - 10))
            self.root.geometry(f"{w}x{h}+{pos_x}+{pos_y}")
            self.root.deiconify()
            self.root.lift()
            self.root.focus_force()
            self.is_visible = True

        def hide(self):
            self.root.withdraw()
            self.is_visible = False

        def action_clipboard(self):
            self.hide()
            if HAS_PYPERCLIP:
                txt = pyperclip.paste()
                messagebox.showinfo("Schowek", f"Zawartość schowka:\n\n{txt[:300]}")

        def action_gemini(self):
            self.hide()
            webbrowser.open("https://gemini.google.com/app")

        def action_speech(self):
            self.hide()
            if HAS_SR and HAS_PYAUTOGUI and HAS_PYPERCLIP:
                r = sr.Recognizer()
                with sr.Microphone() as source:
                    try:
                        audio = r.listen(source, timeout=4, phrase_time_limit=8)
                        text = r.recognize_google(audio, language="pl-PL")
                        if text:
                            pyperclip.copy(text)
                            pyautogui.hotkey('ctrl', 'v')
                    except Exception as e:
                        print(e)

        def action_translate(self):
            self.hide()
            if HAS_PYAUTOGUI and HAS_PYPERCLIP and HAS_TRANSLATOR:
                pyautogui.hotkey('ctrl', 'c')
                time.sleep(0.1)
                t = pyperclip.paste()
                if t:
                    res = GoogleTranslator(source='auto', target='pl').translate(t)
                    pyperclip.copy(res)
                    messagebox.showinfo("Tłumacz", f"🇵🇱 Wynik:\n{res}")

        def action_ocr(self):
            self.hide()
            if HAS_OCR and HAS_PYAUTOGUI and HAS_PYPERCLIP:
                x, y = pyautogui.position()
                img = ImageGrab.grab((max(0, x - 250), max(0, y - 100), x + 250, y + 100))
                txt = pytesseract.image_to_string(img, lang='pol+eng')
                if txt.strip():
                    pyperclip.copy(txt.strip())
                    messagebox.showinfo("OCR", f"Odczytano:\n\n{txt.strip()}")

        def action_pin_top(self):
            self.hide()
            win32_toggle_always_on_top()

        def action_kill(self):
            self.hide()
            win32_force_kill_foreground()

        def action_mic(self):
            self.hide()
            win32_toggle_mic_mute()

        def action_memo(self):
            self.hide()
            if HAS_PYPERCLIP:
                with open("KursorAssist_Notes.txt", "a", encoding="utf-8") as f:
                    f.write(f"\n--- {datetime.now().strftime('%Y-%m-%d %H:%M:%S')} ---\n{pyperclip.paste()}\n")


# ==============================================================================
# GŁÓWNA PĘTLA APLIKACJI & REJESTRACJA GLOBALNYCH SKRÓTÓW WINDOWS
# ==============================================================================
def start_hotkey_listener(trigger_callback, mic_callback):
    """Nasłuchuje globalnych skrótów klawiszowych w tle"""
    if not HAS_KEYBOARD:
        print("[Ostrzeżenie] Brak modułu 'keyboard'. Zainstaluj: pip install keyboard")
        return

    def on_alt_q():
        if HAS_PYAUTOGUI:
            pos = pyautogui.position()
            trigger_callback(pos[0], pos[1])
        else:
            trigger_callback(400, 300)

    keyboard.add_hotkey("alt+q", on_alt_q)
    keyboard.add_hotkey("ctrl+space", on_alt_q)
    keyboard.add_hotkey("ctrl+m", mic_callback)
    print("[KursorAssist] Globalne skróty aktywne: [Alt+Q], [Ctrl+Spacja], [Ctrl+M]")
    keyboard.wait()


def main():
    print("=" * 65)
    print("  KURSORASSIST - HUD & TASKBAR ROLLER (WINDOWS)")
    print("  Wciśnij [Alt + Q] lub [Ctrl + Spacja] aby otworzyć HUD!")
    print("=" * 65)

    if USE_PYQT5:
        app = QApplication(sys.argv)
        app.setQuitOnLastWindowClosed(False)
        hud = ModernHUDWindow()

        # Wątek nasłuchiwania skrótów klawiszowych
        t = threading.Thread(
            target=start_hotkey_listener,
            args=(
                lambda x, y: hud.comm.trigger_show.emit(x, y),
                lambda: hud.comm.trigger_mic.emit()
            ),
            daemon=True
        )
        t.start()

        sys.exit(app.exec_())
    else:
        hud = TkinterHUDWindow()

        def trigger(x, y):
            hud.root.after(0, lambda: hud.show_at_pos(x, y))

        def trigger_mic():
            hud.root.after(0, win32_toggle_mic_mute)

        t = threading.Thread(
            target=start_hotkey_listener,
            args=(trigger, trigger_mic),
            daemon=True
        )
        t.start()

        hud.root.mainloop()


if __name__ == "__main__":
    main()
