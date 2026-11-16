import React, { useEffect, useState } from 'react';
import { CheckCircle2, Play, Volume2 } from 'lucide-react';
import { LenteraState, PropKey, SoundEffectType } from '../../types/lentera';
import { playSoundEffect } from '../../utils/audioEngine';
import { CharacterFigure, PropIconBox } from '../VisualAssets';
import { CupPhone3D } from '../three/CupPhone3D';
import { MediumMasters3D } from '../three/MediumMasters3D';

interface Stage3Props {
  slide: number;
  state: LenteraState;
  onUpdateState: (patch: Partial<LenteraState>) => void;
  onAwardStar: (stage: number, taskKey: string, stars?: number) => void;
  onGoToSlide: (slide: number) => void;
  onToast: (msg: string, icon?: string) => void;
}

export const Stage3Slides: React.FC<Stage3Props> = ({
  slide,
  state,
  onUpdateState,
  onAwardStar,
  onGoToSlide,
  onToast,
}) => {
  const [pulseActive, setPulseActive] = useState(false);
  const [selectedInstrumentInfo, setSelectedInstrumentInfo] = useState<string>(
    'Klik kartu alat musik untuk mendengar suara aslinya!'
  );

  // Slide 11: Auto-stop active sound wave pulse after 2.6s demonstration
  useEffect(() => {
    if (!pulseActive || slide !== 11) return;
    const timer = window.setTimeout(() => setPulseActive(false), 2600);
    return () => window.clearTimeout(timer);
  }, [pulseActive, slide]);

  // Slide 10: Lab Briefing
  if (slide === 10) {
    const stations: Array<{ title: string; desc: string; key: PropKey; target: number }> = [
      { title: 'Telepon Gelas Misterius', desc: 'Uji tali tegang vs kendur', key: 'telepon_kaleng', target: 11 },
      { title: 'Jalur Rahasia Bunyi', desc: 'Simulasi padat, cair, gas, hampa', key: 'membran_drum', target: 12 },
      { title: 'Berburu Alat Musik', desc: '5 sumber getar alat musik', key: 'gitar', target: 13 },
      { title: 'Xylophone Air', desc: 'Eksperimen botol bernada', key: 'botol_air', target: 17 },
    ];

    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="hidden md:flex flex-col items-center shrink-0">
          <CharacterFigure type="buguru" className="w-28 h-28" />
          <span className="wood-panel px-3 py-0.5 rounded-full text-xs font-bold -mt-1 z-10">Bu Guru</span>
        </div>

        <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-3">
          <div className="bg-amber-100 p-3 rounded-2xl border border-amber-500">
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              &ldquo;Selamat datang di <b>Sonic Lab</b>! Kalian akan menyelidiki bagaimana bunyi merambat melalui berbagai
              medium dan mengapa benda menghasilkan nada yang berbeda. Klik salah satu meja eksperimen untuk memulai!&rdquo;
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {stations.map((st) => (
              <button
                type="button"
                key={st.title}
                onClick={() => {
                  onAwardStar(3, 's10_brief', 1);
                  onGoToSlide(st.target);
                }}
                className="cursor-pointer bg-white hover:bg-sky-50 border-2 border-sky-600 rounded-2xl p-2.5 flex flex-col items-center justify-between h-36 shadow-sm transition text-center"
              >
                <PropIconBox
                  itemKey={st.key}
                  label={st.title}
                  customVisuals={state.customVisuals}
                />
                <div>
                  <div className="font-game font-bold text-xs text-sky-950">{st.title}</div>
                  <div className="text-[10px] font-semibold text-sky-700">{st.desc}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Slide 11: Cup Call (Telepon Kaleng 3D Nyata)
  if (slide === 11) {
    const isTaut = state.slide11String === 'Tegang';

    return (
      <div className="w-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-3 sm:p-4 space-y-2.5 text-center">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="px-3 py-1 rounded-xl bg-amber-200 font-bold text-xs text-amber-950">
              Alat & Bahan: 2 kaleng logam nyata dan tali merah sepanjang {state.slide11Distance} meter
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click', state.soundEnabled);
                  onUpdateState({ slide11String: 'Tegang' });
                }}
                className={`px-4 py-1.5 rounded-xl font-game font-bold text-xs border-2 ${
                  isTaut ? 'bg-emerald-600 text-white border-emerald-900' : 'bg-white text-amber-950 border-amber-500'
                }`}
              >
                Tali Tegang
              </button>
              <button
                type="button"
                onClick={() => {
                  playSoundEffect('click', state.soundEnabled);
                  onUpdateState({ slide11String: 'Kendur' });
                }}
                className={`px-4 py-1.5 rounded-xl font-game font-bold text-xs border-2 ${
                  !isTaut ? 'bg-rose-600 text-white border-rose-900' : 'bg-white text-amber-950 border-amber-500'
                }`}
              >
                Tali Kendur
              </button>
            </div>
          </div>

          {/* Real 3D Tin Can Telephone Simulation */}
          <div className="bg-slate-900 rounded-2xl p-2.5 border-4 border-amber-700 flex flex-col items-center justify-center space-y-2">
            <CupPhone3D isTaut={isTaut} distance={state.slide11Distance} pulseActive={pulseActive} />

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200 w-full px-1">
              <div className="flex items-center gap-2 flex-1 min-w-[200px]">
                <span className="font-bold whitespace-nowrap">Jarak Tali:</span>
                <input
                  type="range"
                  min="2"
                  max="10"
                  step="1"
                  value={state.slide11Distance}
                  onChange={(e) => onUpdateState({ slide11Distance: Number(e.target.value) })}
                  className="flex-1 accent-amber-400"
                />
                <span className="font-data font-bold">{state.slide11Distance} m</span>
              </div>
              <span className="text-[11px] font-semibold text-sky-300">
                Geser tampilan 3D untuk memutar kaleng logam
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-100 p-2 rounded-2xl border border-amber-500">
            <span className="text-xs font-bold text-amber-950 text-left">
              {isTaut
                ? 'Tali Tegang: Dasar kaleng menggetarkan tali merah kencang sehingga gelombang bunyi cepat sampai ke kaleng penerima.'
                : 'Tali Kendur: Tali merah melengkung kendur sehingga energi getaran bunyi hilang di tengah jalan dan suara teredam.'}
            </span>
            <button
              type="button"
              onClick={() => {
                setPulseActive(true);
                onAwardStar(3, 's11_cup', 1);
                playSoundEffect(isTaut ? 'cup_clear' : 'cup_muffled', state.soundEnabled);
                onToast(
                  isTaut
                    ? 'Tali Tegang: Getaran merambat lancar, suara terdengar JERNIH!'
                    : 'Tali Kendur: Getaran terhambat, suara TEREDAM/PELAN!',
                  '🔊'
                );
              }}
              className="btn-3d-orange px-5 py-1.5 rounded-xl font-game font-bold text-white text-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Volume2 className="w-4 h-4" />
              <span>Uji & Putar Suara ({state.slide11String})</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slide 12: Medium Masters
  if (slide === 12) {
    const matchRows = [
      { id: 'palu', label: 'Palu diketuk di meja kayu', ans: 'Padat' },
      { id: 'air', label: 'Suara ketukan batu di dalam kolam', ans: 'Cair' },
      { id: 'cakap', label: 'Percakapan dua teman di kelas', ans: 'Gas' },
      { id: 'antariksa', label: 'Suara di luar angkasa tanpa radio', ans: 'Hampa' },
    ];

    const checkMediumMatches = () => {
      let correct = 0;
      matchRows.forEach((r) => {
        if (state.slide12Matches[r.id] === r.ans) correct++;
      });
      if (correct >= 3) {
        onAwardStar(3, 's12_med', 1);
        playSoundEffect('fanfare', state.soundEnabled);
        onToast(`Mantap! Kamu berhasil memasangkan ${correct}/4 medium perambatan bunyi dengan tepat.`, '⭐');
      } else {
        playSoundEffect('error', state.soundEnabled);
        onToast(`Baru ${correct}/4 yang tepat. Cek kembali sifat partikel Padat, Cair, Gas, dan Hampa!`, '💡');
      }
    };

    const mediumInfo: Record<LenteraState['slide12Medium'], string> = {
      Padat: 'Medium Padat (~5.000 m/s): Partikel tersusun sangat rapat! Getaran paling cepat diteruskan.',
      Cair: 'Medium Cair (~1.480 m/s): Partikel cukup rapat. Contohnya sonar lumba-lumba di laut.',
      Gas: 'Medium Gas / Udara (~343 m/s): Partikel agak renggang. Bunyi percakapan merambat lewat udara.',
      Hampa: 'Ruang Hampa (0 m/s): Tidak ada partikel medium sama sekali, sehingga bunyi tidak dapat merambat.',
    };

    return (
      <div className="w-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 items-center">
          <div className="space-y-2">
            <div className="grid grid-cols-4 gap-1.5">
              {(['Padat', 'Cair', 'Gas', 'Hampa'] as const).map((m) => (
                <button
                  type="button"
                  key={m}
                  onClick={() => {
                    playSoundEffect('click', state.soundEnabled);
                    onUpdateState({ slide12Medium: m });
                  }}
                  className={`py-1.5 rounded-xl font-game font-bold text-xs border-2 ${
                    state.slide12Medium === m
                      ? 'bg-sky-600 text-white border-sky-900'
                      : 'bg-white text-amber-950 border-amber-500'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>

            <MediumMasters3D medium={state.slide12Medium} />

            <div className="bg-slate-900 rounded-xl p-2 text-amber-200 text-[11px] font-semibold border border-amber-600 flex flex-col gap-0.5">
              <span>{mediumInfo[state.slide12Medium]}</span>
              <span className="text-sky-300 text-[10px]">Geser kotak 3D untuk melihat susunan molekul dari berbagai sudut</span>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            <div className="font-game font-bold text-sm text-amber-950">Pasangkan Contoh Perambatan Bunyi:</div>
            {matchRows.map((row) => (
              <div
                key={row.id}
                className="flex items-center justify-between gap-2 bg-white px-3 py-2 rounded-xl border border-amber-400"
              >
                <span className="font-bold text-amber-950">{row.label}</span>
                <select
                  value={state.slide12Matches[row.id] || ''}
                  onChange={(e) => {
                    onUpdateState({
                      slide12Matches: { ...state.slide12Matches, [row.id]: e.target.value },
                    });
                  }}
                  className="px-2 py-1 rounded-lg border border-amber-600 font-bold bg-amber-50 shrink-0"
                >
                  <option value="">Pilih...</option>
                  <option value="Padat">Padat</option>
                  <option value="Cair">Cair</option>
                  <option value="Gas">Gas</option>
                  <option value="Hampa">Ruang Hampa</option>
                </select>
              </div>
            ))}

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={checkMediumMatches}
                className="btn-3d-orange px-5 py-1.5 rounded-xl font-game font-bold text-white text-xs"
              >
                Periksa Pasangan
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Slide 13: Instrument Hunter
  const instruments: Array<{
    name: string;
    way: string;
    source: string;
    sound: SoundEffectType;
    key: PropKey;
  }> = [
    { name: 'Seruling', way: 'Ditiup', source: 'Kolom udara', sound: 'flute', key: 'seruling' },
    { name: 'Drum', way: 'Dipukul', source: 'Membran kulit', sound: 'drum', key: 'membran_drum' },
    { name: 'Gitar', way: 'Dipetik', source: 'Senar / dawai', sound: 'guitar', key: 'gitar' },
    { name: 'Biola', way: 'Digesek', source: 'Senar / dawai', sound: 'violin', key: 'biola' },
    { name: 'Angklung', way: 'Digoyangkan', source: 'Tabung bambu', sound: 'angklung', key: 'angklung' },
  ];

  return (
    <div className="w-full h-full flex items-center gap-3">
      <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-2.5">
        <div className="text-xs font-bold text-amber-950">
          Klik setiap kartu alat musik untuk mendengarkan bunyi dan melihat sumber getarnya:
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
          {instruments.map((ins) => {
            const visited = state.slide13Visited.includes(ins.name);
            return (
              <button
                type="button"
                key={ins.name}
                onClick={() => {
                  playSoundEffect(ins.sound, state.soundEnabled);
                  setSelectedInstrumentInfo(`${ins.name}: Dimainkan dengan cara ${ins.way} · Sumber getar: ${ins.source}`);
                  if (!visited) {
                    const next = [...state.slide13Visited, ins.name];
                    onUpdateState({ slide13Visited: next });
                    if (next.length >= 4) onAwardStar(3, 's13_ins', 1);
                  }
                }}
                className={`cursor-pointer bg-white hover:bg-amber-50 border-2 rounded-2xl p-2.5 flex flex-col items-center justify-between h-40 shadow-sm text-center transition ${
                  visited ? 'border-emerald-600' : 'border-amber-500'
                }`}
              >
                <PropIconBox
                  itemKey={ins.key}
                  label={ins.name}
                  customVisuals={state.customVisuals}
                />
                <div>
                  <div className="font-game font-bold text-xs text-amber-950">{ins.name}</div>
                  <div className="text-[10px] font-bold text-sky-800">
                    {ins.way} · {ins.source}
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[10px] flex items-center gap-1">
                  {visited ? <CheckCircle2 className="w-3 h-3" /> : <Play className="w-2.5 h-2.5 fill-white" />}
                  <span>{visited ? 'Terputar' : 'Putar'}</span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 bg-amber-100 px-3.5 py-2 rounded-2xl border border-amber-500">
          <span className="text-xs font-bold text-amber-950">{selectedInstrumentInfo}</span>
          <button
            type="button"
            onClick={() => {
              onAwardStar(3, 's13_done', 1);
              playSoundEffect('fanfare', state.soundEnabled);
              onGoToSlide(2);
            }}
            className="btn-3d-orange px-5 py-1.5 rounded-xl font-game font-bold text-white text-xs whitespace-nowrap"
          >
            Selesai Stage 3 (Ke Peta)
          </button>
        </div>
      </div>
    </div>
  );
};
