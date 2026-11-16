import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, FolderUp, Pause, Play, Rocket, RotateCcw, Volume2 } from 'lucide-react';
import { LenteraState, PropKey, SoundEffectType } from '../../types/lentera';
import { playSoundEffect } from '../../utils/audioEngine';
import { CharacterFigure, PropIconBox } from '../VisualAssets';
import { WaveformVisualizer } from '../WaveformVisualizer';

interface Stage1Props {
  slide: number;
  state: LenteraState;
  onUpdateState: (patch: Partial<LenteraState>) => void;
  onAwardStar: (stage: number, taskKey: string, stars?: number) => void;
  onGoToSlide: (slide: number) => void;
  onToast: (msg: string, icon?: string) => void;
}

const DEFAULT_INTRO_VIDEO = '/assets/aistudio/Video_Pengantar_dari_Guru_d7e16f39.mp4';

export const Stage1Slides: React.FC<Stage1Props> = ({
  slide,
  state,
  onUpdateState,
  onAwardStar,
  onGoToSlide,
  onToast,
}) => {
  // Slide 3 video state (preserves attached Video_Pengantar_dari_Guru_d7e16f39.mp4)
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [customVideoUrl, setCustomVideoUrl] = useState<string | null>(null);

  // Slide 4 state
  const [activeSoundLabel, setActiveSoundLabel] = useState<string>('Klik kartu sumber bunyi untuk melihat gelombangnya');

  useEffect(() => {
    if (slide !== 3 && videoRef.current && !videoRef.current.paused) {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  }, [slide]);

  const togglePlayVideo = () => {
    const vid = videoRef.current;
    if (!vid) return;
    if (!vid.paused) {
      vid.pause();
      setIsPlaying(false);
    } else {
      vid.play().catch(() => {
        onToast('Klik tombol putar pada pemutar video untuk memutar!', '🎬');
      });
      setIsPlaying(true);
      onAwardStar(1, 's3_video', 1);
    }
  };

  const handleUploadLocalVideo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setCustomVideoUrl(url);
    setIsPlaying(false);
    onToast('Video pengantar MP4 berhasil dimuat!', '🎬');
  };

  if (slide === 3) {
    const activeVideoSrc = customVideoUrl || DEFAULT_INTRO_VIDEO;
    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="hidden lg:flex flex-col items-center shrink-0">
          <CharacterFigure type="pakguru" className="w-24 h-24" />
          <span className="wood-panel px-3 py-0.5 rounded-full text-xs font-bold -mt-1 z-10">Pak Guru</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center gap-2.5 min-w-0">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-amber-950/85 backdrop-blur-sm border-2 border-amber-400/90 rounded-full py-1 px-3.5 text-xs font-bold text-amber-100 shadow-lg">
            <span>
              Video Pengantar dari Guru: &ldquo;Halo, anak-anak! Bagaimana suara bisa terbentuk?&rdquo;
            </span>
            <div className="flex items-center gap-1.5">
              <label className="cursor-pointer bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-0.5 rounded-full text-[11px] font-game flex items-center gap-1">
                <FolderUp className="w-3 h-3" />
                <span>Ganti MP4</span>
                <input type="file" accept="video/mp4,video/*" className="hidden" onChange={handleUploadLocalVideo} />
              </label>
              {customVideoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setCustomVideoUrl(null);
                    setIsPlaying(false);
                    onToast('Kembali ke video pengantar asli guru.', '🎬');
                  }}
                  className="bg-slate-600 hover:bg-slate-700 text-white px-2 py-0.5 rounded-full text-[11px] font-game flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" /> Asli
                </button>
              )}
            </div>
          </div>

          {/* Bingkai di sisi video saja agar background Stage 1 tetap terlihat luas */}
          <div className="bg-gradient-to-br from-amber-500 via-amber-700 to-amber-950 p-2 sm:p-2.5 rounded-3xl border-4 border-amber-300 shadow-[0_18px_45px_rgba(0,0,0,0.65)] w-full max-w-[540px] mx-auto">
            <div className="bg-black rounded-2xl w-full aspect-video flex items-center justify-center relative overflow-hidden border-2 border-amber-950/80">
              <video
                ref={videoRef}
                src={activeVideoSrc}
                className="w-full h-full object-contain bg-black"
                controls
                playsInline
                onPlay={() => {
                  setIsPlaying(true);
                  onAwardStar(1, 's3_video', 1);
                }}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                  setIsPlaying(false);
                  onAwardStar(1, 's3_video', 1);
                  onToast('Video Pengantar selesai! Klik "Ayo Menjelajah!" untuk lanjut.', '🎬');
                }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={togglePlayVideo}
              className="btn-3d-blue px-5 py-1.5 rounded-full font-game font-bold text-white text-xs sm:text-sm flex items-center gap-1.5 shadow-lg"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Jeda Video' : 'Putar Video Pengantar'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onAwardStar(1, 's3_video', 1);
                onGoToSlide(4);
              }}
              className="btn-3d-orange px-6 py-1.5 rounded-full font-game font-bold text-white text-xs sm:text-sm flex items-center gap-1.5 shadow-lg"
            >
              <Rocket className="w-4 h-4" />
              <span>Ayo Menjelajah!</span>
            </button>
          </div>
        </div>

        <div className="hidden lg:flex flex-col items-center shrink-0">
          <CharacterFigure type="buguru" className="w-24 h-24" />
          <span className="wood-panel px-3 py-0.5 rounded-full text-xs font-bold -mt-1 z-10">Bu Guru</span>
        </div>
      </div>
    );
  }

  if (slide === 4) {
    const items: Array<{ key: PropKey; name: string; sound: SoundEffectType; note: string }> = [
      { key: 'bel', name: 'Bel Sekolah', sound: 'bell', note: 'Logam bel bergetar · Nada nyaring' },
      { key: 'burung', name: 'Kicauan Burung', sound: 'bird', note: 'Pita suara burung · Nada tinggi cepat' },
      { key: 'kendaraan', name: 'Kendaraan', sound: 'vehicle', note: 'Mesin bergetar · Nada rendah berat' },
      { key: 'gitar', name: 'Gitar', sound: 'guitar', note: 'Senar dipetik · Harmoni merdu' },
    ];

    const handleHearItem = (it: { key: PropKey; name: string; sound: SoundEffectType; note: string }) => {
      playSoundEffect(it.sound, state.soundEnabled);
      setActiveSoundLabel(`${it.name}: ${it.note}`);
      if (!state.slide4ObservedSounds.includes(it.key)) {
        const nextList = [...state.slide4ObservedSounds, it.key];
        onUpdateState({ slide4ObservedSounds: nextList });
        if (nextList.length === 4) {
          onAwardStar(1, 's4_listen', 1);
          onToast('Kamu telah mendengarkan semua 4 suara! +1 Bintang Stage 1', '⭐');
        }
      }
    };

    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="hidden md:flex flex-col items-center shrink-0">
          <CharacterFigure type={state.playerGender === 'girl' ? 'girl_student' : 'boy_student'} className="w-24 h-24" />
          <span className="wood-panel px-3 py-0.5 rounded-full text-xs font-bold -mt-1 z-10 max-w-[110px] truncate">
            {state.playerName}
          </span>
        </div>

        <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-2.5">
          <div className="bg-amber-200/70 px-3 py-1.5 rounded-xl border border-amber-600/30">
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              Pagi hari, <b>{state.playerName}</b> mendengar bel sekolah, kicauan burung, kendaraan, dan gitar. Klik gambar untuk mendengar bunyinya!
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {items.map((it) => {
              const heard = state.slide4ObservedSounds.includes(it.key);
              return (
                <button
                  type="button"
                  key={it.key}
                  onClick={() => handleHearItem(it)}
                  className={`cursor-pointer bg-white hover:bg-amber-50 border-2 rounded-2xl p-2 flex flex-col items-center justify-between h-32 shadow-sm transition ${
                    heard ? 'border-emerald-600 ring-2 ring-emerald-300' : 'border-amber-500'
                  }`}
                >
                  <PropIconBox
                    itemKey={it.key}
                    label={it.name}
                    customVisuals={state.customVisuals}
                  />
                  <div className="text-xs font-extrabold text-amber-950">{it.name}</div>
                  <span className="text-[10px] font-bold text-sky-700 flex items-center gap-1">
                    {heard ? <CheckCircle2 className="w-3 h-3 text-emerald-600" /> : <Volume2 className="w-3 h-3" />}
                    <span>{heard ? 'Sudah Diamati' : 'Dengarkan'}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <WaveformVisualizer label={activeSoundLabel} accentColor="#38BDF8" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-center">
            <div className="bg-sky-100 border border-sky-400 rounded-xl p-1.5 text-[11px] font-bold text-sky-950">
              1. Apa persamaannya?
            </div>
            <div className="bg-emerald-100 border border-emerald-400 rounded-xl p-1.5 text-[11px] font-bold text-emerald-950">
              2. Bagaimana bunyi dihasilkan?
            </div>
            <div className="bg-amber-100 border border-amber-400 rounded-xl p-1.5 text-[11px] font-bold text-amber-950">
              3. Mengapa bunyinya berbeda?
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={state.slide4Saved}
              onChange={(e) => onUpdateState({ slide4Saved: e.target.value })}
              placeholder="Tulis hasil pengamatanmu di sini (contoh: Semua berasal dari getaran, tetapi sumber getarnya berbeda)..."
              className="flex-1 px-3 py-1.5 rounded-xl border-2 border-amber-700 bg-white text-xs font-semibold"
            />
            <button
              type="button"
              onClick={() => {
                if (!state.slide4Saved.trim()) {
                  onToast('Tuliskan hasil pengamatanmu terlebih dahulu!', '✏️');
                  return;
                }
                onAwardStar(1, 's4_ans', 1);
                playSoundEffect('fanfare', state.soundEnabled);
                onToast('Jawaban pengamatan tersimpan! +1 Bintang Stage 1', '⭐');
              }}
              className="btn-3d-orange px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs whitespace-nowrap"
            >
              Simpan Jawaban
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slide 5: Prediksi Ilmuwan Cilik
  const objects: Array<{ key: PropKey; name: string; sound: SoundEffectType }> = [
    { key: 'senar_gitar', name: 'Senar Gitar', sound: 'guitar' },
    { key: 'membran_drum', name: 'Membran Drum', sound: 'drum' },
    { key: 'telepon_kaleng', name: 'Telepon Kaleng', sound: 'cup_clear' },
    { key: 'botol_air', name: 'Botol Air Berbeda', sound: 'flute' },
  ];

  const handleSavePrediction = () => {
    if (state.slide5Choice === 'Benda bergetar') {
      onAwardStar(1, 's5_pred', 1);
      playSoundEffect('fanfare', state.soundEnabled);
      onToast('Prediksimu tepat! Bunyi dihasilkan oleh benda yang bergetar. Ayo buktikan di Sonic Safari!', '✅');
    } else {
      playSoundEffect('click', state.soundEnabled);
      onToast('Hipotesismu tersimpan! Ayo kita uji kebenarannya di Stage berikutnya.', '💡');
    }
  };

  return (
    <div className="w-full h-full flex items-center gap-4">
      <div className="flex-1 parchment-panel rounded-3xl p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        <div className="md:col-span-5 space-y-2">
          <div className="text-[11px] font-bold text-amber-900">Objek Eksperimen:</div>
          <div className="grid grid-cols-2 gap-2.5">
            {objects.map((o) => (
              <button
                type="button"
                key={o.key}
                onClick={() => playSoundEffect(o.sound, state.soundEnabled)}
                className="cursor-pointer bg-white hover:bg-amber-50 border-2 border-amber-500 rounded-2xl p-2 flex flex-col items-center justify-between h-28 shadow-sm transition"
              >
                <PropIconBox
                  itemKey={o.key}
                  label={o.name}
                  customVisuals={state.customVisuals}
                />
                <span className="text-[11px] font-extrabold text-amber-950 text-center">{o.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="md:col-span-7 space-y-2.5">
          <div className="font-game font-bold text-sm sm:text-base text-amber-950">
            Pertanyaan Prediksi: &ldquo;Apa yang harus terjadi pada benda agar bunyi dihasilkan?&rdquo;
          </div>

          <div className="grid grid-cols-3 gap-2">
            {['Benda bergetar', 'Benda berubah warna', 'Benda diam'].map((opt) => (
              <button
                type="button"
                key={opt}
                onClick={() => {
                  playSoundEffect('click', state.soundEnabled);
                  onUpdateState({ slide5Choice: opt });
                }}
                className={`p-2 rounded-xl border-2 font-bold text-xs transition ${
                  state.slide5Choice === opt
                    ? 'bg-amber-500 text-white border-amber-900 shadow-inner'
                    : 'bg-white text-amber-950 border-amber-400 hover:bg-amber-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <textarea
            value={state.slide5Reason}
            onChange={(e) => onUpdateState({ slide5Reason: e.target.value })}
            rows={2}
            placeholder="Jelaskan alasan ilmiahmu mengapa benda tersebut dapat menghasilkan bunyi..."
            className="w-full px-3 py-1.5 rounded-xl border-2 border-amber-700 bg-white text-xs font-semibold"
          />

          <div className="flex flex-wrap items-center justify-between gap-2">
            <button
              type="button"
              onClick={handleSavePrediction}
              className="btn-3d-blue px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs"
            >
              Periksa & Simpan Prediksi
            </button>
            <button
              type="button"
              onClick={() => {
                onAwardStar(1, 's5_done', 1);
                onGoToSlide(2);
              }}
              className="btn-3d-orange px-5 py-1.5 rounded-xl font-game font-bold text-white text-xs"
            >
              Selesai Stage 1 (Ke Peta)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
