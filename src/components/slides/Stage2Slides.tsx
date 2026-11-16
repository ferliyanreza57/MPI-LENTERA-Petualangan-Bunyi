import React, { useEffect, useRef, useState } from 'react';
import { Play, Sparkles, Volume2 } from 'lucide-react';
import { LenteraState, PropKey, SoundEffectType } from '../../types/lentera';
import { playSoundEffect, playToneHz } from '../../utils/audioEngine';
import { CharacterFigure, PropIconBox } from '../VisualAssets';
import { WaveformVisualizer } from '../WaveformVisualizer';

interface Stage2Props {
  slide: number;
  state: LenteraState;
  onUpdateState: (patch: Partial<LenteraState>) => void;
  onAwardStar: (stage: number, taskKey: string, stars?: number) => void;
  onGoToSlide: (slide: number) => void;
  onToast: (msg: string, icon?: string) => void;
}

export const Stage2Slides: React.FC<Stage2Props> = ({
  slide,
  state,
  onUpdateState,
  onAwardStar,
  onGoToSlide,
  onToast,
}) => {
  const [s6ComparisonAnswer, setS6ComparisonAnswer] = useState<'ya' | 'tidak' | null>(null);
  const [activeWaveMeta, setActiveWaveMeta] = useState<{ label: string; color: string }>({
    label: 'Klik kartu bunyi untuk melihat pola gelombang nyatanya',
    color: '#F59E0B',
  });
  const physicsCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Slide 7 Interactive Longitudinal Wave Physics Canvas
  useEffect(() => {
    if (slide !== 7) return;
    let rafId = 0;
    let phase = 0;

    const renderPhysics = () => {
      const canvas = physicsCanvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, W, H);

      // Vibrating source membrane on the left
      const ampPx = state.slide7Vibrating ? state.slide7Amplitude * 14 : 0;
      const freqSpeed = state.slide7Vibrating ? 0.08 * state.slide7Frequency : 0;
      phase += freqSpeed;

      const membraneX = 36 + Math.sin(phase) * ampPx;
      ctx.fillStyle = '#F59E0B';
      ctx.fillRect(membraneX - 6, 18, 12, H - 36);

      // Air particle grid illustrating longitudinal compression & rarefaction
      const cols = 22;
      const rows = 4;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const baseX = 72 + c * ((W - 115) / (cols - 1));
          const baseY = 26 + r * ((H - 52) / (rows - 1));
          const disp = state.slide7Vibrating
            ? Math.sin(c * 0.65 - phase) * (state.slide7Amplitude * 12)
            : 0;
          const x = baseX + disp;
          const compression = Math.cos(c * 0.65 - phase);
          ctx.fillStyle = state.slide7Vibrating && compression > 0.35 ? '#38BDF8' : '#94A3B8';
          ctx.beginPath();
          ctx.arc(x, baseY, 4.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Ear icon target on the right
      ctx.fillStyle = '#FDE68A';
      ctx.font = 'bold 14px Plus Jakarta Sans, sans-serif';
      ctx.fillText('Telinga', W - 62, H / 2 + 5);

      rafId = requestAnimationFrame(renderPhysics);
    };

    rafId = requestAnimationFrame(renderPhysics);
    return () => cancelAnimationFrame(rafId);
  }, [slide, state.slide7Vibrating, state.slide7Amplitude, state.slide7Frequency]);

  // Slide 6: Sound Explorer
  if (slide === 6) {
    const cards: Array<{ key: PropKey; name: string; sound: SoundEffectType; desc: string; color: string }> = [
      { key: 'bel', name: 'Bel Sekolah', sound: 'bell', desc: 'Nada tinggi, keras & jernih', color: '#FACC15' },
      { key: 'membran_drum', name: 'Drum', sound: 'drum', desc: 'Nada rendah, kuat bertenaga', color: '#F97316' },
      { key: 'gitar', name: 'Gitar', sound: 'guitar', desc: 'Nada harmonis beresonansi', color: '#10B981' },
      { key: 'burung', name: 'Burung', sound: 'bird', desc: 'Nada sangat tinggi & cepat', color: '#38BDF8' },
      { key: 'hujan', name: 'Hujan', sound: 'rain', desc: 'Bunyi desah acak berkelanjutan', color: '#60A5FA' },
      { key: 'tepuk_tangan', name: 'Tepuk Tangan', sound: 'clap', desc: 'Bunyi dentum singkat', color: '#F43F5E' },
    ];

    return (
      <div className="w-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-3 space-y-2">
          <div className="text-xs font-bold text-amber-950">
            Dengarkan dan bandingkan 6 sumber bunyi di bawah ini:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {cards.map((c) => {
              const visited = state.slide6Visited.includes(c.key);
              return (
                <button
                  type="button"
                  key={c.key}
                  onClick={() => {
                    playSoundEffect(c.sound, state.soundEnabled);
                    setActiveWaveMeta({ label: `${c.name} — ${c.desc}`, color: c.color });
                    if (!visited) {
                      const next = [...state.slide6Visited, c.key];
                      onUpdateState({ slide6Visited: next });
                      if (next.length >= 3) onAwardStar(2, 's6_play', 1);
                    }
                  }}
                  className={`cursor-pointer bg-white hover:bg-amber-50 border-2 rounded-2xl p-1.5 flex flex-col items-center justify-between h-32 shadow-sm transition group ${
                    visited ? 'border-emerald-600' : 'border-amber-500'
                  }`}
                >
                  <PropIconBox
                    itemKey={c.key}
                    label={c.name}
                    className="scale-90 -my-1"
                    customVisuals={state.customVisuals}
                  />
                  <div className="font-game font-bold text-[11px] leading-tight text-amber-950 text-center">
                    {c.name}
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-orange-500 text-white font-bold text-[10px] flex items-center gap-1 group-hover:scale-105 transition">
                    <Play className="w-2.5 h-2.5 fill-white" /> Putar
                  </span>
                </button>
              );
            })}
          </div>

          <WaveformVisualizer label={activeWaveMeta.label} accentColor={activeWaveMeta.color} height={52} />

          <div className="bg-amber-100 border-2 border-amber-500 rounded-2xl p-2 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-amber-950">
              Pertanyaan Kritis: &ldquo;Apakah suara yang lebih keras selalu memiliki nada lebih tinggi?&rdquo;
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setS6ComparisonAnswer('ya');
                  playSoundEffect('error', state.soundEnabled);
                  onToast('Kurang tepat! Drum bersuara keras, tetapi nadanya lebih rendah daripada kicau burung.', '💡');
                }}
                className={`px-3 py-1 rounded-xl font-bold text-xs border-2 ${
                  s6ComparisonAnswer === 'ya'
                    ? 'bg-rose-600 text-white border-rose-900'
                    : 'bg-white text-amber-950 border-amber-400'
                }`}
              >
                Ya, selalu
              </button>
              <button
                type="button"
                onClick={() => {
                  setS6ComparisonAnswer('tidak');
                  onAwardStar(2, 's6_cmp', 1);
                  playSoundEffect('fanfare', state.soundEnabled);
                  onToast('Tepat! Kuat bunyi ditentukan amplitudo, sedangkan tinggi nada ditentukan frekuensi.', '⭐');
                }}
                className={`px-3 py-1 rounded-xl font-bold text-xs border-2 ${
                  s6ComparisonAnswer === 'tidak'
                    ? 'bg-emerald-600 text-white border-emerald-900'
                    : 'bg-white text-amber-950 border-amber-400'
                }`}
              >
                Tidak (Amplitudo ≠ Frekuensi)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 7: Sound Knowledge (Apa Itu Bunyi?)
  if (slide === 7) {
    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="hidden md:flex flex-col items-center shrink-0">
          <CharacterFigure type="pakguru" className="w-28 h-28" />
          <span className="wood-panel px-3 py-0.5 rounded-full text-xs font-bold -mt-1 z-10">Pak Guru</span>
        </div>

        <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-2.5">
          <div className="wood-panel px-4 py-2 rounded-2xl font-game font-bold text-xs sm:text-sm text-amber-200 text-center">
            KONSEP INTI: Bunyi dihasilkan oleh benda yang <span className="text-amber-300 underline">BERGETAR</span>{' '}
            dan merambat mendorong partikel <span className="text-sky-300 underline">MEDIUM</span> ke telinga.
          </div>

          {/* Interactive 3 Sound Sources */}
          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => playSoundEffect('guitar', state.soundEnabled)}
              className={`cursor-pointer bg-white border-2 border-amber-500 rounded-2xl p-2 flex flex-col items-center justify-between h-28 ${
                state.slide7Vibrating ? 'vibrate-active ring-2 ring-amber-400' : ''
              }`}
            >
              <PropIconBox itemKey="senar_gitar" label="Senar Gitar" className="scale-90" customVisuals={state.customVisuals} />
              <div className="font-game font-bold text-xs text-amber-950">Senar Gitar (Dipetik)</div>
            </button>
            <button
              type="button"
              onClick={() => playSoundEffect('drum', state.soundEnabled)}
              className={`cursor-pointer bg-white border-2 border-amber-500 rounded-2xl p-2 flex flex-col items-center justify-between h-28 ${
                state.slide7Vibrating ? 'vibrate-active ring-2 ring-amber-400' : ''
              }`}
            >
              <PropIconBox itemKey="membran_drum" label="Membran Drum" className="scale-90" customVisuals={state.customVisuals} />
              <div className="font-game font-bold text-xs text-amber-950">Membran Drum (Dipukul)</div>
            </button>
            <button
              type="button"
              onClick={() => playSoundEffect('flute', state.soundEnabled)}
              className={`cursor-pointer bg-white border-2 border-amber-500 rounded-2xl p-2 flex flex-col items-center justify-between h-28 ${
                state.slide7Vibrating ? 'vibrate-active ring-2 ring-amber-400' : ''
              }`}
            >
              <PropIconBox itemKey="seruling" label="Kolom Udara Seruling" className="scale-90" customVisuals={state.customVisuals} />
              <div className="font-game font-bold text-xs text-amber-950">Seruling (Kolom Udara)</div>
            </button>
          </div>

          {/* Interactive Longitudinal Physics Sandbox */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-2.5 items-center bg-slate-900 rounded-2xl p-3 border-2 border-amber-600 text-white">
            <div className="lg:col-span-7">
              <div className="text-[11px] font-bold text-amber-300 mb-1">
                Simulasi Gelombang Longitudinal Partikel Udara (Rapatan & Regangan)
              </div>
              <canvas ref={physicsCanvasRef} width={520} height={110} className="w-full h-24 rounded-xl border border-slate-700" />
            </div>

            <div className="lg:col-span-5 space-y-2 text-xs">
              <div>
                <div className="flex justify-between font-bold text-amber-200">
                  <span>Amplitudo (Kekuatan Getar)</span>
                  <span className="font-data">{Math.round(state.slide7Amplitude * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.1"
                  value={state.slide7Amplitude}
                  onChange={(e) => onUpdateState({ slide7Amplitude: parseFloat(e.target.value), slide7Vibrating: true })}
                  className="w-full accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between font-bold text-sky-200">
                  <span>Frekuensi (Kecepatan Getar)</span>
                  <span className="font-data">{Math.round(state.slide7Frequency * 220)} Hz</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.5"
                  value={state.slide7Frequency}
                  onChange={(e) => onUpdateState({ slide7Frequency: parseFloat(e.target.value), slide7Vibrating: true })}
                  className="w-full accent-sky-400"
                />
              </div>

              <div className="flex gap-2 pt-0.5">
                <button
                  type="button"
                  onClick={() => {
                    const nextVib = !state.slide7Vibrating;
                    onUpdateState({ slide7Vibrating: nextVib });
                    onAwardStar(2, 's7_anim', 1);
                    if (nextVib) {
                      playToneHz(state.slide7Frequency * 220, 0.55, 'sine', state.soundEnabled);
                    }
                  }}
                  className="flex-1 btn-3d-blue py-1.5 rounded-xl font-game font-bold text-xs flex items-center justify-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{state.slide7Vibrating ? 'Hentikan Getaran' : 'Aktifkan Getaran'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAwardStar(2, 's7_anim', 1);
                    playToneHz(state.slide7Frequency * 220, 0.55, 'triangle', state.soundEnabled);
                  }}
                  className="btn-3d-orange px-3 py-1.5 rounded-xl font-game font-bold text-xs flex items-center gap-1"
                >
                  <Volume2 className="w-3.5 h-3.5" /> Uji Nada
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 8: Frequency Ranger
  if (slide === 8) {
    const items: Array<{ name: string; key: PropKey; range: string; sample: SoundEffectType; answer: string }> = [
      { name: 'Gajah', key: 'gajah', range: '< 20 Hz', sample: 'infra', answer: 'Infrasonik' },
      { name: 'Paus', key: 'paus', range: '10–18 Hz', sample: 'infra', answer: 'Infrasonik' },
      { name: 'Nada Piano', key: 'piano', range: '27–4.186 Hz', sample: 'audio', answer: 'Audiosonik' },
      { name: 'Nyamuk', key: 'nyamuk', range: '450–600 Hz', sample: 'bird', answer: 'Audiosonik' },
      { name: 'Anjing', key: 'anjing', range: 'hingga 45 kHz', sample: 'ultra', answer: 'Ultrasonik' },
      { name: 'Kelelawar', key: 'kelelawar', range: '> 20.000 Hz', sample: 'ultra', answer: 'Ultrasonik' },
    ];

    const checkAnswers = () => {
      let correct = 0;
      items.forEach((it) => {
        if (state.slide8Bins[it.name] === it.answer) correct++;
      });
      if (correct >= 4) {
        onAwardStar(2, 's8_freq', 1);
        playSoundEffect('fanfare', state.soundEnabled);
        onToast(`Bagus sekali! Kamu menjawab ${correct}/6 kategori frekuensi dengan tepat!`, '🎯');
      } else {
        playSoundEffect('error', state.soundEnabled);
        onToast(`Baru ${correct}/6 yang tepat. Ingat: Infrasonik (<20 Hz), Audiosonik (20–20.000 Hz), Ultrasonik (>20.000 Hz).`, '💡');
      }
    };

    return (
      <div className="w-full h-full flex items-center gap-3">
        <div className="flex-1 parchment-panel rounded-3xl p-3.5 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <div className="font-game font-bold text-xs sm:text-sm text-amber-950">
                Klasifikasikan ke 3 Zona Frekuensi (Infrasonik · Audiosonik · Ultrasonik)
              </div>
              <div className="text-[11px] font-semibold text-amber-800">
                Infrasonik (&lt;20 Hz) · Audiosonik (20–20.000 Hz, terdengar manusia) · Ultrasonik (&gt;20.000 Hz)
              </div>
            </div>
            <button
              type="button"
              onClick={checkAnswers}
              className="btn-3d-orange px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs"
            >
              Periksa Jawaban
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {items.map((item) => (
              <div
                key={item.name}
                className="bg-white border-2 border-amber-500 rounded-2xl p-2 flex flex-col items-center justify-between h-48 shadow-sm"
              >
                <button
                  type="button"
                  onClick={() => playSoundEffect(item.sample, state.soundEnabled)}
                  title="Dengar ilustrasi frekuensi"
                  className="cursor-pointer hover:scale-105 transition"
                >
                  <PropIconBox
                    itemKey={item.key}
                    label={item.name}
                    customVisuals={state.customVisuals}
                  />
                </button>
                <div className="text-center">
                  <div className="font-game font-bold text-xs text-amber-950">{item.name}</div>
                  <div className="text-[10px] font-data text-sky-700 font-bold">{item.range}</div>
                </div>
                <div className="grid grid-cols-1 gap-1 w-full">
                  {['Infrasonik', 'Audiosonik', 'Ultrasonik'].map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      onClick={() => {
                        playSoundEffect('click', state.soundEnabled);
                        onUpdateState({ slide8Bins: { ...state.slide8Bins, [item.name]: cat } });
                      }}
                      className={`py-0.5 rounded-lg text-[10px] font-bold border ${
                        state.slide8Bins[item.name] === cat
                          ? 'bg-amber-600 text-white border-amber-900'
                          : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Slide 9: Sound Detective (All 4 Interactive Tabs!)
  const s9Sounds: Array<{ title: string; type: SoundEffectType; key: string }> = [
    { title: 'Suara 1: Alunan Seruling', type: 'nada', key: 'Nada' },
    { title: 'Suara 2: Desir Hujan & Angin', type: 'desah', key: 'Desah' },
    { title: 'Suara 3: Dentuman Keras', type: 'dentum', key: 'Dentum' },
  ];
  const curS9 = s9Sounds[state.slide9AudioIdx];

  const tabs = [
    '1. Nada, Desah, Dentum',
    '2. Cocokkan Alat Musik',
    '3. Cara Memainkan',
    '4. Sumber Getar',
  ];

  return (
    <div className="w-full h-full flex items-center gap-3">
      <div className="w-48 hidden sm:flex flex-col gap-1.5 shrink-0">
        {tabs.map((t, idx) => (
          <button
            type="button"
            key={t}
            onClick={() => {
              playSoundEffect('click', state.soundEnabled);
              onUpdateState({ slide9Tab: idx });
            }}
            className={`px-3 py-2 rounded-xl font-game font-bold text-xs text-left border-2 transition ${
              state.slide9Tab === idx ? 'bg-amber-500 text-white border-white shadow' : 'wood-panel text-amber-100'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-2.5 text-center">
        {state.slide9Tab === 0 && (
          <>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onUpdateState({ slide9AudioIdx: (state.slide9AudioIdx + 2) % 3, slide9Category: '' })}
                className="btn-3d-blue px-3 py-1 rounded-xl text-white font-bold text-xs"
              >
                ◀ Sebelumnya
              </button>
              <div className="wood-panel px-4 py-1.5 rounded-2xl font-game font-bold text-xs sm:text-sm text-amber-200">
                {curS9.title}
              </div>
              <button
                type="button"
                onClick={() => onUpdateState({ slide9AudioIdx: (state.slide9AudioIdx + 1) % 3, slide9Category: '' })}
                className="btn-3d-blue px-3 py-1 rounded-xl text-white font-bold text-xs"
              >
                Berikutnya ▶
              </button>
            </div>
            <button
              type="button"
              onClick={() => playSoundEffect(curS9.type, state.soundEnabled)}
              className="btn-3d-orange px-6 py-2 rounded-full font-game font-bold text-white text-xs sm:text-sm"
            >
              Putar Audio Detektif
            </button>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { name: 'Nada', desc: 'Frekuensi teratur' },
                { name: 'Desah', desc: 'Frekuensi acak halus' },
                { name: 'Dentum', desc: 'Bunyi keras singkat' },
              ].map((cat) => (
                <button
                  type="button"
                  key={cat.name}
                  onClick={() => {
                    onUpdateState({ slide9Category: cat.name });
                    if (cat.name === curS9.key) {
                      onAwardStar(2, 's9_cat', 1);
                      playSoundEffect('fanfare', state.soundEnabled);
                      onToast(`Benar! ${curS9.title} termasuk kategori ${cat.name}.`, '✅');
                    } else {
                      playSoundEffect('error', state.soundEnabled);
                      onToast('Belum tepat, coba dengarkan kembali keteraturan getarannya!', '💡');
                    }
                  }}
                  className={`p-2 rounded-2xl border-2 font-game font-bold text-xs ${
                    state.slide9Category === cat.name
                      ? 'bg-emerald-600 text-white border-emerald-900'
                      : 'bg-white text-amber-950 border-amber-500'
                  }`}
                >
                  <div>{cat.name}</div>
                  <div className="text-[10px] font-normal opacity-85">{cat.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {state.slide9Tab === 1 && (
          <div className="space-y-2 text-left text-xs">
            <div className="font-game font-bold text-sm text-amber-950 text-center">
              Cocokkan Karakteristik Suara dengan Alat Musiknya
            </div>
            {[
              { id: 'seruling', clue: 'Alunan lembut kolom udara', ans: 'Seruling', sound: 'flute' as SoundEffectType },
              { id: 'gitar', clue: 'Petikan senar bernada harmonis', ans: 'Gitar', sound: 'guitar' as SoundEffectType },
              { id: 'drum', clue: 'Pukulan membran bertenaga', ans: 'Drum', sound: 'drum' as SoundEffectType },
            ].map((row) => (
              <div key={row.id} className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-amber-400">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => playSoundEffect(row.sound, state.soundEnabled)}
                    className="px-2.5 py-1 rounded-lg bg-sky-600 text-white font-bold text-[11px]"
                  >
                    Dengar
                  </button>
                  <span className="font-bold text-amber-950">{row.clue}</span>
                </div>
                <select
                  value={state.slide9InstrumentMatches[row.id] || ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    onUpdateState({
                      slide9InstrumentMatches: { ...state.slide9InstrumentMatches, [row.id]: val },
                    });
                    if (val === row.ans) onToast(`Cocok! Itu adalah ${row.ans}.`, '✅');
                  }}
                  className="px-3 py-1 rounded-lg border border-amber-600 font-bold bg-amber-50"
                >
                  <option value="">Pilih alat musik...</option>
                  <option value="Seruling">Seruling</option>
                  <option value="Gitar">Gitar</option>
                  <option value="Drum">Drum</option>
                </select>
              </div>
            ))}
          </div>
        )}

        {state.slide9Tab === 2 && (
          <div className="space-y-2 text-left text-xs">
            <div className="font-game font-bold text-sm text-amber-950 text-center">
              Kelompokkan Cara Memainkan Alat Musik
            </div>
            {[
              { id: 'gitar', label: 'Gitar', ans: 'Dipetik' },
              { id: 'seruling', label: 'Seruling', ans: 'Ditiup' },
              { id: 'drum', label: 'Drum', ans: 'Dipukul' },
            ].map((row) => (
              <div key={row.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-400">
                <span className="font-extrabold text-amber-950">{row.label}</span>
                <div className="flex gap-1.5">
                  {['Dipetik', 'Ditiup', 'Dipukul'].map((method) => (
                    <button
                      type="button"
                      key={method}
                      onClick={() => {
                        onUpdateState({ slide9PlayMethods: { ...state.slide9PlayMethods, [row.id]: method } });
                        if (method === row.ans) onToast(`Benar! ${row.label} dimainkan dengan cara ${method}.`, '🎵');
                      }}
                      className={`px-3 py-1 rounded-lg font-bold border ${
                        state.slide9PlayMethods[row.id] === method
                          ? method === row.ans
                            ? 'bg-emerald-600 text-white border-emerald-900'
                            : 'bg-rose-600 text-white border-rose-900'
                          : 'bg-amber-50 text-amber-950 border-amber-300'
                      }`}
                    >
                      {method}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {state.slide9Tab === 3 && (
          <div className="space-y-2 text-left text-xs">
            <div className="font-game font-bold text-sm text-amber-950 text-center">
              Identifikasi Bagian yang Bergetar sebagai Sumber Bunyi
            </div>
            {[
              { id: 'gitar', label: 'Gitar', ans: 'Senar/Dawai' },
              { id: 'drum', label: 'Drum', ans: 'Membran Kulit' },
              { id: 'seruling', label: 'Seruling', ans: 'Kolom Udara' },
            ].map((row) => (
              <div key={row.id} className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-amber-400">
                <span className="font-extrabold text-amber-950">{row.label}</span>
                <div className="flex gap-1.5 flex-wrap">
                  {['Senar/Dawai', 'Membran Kulit', 'Kolom Udara'].map((src) => (
                    <button
                      type="button"
                      key={src}
                      onClick={() => {
                        onUpdateState({ slide9VibrationSources: { ...state.slide9VibrationSources, [row.id]: src } });
                        if (src === row.ans) onToast(`Tepat! Sumber getar ${row.label} adalah ${src}.`, '✨');
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold border ${
                        state.slide9VibrationSources[row.id] === src
                          ? src === row.ans
                            ? 'bg-emerald-600 text-white border-emerald-900'
                            : 'bg-rose-600 text-white border-rose-900'
                          : 'bg-amber-50 text-amber-950 border-amber-300'
                      }`}
                    >
                      {src}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={state.slide9Reason}
            onChange={(e) => onUpdateState({ slide9Reason: e.target.value })}
            placeholder="Tulis kesimpulan detektifmu tentang Nada, Desah, Dentum, atau Sumber Getar..."
            className="flex-1 px-3 py-1.5 rounded-xl border-2 border-amber-700 bg-white text-xs font-semibold"
          />
          <button
            type="button"
            onClick={() => {
              onAwardStar(2, 's9_done', 1);
              playSoundEffect('fanfare', state.soundEnabled);
              onGoToSlide(2);
            }}
            className="btn-3d-orange px-5 py-1.5 rounded-xl font-game font-bold text-white text-xs whitespace-nowrap"
          >
            Selesai Stage 2 (Ke Peta)
          </button>
        </div>
      </div>
    </div>
  );
};
