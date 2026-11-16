import React, { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Music, RotateCcw, Shuffle, Volume2 } from 'lucide-react';
import {
  STAGE4_GUESS_ROUNDS,
  STAGE4_MATCH_PAIRS,
  STAGE4_QUIZ_QUESTIONS,
} from '../../data/slidesData';
import { LenteraState } from '../../types/lentera';
import { playBottleNote, playSoundEffect } from '../../utils/audioEngine';
import { CharacterFigure, PropIconBox } from '../VisualAssets';
import { WaveformVisualizer } from '../WaveformVisualizer';
import { WaterXylophone3D } from '../three/WaterXylophone3D';

interface Stage4Props {
  slide: number;
  state: LenteraState;
  onUpdateState: (patch: Partial<LenteraState>) => void;
  onAwardStar: (stage: number, taskKey: string, stars?: number) => void;
  onGoToSlide: (slide: number) => void;
  onToast: (msg: string, icon?: string) => void;
}

const PAIR_BADGES = ['A', 'B', 'C', 'D', 'E'];

export const Stage4Slides: React.FC<Stage4Props> = ({
  slide,
  state,
  onUpdateState,
  onAwardStar,
  onGoToSlide,
  onToast,
}) => {
  // Slide 14 feedback
  const [qFeedback, setQFeedback] = useState<string>('');

  // Slide 15 matching state
  const [selectedLeftId, setSelectedLeftId] = useState<string | null>(null);
  const [shuffledRight, setShuffledRight] = useState(() =>
    [...STAGE4_MATCH_PAIRS].sort((a, b) => a.right.localeCompare(b.right))
  );

  // Slide 17 bottle feedback
  const [lastBottleHz, setLastBottleHz] = useState<string>('Klik botol kaca 3D (atau tekan angka 1–5 di keyboard)');
  const [activeBottleIdx, setActiveBottleIdx] = useState<number | null>(null);
  const [strikeNonce, setStrikeNonce] = useState<number>(0);

  const handlePlayBottle = useCallback(
    (idx: number) => {
      const hz = playBottleNote(idx, state.slide17Mode, state.soundEnabled);
      setActiveBottleIdx(idx);
      setStrikeNonce((n) => n + 1);
      const levels = [85, 68, 52, 36, 20];
      setLastBottleHz(
        `Botol ${idx + 1} (Air ${levels[idx]}%) · Mode ${state.slide17Mode} · Frekuensi ${hz.toFixed(1)} Hz`
      );
      setTimeout(() => setActiveBottleIdx(null), 260);
    },
    [state.slide17Mode, state.soundEnabled]
  );

  // Keyboard 1-5 support on Slide 17
  useEffect(() => {
    if (slide !== 17) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 5) {
        handlePlayBottle(num - 1);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [slide, handlePlayBottle]);

  // Slide 14: Sound Challenge (4 Progressive Questions)
  if (slide === 14) {
    const q = STAGE4_QUIZ_QUESTIONS[state.slide14CurrentQ];
    const selectedOpt = state.slide14Answers[q.id];

    const totalCorrect = STAGE4_QUIZ_QUESTIONS.filter((item) => state.slide14Answers[item.id] === item.correct).length;

    const checkCurrentQuestion = () => {
      if (!selectedOpt) {
        onToast('Pilih salah satu jawaban terlebih dahulu!', '✏️');
        return;
      }
      if (selectedOpt === q.correct) {
        playSoundEffect('fanfare', state.soundEnabled);
        setQFeedback(q.explanation);
        onAwardStar(4, 's14_q_first', 1);
        if (totalCorrect >= STAGE4_QUIZ_QUESTIONS.length) {
          onAwardStar(4, 's14_q_all', 1);
          onToast('Luar biasa! Semua 4 soal Sound Challenge benar! +1 Bintang tambahan', '⭐');
        } else {
          onToast('Jawaban benar!', '🎉');
        }
      } else {
        playSoundEffect('error', state.soundEnabled);
        setQFeedback('Belum tepat. Coba ingat kembali konsep getaran dan medium bunyi!');
        onToast('Belum tepat, coba lagi!', '💡');
      }
    };

    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="hidden md:flex flex-col items-center shrink-0">
          <CharacterFigure type="pakguru" className="w-28 h-28" />
          <span className="wood-panel px-3 py-0.5 rounded-full text-xs font-bold -mt-1 z-10">Pak Guru</span>
        </div>

        <div className="flex-1 parchment-panel rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-xs font-extrabold text-purple-900">
              {q.subject} · Soal {state.slide14CurrentQ + 1}/{STAGE4_QUIZ_QUESTIONS.length} · Benar:{' '}
              <span className="font-data">
                {totalCorrect}/{STAGE4_QUIZ_QUESTIONS.length}
              </span>
            </div>
            <div className="flex gap-1.5">
              {STAGE4_QUIZ_QUESTIONS.map((item, idx) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => {
                    setQFeedback('');
                    onUpdateState({ slide14CurrentQ: idx });
                  }}
                  className={`w-7 h-7 rounded-full font-game font-bold text-xs border-2 ${
                    state.slide14CurrentQ === idx
                      ? 'bg-purple-700 text-white border-purple-950'
                      : state.slide14Answers[item.id] === item.correct
                        ? 'bg-emerald-500 text-white border-emerald-800'
                        : 'bg-white text-amber-950 border-amber-400'
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="font-game font-bold text-sm sm:text-base text-amber-950">{q.question}</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {q.options.map((o) => (
              <button
                type="button"
                key={o.id}
                onClick={() => {
                  setQFeedback('');
                  playSoundEffect('click', state.soundEnabled);
                  onUpdateState({ slide14Answers: { ...state.slide14Answers, [q.id]: o.id } });
                }}
                className={`p-3 rounded-2xl border-2 text-left font-bold text-xs sm:text-sm flex items-center gap-2.5 transition ${
                  selectedOpt === o.id
                    ? 'bg-purple-700 text-white border-purple-950 shadow-lg'
                    : 'bg-white text-amber-950 border-amber-500 hover:bg-amber-50'
                }`}
              >
                <span className="w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-game font-extrabold flex items-center justify-center shrink-0">
                  {o.id}
                </span>
                <span>{o.text}</span>
              </button>
            ))}
          </div>

          {qFeedback && (
            <div className="bg-sky-100 border-2 border-sky-500 rounded-xl px-3 py-2 text-xs font-bold text-sky-950">
              {qFeedback}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex gap-2">
              {state.slide14CurrentQ > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQFeedback('');
                    onUpdateState({ slide14CurrentQ: state.slide14CurrentQ - 1 });
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-200 font-bold text-xs text-amber-950"
                >
                  ◀ Soal Sebelumnya
                </button>
              )}
              {state.slide14CurrentQ < STAGE4_QUIZ_QUESTIONS.length - 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setQFeedback('');
                    onUpdateState({ slide14CurrentQ: state.slide14CurrentQ + 1 });
                  }}
                  className="btn-3d-blue px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs"
                >
                  Soal Berikutnya ▶
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={checkCurrentQuestion}
              className="btn-3d-orange px-6 py-1.5 rounded-xl font-game font-bold text-white text-xs sm:text-sm"
            >
              Periksa Jawaban
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slide 15: Interactive Match & Match Game
  if (slide === 15) {
    const handleSelectRight = (rightText: string) => {
      if (!selectedLeftId) {
        onToast('Klik kartu konsep di sebelah KIRI terlebih dahulu, lalu klik pasangannya di kanan!', '👆');
        return;
      }
      playSoundEffect('click', state.soundEnabled);
      onUpdateState({
        slide15Pairs: { ...state.slide15Pairs, [selectedLeftId]: rightText },
      });
      setSelectedLeftId(null);
    };

    const verifyPairs = () => {
      let correct = 0;
      STAGE4_MATCH_PAIRS.forEach((p) => {
        if (state.slide15Pairs[p.id] === p.right) correct++;
      });
      if (correct === STAGE4_MATCH_PAIRS.length) {
        onAwardStar(4, 's15_match', 1);
        playSoundEffect('fanfare', state.soundEnabled);
        onToast('Sempurna! Semua 5 pasangan konsep bunyi cocok 100%! +1 Bintang Stage 4', '⭐');
      } else {
        playSoundEffect('error', state.soundEnabled);
        onToast(`Tepat ${correct}/${STAGE4_MATCH_PAIRS.length} pasangan. Perbaiki pasangan yang masih tertukar!`, '💡');
      }
    };

    const shuffleRight = () => {
      setShuffledRight((prev) => [...prev].sort(() => Math.random() - 0.5));
      onUpdateState({ slide15Pairs: {} });
      setSelectedLeftId(null);
    };

    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-2.5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-game font-bold text-xs sm:text-sm text-amber-950">
              Klik konsep di KIRI, lalu klik penjelasannya di KANAN untuk memasangkan!
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={shuffleRight}
                className="px-3 py-1 rounded-xl bg-amber-200 hover:bg-amber-300 font-bold text-xs text-amber-950 flex items-center gap-1"
              >
                <Shuffle className="w-3.5 h-3.5" /> Acak Ulang
              </button>
              <button
                type="button"
                onClick={verifyPairs}
                className="btn-3d-orange px-4 py-1 rounded-xl font-game font-bold text-white text-xs"
              >
                Periksa Pasangan
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Left column: Concepts */}
            <div className="space-y-1.5">
              {STAGE4_MATCH_PAIRS.map((p, idx) => {
                const isSelected = selectedLeftId === p.id;
                const pairedRight = state.slide15Pairs[p.id];
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => {
                      playSoundEffect('click', state.soundEnabled);
                      setSelectedLeftId(isSelected ? null : p.id);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl border-2 font-bold flex items-center justify-between transition ${
                      isSelected
                        ? 'bg-purple-700 text-white border-purple-950 shadow-md scale-[1.01]'
                        : pairedRight
                          ? 'bg-sky-50 text-sky-950 border-sky-500'
                          : 'bg-white text-amber-950 border-amber-400 hover:bg-amber-50'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-400 text-amber-950 font-game flex items-center justify-center shrink-0">
                        {PAIR_BADGES[idx]}
                      </span>
                      <span>{p.left}</span>
                    </span>
                    <span className="text-[10px] opacity-80">{pairedRight ? 'Terpasang' : 'Pilih'}</span>
                  </button>
                );
              })}
            </div>

            {/* Right column: Explanations */}
            <div className="space-y-1.5">
              {shuffledRight.map((r) => {
                const linkedIdx = STAGE4_MATCH_PAIRS.findIndex((p) => state.slide15Pairs[p.id] === r.right);
                return (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => handleSelectRight(r.right)}
                    className={`w-full text-left px-3 py-2 rounded-xl border-2 font-semibold flex items-center justify-between gap-2 transition ${
                      linkedIdx >= 0
                        ? 'bg-emerald-50 text-emerald-950 border-emerald-500'
                        : 'bg-white text-amber-950 border-amber-400 hover:bg-amber-50'
                    }`}
                  >
                    <span>{r.right}</span>
                    {linkedIdx >= 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-game font-bold text-[10px] shrink-0">
                        {PAIR_BADGES[linkedIdx]}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 16: Guess The Sound (4 Mystery Rounds)
  if (slide === 16) {
    const roundData = STAGE4_GUESS_ROUNDS[state.slide16Round];
    const picked = state.slide16Guesses[roundData.round] || '';

    const checkGuess = () => {
      if (!picked) {
        onToast('Pilih salah satu kartu alat musik terlebih dahulu!', '🎧');
        return;
      }
      if (picked === roundData.target) {
        onAwardStar(4, 's16_guess', 1);
        playSoundEffect('fanfare', state.soundEnabled);
        onToast(`Tepat sekali! Itu adalah bunyi ${roundData.target}.`, '🎉');
      } else {
        playSoundEffect('error', state.soundEnabled);
        onToast(`Belum tepat. Petunjuk: ${roundData.clue}`, '💡');
      }
    };

    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-2.5 text-center">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="font-game font-bold text-sm text-amber-950">
              GUESS THE SOUND · Ronde {state.slide16Round + 1}/{STAGE4_GUESS_ROUNDS.length}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {STAGE4_GUESS_ROUNDS.map((r, idx) => (
                <button
                  type="button"
                  key={r.round}
                  onClick={() => onUpdateState({ slide16Round: idx })}
                  className={`px-2.5 py-1 rounded-lg font-game font-bold text-xs border ${
                    state.slide16Round === idx
                      ? 'bg-purple-700 text-white border-purple-950'
                      : state.slide16Guesses[r.round] === r.target
                        ? 'bg-emerald-500 text-white border-emerald-800'
                        : 'bg-white text-amber-950 border-amber-400'
                  }`}
                >
                  Ronde {idx + 1}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => playSoundEffect(roundData.sound, state.soundEnabled)}
              className="btn-3d-blue px-6 py-2 rounded-full font-game font-bold text-white text-xs sm:text-sm flex items-center gap-1.5"
            >
              <Volume2 className="w-4 h-4" /> Putar Misteri Suara
            </button>
            <span className="text-xs font-semibold text-amber-800">Petunjuk: {roundData.clue}</span>
          </div>

          <WaveformVisualizer label="Osiloskop Suara Misteri" accentColor="#A855F7" />

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {roundData.options.map((g) => (
              <button
                type="button"
                key={g.name}
                onClick={() => {
                  playSoundEffect('click', state.soundEnabled);
                  onUpdateState({ slide16Guesses: { ...state.slide16Guesses, [roundData.round]: g.name } });
                }}
                className={`cursor-pointer rounded-2xl p-2 border-2 flex flex-col items-center justify-between h-32 transition ${
                  picked === g.name
                    ? 'bg-purple-700 text-white border-purple-950 scale-[1.03] shadow-lg'
                    : 'bg-white text-amber-950 border-amber-500 hover:bg-amber-50'
                }`}
              >
                <PropIconBox
                  itemKey={g.key}
                  label={g.name}
                  customVisuals={state.customVisuals}
                />
                <span className="font-game font-bold text-xs flex items-center gap-1">
                  {picked === g.name && <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{g.name}</span>
                </span>
              </button>
            ))}
          </div>

          <div className="flex justify-center">
            <button
              type="button"
              onClick={checkGuess}
              className="btn-3d-orange px-6 py-1.5 rounded-xl font-game font-bold text-white text-xs"
            >
              Periksa Tebakan
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slide 17: Final Boss - Xylophone 5 Botol Air 3D Nyata
  const bottles = [
    { water: 85, air: 15, badge: 'bg-rose-500' },
    { water: 68, air: 32, badge: 'bg-amber-500' },
    { water: 52, air: 48, badge: 'bg-emerald-500' },
    { water: 36, air: 64, badge: 'bg-sky-500' },
    { water: 20, air: 80, badge: 'bg-indigo-500' },
  ];

  const playDemoScale = () => {
    [0, 1, 2, 3, 4].forEach((idx, order) => {
      setTimeout(() => handlePlayBottle(idx), order * 320);
    });
  };

  return (
    <div className="w-full h-full flex items-center gap-4">
      <div className="flex-1 parchment-panel rounded-3xl p-3 sm:p-4 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <div className="font-game font-bold text-xs sm:text-sm text-amber-950">
              FINAL BOSS: Eksperimen Xylophone 5 Botol Air (3D)
            </div>
            <div className="text-[11px] font-semibold text-amber-800">{lastBottleHz}</div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => onUpdateState({ slide17Mode: 'Ketuk Botol' })}
              className={`px-3 py-1 rounded-xl font-game font-bold text-xs border-2 ${
                state.slide17Mode === 'Ketuk Botol'
                  ? 'bg-amber-600 text-white border-amber-950'
                  : 'bg-white text-amber-950 border-amber-500'
              }`}
            >
              Ketuk Botol (Getar Air)
            </button>
            <button
              type="button"
              onClick={() => onUpdateState({ slide17Mode: 'Tiup Botol' })}
              className={`px-3 py-1 rounded-xl font-game font-bold text-xs border-2 ${
                state.slide17Mode === 'Tiup Botol'
                  ? 'bg-sky-600 text-white border-sky-950'
                  : 'bg-white text-amber-950 border-amber-500'
              }`}
            >
              Tiup Botol (Getar Udara)
            </button>
            <button
              type="button"
              onClick={playDemoScale}
              className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-game font-bold text-xs flex items-center gap-1"
            >
              <Music className="w-3.5 h-3.5" /> Uji Tangga Nada (1–5)
            </button>
          </div>
        </div>

        {/* 5 Real 3D Glass Bottles Showcase */}
        <div className="bg-slate-900 p-2 rounded-2xl border-2 border-amber-600 space-y-1.5">
          <WaterXylophone3D
            mode={state.slide17Mode}
            activeBottleIdx={activeBottleIdx}
            strikeNonce={strikeNonce}
            onSelectBottle={handlePlayBottle}
          />
          <div className="grid grid-cols-5 gap-1.5">
            {bottles.map((b, idx) => (
              <button
                type="button"
                key={idx}
                onClick={() => handlePlayBottle(idx)}
                className={`cursor-pointer py-1 px-1.5 rounded-lg border text-[10px] font-game font-bold flex items-center justify-center gap-1 transition ${
                  activeBottleIdx === idx
                    ? 'bg-amber-400 text-slate-950 border-white scale-[1.03]'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-100 border-amber-700'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${b.badge} shrink-0`} />
                <span>
                  Botol {idx + 1} · Air {b.water}% (
                  {state.slide17Mode === 'Ketuk Botol'
                    ? ['Sol', 'La', 'Do', 'Re', 'Mi'][idx]
                    : ['Mi', 'Re', 'Do', 'La', 'Sol'][idx]}
                  )
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-amber-100 border border-amber-500 rounded-xl px-3 py-1.5 text-[11px] font-bold text-amber-950 flex items-center justify-between">
          <span>
            {state.slide17Mode === 'Ketuk Botol'
              ? 'Fisika Ketuk: Semakin banyak air, massa botol bertambah sehingga getaran lebih lambat (nada RENDAH).'
              : 'Fisika Tiup: Semakin banyak air, kolom udara di atasnya semakin pendek sehingga getaran udara lebih cepat (nada TINGGI).'}
          </span>
          <RotateCcw
            className="w-3.5 h-3.5 text-amber-800 cursor-pointer shrink-0 ml-2"
            onClick={() => onUpdateState({ slide17Notes: '' })}
          />
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={state.slide17Notes}
            onChange={(e) => onUpdateState({ slide17Notes: e.target.value })}
            placeholder="Jelaskan mengapa tinggi nada berbeda saat botol diketuk vs ditiup..."
            className="flex-1 px-3 py-1.5 rounded-xl border-2 border-amber-700 bg-white text-xs font-semibold"
          />
          <button
            type="button"
            onClick={() => {
              onAwardStar(4, 's17_boss', 1);
              playSoundEffect('fanfare', state.soundEnabled);
              onToast('Misi Final Boss Sonic Arena selesai! +1 Bintang Stage 4', '🏆');
              setTimeout(() => onGoToSlide(2), 900);
            }}
            className="btn-3d-orange px-5 py-1.5 rounded-xl font-game font-bold text-white text-xs whitespace-nowrap"
          >
            Kumpulkan & Ke Peta
          </button>
        </div>
      </div>
    </div>
  );
};
