export type Gender = 'boy' | 'girl';

export type SoundEffectType =
  | 'click'
  | 'bell'
  | 'drum'
  | 'guitar'
  | 'bird'
  | 'vehicle'
  | 'rain'
  | 'clap'
  | 'flute'
  | 'violin'
  | 'angklung'
  | 'desah'
  | 'dentum'
  | 'nada'
  | 'cup_clear'
  | 'cup_muffled'
  | 'fanfare'
  | 'error'
  | 'infra'
  | 'audio'
  | 'ultra';

export type PropKey =
  | 'bel'
  | 'burung'
  | 'kendaraan'
  | 'gitar'
  | 'senar_gitar'
  | 'membran_drum'
  | 'telepon_kaleng'
  | 'botol_air'
  | 'hujan'
  | 'tepuk_tangan'
  | 'gajah'
  | 'paus'
  | 'piano'
  | 'nyamuk'
  | 'anjing'
  | 'kelelawar'
  | 'seruling'
  | 'biola'
  | 'angklung';

export interface SlideMeta {
  stage: number;
  stageName?: string;
  color?: string;
  theme?: string;
  activity?: string;
  step?: [number, number];
  prev: number | null;
  next: number;
}

export interface CreationSubmission {
  id: string;
  author: string;
  mission: string;
  title: string;
  description: string;
  format: 'Foto' | 'Video' | 'Dokumen' | 'Rekaman' | 'Tautan';
  attachmentName?: string;
  imageDataUrl?: string;
  audioDataUrl?: string;
  linkUrl?: string;
  createdAt: string;
}

export interface LenteraState {
  currentSlide: number;
  playerName: string;
  playerGender: Gender;
  devName: string;
  className: string;
  soundEnabled: boolean;
  teacherUnlocked: boolean;
  stageStars: Record<number, number>;
  stageMaxStars: Record<number, number>;
  completedTasks: Record<string, boolean>;
  customVisuals: Record<string, string>;

  // Stage 1
  slide4Saved: string;
  slide4ObservedSounds: string[];
  slide5Choice: string;
  slide5Reason: string;

  // Stage 2
  slide6Visited: string[];
  slide7Vibrating: boolean;
  slide7Amplitude: number;
  slide7Frequency: number;
  slide8Bins: Record<string, string>;
  slide9Tab: number;
  slide9AudioIdx: number;
  slide9Category: string;
  slide9Reason: string;
  slide9InstrumentMatches: Record<string, string>;
  slide9PlayMethods: Record<string, string>;
  slide9VibrationSources: Record<string, string>;

  // Stage 3
  slide11String: 'Tegang' | 'Kendur';
  slide11Distance: number;
  slide12Medium: 'Padat' | 'Cair' | 'Gas' | 'Hampa';
  slide12Matches: Record<string, string>;
  slide13Visited: string[];
  slide13QuizAnswers: Record<string, string>;

  // Stage 4
  slide14Answers: Record<number, string>;
  slide14CurrentQ: number;
  slide15Pairs: Record<string, string>;
  slide16Round: number;
  slide16Guesses: Record<number, string>;
  slide17Mode: 'Ketuk Botol' | 'Tiup Botol';
  slide17Notes: string;

  // Stage 5
  slide18Mission: string;
  slide19Title: string;
  slide19Desc: string;
  slide19Format: CreationSubmission['format'];
  slide19Link: string;
  slide19ImagePreview: string;
  slide19AudioPreview: string;
  submissions: CreationSubmission[];
  slide20New: string;
  slide20Best: string;
  slide20Self: number;
}
