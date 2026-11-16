import React, { useEffect, useRef, useState } from 'react';
import {
  CheckCircle2,
  Download,
  ExternalLink,
  FolderOpen,
  ImagePlus,
  Link2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DEFAULT_CERTIFICATE_IMAGE } from '../../data/slidesData';
import { CreationSubmission, LenteraState } from '../../types/lentera';
import { playSoundEffect } from '../../utils/audioEngine';
import { CharacterFigure } from '../VisualAssets';

const STAGE5_MISSIONS = [
  {
    id: 'Misi A: Sonic Maker',
    tag: 'Rekayasa Alat',
    desc: 'Membuat telepon gelas, gitar karet gelang, atau alat musik sederhana dari barang bekas.',
    driveUrl: 'https://drive.google.com/drive/folders/1zOBHJoMuGtYXeb6U0E2SYuPiLQIPP1aJ?usp=sharing',
  },
  {
    id: 'Misi B: Sonic Illustrator',
    tag: 'Visual Sains',
    desc: 'Membuat poster atau infografik tentang sumber bunyi, getaran, dan medium perambatan.',
    driveUrl: 'https://drive.google.com/drive/folders/1oTCqS7HOE97fn-ysJgTbKeqxDvbZDtW7?usp=sharing',
  },
  {
    id: 'Misi C: Sonic Performer',
    tag: 'Pertunjukan Musik',
    desc: 'Memainkan lagu anak sederhana menggunakan xylophone 5 botol air yang telah diuji.',
    driveUrl: 'https://drive.google.com/drive/folders/1Iegf6-l00FWfnCtxQkFDAYEyzJQMUb_n?usp=sharing',
  },
  {
    id: 'Misi D: Sonic Storyteller',
    tag: 'Narasi & Eksplanasi',
    desc: 'Membuat video atau rekaman penjelasan ilmiah tentang bagaimana bunyi sampai ke telinga.',
    driveUrl: 'https://drive.google.com/drive/folders/1Mjc7sWv2z66A3bl2hZDsFT_cDkkr2VdA?usp=sharing',
  },
] as const;

const CONFETTI_PIECES = Array.from({ length: 34 }, (_, i) => ({
  id: i,
  left: `${3 + ((i * 29) % 94)}%`,
  delay: (i % 8) * 0.08,
  duration: 2.2 + (i % 5) * 0.35,
  drift: ((i % 2 === 0 ? 1 : -1) * (20 + (i % 4) * 14)),
  rotate: (i % 2 === 0 ? 1 : -1) * (180 + (i % 5) * 60),
  color: ['#facc15', '#38bdf8', '#f43f5e', '#34d399', '#a855f7', '#fb923c'][i % 6],
  isStar: i % 3 === 0,
}));

interface Stage5Props {
  slide: number;
  state: LenteraState;
  onUpdateState: (patch: Partial<LenteraState>) => void;
  onAwardStar: (stage: number, taskKey: string, stars?: number) => void;
  onGoToSlide: (slide: number) => void;
  onToast: (msg: string, icon?: string) => void;
  onResetProgress: () => void;
}

export const Stage5Slides: React.FC<Stage5Props> = ({
  slide,
  state,
  onUpdateState,
  onAwardStar,
  onGoToSlide,
  onToast,
  onResetProgress,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [driveSubmitted, setDriveSubmitted] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (slide === 21) {
      onAwardStar(5, 's21_cert', 1);
    }
    if (slide !== 19 && mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // Ignore already-stopped recorder
      }
      setIsRecording(false);
    }
  }, [slide, onAwardStar]);

  useEffect(() => {
    setDriveSubmitted(false);
  }, [state.slide18Mission]);

  // Slide 18: Choose Your Creation
  if (slide === 18) {
    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-3">
          <p className="text-xs sm:text-sm font-bold text-amber-950">
            &ldquo;Sekarang saatnya kamu menunjukkan hasil belajarmu di <b>Sonic Expo</b>! Pilih salah satu misi
            sesuai minat dan kemampuanmu.&rdquo;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STAGE5_MISSIONS.map((ms) => {
              const selected = state.slide18Mission === ms.id;
              return (
                <div
                  key={ms.id}
                  className={`bg-white border-2 rounded-2xl p-3 flex flex-col justify-between space-y-2.5 shadow-sm transition ${
                    selected ? 'border-amber-600 ring-2 ring-amber-400' : 'border-amber-400'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-rose-700">{ms.tag}</div>
                    <div className="font-game font-bold text-sm text-amber-950">{ms.id}</div>
                    <p className="text-xs text-amber-800 leading-relaxed">{ms.desc}</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const switched = ms.id !== state.slide18Mission;
                      onUpdateState({
                        slide18Mission: ms.id,
                        ...(switched ? { slide19Link: '' } : {}),
                      });
                      onAwardStar(5, 's18_mis', 1);
                      playSoundEffect('click', state.soundEnabled);
                      onGoToSlide(19);
                    }}
                    className="btn-3d-orange w-full py-1.5 rounded-xl font-game font-bold text-white text-xs"
                  >
                    Pilih Misi
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Slide 19: Upload Your Creation + Connected Google Drive Folder at Kirim ke Galeri Expo
  if (slide === 19) {
    const activeMission =
      STAGE5_MISSIONS.find((m) => m.id === state.slide18Mission) || STAGE5_MISSIONS[0];

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onUpdateState({ slide19ImagePreview: reader.result, slide19Format: 'Foto' });
          onToast('Foto karya berhasil dilampirkan!', '📷');
        }
      };
      reader.readAsDataURL(file);
    };

    const toggleRecordAudio = async () => {
      if (isRecording) {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        audioChunksRef.current = [];
        recorder.ondataavailable = (ev) => {
          if (ev.data.size > 0) audioChunksRef.current.push(ev.data);
        };
        recorder.onstop = () => {
          const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          const url = URL.createObjectURL(blob);
          onUpdateState({ slide19AudioPreview: url, slide19Format: 'Rekaman' });
          stream.getTracks().forEach((t) => t.stop());
          onToast('Rekaman suara berhasil disimpan!', '🎙️');
        };
        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
      } catch {
        onToast('Mikrofon tidak tersedia atau izin ditolak. Kamu tetap dapat mengirim karya tertulis atau foto.', '🎙️');
      }
    };

    const handleSubmitCreation = () => {
      if (!state.slide19Title.trim()) {
        onToast('Berikan judul untuk karyamu terlebih dahulu!', '✏️');
        return;
      }
      const linkedDrive = state.slide19Link.trim() || activeMission.driveUrl;
      const newSub: CreationSubmission = {
        id: `${Date.now()}`,
        author: state.playerName || 'Penjelajah Bunyi',
        mission: state.slide18Mission,
        title: state.slide19Title.trim(),
        description: state.slide19Desc.trim() || 'Karya ekspedisi sains bunyi LENTERA.',
        format: state.slide19Format,
        imageDataUrl: state.slide19ImagePreview || undefined,
        audioDataUrl: state.slide19AudioPreview || undefined,
        linkUrl: linkedDrive,
        createdAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      };

      onUpdateState({
        slide19Link: linkedDrive,
        submissions: [newSub, ...state.submissions],
      });
      setDriveSubmitted(true);
      onAwardStar(5, 's19_up', 1);
      playSoundEffect('fanfare', state.soundEnabled);
      onToast(
        `Karya dipamerkan di Galeri Expo & terhubung otomatis ke Drive ${activeMission.tag}! +1 Bintang`,
        '🎉'
      );
    };

    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
          {/* Form Column */}
          <div className="lg:col-span-7 space-y-2">
            <div className="font-game font-bold text-sm text-amber-950">
              Galeri Karya · {activeMission.id} ({activeMission.tag})
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={state.playerName}
                onChange={(e) => onUpdateState({ playerName: e.target.value })}
                className="px-3 py-1.5 rounded-xl border-2 border-amber-600 bg-white font-bold"
                placeholder="Nama Peserta Didik"
              />
              <input
                type="text"
                value={state.slide19Title}
                onChange={(e) => onUpdateState({ slide19Title: e.target.value })}
                className="px-3 py-1.5 rounded-xl border-2 border-amber-600 bg-white font-bold"
                placeholder="Judul Karya (mis. Telepon Kaleng Super)"
              />
            </div>

            <textarea
              rows={2}
              value={state.slide19Desc}
              onChange={(e) => onUpdateState({ slide19Desc: e.target.value })}
              className="w-full px-3 py-1.5 rounded-xl border-2 border-amber-600 bg-white font-semibold"
              placeholder="Ceritakan bahan, cara kerja bunyi, dan kesimpulan ilmiah dari karyamu..."
            />

            {/* Format selector & Real media inputs */}
            <div className="flex flex-wrap items-center gap-1.5">
              {(['Foto', 'Video', 'Dokumen', 'Rekaman', 'Tautan'] as const).map((fmt) => (
                <button
                  type="button"
                  key={fmt}
                  onClick={() => onUpdateState({ slide19Format: fmt })}
                  className={`px-3 py-1 rounded-xl font-bold border ${
                    state.slide19Format === fmt
                      ? 'bg-amber-600 text-white border-amber-900'
                      : 'bg-amber-100 text-amber-950 border-amber-400'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5" />
                <span>Unggah Foto Karya</span>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>

              <button
                type="button"
                onClick={toggleRecordAudio}
                className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 text-white ${
                  isRecording ? 'bg-rose-600 animate-pulse' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isRecording ? 'Hentikan Rekam' : 'Rekam Suara'}</span>
              </button>

              <div className="flex-1 min-w-[140px] flex items-center gap-1 bg-white border border-amber-500 rounded-xl px-2 py-1">
                <Link2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <input
                  type="url"
                  value={state.slide19Link}
                  onChange={(e) => onUpdateState({ slide19Link: e.target.value })}
                  placeholder={`Otomatis ke Drive ${activeMission.tag}`}
                  className="w-full text-[11px] focus:outline-none"
                />
              </div>
            </div>

            {state.slide19AudioPreview && (
              <audio controls src={state.slide19AudioPreview} className="w-full h-8" />
            )}

            {/* Submit to Gallery Expo + Direct Connected Google Drive Storage Action */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleSubmitCreation}
                  className="btn-3d-orange px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim ke Galeri Expo</span>
                </button>

                <a
                  href={activeMission.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    onUpdateState({ slide19Link: state.slide19Link.trim() || activeMission.driveUrl });
                    setDriveSubmitted(true);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-game font-bold text-xs flex items-center gap-1.5 border-2 transition shadow-sm ${
                    driveSubmitted
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-900'
                      : 'bg-sky-600 hover:bg-sky-700 text-white border-sky-900'
                  }`}
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>Simpan ke Drive ({activeMission.tag})</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <button
                type="button"
                onClick={() => onGoToSlide(20)}
                className="btn-3d-blue px-4 py-1.5 rounded-xl font-game font-bold text-white text-xs"
              >
                Lanjut Refleksi ▶
              </button>
            </div>
          </div>

          {/* Live Gallery Column */}
          <div className="lg:col-span-5 bg-white/80 border-2 border-amber-400 rounded-2xl p-3 flex flex-col max-h-60 overflow-y-auto custom-scroll">
            <div className="font-game font-bold text-xs text-amber-950 mb-2 flex items-center justify-between">
              <span>Pameran Galeri Expo ({state.submissions.length})</span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            </div>
            {state.submissions.length === 0 ? (
              <div className="my-auto text-center text-amber-800/80 py-6 space-y-1">
                <div className="font-bold">Belum ada karya yang dipajang</div>
                <div className="text-[11px]">
                  Isi judul &amp; deskripsi lalu klik &ldquo;Kirim ke Galeri Expo&rdquo; untuk terhubung ke folder Drive{' '}
                  <b>{activeMission.tag}</b>.
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                {state.submissions.map((sub) => (
                  <div key={sub.id} className="bg-amber-50 border border-amber-400 rounded-xl p-2 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-game font-bold text-amber-950">{sub.title}</span>
                      <span className="text-[10px] font-bold text-amber-700">{sub.format}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-amber-800">
                      Oleh {sub.author} · {sub.mission} · {sub.createdAt}
                    </div>
                    <p className="text-[11px] text-amber-950">{sub.description}</p>
                    {sub.imageDataUrl && (
                      <img src={sub.imageDataUrl} alt={sub.title} className="w-full h-24 object-cover rounded-lg border border-amber-300" />
                    )}
                    {sub.audioDataUrl && <audio controls src={sub.audioDataUrl} className="w-full h-7" />}
                    {sub.linkUrl && (
                      <a
                        href={sub.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Tersimpan / Buka Folder Google Drive
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Slide 20: Reflect & Grow
  if (slide === 20) {
    const emojis = [
      { id: 1, icon: '😟', text: 'Saya masih membutuhkan bantuan guru/teman' },
      { id: 2, icon: '🙂', text: 'Saya mulai memahami konsep getaran dan bunyi' },
      { id: 3, icon: '😄', text: 'Saya sudah memahami dan dapat menjelaskan dengan baik' },
      { id: 4, icon: '🤩', text: 'Saya dapat menerapkan konsep dalam percobaan baru' },
    ];

    return (
      <div className="w-full h-full flex items-center gap-4">
        <div className="flex-1 parchment-panel rounded-3xl p-4 space-y-3 text-xs">
          <div className="font-game font-bold text-sm text-amber-950">
            Refleksi Penjelajah Bunyi — Rangkum Pengetahuan Barumu
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-bold text-amber-900 block">
                1. Pengetahuan baru tentang bunyi yang kamu dapatkan:
              </label>
              <textarea
                rows={2}
                value={state.slide20New}
                onChange={(e) => onUpdateState({ slide20New: e.target.value })}
                placeholder="Contoh: Bunyi terjadi karena benda bergetar dan merambat lewat padat, cair, gas..."
                className="w-full px-3 py-2 rounded-xl border-2 border-amber-600 bg-white font-semibold"
              />
            </div>
            <div className="space-y-1">
              <label className="font-bold text-amber-900 block">
                2. Penemuan atau eksperimen paling menarik bagimu:
              </label>
              <textarea
                rows={2}
                value={state.slide20Best}
                onChange={(e) => onUpdateState({ slide20Best: e.target.value })}
                placeholder="Contoh: Eksperimen xylophone 5 botol air saat diketuk vs ditiup!"
                className="w-full px-3 py-2 rounded-xl border-2 border-amber-600 bg-white font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <div className="font-bold text-amber-900">Bagaimana perasaan dan pemahamanmu hari ini?</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {emojis.map((em) => (
                <button
                  type="button"
                  key={em.id}
                  onClick={() => {
                    playSoundEffect('click', state.soundEnabled);
                    onUpdateState({ slide20Self: em.id });
                  }}
                  className={`p-2.5 rounded-2xl border-2 flex flex-col items-center text-center gap-1 transition ${
                    state.slide20Self === em.id
                      ? 'bg-amber-500 text-white border-amber-900 shadow-md scale-[1.02]'
                      : 'bg-white text-amber-950 border-amber-400 hover:bg-amber-50'
                  }`}
                >
                  <span className="text-2xl">{em.icon}</span>
                  <span className="font-bold text-[10px] leading-tight">{em.text}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => {
                onAwardStar(5, 's20_ref', 2);
                playSoundEffect('fanfare', state.soundEnabled);
                onGoToSlide(21);
              }}
              className="btn-3d-orange px-6 py-2 rounded-xl font-game font-bold text-white text-xs sm:text-sm"
            >
              Simpan Refleksi &amp; Buka Sertifikat
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Slide 21: Mission Complete - Sertifikat Penjelajah Bunyi + Confetti/Starlight + Reset History
  const totalStars = Object.values(state.stageStars).reduce((a, b) => a + b, 0);
  const maxStars = Object.values(state.stageMaxStars).reduce((a, b) => a + b, 0);
  const certSrc = state.customVisuals?.cert_bg || DEFAULT_CERTIFICATE_IMAGE;
  const studentDisplayName = state.playerName?.trim() || 'Penjelajah Bunyi';

  const downloadCertificatePng = () => {
    const W = 1491;
    const H = 1055;
    const canvas = document.createElement('canvas');
    canvas.width = W;
    canvas.height = H;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const wrapText = (text: string, x: number, startY: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let y = startY;
      for (let n = 0; n < words.length; n++) {
        const testLine = line ? `${line} ${words[n]}` : words[n];
        if (ctx.measureText(testLine).width > maxWidth && n > 0) {
          ctx.fillText(line, x, y);
          line = words[n];
          y += lineHeight;
        } else {
          line = testLine;
        }
      }
      if (line) ctx.fillText(line, x, y);
      return y;
    };

    const drawDynamicTextAndDownload = (usedRefImage: boolean) => {
      ctx.textAlign = 'center';

      if (usedRefImage) {
        // Feathered cream parchment patch covering ONLY the baked sample name & sentence
        const patchX = W * 0.11;
        const patchY = H * 0.412;
        const patchW = W * 0.78;
        const patchH = H * 0.326;
        const grad = ctx.createRadialGradient(W * 0.5, H * 0.56, 60, W * 0.5, H * 0.56, patchW * 0.56);
        grad.addColorStop(0, '#fdf5e5');
        grad.addColorStop(0.65, '#fcedd4');
        grad.addColorStop(1, '#fbe6c4');
        ctx.save();
        ctx.shadowColor = '#fbe6c4';
        ctx.shadowBlur = 18;
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(patchX, patchY, patchW, patchH, 28);
        ctx.fill();
        ctx.restore();

        // Student name + side golden bursts + underline bar
        const nameY = H * 0.506;
        ctx.fillStyle = '#064e78';
        const nameFontSize = studentDisplayName.length > 22 ? 66 : studentDisplayName.length > 15 ? 78 : 92;
        ctx.font = `bold ${nameFontSize}px Fredoka, Plus Jakarta Sans, sans-serif`;
        ctx.fillText(studentDisplayName, W * 0.5, nameY);

        const textWidth = Math.min(ctx.measureText(studentDisplayName).width, W * 0.56);
        const lineW = Math.max(textWidth + 36, 280);
        const lineY = nameY + 24;
        const barGrad = ctx.createLinearGradient(W * 0.5 - lineW / 2, lineY, W * 0.5 + lineW / 2, lineY);
        barGrad.addColorStop(0, '#f59e0b');
        barGrad.addColorStop(0.5, '#fbbf24');
        barGrad.addColorStop(1, '#f59e0b');
        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(W * 0.5 - lineW / 2, lineY, lineW, 12, 6);
        ctx.fill();

        // Decorative orange/gold bursts flanking the name
        const drawBurst = (cx: number, cy: number, dir: 1 | -1) => {
          [-0.38, 0, 0.38].forEach((ang, idx) => {
            ctx.save();
            ctx.translate(cx, cy + (idx - 1) * 20);
            ctx.rotate(ang * dir);
            ctx.fillStyle = '#f59e0b';
            ctx.beginPath();
            ctx.roundRect(-18, -4.5, 36, 9, 4.5);
            ctx.fill();
            ctx.restore();
          });
        };
        drawBurst(W * 0.5 - lineW / 2 - 44, nameY - 22, 1);
        drawBurst(W * 0.5 + lineW / 2 + 44, nameY - 22, -1);

        // Dynamic summary paragraph
        ctx.fillStyle = '#5c3518';
        ctx.font = '600 31px Plus Jakarta Sans, sans-serif';
        const bodyText = `Telah menyelesaikan ekspedisi 5 pulau LENTERA – Petualangan Bunyi (${state.className}) dengan total ${totalStars}/${maxStars} Bintang dan mampu menjelaskan fenomena bunyi berdasarkan bukti ilmiah.`;
        wrapText(bodyText, W * 0.5, H * 0.605, W * 0.72, 42);

        // Subtle divider + Tim Pengembang MPI preserved above bottom illustrations
        ctx.strokeStyle = 'rgba(180, 83, 9, 0.25)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(W * 0.26, H * 0.692);
        ctx.lineTo(W * 0.74, H * 0.692);
        ctx.stroke();

        ctx.fillStyle = '#78350f';
        ctx.font = 'bold 23px Plus Jakarta Sans, sans-serif';
        ctx.fillText(
          `Tim Pengembang MPI: ${state.devName} · ${new Date().toLocaleDateString('id-ID')}`,
          W * 0.5,
          H * 0.724
        );
      } else {
        ctx.fillStyle = '#92400E';
        ctx.font = 'bold 30px Plus Jakarta Sans, sans-serif';
        ctx.fillText('LENTERA — PETUALANGAN BUNYI', W * 0.5, 160);
        ctx.fillStyle = '#78350F';
        ctx.font = 'bold 60px Fredoka, sans-serif';
        ctx.fillText('SERTIFIKAT PENJELAJAH BUNYI', W * 0.5, 250);
        ctx.fillStyle = '#064e78';
        ctx.font = 'bold 82px Fredoka, sans-serif';
        ctx.fillText(studentDisplayName, W * 0.5, 455);
        ctx.fillStyle = '#5c3518';
        ctx.font = '600 30px Plus Jakarta Sans, sans-serif';
        wrapText(
          `Telah menyelesaikan ekspedisi 5 pulau LENTERA (${state.className}) dengan total ${totalStars}/${maxStars} Bintang.`,
          W * 0.5,
          555,
          W * 0.72,
          44
        );
        ctx.fillStyle = '#78350F';
        ctx.font = 'bold 24px Plus Jakarta Sans, sans-serif';
        ctx.fillText(`Tim Pengembang MPI: ${state.devName}`, W * 0.5, 880);
      }

      const link = document.createElement('a');
      link.download = `Sertifikat_LENTERA_${studentDisplayName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      playSoundEffect('fanfare', state.soundEnabled);
      setShowCelebration(true);
      onToast('Sertifikat PNG berhasil diunduh! Selamat atas keberhasilanmu!', '🎓');
    };

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.drawImage(img, 0, 0, W, H);
      drawDynamicTextAndDownload(true);
    };
    img.onerror = () => {
      const bg = ctx.createLinearGradient(0, 0, 0, H);
      bg.addColorStop(0, '#FFFDF5');
      bg.addColorStop(1, '#FDECC8');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
      ctx.strokeStyle = '#8D5B3C';
      ctx.lineWidth = 28;
      ctx.strokeRect(28, 28, W - 56, H - 56);
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 8;
      ctx.strokeRect(56, 56, W - 112, H - 112);
      drawDynamicTextAndDownload(false);
    };
    img.src = certSrc;
  };

  return (
    <div className="w-full h-full flex items-center justify-center gap-4 relative">
      <div className="hidden md:flex flex-col items-center shrink-0">
        <CharacterFigure type={state.playerGender === 'girl' ? 'girl_student' : 'boy_student'} className="w-28 h-28" />
        <span className="wood-panel px-3 py-0.5 rounded-full text-xs font-bold -mt-1 z-10 max-w-[120px] truncate">
          {studentDisplayName}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center gap-2.5 w-full max-w-[540px]">
        {/* Certificate Frame matching uploaded reference design */}
        <div
          style={{ containerType: 'inline-size' }}
          className="relative w-full aspect-[1491/1055] rounded-2xl overflow-hidden border-[3px] border-amber-500 shadow-2xl select-none bg-[#fdf5e5]"
        >
          <img
            src={certSrc}
            alt="Sertifikat Penjelajah Bunyi"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />

          {/* Seamless cream parchment patch over ONLY sample name & static sentence */}
          <div
            aria-hidden="true"
            className="absolute left-[11%] right-[11%] top-[41.2%] bottom-[26.2%] rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at 50% 45%, #fdf6e6 0%, #fcedd4 70%, #fbe7c7 100%)',
              boxShadow: '0 0 12px 6px #fbe7c7',
            }}
          />

          {/* Dynamic Student Name, Stars, Class & Developer Credits Overlay */}
          <div className="absolute left-[12%] right-[12%] top-[41.5%] bottom-[26.5%] flex flex-col items-center justify-between py-[1.4cqw] text-center pointer-events-none">
            <div className="flex flex-col items-center justify-center pt-[0.4cqw]">
              <div className="flex items-center justify-center gap-[1.8cqw]">
                <span aria-hidden="true" className="text-amber-500 font-bold text-[2.4cqw] leading-none">
                  ✦
                </span>
                <div
                  className="font-game font-extrabold text-[#064e78] leading-tight tracking-tight px-2 border-b-[0.55cqw] border-amber-400"
                  style={{ fontSize: studentDisplayName.length > 18 ? '4.2cqw' : '5.4cqw' }}
                >
                  {studentDisplayName}
                </div>
                <span aria-hidden="true" className="text-amber-500 font-bold text-[2.4cqw] leading-none">
                  ✦
                </span>
              </div>
            </div>

            <p className="font-semibold text-[#5c3518] leading-[1.32] px-[2cqw]" style={{ fontSize: '2.05cqw' }}>
              Telah menyelesaikan ekspedisi 5 pulau <b>LENTERA – Petualangan Bunyi</b> ({state.className}) dengan total{' '}
              <b className="font-data text-amber-900">
                {totalStars}/{maxStars} Bintang
              </b>{' '}
              dan mampu menjelaskan fenomena bunyi berdasarkan bukti ilmiah.
            </p>

            <div
              className="w-[74%] border-t border-amber-800/20 pt-[0.6cqw] font-bold text-[#78350f] truncate"
              style={{ fontSize: '1.65cqw' }}
            >
              Tim Pengembang MPI: {state.devName}
            </div>
          </div>
        </div>

        {/* Action Buttons Below Certificate */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={downloadCertificatePng}
            className="btn-3d-green px-4 py-1.5 rounded-full font-game font-bold text-white text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Unduh Sertifikat (PNG)
          </button>

          <button
            type="button"
            onClick={() => {
              playSoundEffect('fanfare', state.soundEnabled);
              onGoToSlide(2);
            }}
            className="btn-3d-orange px-4 py-1.5 rounded-full font-game font-bold text-white text-xs sm:text-sm"
          >
            Kembali ke Peta
          </button>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="px-4 py-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-game font-bold text-xs sm:text-sm flex items-center gap-1.5 border-2 border-rose-900 shadow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Riwayat</span>
            </button>
          ) : (
            <div className="bg-rose-950 text-white px-3 py-1 rounded-full flex items-center gap-1.5 text-xs font-game font-bold border-2 border-rose-400">
              <span>Reset untuk pengguna baru?</span>
              <button
                type="button"
                onClick={() => {
                  setConfirmReset(false);
                  setShowCelebration(false);
                  onResetProgress();
                }}
                className="px-2.5 py-0.5 rounded-full bg-rose-500 hover:bg-rose-600"
              >
                Ya, Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-2.5 py-0.5 rounded-full bg-slate-600 hover:bg-slate-700"
              >
                Batal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Celebration Confetti + Glowing Starlight + "Selamat!" Pop-up */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-sm overflow-hidden p-4"
          >
            {/* Falling Confetti & Glowing Starlight Layer */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {CONFETTI_PIECES.map((c) => (
                <motion.div
                  key={c.id}
                  initial={{ y: -40, x: 0, opacity: 1, rotate: 0, scale: 0.7 }}
                  animate={{
                    y: '105vh',
                    x: c.drift,
                    opacity: [1, 1, 0.9, 0],
                    rotate: c.rotate,
                    scale: c.isStar ? [0.9, 1.35, 1] : 1,
                  }}
                  transition={{
                    duration: c.duration,
                    delay: c.delay,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  style={{ left: c.left }}
                  className="absolute top-0"
                >
                  {c.isStar ? (
                    <span
                      style={{ color: c.color, textShadow: `0 0 12px ${c.color}` }}
                      className="text-xl sm:text-2xl font-bold select-none"
                    >
                      ★
                    </span>
                  ) : (
                    <span
                      style={{ backgroundColor: c.color }}
                      className="block w-2.5 h-4 rounded-sm shadow-sm"
                    />
                  )}
                </motion.div>
              ))}
            </div>

            {/* Radiant "Selamat!" Pop-Up Card */}
            <motion.div
              initial={{ scale: 0.65, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="relative z-10 max-w-md w-full parchment-panel rounded-3xl p-6 text-center space-y-3 border-4 border-amber-400 shadow-[0_0_65px_rgba(250,204,21,0.75)]"
            >
              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                aria-label="Tutup ucapan selamat"
                className="absolute top-3 right-3 w-7 h-7 rounded-full bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-center gap-2 pt-1">
                <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]" />
                <Sparkles className="w-9 h-9 text-amber-500 animate-bounce drop-shadow-[0_0_12px_rgba(251,191,36,0.9)]" />
                <Star className="w-7 h-7 fill-amber-400 text-amber-500 animate-pulse drop-shadow-[0_0_10px_rgba(250,204,21,0.9)]" />
              </div>

              <h3 className="font-game text-3xl sm:text-4xl font-extrabold text-amber-900 tracking-wide drop-shadow-sm">
                Selamat! 🎉
              </h3>

              <p className="text-xs sm:text-sm font-bold text-amber-950 leading-relaxed">
                Hebat sekali, <span className="text-sky-800">{state.playerName}</span>! Kamu telah berhasil
                menyelesaikan seluruh misi <b>LENTERA – Petualangan Bunyi</b> dan mengumpulkan{' '}
                <span className="text-amber-700 font-data">
                  {totalStars}/{maxStars} ★
                </span>
                .
              </p>

              <div className="bg-amber-100 border-2 border-amber-400 rounded-2xl px-3 py-2 text-[11px] font-bold text-amber-900">
                Sertifikat Penjelajah Bunyi telah berhasil diunduh ke perangkatmu!
              </div>

              <div className="pt-1 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCelebration(false)}
                  className="btn-3d-orange px-6 py-2 rounded-full font-game font-bold text-white text-xs sm:text-sm"
                >
                  Lanjutkan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
