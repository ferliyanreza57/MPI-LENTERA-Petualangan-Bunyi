import { PropKey, SlideMeta, SoundEffectType } from '../types/lentera';

export const DEFAULT_PROP_IMAGES: Partial<Record<PropKey, string>> = {
  bel: '/assets/aistudio/Bel_Sekolah_65c5e4a8.png',
  burung: '/assets/aistudio/Burung_ea02b2a5.png',
  kendaraan: '/assets/aistudio/Kendaraan_8ac10363.png',
  gitar: '/assets/aistudio/Gitar_881d0d83.png',
  senar_gitar: '/assets/aistudio/Senar_Gitar_075fbd3a.png',
  membran_drum: '/assets/aistudio/Membran_Drum_602cbffd.png',
  telepon_kaleng: '/assets/aistudio/Telepon_Kaleng_dengan_Tali_Merah_452ef4eb.png',
  botol_air: '/assets/aistudio/Enam_Botol_Air_dengan_Level_Berbeda_74d41d04.png',
  hujan: '/assets/aistudio/Hujan_74911b1f.png',
  tepuk_tangan: '/assets/aistudio/Tepuk_Tangan_bfdc781b.png',
  gajah: '/assets/aistudio/Gajah_265e4a72.png',
  paus: '/assets/aistudio/Paus_ca4b25f6.png',
  piano: '/assets/aistudio/Nada_Piano_da5d18e4.png',
  nyamuk: '/assets/aistudio/Nyamuk_e1366388.png',
  anjing: '/assets/aistudio/Anjing_45401382.png',
  kelelawar: '/assets/aistudio/Kelelawar_62049809.png',
  seruling: '/assets/aistudio/Seruling_Bambu_Realistis_Bertekstur_Alami_9c174acf.png',
  biola: '/assets/aistudio/Biola_Cokelat_dan_Busur_Violin_66110be6.png',
  angklung: '/assets/aistudio/Angklung_Bambu_Tradisional_Alami_911f8de7.png',
};

export const DEFAULT_HOME_COVER_IMAGE = '/assets/aistudio/Halaman_awal_9fd76892.png';
export const DEFAULT_MAP_IMAGE = '/assets/aistudio/visual_peta_petualangan_d0588ffc.png';
export const DEFAULT_STAGE1_BG = '/assets/aistudio/Gambar_ChatGPT_16_Nov_2026__21.40.21_2f6ce86d.png';
export const DEFAULT_STAGE2_BG = '/assets/aistudio/Gambar_ChatGPT_16_Nov_2026__21.40.27_07aa0d71.png';
export const DEFAULT_STAGE3_BG = '/assets/aistudio/Gambar_ChatGPT_16_Nov_2026__21.40.32_de5f5b50.png';
export const DEFAULT_STAGE4_BG = '/assets/aistudio/Gambar_ChatGPT_16_Nov_2026__21.40.37_9a0c1389.png';
export const DEFAULT_STAGE5_BG = '/assets/aistudio/Gambar_ChatGPT_16_Nov_2026__21.40.40_f840db52.png';
export const DEFAULT_DEV_POSTER_IMAGE = '/assets/aistudio/Poster_Tim_Pengembang_LENTERA_UNY_7be61b7a.png';
export const DEFAULT_CERTIFICATE_IMAGE = '/assets/aistudio/Sertifikat_Penjelajah_Bunyi_Kang_Edi_63ca8bdd.png';

export const PROP_LABELS: Record<PropKey, string> = {
  bel: 'Bel Sekolah',
  burung: 'Kicauan Burung',
  kendaraan: 'Kendaraan',
  gitar: 'Gitar',
  senar_gitar: 'Senar Gitar',
  membran_drum: 'Membran Drum',
  telepon_kaleng: 'Telepon Kaleng',
  botol_air: 'Botol Air Berbeda',
  hujan: 'Hujan',
  tepuk_tangan: 'Tepuk Tangan',
  gajah: 'Gajah',
  paus: 'Paus',
  piano: 'Nada Piano',
  nyamuk: 'Nyamuk',
  anjing: 'Anjing',
  kelelawar: 'Kelelawar',
  seruling: 'Seruling',
  biola: 'Biola',
  angklung: 'Angklung',
};

export const SLIDE_META: Record<number, SlideMeta> = {
  1: { stage: 0, prev: null, next: 2 },
  2: { stage: 0, prev: 1, next: 3 },
  3: {
    stage: 1,
    stageName: 'MENGENAL DUNIA BUNYI',
    color: '#2E7D32',
    theme: 'Dunia Bunyi Menantimu!',
    activity: 'Misi Pembuka: Video Pengantar Guru',
    step: [1, 3],
    prev: 2,
    next: 4,
  },
  4: {
    stage: 1,
    stageName: 'MENGENAL DUNIA BUNYI',
    color: '#2E7D32',
    theme: 'Dunia Bunyi Menantimu!',
    activity: 'Suara di Sekitar Kita',
    step: [2, 3],
    prev: 3,
    next: 5,
  },
  5: {
    stage: 1,
    stageName: 'MENGENAL DUNIA BUNYI',
    color: '#2E7D32',
    theme: 'Dunia Bunyi Menantimu!',
    activity: 'Prediksi Ilmuwan Cilik',
    step: [3, 3],
    prev: 4,
    next: 2,
  },
  6: {
    stage: 2,
    stageName: 'SUMBER & SIFAT BUNYI',
    color: '#EF6C00',
    theme: 'Berburu Jejak Bunyi',
    activity: 'Sound Explorer: Dengarkan dan Bandingkan',
    step: [1, 4],
    prev: 2,
    next: 7,
  },
  7: {
    stage: 2,
    stageName: 'SUMBER & SIFAT BUNYI',
    color: '#EF6C00',
    theme: 'Berburu Jejak Bunyi',
    activity: 'Sound Knowledge: Apa Itu Bunyi?',
    step: [2, 4],
    prev: 6,
    next: 8,
  },
  8: {
    stage: 2,
    stageName: 'SUMBER & SIFAT BUNYI',
    color: '#EF6C00',
    theme: 'Berburu Jejak Bunyi',
    activity: 'Frequency Ranger: Dunia Frekuensi',
    step: [3, 4],
    prev: 7,
    next: 9,
  },
  9: {
    stage: 2,
    stageName: 'SUMBER & SIFAT BUNYI',
    color: '#EF6C00',
    theme: 'Berburu Jejak Bunyi',
    activity: 'Sound Detective: Nada, Desah, dan Dentum',
    step: [4, 4],
    prev: 8,
    next: 2,
  },
  10: {
    stage: 3,
    stageName: 'EKSPERIMEN BUNYI',
    color: '#0277BD',
    theme: 'Laboratorium Rahasia Bunyi',
    activity: 'Lab Briefing: Misi Dimulai',
    step: [1, 4],
    prev: 2,
    next: 11,
  },
  11: {
    stage: 3,
    stageName: 'EKSPERIMEN BUNYI',
    color: '#0277BD',
    theme: 'Laboratorium Rahasia Bunyi',
    activity: 'CUP CALL: Telepon Gelas Misterius',
    step: [2, 4],
    prev: 10,
    next: 12,
  },
  12: {
    stage: 3,
    stageName: 'EKSPERIMEN BUNYI',
    color: '#0277BD',
    theme: 'Laboratorium Rahasia Bunyi',
    activity: 'MEDIUM MASTERS: Jalur Rahasia Bunyi',
    step: [3, 4],
    prev: 11,
    next: 13,
  },
  13: {
    stage: 3,
    stageName: 'EKSPERIMEN BUNYI',
    color: '#0277BD',
    theme: 'Laboratorium Rahasia Bunyi',
    activity: 'INSTRUMENT HUNTER: Berburu Alat Musik',
    step: [4, 4],
    prev: 12,
    next: 2,
  },
  14: {
    stage: 4,
    stageName: 'BUNYI DALAM KEHIDUPAN',
    color: '#6A1B9A',
    theme: 'Duel Para Detektif',
    activity: 'SOUND CHALLENGE: Kuis Pilihan Ganda',
    step: [1, 4],
    prev: 2,
    next: 15,
  },
  15: {
    stage: 4,
    stageName: 'BUNYI DALAM KEHIDUPAN',
    color: '#6A1B9A',
    theme: 'Duel Para Detektif',
    activity: 'MATCH & MATCH: Pasangkan Konsep',
    step: [2, 4],
    prev: 14,
    next: 16,
  },
  16: {
    stage: 4,
    stageName: 'BUNYI DALAM KEHIDUPAN',
    color: '#6A1B9A',
    theme: 'Duel Para Detektif',
    activity: 'GUESS THE SOUND: Tebak Suara',
    step: [3, 4],
    prev: 15,
    next: 17,
  },
  17: {
    stage: 4,
    stageName: 'BUNYI DALAM KEHIDUPAN',
    color: '#6A1B9A',
    theme: 'Duel Para Detektif',
    activity: 'FINAL BOSS: Eksperimen Xylophone Air',
    step: [4, 4],
    prev: 16,
    next: 2,
  },
  18: {
    stage: 5,
    stageName: 'KREASI MUSIK SEDERHANA',
    color: '#C62828',
    theme: 'Panggung Kreasi Ilmuwan',
    activity: 'CHOOSE YOUR CREATION: Pilih Misi Karyamu',
    step: [1, 4],
    prev: 2,
    next: 19,
  },
  19: {
    stage: 5,
    stageName: 'KREASI MUSIK SEDERHANA',
    color: '#C62828',
    theme: 'Panggung Kreasi Ilmuwan',
    activity: 'UPLOAD YOUR CREATION: Galeri Karya',
    step: [2, 4],
    prev: 18,
    next: 20,
  },
  20: {
    stage: 5,
    stageName: 'KREASI MUSIK SEDERHANA',
    color: '#C62828',
    theme: 'Panggung Kreasi Ilmuwan',
    activity: 'REFLECT & GROW: Refleksi Penjelajah',
    step: [3, 4],
    prev: 19,
    next: 21,
  },
  21: {
    stage: 5,
    stageName: 'KREASI MUSIK SEDERHANA',
    color: '#C62828',
    theme: 'Panggung Kreasi Ilmuwan',
    activity: 'MISSION COMPLETE: Sertifikat Penjelajah',
    step: [4, 4],
    prev: 20,
    next: 2,
  },
};

export interface MapIsland {
  id: number;
  slide: number;
  name: string;
  sub: string;
  badgeColor: string;
  hitboxClass: string;
  starPillClass: string;
}

export const MAP_ISLANDS: MapIsland[] = [
  {
    id: 1,
    slide: 3,
    name: 'Mengenal Dunia Bunyi',
    sub: 'Gerbang Misteri Suara',
    badgeColor: '#2E7D32',
    hitboxClass: 'left-[5.5%] top-[20%] w-[20%] h-[36%]',
    starPillClass: 'left-[8.2%] top-[50.5%]',
  },
  {
    id: 2,
    slide: 6,
    name: 'Sumber & Sifat Bunyi',
    sub: 'Berburu Jejak Bunyi',
    badgeColor: '#EF6C00',
    hitboxClass: 'left-[42.5%] top-[7%] w-[21%] h-[36%]',
    starPillClass: 'left-[46.2%] top-[38.2%]',
  },
  {
    id: 3,
    slide: 10,
    name: 'Eksperimen Bunyi',
    sub: 'Laboratorium Rahasia',
    badgeColor: '#0277BD',
    hitboxClass: 'left-[74.5%] top-[14%] w-[21%] h-[36%]',
    starPillClass: 'left-[78.5%] top-[44.8%]',
  },
  {
    id: 4,
    slide: 14,
    name: 'Bunyi dalam Kehidupan',
    sub: 'Duel Para Detektif',
    badgeColor: '#6A1B9A',
    hitboxClass: 'left-[24.5%] top-[50.5%] w-[22%] h-[36%]',
    starPillClass: 'left-[27.8%] top-[80.5%]',
  },
  {
    id: 5,
    slide: 18,
    name: 'Kreasi Musik Sederhana',
    sub: 'Panggung Kreasi',
    badgeColor: '#C62828',
    hitboxClass: 'left-[61.5%] top-[49%] w-[22%] h-[36%]',
    starPillClass: 'left-[64.8%] top-[79.5%]',
  },
];

export const STAGE4_QUIZ_QUESTIONS = [
  {
    id: 0,
    subject: 'IPAS · Sumber Bunyi',
    question: 'Ketika senar gitar dipetik, bunyi muncul karena …',
    options: [
      { id: 'A', text: 'Senar berubah warna menjadi terang' },
      { id: 'B', text: 'Senar mengalami getaran yang menggetarkan udara' },
      { id: 'C', text: 'Udara di sekitar gitar berhenti bergerak' },
      { id: 'D', text: 'Gitar menyerap semua gelombang bunyi' },
    ],
    correct: 'B',
    explanation:
      'Tepat! Bunyi selalu dihasilkan oleh benda yang bergetar. Getaran senar merambat melalui udara hingga ke telinga.',
  },
  {
    id: 1,
    subject: 'IPAS · Perambatan Bunyi',
    question: 'Astronot di ruang angkasa tidak bisa saling mendengar langsung tanpa radio karena …',
    options: [
      { id: 'A', text: 'Ruang angkasa terlalu gelap untuk bunyi' },
      { id: 'B', text: 'Tidak ada medium (udara/partikel) untuk merambatkan getaran' },
      { id: 'C', text: 'Helm astronot memantulkan semua suara' },
      { id: 'D', text: 'Frekuensi suara manusia terlalu rendah' },
    ],
    correct: 'B',
    explanation:
      'Benar! Bunyi adalah gelombang mekanik yang membutuhkan medium (padat, cair, atau gas). Ruang hampa tidak memiliki partikel.',
  },
  {
    id: 2,
    subject: 'Seni Musik · Frekuensi & Nada',
    question:
      'Ketika botol air diisi semakin banyak lalu DIKETUK dengan sendok, nada yang dihasilkan menjadi lebih rendah karena …',
    options: [
      { id: 'A', text: 'Massa air dan botol yang ikut bergetar semakin besar' },
      { id: 'B', text: 'Air menyerap warna suara sendok' },
      { id: 'C', text: 'Udara di luar botol menjadi semakin dingin' },
      { id: 'D', text: 'Botol menjadi semakin ringan' },
    ],
    correct: 'A',
    explanation:
      'Hebat! Saat diketuk, air dan kaca ikut bergetar. Semakin penuh airnya, getarannya semakin lambat sehingga nadanya lebih rendah.',
  },
  {
    id: 3,
    subject: 'Bahasa Indonesia · Eksplanasi Ilmiah',
    question: 'Manakah kalimat penjelasan ilmiah yang paling runtut tentang cara kerja telepon gelas?',
    options: [
      { id: 'A', text: 'Telepon gelas berbunyi karena warnanya cerah dan talinya panjang.' },
      {
        id: 'B',
        text: 'Suara menggetarkan dasar gelas, getaran merambat sepanjang tali yang tegang, lalu menggetarkan gelas penerima.',
      },
      { id: 'C', text: 'Tali yang kendur membuat suara berjalan lebih cepat daripada tali tegang.' },
      { id: 'D', text: 'Gelas plastik dapat menghasilkan listrik untuk mengirim suara.' },
    ],
    correct: 'B',
    explanation:
      'Luar biasa! Kalimat B menjelaskan alur sebab-akibat perambatan getaran bunyi melalui medium padat (tali tegang) secara runtut.',
  },
];

export const STAGE4_MATCH_PAIRS = [
  { id: 'gitar', left: 'Senar gitar', right: 'Bergetar saat dipetik (sumber bunyi)' },
  { id: 'gelas', left: 'Telepon gelas', right: 'Getaran merambat melalui medium tali tegang' },
  { id: 'gema', left: 'Gema', right: 'Bunyi pantul yang terdengar terpisah dari bunyi asli' },
  { id: 'seruling', left: 'Seruling', right: 'Kolom udara di dalam tabung bergetar saat ditiup' },
  { id: 'botol', left: 'Botol diketuk', right: 'Getaran dinding botol dan air menghasilkan nada' },
];

export const STAGE4_GUESS_ROUNDS: Array<{
  round: number;
  target: string;
  sound: SoundEffectType;
  clue: string;
  options: Array<{ name: string; key: PropKey }>;
}> = [
  {
    round: 0,
    target: 'Seruling',
    sound: 'flute',
    clue: 'Alat musik tiup dengan nada lembut dan teratur dari getaran kolom udara.',
    options: [
      { name: 'Gitar', key: 'gitar' },
      { name: 'Drum', key: 'membran_drum' },
      { name: 'Seruling', key: 'seruling' },
      { name: 'Bel Sekolah', key: 'bel' },
    ],
  },
  {
    round: 1,
    target: 'Gitar',
    sound: 'guitar',
    clue: 'Dimainkan dengan cara dipetik; menghasilkan harmoni dawai yang bergetar.',
    options: [
      { name: 'Gitar', key: 'gitar' },
      { name: 'Drum', key: 'membran_drum' },
      { name: 'Angklung', key: 'angklung' },
      { name: 'Bel Sekolah', key: 'bel' },
    ],
  },
  {
    round: 2,
    target: 'Drum',
    sound: 'drum',
    clue: 'Memiliki kulit membran yang dipukul hingga bergetar dengan nada rendah bertenaga.',
    options: [
      { name: 'Seruling', key: 'seruling' },
      { name: 'Drum', key: 'membran_drum' },
      { name: 'Biola', key: 'biola' },
      { name: 'Bel Sekolah', key: 'bel' },
    ],
  },
  {
    round: 3,
    target: 'Angklung',
    sound: 'angklung',
    clue: 'Alat musik bambu tradisional Indonesia yang dimainkan dengan digoyangkan.',
    options: [
      { name: 'Gitar', key: 'gitar' },
      { name: 'Angklung', key: 'angklung' },
      { name: 'Drum', key: 'membran_drum' },
      { name: 'Seruling', key: 'seruling' },
    ],
  },
];
