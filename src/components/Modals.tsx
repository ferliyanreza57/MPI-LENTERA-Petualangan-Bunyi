import React, { useEffect, useState } from 'react';
import { BookOpen, ClipboardList, Image, ImagePlus, Lock, RotateCcw, Settings, Target, Upload, Users, X } from 'lucide-react';
import {
  DEFAULT_CERTIFICATE_IMAGE,
  DEFAULT_DEV_POSTER_IMAGE,
  DEFAULT_HOME_COVER_IMAGE,
  DEFAULT_MAP_IMAGE,
  DEFAULT_PROP_IMAGES,
  DEFAULT_STAGE1_BG,
  DEFAULT_STAGE2_BG,
  DEFAULT_STAGE3_BG,
  DEFAULT_STAGE4_BG,
  DEFAULT_STAGE5_BG,
  PROP_LABELS,
} from '../data/slidesData';
import { LenteraState, PropKey } from '../types/lentera';
import { playSoundEffect } from '../utils/audioEngine';
import { processImageFileToDataUrl } from '../utils/imageUpload';
import { FallbackPropSVG } from './VisualAssets';

interface InfoModalProps {
  isOpen: boolean;
  initialTab?: 'petunjuk' | 'tujuan' | 'pengembang';
  onClose: () => void;
  onToast: (msg: string, icon?: string) => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, initialTab = 'petunjuk', onClose, onToast }) => {
  const [activeTab, setActiveTab] = useState<'petunjuk' | 'tujuan' | 'pengembang'>(initialTab);
  const [customPhotoUrl, setCustomPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5">
      <div className="parchment-panel w-full max-w-4xl rounded-3xl p-4 sm:p-5 space-y-3 max-h-[92vh] overflow-y-auto custom-scroll border-4 border-amber-700">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-amber-800/20 pb-2.5">
          <div>
            <h3 className="font-game font-bold text-base sm:text-lg text-amber-950">
              INFORMASI & PANDUAN MPI LENTERA
            </h3>
            <p className="text-[11px] font-semibold text-amber-800">
              Lintas Eksplorasi, Narasi, Tematik, Edukasi, Ritme, dan Alam · Kelas VI SD (Fase C)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('petunjuk')}
              className={`px-3 py-1.5 rounded-xl font-game font-bold text-xs flex items-center gap-1.5 ${
                activeTab === 'petunjuk'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-amber-100 text-amber-900 border border-amber-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Petunjuk Penggunaan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tujuan')}
              className={`px-3 py-1.5 rounded-xl font-game font-bold text-xs flex items-center gap-1.5 ${
                activeTab === 'tujuan'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-amber-100 text-amber-900 border border-amber-400'
              }`}
            >
              <Target className="w-3.5 h-3.5" /> Tujuan Pembelajaran
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pengembang')}
              className={`px-3 py-1.5 rounded-xl font-game font-bold text-xs flex items-center gap-1.5 ${
                activeTab === 'pengembang'
                  ? 'bg-amber-600 text-white shadow'
                  : 'bg-amber-100 text-amber-900 border border-amber-400'
              }`}
            >
              <Users className="w-3.5 h-3.5" /> Tim Pengembang
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup modal"
              className="w-8 h-8 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {activeTab === 'petunjuk' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-amber-950">
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 space-y-1.5">
              <div className="font-game font-bold text-sm text-amber-900">1. Memulai Ekspedisi & Pilih Karakter</div>
              <p className="leading-relaxed">
                Ketik <b>Nama Pemain</b> pada Halaman Awal (Slide 1), pilih karakter <b>Laki-laki</b> atau{' '}
                <b>Perempuan</b>, lalu klik tombol <b>Mulai Petualangan</b>. Progresmu tersimpan otomatis di peramban.
              </p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 space-y-1.5">
              <div className="font-game font-bold text-sm text-amber-900">2. Peta 5 Pulau & Bintang Progres</div>
              <p className="leading-relaxed">
                Di <b>Peta Petualangan (Slide 2)</b>, klik logo lingkaran pulau untuk memulai Stage 1 hingga Stage 5.
                Selesaikan aktivitas dan kuis di setiap stage untuk mengumpulkan <b>Bintang Progres (★)</b>.
              </p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 space-y-1.5">
              <div className="font-game font-bold text-sm text-amber-900">3. Eksperimen Lab & Osiloskop Nyata</div>
              <p className="leading-relaxed">
                Klik tombol <b>Putar</b> pada kartu instrumen/objek untuk melihat gelombang suara nyata di osiloskop,
                atur amplitudo & frekuensi di Sonic Safari, dan mainkan 5 botol <b>Xylophone Air</b> dengan klik atau
                tombol angka 1–5.
              </p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3 space-y-1.5">
              <div className="font-game font-bold text-sm text-amber-900">4. Pameran Karya & Sertifikat PNG</div>
              <p className="leading-relaxed">
                Unggah karyamu di Galeri Sonic Expo (Slide 19), lengkapi refleksi di Slide 20, lalu unduh{' '}
                <b>Sertifikat Penjelajah Bunyi</b> berformat PNG di Slide 21!
              </p>
            </div>
          </div>
        )}

        {activeTab === 'tujuan' && (
          <div className="space-y-3 text-xs text-amber-950">
            <div className="bg-sky-50 border-2 border-sky-400 rounded-2xl p-3.5 space-y-1">
              <div className="font-game font-bold text-sm text-sky-900">1. Mata Pelajaran Utama: IPAS Kelas VI SD (Fase C)</div>
              <p className="leading-relaxed">
                Peserta didik mampu membuktikan bahwa bunyi dihasilkan oleh benda yang <b>bergetar</b>, mengidentifikasi
                sifat rambat bunyi melalui medium <b>padat, cair, dan gas</b> (serta tidak merambat di ruang hampa), dan
                mengklasifikasikan rentang frekuensi bunyi (<b>infrasonik, audiosonik, ultrasonik</b>) melalui
                penyelidikan berbasis bukti.
              </p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-400 rounded-2xl p-3.5 space-y-1">
              <div className="font-game font-bold text-sm text-emerald-900">
                2. Integrasi Bahasa Indonesia (Bernarasi & Eksplanasi Ilmiah)
              </div>
              <p className="leading-relaxed">
                Peserta didik mampu menuliskan prediksi ilmiah, menguraikan langkah percobaan, serta menjelaskan hubungan
                sebab-akibat fenomena bunyi menggunakan kalimat yang runtut dan logis berdasarkan bukti pengamatan.
              </p>
            </div>
            <div className="bg-amber-50 border-2 border-amber-400 rounded-2xl p-3.5 space-y-1">
              <div className="font-game font-bold text-sm text-amber-900">
                3. Integrasi Seni Musik (Nada & Instrumen)
              </div>
              <p className="leading-relaxed">
                Peserta didik mampu membedakan karakteristik bunyi (<b>nada, desah, dentum</b>), mengelompokkan alat
                musik berdasarkan cara memainkannya dan sumber getarnya, serta merancang instrumen penghasil nada
                sederhana (Xylophone Air).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'pengembang' && (
          <div className="bg-gradient-to-b from-sky-200 via-sky-100 to-amber-50 border-4 border-amber-500 rounded-3xl p-3 sm:p-4 shadow-xl relative overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="px-4 py-1 rounded-full bg-amber-500 text-white font-game font-bold text-xs shadow">
                TIM PENGEMBANG MPI LENTERA
              </span>
              <div className="flex items-center gap-1.5">
                <label className="cursor-pointer px-3 py-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white font-game font-bold text-[11px] shadow flex items-center gap-1">
                  <ImagePlus className="w-3.5 h-3.5" />
                  <span>Ganti Foto Tim</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setCustomPhotoUrl(URL.createObjectURL(file));
                      onToast('Foto Tim Pengembang berhasil diperbarui!', '🖼️');
                    }}
                  />
                </label>
                {customPhotoUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setCustomPhotoUrl(null);
                      onToast('Poster Tim Pengembang dikembalikan ke bawaan.', '🔄');
                    }}
                    className="px-3 py-1 rounded-full bg-slate-600 hover:bg-slate-700 text-white font-game font-bold text-[11px] shadow flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" /> Reset
                  </button>
                )}
              </div>
            </div>

            <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-2">
              <img
                src={customPhotoUrl || DEFAULT_DEV_POSTER_IMAGE}
                alt="Tim Pengembang MPI LENTERA - Teresa Avilla Ayuning Budi Cayestu, Ferliyan Reza, dan Eprina Roganda Br. Singo-Ringo"
                referrerPolicy="no-referrer"
                className="w-full aspect-video object-contain rounded-2xl border-2 border-amber-400 shadow-2xl bg-sky-100"
              />
              <p className="text-[11px] font-bold text-amber-950 text-center">
                Dikembangkan oleh Mahasiswa &amp; Guru MPI LENTERA · Universitas Negeri Yogyakarta (UNY)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface TeacherAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeacherAuthModal: React.FC<TeacherAuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const verify = () => {
    if (password.trim() === 'lentera2026') {
      setError(false);
      setPassword('');
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="parchment-panel w-full max-w-md rounded-3xl p-5 space-y-3 border-4 border-amber-700 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="font-game font-bold text-lg text-amber-950">Akses Pengaturan Khusus Guru</h3>
        <p className="text-xs font-semibold text-amber-800">
          Masukkan kata sandi khusus guru untuk membuka panel pengaturan, rekap jawaban siswa, dan lompat slide.
        </p>
        <input
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError(false);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') verify();
          }}
          placeholder="Masukkan password guru..."
          className="w-full px-4 py-2 rounded-xl border-2 border-amber-600 bg-white font-bold text-sm text-center text-amber-950"
        />
        {error && <p className="text-xs font-bold text-red-600">Kata sandi salah! Hanya guru yang memiliki akses.</p>}
        <div className="flex items-center justify-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={verify}
            className="btn-3d-orange px-5 py-2 rounded-xl font-game font-bold text-white text-xs"
          >
            Buka Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};

interface TeacherDashboardModalProps {
  isOpen: boolean;
  state: LenteraState;
  onUpdateState: (patch: Partial<LenteraState>) => void;
  onUploadVisual: (key: string, dataUrl: string) => void;
  onResetVisual: (key: string) => void;
  onGoToSlide: (slide: number) => void;
  onFillStars: () => void;
  onResetAll: () => void;
  onClose: () => void;
  onToast: (msg: string, icon?: string) => void;
}

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  isOpen,
  state,
  onUpdateState,
  onUploadVisual,
  onResetVisual,
  onGoToSlide,
  onFillStars,
  onResetAll,
  onClose,
  onToast,
}) => {
  const [devInput, setDevInput] = useState(state.devName);
  const [clsInput, setClsInput] = useState(state.className);
  const [showRecap, setShowRecap] = useState(false);
  const [showVisualMgr, setShowVisualMgr] = useState(false);

  useEffect(() => {
    setDevInput(state.devName);
    setClsInput(state.className);
  }, [state.devName, state.className, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="parchment-panel w-full max-w-3xl rounded-3xl p-5 space-y-3 max-h-[90vh] overflow-y-auto custom-scroll">
        <div className="flex items-center justify-between border-b-2 border-amber-800/20 pb-2">
          <h3 className="font-game font-bold text-lg text-amber-950 flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-700" />
            <span>Pengaturan Guru, Rekap Jawaban & Lompat Slide</span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-red-600 text-white font-bold flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <label className="font-bold block mb-1">Tim Pengembang (Sertifikat Slide 21):</label>
            <input
              type="text"
              value={devInput}
              onChange={(e) => setDevInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border-2 border-amber-700 bg-white font-semibold"
            />
          </div>
          <div>
            <label className="font-bold block mb-1">Target Kelas (Slide 1 & 21):</label>
            <input
              type="text"
              value={clsInput}
              onChange={(e) => setClsInput(e.target.value)}
              className="w-full px-3 py-1.5 rounded-xl border-2 border-amber-700 bg-white font-semibold"
            />
          </div>
        </div>

        <div className="bg-amber-100/90 border-2 border-amber-500 rounded-xl p-2.5 text-xs flex flex-wrap items-center justify-between gap-2">
          <span className="font-bold text-amber-950">Kontrol Bintang & Progres:</span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onFillStars}
              className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              Isi Penuh Semua Bintang
            </button>
            <button
              type="button"
              onClick={onResetAll}
              className="px-3 py-1 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-bold flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" /> Reset Semua Progres
            </button>
            <button
              type="button"
              onClick={() => setShowRecap(!showRecap)}
              className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold flex items-center gap-1"
            >
              <ClipboardList className="w-3 h-3" /> {showRecap ? 'Tutup Rekap Jawaban' : 'Lihat Rekap Jawaban Siswa'}
            </button>
            <button
              type="button"
              onClick={() => setShowVisualMgr(!showVisualMgr)}
              className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1"
            >
              <Image className="w-3 h-3" /> {showVisualMgr ? 'Tutup Kelola PNG' : 'Kelola Visual PNG Slide'}
            </button>
          </div>
        </div>

        {showRecap && (
          <div className="bg-white border-2 border-sky-500 rounded-2xl p-3 text-xs space-y-1.5">
            <div className="font-game font-bold text-sky-950">Rekap Jawaban Tertulis Siswa ({state.playerName})</div>
            <div>
              <b>Slide 4 (Pengamatan Suara):</b> {state.slide4Saved || '— belum diisi —'}
            </div>
            <div>
              <b>Slide 5 (Prediksi):</b> {state.slide5Choice} — {state.slide5Reason || '— belum ada alasan —'}
            </div>
            <div>
              <b>Slide 9 (Kesimpulan Detektif):</b> {state.slide9Reason || '— belum diisi —'}
            </div>
            <div>
              <b>Slide 17 (Penjelasan Xylophone Air):</b> {state.slide17Notes || '— belum diisi —'}
            </div>
            <div>
              <b>Slide 20 (Refleksi):</b> Baru: {state.slide20New || '—'} · Menarik: {state.slide20Best || '—'}
            </div>
          </div>
        )}

        {showVisualMgr && (
          <div className="bg-white border-2 border-emerald-500 rounded-2xl p-3 text-xs space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-game font-bold text-emerald-950">
                Kelola Visual Nyata PNG untuk Peta &amp; Setiap Slide
              </div>
              <button
                type="button"
                onClick={() => {
                  onUpdateState({ customVisuals: {} });
                  onToast('Seluruh gambar dikembalikan ke visual bawaan!', '🔄');
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-600 hover:bg-slate-700 text-white font-bold text-[11px] flex items-center gap-1"
              >
                <RotateCcw className="w-3 h-3" /> Reset Semua Visual
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto custom-scroll pr-1">
              {/* Home Cover Image Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 border border-amber-300">
                  <img
                    src={state.customVisuals?.home_cover || DEFAULT_HOME_COVER_IMAGE}
                    alt="Cover Halaman Awal"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Sampul Halaman Awal (Slide 1)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('home_cover', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.home_cover && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('home_cover')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Adventure Map Background Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 border border-amber-300">
                  <img
                    src={state.customVisuals?.map_bg || DEFAULT_MAP_IMAGE}
                    alt="Peta Petualangan"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Peta Petualangan (Slide 2)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('map_bg', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.map_bg && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('map_bg')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Stage 1 Unified Background Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 border border-amber-300">
                  <img
                    src={state.customVisuals?.stage1_bg || DEFAULT_STAGE1_BG}
                    alt="Latar Stage 1"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Latar Stage 1 (Slide 3–5)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('stage1_bg', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.stage1_bg && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('stage1_bg')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Stage 2 Unified Background Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 border border-amber-300">
                  <img
                    src={state.customVisuals?.stage2_bg || DEFAULT_STAGE2_BG}
                    alt="Latar Stage 2"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Latar Stage 2 (Slide 6–9)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('stage2_bg', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.stage2_bg && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('stage2_bg')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Stage 3 Unified Background Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 border border-amber-300">
                  <img
                    src={state.customVisuals?.stage3_bg || DEFAULT_STAGE3_BG}
                    alt="Latar Stage 3"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Latar Stage 3 (Slide 10–13)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('stage3_bg', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.stage3_bg && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('stage3_bg')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Stage 4 Unified Background Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 border border-amber-300">
                  <img
                    src={state.customVisuals?.stage4_bg || DEFAULT_STAGE4_BG}
                    alt="Latar Stage 4"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Latar Stage 4 (Slide 14–17)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('stage4_bg', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.stage4_bg && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('stage4_bg')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Stage 5 Unified Background Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-slate-200 border border-amber-300">
                  <img
                    src={state.customVisuals?.stage5_bg || DEFAULT_STAGE5_BG}
                    alt="Latar Stage 5"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Latar Stage 5 (Slide 18–21)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('stage5_bg', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.stage5_bg && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('stage5_bg')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {/* Certificate Reference Background Card */}
              <div className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center">
                <div className="w-full h-14 rounded-lg overflow-hidden bg-amber-100 border border-amber-300 flex items-center justify-center">
                  <img
                    src={state.customVisuals?.cert_bg || DEFAULT_CERTIFICATE_IMAGE}
                    alt="Referensi Sertifikat"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="font-bold text-[11px] text-amber-950 leading-tight">Referensi Sertifikat (Slide 21)</div>
                <div className="flex items-center gap-1">
                  <label className="cursor-pointer px-2 py-0.5 rounded bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] flex items-center gap-1">
                    <Upload className="w-2.5 h-2.5" /> Ganti
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                          const dataUrl = await processImageFileToDataUrl(file, 1280);
                          onUploadVisual('cert_bg', dataUrl);
                        } catch {
                          onToast('File gambar tidak valid!', '⚠️');
                        }
                      }}
                    />
                  </label>
                  {state.customVisuals?.cert_bg && (
                    <button
                      type="button"
                      onClick={() => onResetVisual('cert_bg')}
                      className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </div>

              {(Object.keys(PROP_LABELS) as PropKey[]).map((key) => {
                const customSrc = state.customVisuals?.[key];
                const src = customSrc || DEFAULT_PROP_IMAGES[key];
                return (
                  <div
                    key={key}
                    className="bg-amber-50 border border-amber-400 rounded-xl p-2 flex flex-col items-center gap-1.5 text-center"
                  >
                    <div className="w-full h-14 rounded-lg overflow-hidden bg-white border border-amber-200 flex items-center justify-center p-1">
                      {src ? (
                        <img src={src} alt={PROP_LABELS[key]} className="w-full h-full object-contain" />
                      ) : (
                        <div className="w-10 h-10">
                          <FallbackPropSVG itemKey={key} />
                        </div>
                      )}
                    </div>
                    <div className="font-bold text-[11px] text-amber-950 leading-tight">{PROP_LABELS[key]}</div>
                    <div className="flex items-center gap-1">
                      <label className="cursor-pointer px-2 py-0.5 rounded bg-sky-600 hover:bg-sky-700 text-white font-bold text-[10px] flex items-center gap-1">
                        <Upload className="w-2.5 h-2.5" /> {src ? 'Ganti' : 'Upload'}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            try {
                              const dataUrl = await processImageFileToDataUrl(file, 480);
                              onUploadVisual(key, dataUrl);
                            } catch {
                              onToast('File gambar tidak valid!', '⚠️');
                            }
                          }}
                        />
                      </label>
                      {customSrc && (
                        <button
                          type="button"
                          onClick={() => onResetVisual(key)}
                          className="px-1.5 py-0.5 rounded bg-slate-600 text-white text-[10px] font-bold"
                        >
                          Reset
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="space-y-1 text-xs">
          <p className="font-bold text-amber-900">Lompat Cepat ke Slide (1–21):</p>
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {Array.from({ length: 21 }, (_, idx) => idx + 1).map((num) => (
              <button
                type="button"
                key={num}
                onClick={() => {
                  onClose();
                  onGoToSlide(num);
                }}
                className={`p-1.5 rounded-lg border border-amber-600 font-bold text-xs ${
                  state.currentSlide === num
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-950 hover:bg-amber-100'
                }`}
              >
                Slide {num}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="button"
            onClick={() => {
              playSoundEffect('click', state.soundEnabled);
              onUpdateState({
                devName: devInput.trim() || state.devName,
                className: clsInput.trim() || state.className,
              });
              onClose();
              onToast('Pengaturan guru berhasil disimpan!', '✅');
            }}
            className="btn-3d-orange px-5 py-1.5 rounded-xl font-game font-bold text-white text-xs"
          >
            Simpan Pengaturan
          </button>
        </div>
      </div>
    </div>
  );
};
