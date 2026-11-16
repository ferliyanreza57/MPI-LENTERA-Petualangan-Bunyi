import React from 'react';
import { Award, BookOpen, Home, Settings, Star, Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_MAP_IMAGE, MAP_ISLANDS } from '../../data/slidesData';
import { LenteraState } from '../../types/lentera';
import { HalfBodyAvatar } from '../VisualAssets';

interface MapSlideProps {
  state: LenteraState;
  onGoToSlide: (slide: number) => void;
  onOpenInfo: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const MapSlide: React.FC<MapSlideProps> = ({
  state,
  onGoToSlide,
  onOpenInfo,
  onOpenSettings,
  onToggleSound,
}) => {
  const totalStars = Object.values(state.stageStars).reduce((acc, v) => acc + v, 0);
  const maxStars = Object.values(state.stageMaxStars).reduce((acc, v) => acc + v, 0);
  const rankTitle =
    totalStars >= 20
      ? 'Master Detektif Bunyi'
      : totalStars >= 12
        ? 'Ilmuwan Muda Bunyi'
        : totalStars >= 5
          ? 'Penjelajah Aktif'
          : 'Penjelajah Pemula';

  const mapSrc = state.customVisuals?.map_bg || DEFAULT_MAP_IMAGE;

  return (
    <div className="w-full h-full relative select-none overflow-hidden">
      {/* Reference Tropical Archipelago Map Background */}
      <img
        src={mapSrc}
        alt="Peta Petualangan LENTERA - Eksplorasi Dunia Bunyi"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Seamless sky/cloud patch removing the baked fake Home icon in top-right */}
      <div
        aria-hidden="true"
        className="absolute left-[91.8%] right-[1.0%] top-[2.0%] bottom-[87.2%] z-10 rounded-full pointer-events-none"
        style={{
          background: 'linear-gradient(175deg, #c6def0 0%, #eaecee 52%, #dce3e7 100%)',
          boxShadow: '0 0 14px 10px #e2e6ea',
        }}
      />

      {/* Top-Right Compact Action Controls (Leaves Top-Left Map Sign Cleanly Visible) */}
      <div className="absolute top-2.5 right-3 z-30 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={onOpenInfo}
          className="btn-3d-green px-2.5 py-1.5 rounded-xl text-white font-game text-xs flex items-center gap-1"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Info & Panduan</span>
        </button>

        <button
          type="button"
          onClick={onOpenSettings}
          className="btn-3d-blue px-2.5 py-1.5 rounded-xl text-white font-game text-xs flex items-center gap-1"
        >
          <Settings className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Pengaturan</span>
        </button>

        <button
          type="button"
          onClick={onToggleSound}
          aria-label={state.soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
          className="btn-3d-orange w-8 h-8 rounded-xl flex items-center justify-center text-white"
        >
          {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        <button
          type="button"
          onClick={() => onGoToSlide(1)}
          title="Halaman Awal"
          aria-label="Halaman Awal"
          className="btn-3d-orange w-9 h-9 rounded-full flex items-center justify-center text-white"
        >
          <Home className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom-Right Player Avatar & Star/Rank Pill */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2">
        <div className="wood-panel pl-1 pr-3 py-0.5 rounded-full flex items-center gap-2 border-2 border-amber-300 shadow-md">
          <div className="w-7 h-7 rounded-full overflow-hidden border-2 border-amber-200 bg-sky-100 shrink-0">
            <HalfBodyAvatar gender={state.playerGender} />
          </div>
          <span className="font-game font-bold text-xs text-amber-100 max-w-[110px] truncate">
            {state.playerName || 'Penjelajah Bunyi'}
          </span>
        </div>

        <div className="wood-panel px-3 py-1 rounded-full flex items-center gap-2 border-2 border-amber-400 shadow-md">
          <div className="flex items-center gap-1 text-amber-300 font-game font-bold text-xs font-data">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>
              {totalStars}/{maxStars}
            </span>
          </div>
          <span className="text-amber-200/50 hidden sm:inline">|</span>
          <div className="hidden sm:flex items-center gap-1 text-[11px] font-bold text-amber-100">
            <Award className="w-3.5 h-3.5 text-amber-300" />
            <span>{rankTitle}</span>
          </div>
        </div>
      </div>

      {/* 5 Clickable Island Hotspots + Live Dynamic Star Counters */}
      {MAP_ISLANDS.map((isl) => {
        const sc = state.stageStars[isl.id] || 0;
        const mc = state.stageMaxStars[isl.id] || 5;
        const isComplete = sc >= mc;

        return (
          <React.Fragment key={isl.id}>
            {/* Interactive Island Click Zone */}
            <button
              type="button"
              onClick={() => onGoToSlide(isl.slide)}
              title={`Masuk Stage ${isl.id}: ${isl.name}`}
              aria-label={`Masuk Stage ${isl.id}: ${isl.name}`}
              className={`absolute ${isl.hitboxClass} z-20 cursor-pointer rounded-3xl transition-all duration-200 hover:bg-white/10 hover:ring-4 hover:ring-amber-300/80 focus:outline-none focus-visible:ring-4 focus-visible:ring-white group`}
            >
              <span className="sr-only">
                Stage {isl.id}: {isl.name} ({sc}/{mc} bintang)
              </span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-2 left-1/2 -translate-x-1/2 bg-slate-900/90 text-amber-200 border border-amber-400 px-3 py-0.5 rounded-full text-[11px] font-game font-bold whitespace-nowrap shadow-lg pointer-events-none">
                Masuk Stage {isl.id} ▶
              </div>
            </button>

            {/* Live Dynamic Star Pill Aligned Over Island Star Bar */}
            <button
              type="button"
              onClick={() => onGoToSlide(isl.slide)}
              className={`absolute ${isl.starPillClass} z-30 star-pill-3d px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow-lg hover:scale-105 transition-transform cursor-pointer ${
                isComplete ? 'ring-2 ring-amber-300' : ''
              }`}
            >
              <span className="font-game font-extrabold text-amber-300 text-[11px] font-data">
                {sc}/{mc}
              </span>
              <div className="flex items-center gap-0.5">
                {Array.from({ length: mc }, (_, idx) => (
                  <span
                    key={idx}
                    className={`text-[12px] leading-none ${
                      idx + 1 <= sc ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.9)]' : 'text-slate-400/60'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </button>
          </React.Fragment>
        );
      })}
    </div>
  );
};
