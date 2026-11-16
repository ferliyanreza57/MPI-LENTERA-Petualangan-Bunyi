import React from 'react';
import { BookOpen, Check, Compass, Rocket, Settings, Star, Volume2, VolumeX } from 'lucide-react';
import { DEFAULT_HOME_COVER_IMAGE } from '../../data/slidesData';
import { Gender, LenteraState } from '../../types/lentera';

interface HomeSlideProps {
  state: LenteraState;
  onUpdateState: (patch: Partial<LenteraState>) => void;
  onStartAdventure: () => void;
  onOpenInfo: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
  onSelectGender: (gender: Gender) => void;
}

export const HomeSlide: React.FC<HomeSlideProps> = ({
  state,
  onUpdateState,
  onStartAdventure,
  onOpenInfo,
  onOpenSettings,
  onToggleSound,
  onSelectGender,
}) => {
  const totalStars = Object.values(state.stageStars).reduce((acc, v) => acc + v, 0);
  const maxStars = Object.values(state.stageMaxStars).reduce((acc, v) => acc + v, 0);
  const coverSrc = state.customVisuals?.home_cover || DEFAULT_HOME_COVER_IMAGE;

  return (
    <div className="w-full h-full relative select-none overflow-hidden">
      {/* Uploaded 16:9 Cover Artwork */}
      <img
        src={coverSrc}
        alt="Sampul LENTERA - Petualangan Bunyi"
        referrerPolicy="no-referrer"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />

      {/* Clean wood-matched plaque cover + elevated title & subtitle cleanly above the center explorer hat */}
      <div
        aria-hidden="true"
        className="absolute left-[21.5%] right-[21.5%] top-[0.4%] h-[11.5%] z-20 rounded-b-xl pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, #944c15 0%, #864312 52%, #72380e 100%)',
          boxShadow: '0 0 8px 4px #7b3e10',
        }}
      />
      <div
        style={{ containerType: 'inline-size' }}
        className="absolute left-[21.5%] right-[21.5%] top-[0.6%] h-[10.4%] z-20 flex flex-col items-center justify-center text-center pointer-events-none"
      >
        <h1
          className="font-game font-extrabold text-[#FFF9EE] leading-none tracking-wide"
          style={{
            fontSize: '4.55cqw',
            textShadow: '0 2px 4px rgba(55, 22, 4, 0.78)',
          }}
        >
          LENTERA – Petualangan Bunyi
        </h1>
        <p
          className="font-semibold text-[#FDE8BD] leading-tight mt-[0.6cqw]"
          style={{
            fontSize: '1.85cqw',
            textShadow: '0 1px 2px rgba(55, 22, 4, 0.72)',
          }}
        >
          Lintas Eksplorasi, Narasi, Tematik, Edukatif, Ritme, dan Alam
        </p>
      </div>

      {/* Top-Left Progress Star Pill (when student already has stars) */}
      {totalStars > 0 && (
        <div className="absolute top-2.5 left-3 z-30 wood-panel px-3 py-1 rounded-full flex items-center gap-1.5 border-2 border-amber-400 shadow-lg">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-game font-bold text-xs text-amber-200 font-data">
            Progres: {totalStars}/{maxStars} ★
          </span>
        </div>
      )}

      {/* Interactive Player Name Input Overlay (aligned directly over the cover input pill) */}
      <div className="absolute left-[27.8%] right-[27.8%] top-[59.4%] h-[6.8%] z-20 flex items-center justify-center">
        <input
          id="home-player-name-input"
          aria-label="Nama Pemain"
          type="text"
          value={state.playerName}
          onChange={(e) => onUpdateState({ playerName: e.target.value })}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onStartAdventure();
          }}
          placeholder="Ketik namamu di sini..."
          className="w-full h-full px-5 rounded-full border-2 border-amber-500 bg-white font-game font-bold text-amber-950 text-xs sm:text-base md:text-lg text-center shadow-inner focus:outline-none focus:ring-4 focus:ring-amber-400/70"
        />
      </div>

      {/* Precise True-Circle Gender Selector Overlays matching baked circular avatar frames */}
      <button
        type="button"
        onClick={() => onSelectGender('boy')}
        aria-label="Pilih karakter Laki-laki"
        className={`absolute left-[35.80%] top-[68.48%] w-[9.60%] aspect-square z-20 cursor-pointer rounded-full transition-all ${
          state.playerGender === 'boy'
            ? 'border-[3.5px] border-sky-500 bg-sky-400/10 shadow-[inset_0_0_10px_rgba(14,165,233,0.4),0_0_14px_rgba(14,165,233,0.5)]'
            : 'border-2 border-transparent hover:border-sky-400/80 opacity-95 hover:opacity-100'
        }`}
      >
        {state.playerGender === 'boy' && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-sky-600 border-2 border-white text-white flex items-center justify-center shadow-md">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
      </button>

      <button
        type="button"
        onClick={() => onSelectGender('girl')}
        aria-label="Pilih karakter Perempuan"
        className={`absolute left-[53.78%] top-[68.52%] w-[9.56%] aspect-square z-20 cursor-pointer rounded-full transition-all ${
          state.playerGender === 'girl'
            ? 'border-[3.5px] border-rose-500 bg-rose-400/10 shadow-[inset_0_0_10px_rgba(244,63,94,0.4),0_0_14px_rgba(244,63,94,0.5)]'
            : 'border-2 border-transparent hover:border-rose-400/80 opacity-95 hover:opacity-100'
        }`}
      >
        {state.playerGender === 'girl' && (
          <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-rose-600 border-2 border-white text-white flex items-center justify-center shadow-md">
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </span>
        )}
      </button>

      {/* Cream parchment mask seamlessly removing the brown circle between avatars */}
      <div
        aria-hidden="true"
        className="absolute left-[47.4%] top-[82.2%] w-[4.9%] h-[8.4%] rounded-full z-20 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, #feeac8 0%, #fee9c8 75%, #fdeac9 100%)',
        }}
      />

      {/* Primary CTA Button at Bottom of Center Parchment Card */}
      <div className="absolute inset-x-0 bottom-[3.6%] z-30 flex justify-center pointer-events-none">
        <button
          type="button"
          onClick={onStartAdventure}
          className="pointer-events-auto btn-3d-orange px-6 sm:px-8 py-1.5 sm:py-2 rounded-full font-game font-bold text-xs sm:text-sm md:text-base text-white tracking-wide flex items-center gap-2 whitespace-nowrap shadow-2xl"
        >
          {totalStars > 0 ? <Compass className="w-4 h-4 sm:w-5 sm:h-5" /> : <Rocket className="w-4 h-4 sm:w-5 sm:h-5" />}
          <span>{totalStars > 0 ? 'Lanjutkan Petualangan' : 'Mulai Petualangan'}</span>
        </button>
      </div>

      {/* Bottom-Left: Info & Panduan */}
      <div className="absolute bottom-3 left-3 z-30">
        <button
          type="button"
          onClick={onOpenInfo}
          className="btn-3d-green px-3.5 py-1.5 rounded-xl font-game text-xs sm:text-sm text-white flex items-center gap-1.5 whitespace-nowrap shadow-xl"
        >
          <BookOpen className="w-4 h-4" />
          <span>Info &amp; Panduan</span>
        </button>
      </div>

      {/* Bottom-Right: Pengaturan & Audio Suara */}
      <div className="absolute bottom-3 right-3 z-30 flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenSettings}
          className="btn-3d-blue px-3.5 py-1.5 rounded-xl font-game text-xs sm:text-sm text-white flex items-center gap-1.5 whitespace-nowrap shadow-xl"
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan</span>
        </button>
        <button
          type="button"
          onClick={onToggleSound}
          aria-label={state.soundEnabled ? 'Matikan suara' : 'Aktifkan suara'}
          className="btn-3d-orange w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xl"
        >
          {state.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );
};


