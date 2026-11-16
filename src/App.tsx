/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { InfoModal, TeacherAuthModal, TeacherDashboardModal } from './components/Modals';
import { SceneBackdrop } from './components/SceneBackdrop';
import { HalfBodyAvatar } from './components/VisualAssets';
import { HomeSlide } from './components/slides/HomeSlide';
import { MapSlide } from './components/slides/MapSlide';
import { Stage1Slides } from './components/slides/Stage1Slides';
import { Stage2Slides } from './components/slides/Stage2Slides';
import { Stage3Slides } from './components/slides/Stage3Slides';
import { Stage4Slides } from './components/slides/Stage4Slides';
import { Stage5Slides } from './components/slides/Stage5Slides';
import { SLIDE_META } from './data/slidesData';
import { Gender, LenteraState } from './types/lentera';
import { playSoundEffect, stopNarration } from './utils/audioEngine';

const STORAGE_KEY = 'lentera_petualangan_bunyi_v2';

const DEFAULT_STATE: LenteraState = {
  currentSlide: 1,
  playerName: 'Penjelajah Bunyi',
  playerGender: 'boy',
  devName: 'Teresa Avilla A.B.C., Ferliyan Reza, Eprina Roganda',
  className: 'Kelas VI SD (Fase C)',
  soundEnabled: true,
  teacherUnlocked: false,
  stageStars: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  stageMaxStars: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
  completedTasks: {},
  customVisuals: {},

  slide4Saved: '',
  slide4ObservedSounds: [],
  slide5Choice: 'Benda bergetar',
  slide5Reason: '',

  slide6Visited: [],
  slide7Vibrating: true,
  slide7Amplitude: 0.7,
  slide7Frequency: 2,
  slide8Bins: {},
  slide9Tab: 0,
  slide9AudioIdx: 0,
  slide9Category: '',
  slide9Reason: '',
  slide9InstrumentMatches: {},
  slide9PlayMethods: {},
  slide9VibrationSources: {},

  slide11String: 'Tegang',
  slide11Distance: 4,
  slide12Medium: 'Padat',
  slide12Matches: {},
  slide13Visited: [],
  slide13QuizAnswers: {},

  slide14Answers: {},
  slide14CurrentQ: 0,
  slide15Pairs: {},
  slide16Round: 0,
  slide16Guesses: {},
  slide17Mode: 'Ketuk Botol',
  slide17Notes: '',

  slide18Mission: 'Misi A: Sonic Maker',
  slide19Title: '',
  slide19Desc: '',
  slide19Format: 'Foto',
  slide19Link: '',
  slide19ImagePreview: '',
  slide19AudioPreview: '',
  submissions: [],
  slide20New: '',
  slide20Best: '',
  slide20Self: 4,
};

function loadInitialState(): LenteraState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<LenteraState>;
    return {
      ...DEFAULT_STATE,
      ...parsed,
      className:
        !parsed.className || parsed.className === 'Kelas IV SD (Fase B)'
          ? 'Kelas VI SD (Fase C)'
          : parsed.className,
      stageMaxStars: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 },
      customVisuals: parsed.customVisuals || {},
      // Always start from Slide 1 on fresh load so user sees landing screen cleanly
      currentSlide: 1,
      // Do not persist ephemeral object URLs across sessions
      slide19AudioPreview: '',
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export default function App() {
  const [state, setState] = useState<LenteraState>(loadInitialState);
  const [toast, setToast] = useState<{ msg: string; icon: string } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [teacherOpen, setTeacherOpen] = useState(false);

  // Persist user progress safely
  useEffect(() => {
    try {
      const toSave = {
        ...state,
        // Avoid blowing localStorage quota with large inline images if needed
        slide19AudioPreview: '',
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {
      // Ignore storage quota issues
    }
  }, [state]);

  const showToast = useCallback((msg: string, icon = '✨') => {
    setToast({ msg, icon });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  const updateState = useCallback((patch: Partial<LenteraState>) => {
    setState((prev) => ({ ...prev, ...patch }));
  }, []);

  const awardTaskStar = useCallback((stageNum: number, taskKey: string, starsToAdd = 1) => {
    setState((prev) => {
      if (prev.completedTasks[taskKey]) return prev;
      const maxS = prev.stageMaxStars[stageNum] || 5;
      const curS = prev.stageStars[stageNum] || 0;
      return {
        ...prev,
        completedTasks: { ...prev.completedTasks, [taskKey]: true },
        stageStars: {
          ...prev.stageStars,
          [stageNum]: Math.min(maxS, curS + starsToAdd),
        },
      };
    });
  }, []);

  const goToSlide = useCallback(
    (num: number) => {
      stopNarration();
      playSoundEffect('click', state.soundEnabled);
      setState((prev) => ({ ...prev, currentSlide: num }));
    },
    [state.soundEnabled]
  );

  const toggleSound = () => {
    const next = !state.soundEnabled;
    if (!next) stopNarration();
    updateState({ soundEnabled: next });
    showToast(next ? 'Efek Suara Diaktifkan!' : 'Efek Suara Dimatikan', next ? '🔊' : '🔇');
  };

  const handleSelectGender = (gender: Gender) => {
    playSoundEffect('click', state.soundEnabled);
    updateState({ playerGender: gender });
    showToast(`Karakter ${gender === 'boy' ? 'Laki-laki' : 'Perempuan'} dipilih!`, gender === 'boy' ? '👦' : '👧');
  };

  const handleStartAdventure = () => {
    if (!state.playerName.trim()) {
      showToast('Silakan ketik namamu terlebih dahulu!', '✏️');
      return;
    }
    playSoundEffect('fanfare', state.soundEnabled);
    goToSlide(2);
  };

  const openSettings = () => {
    playSoundEffect('click', state.soundEnabled);
    if (state.teacherUnlocked) {
      setTeacherOpen(true);
    } else {
      setAuthOpen(true);
    }
  };

  const handleUploadVisual = useCallback(
    (key: string, dataUrl: string) => {
      setState((prev) => ({
        ...prev,
        customVisuals: { ...prev.customVisuals, [key]: dataUrl },
      }));
      showToast('Gambar PNG berhasil diperbarui!', '🖼️');
    },
    [showToast]
  );

  const handleResetVisual = useCallback(
    (key: string) => {
      setState((prev) => {
        const next = { ...prev.customVisuals };
        delete next[key];
        return { ...prev, customVisuals: next };
      });
      showToast('Gambar dikembalikan ke visual bawaan.', '🔄');
    },
    [showToast]
  );

  const resetForNewUser = useCallback(() => {
    stopNarration();
    localStorage.removeItem(STORAGE_KEY);
    setState((prev) => ({
      ...DEFAULT_STATE,
      customVisuals: prev.customVisuals || {},
      teacherUnlocked: prev.teacherUnlocked,
      currentSlide: 1,
    }));
    showToast('Riwayat pengerjaan LENTERA telah direset! Siap untuk pengguna baru.', '🔄');
  }, [showToast]);

  const curSlide = state.currentSlide;
  const meta = SLIDE_META[curSlide];

  const renderSlide = () => {
    if (curSlide === 1) {
      return (
        <HomeSlide
          state={state}
          onUpdateState={updateState}
          onStartAdventure={handleStartAdventure}
          onOpenInfo={() => {
            playSoundEffect('click', state.soundEnabled);
            setInfoOpen(true);
          }}
          onOpenSettings={openSettings}
          onToggleSound={toggleSound}
          onSelectGender={handleSelectGender}
        />
      );
    }
    if (curSlide === 2) {
      return (
        <MapSlide
          state={state}
          onGoToSlide={goToSlide}
          onOpenInfo={() => {
            playSoundEffect('click', state.soundEnabled);
            setInfoOpen(true);
          }}
          onOpenSettings={openSettings}
          onToggleSound={toggleSound}
        />
      );
    }
    if (curSlide >= 3 && curSlide <= 5) {
      return (
        <Stage1Slides
          slide={curSlide}
          state={state}
          onUpdateState={updateState}
          onAwardStar={awardTaskStar}
          onGoToSlide={goToSlide}
          onToast={showToast}
        />
      );
    }
    if (curSlide >= 6 && curSlide <= 9) {
      return (
        <Stage2Slides
          slide={curSlide}
          state={state}
          onUpdateState={updateState}
          onAwardStar={awardTaskStar}
          onGoToSlide={goToSlide}
          onToast={showToast}
        />
      );
    }
    if (curSlide >= 10 && curSlide <= 13) {
      return (
        <Stage3Slides
          slide={curSlide}
          state={state}
          onUpdateState={updateState}
          onAwardStar={awardTaskStar}
          onGoToSlide={goToSlide}
          onToast={showToast}
        />
      );
    }
    if (curSlide >= 14 && curSlide <= 17) {
      return (
        <Stage4Slides
          slide={curSlide}
          state={state}
          onUpdateState={updateState}
          onAwardStar={awardTaskStar}
          onGoToSlide={goToSlide}
          onToast={showToast}
        />
      );
    }
    return (
      <Stage5Slides
        slide={curSlide}
        state={state}
        onUpdateState={updateState}
        onAwardStar={awardTaskStar}
        onGoToSlide={goToSlide}
        onToast={showToast}
        onResetProgress={resetForNewUser}
      />
    );
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center p-1 sm:p-2 overflow-hidden">
      {/* Main Strict 16:9 Game Viewport (never stretches wider or taller than 16:9) */}
      <div
        style={{ width: 'min(98vw, calc(96vh * 16 / 9), 1366px)' }}
        className="relative aspect-video shrink-0 rounded-2xl sm:rounded-3xl overflow-hidden shadow-[0_20px_70px_rgba(0,0,0,0.85)] border-4 border-amber-700/80 bg-slate-900 flex flex-col justify-between"
      >
        {/* Dynamic Environmental Backdrop Layer */}
        <SceneBackdrop slideNum={curSlide} customVisuals={state.customVisuals} />

        {/* TOP HUD BAR (Slides 3-21; Slide 1 & Slide 2 have dedicated integrated HUDs) */}
        {curSlide >= 3 && (
          <header className="relative z-20 flex items-center justify-between px-3 sm:px-5 pt-2.5 pb-1.5">
            <div className="flex items-center gap-2 min-w-0">
              <button
                type="button"
                onClick={() => goToSlide(1)}
                title="Halaman Awal"
                aria-label="Halaman Awal"
                className="btn-3d-orange w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
              >
                <Home className="w-4 h-4" />
              </button>

              <div className="wood-panel px-2.5 py-1 rounded-xl flex items-center gap-1.5 shrink-0">
                <span className="font-game font-bold text-xs sm:text-sm tracking-wider text-amber-200 whitespace-nowrap">
                  LENTERA
                </span>
              </div>

              <div className="wood-panel pl-1 pr-3 py-0.5 rounded-full flex items-center gap-2 border-2 border-amber-300 shadow-md shrink-0">
                <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-amber-200 bg-sky-100 shrink-0">
                  <HalfBodyAvatar gender={state.playerGender} />
                </div>
                <span className="font-game font-bold text-xs sm:text-sm text-amber-100 max-w-[120px] truncate">
                  {state.playerName || 'Penjelajah Bunyi'}
                </span>
              </div>

              {curSlide >= 3 && meta.stage > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 shrink-0">
                  <span
                    style={{ backgroundColor: meta.color }}
                    className="w-7 h-7 rounded-full flex items-center justify-center font-game font-bold text-white text-xs border-2 border-white shadow-md font-data"
                  >
                    {meta.stage}
                  </span>
                  <div className="wood-panel px-2.5 py-1 rounded-xl font-game font-bold text-[11px] sm:text-xs tracking-wide whitespace-nowrap">
                    STAGE {meta.stage} · {meta.stageName}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="hidden xl:block wood-panel px-3 py-1 rounded-xl font-game text-xs text-amber-100 whitespace-nowrap">
                {curSlide === 2 ? 'Ekspedisi Rahasia Dunia Bunyi' : meta.theme}
              </div>
              <button
                type="button"
                onClick={toggleSound}
                aria-label={state.soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
                className="btn-3d-orange w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0"
              >
                {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </header>
        )}

        {/* ACTIVITY SUBHEADER (Slides 3-21) */}
        {curSlide >= 3 && meta.activity && (
          <div className="relative z-20 px-6 flex justify-center pointer-events-none">
            <div className="parchment-panel px-5 py-1 rounded-full font-game font-bold text-xs sm:text-sm text-amber-950 shadow-md">
              {meta.activity}
            </div>
          </div>
        )}

        {/* MAIN INTERACTIVE SLIDE CONTAINER */}
        <main
          className={`relative z-10 flex-1 min-h-0 w-full flex flex-col ${
            curSlide === 1 || curSlide === 2
              ? 'p-0 overflow-hidden items-center justify-center'
              : 'px-3 sm:px-6 py-1.5 overflow-y-auto custom-scroll'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={curSlide}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
              className={
                curSlide === 1 || curSlide === 2
                  ? 'w-full h-full flex items-center justify-center'
                  : 'w-full my-auto flex items-center justify-center'
              }
            >
              {renderSlide()}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* BOTTOM NAVIGATION BAR (Slides 3-21) */}
        {curSlide >= 3 && meta.step && (
          <footer className="relative z-20 px-4 sm:px-6 pb-2.5 pt-1 flex items-center justify-between">
            <button
              type="button"
              onClick={() => meta.prev && goToSlide(meta.prev)}
              className="btn-3d-orange px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>

            <div className="wood-panel px-3.5 py-1 rounded-full flex items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                {Array.from({ length: meta.step[1] }, (_, i) => (
                  <span
                    key={i}
                    className={`w-3 h-3 rounded-full ${
                      i + 1 === meta.step![0]
                        ? 'bg-amber-400 scale-125 shadow'
                        : 'bg-amber-950/60 border border-amber-400/50'
                    }`}
                  />
                ))}
              </div>
              <span className="font-game font-bold text-xs text-amber-300 font-data">
                {meta.step[0]}/{meta.step[1]}
              </span>
              <span className="text-[10px] text-amber-200/80 hidden sm:inline font-data">
                Slide {curSlide}/21
              </span>
            </div>

            <button
              type="button"
              onClick={() => goToSlide(meta.next)}
              className="btn-3d-orange px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs sm:text-sm flex items-center gap-1 whitespace-nowrap"
            >
              <span>{meta.next === 2 ? 'Ke Peta' : 'Lanjut'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </footer>
        )}

        {/* TOAST FEEDBACK */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="fixed top-5 left-1/2 -translate-x-1/2 z-50 parchment-panel px-5 py-2.5 rounded-2xl shadow-2xl border-4 border-amber-600 flex items-center gap-2.5 max-w-md"
            >
              <span className="text-xl">{toast.icon}</span>
              <p className="text-xs sm:text-sm font-bold text-amber-950">{toast.msg}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MODALS */}
        <InfoModal isOpen={infoOpen} onClose={() => setInfoOpen(false)} onToast={showToast} />

        <TeacherAuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {
            updateState({ teacherUnlocked: true });
            setAuthOpen(false);
            setTeacherOpen(true);
            playSoundEffect('fanfare', state.soundEnabled);
            showToast('Akses Pengaturan Guru dibuka!', '🔓');
          }}
        />

        <TeacherDashboardModal
          isOpen={teacherOpen}
          state={state}
          onUpdateState={updateState}
          onUploadVisual={handleUploadVisual}
          onResetVisual={handleResetVisual}
          onGoToSlide={goToSlide}
          onFillStars={() => {
            updateState({ stageStars: { 1: 5, 2: 5, 3: 5, 4: 5, 5: 5 } });
            playSoundEffect('fanfare', state.soundEnabled);
            showToast('Seluruh 25 bintang di 5 pulau telah terisi penuh!', '⭐');
          }}
          onResetAll={() => {
            localStorage.removeItem(STORAGE_KEY);
            setState({ ...DEFAULT_STATE, currentSlide: state.currentSlide, teacherUnlocked: true });
            showToast('Seluruh progres bintang & jawaban direset ke 0.', '🔄');
          }}
          onClose={() => setTeacherOpen(false)}
          onToast={showToast}
        />
      </div>
    </div>
  );
}
