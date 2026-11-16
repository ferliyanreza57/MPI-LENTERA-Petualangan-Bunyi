import React, { useState } from 'react';
import { RotateCcw, Upload } from 'lucide-react';
import { DEFAULT_PROP_IMAGES } from '../data/slidesData';
import { Gender, PropKey } from '../types/lentera';
import { processImageFileToDataUrl } from '../utils/imageUpload';

const CHARACTER_PORTRAITS = {
  boy_student: '/assets/aistudio/char_boy.png',
  girl_student: '/assets/aistudio/char_girl.png',
  pakguru: '/assets/aistudio/char_pakguru.png',
  buguru: '/assets/aistudio/char_buguru.png',
} as const;

export const HalfBodyAvatar: React.FC<{ gender: Gender; className?: string }> = ({
  gender,
  className = 'w-full h-full',
}) => {
  const src = gender === 'girl' ? CHARACTER_PORTRAITS.girl_student : CHARACTER_PORTRAITS.boy_student;
  const label = gender === 'girl' ? 'Avatar Siswa Perempuan' : 'Avatar Siswa Laki-laki';

  return (
    <img
      src={src}
      alt={label}
      referrerPolicy="no-referrer"
      className={`${className} object-cover select-none`}
    />
  );
};

export const CharacterFigure: React.FC<{
  type: 'boy_student' | 'girl_student' | 'pakguru' | 'buguru';
  className?: string;
}> = ({ type, className = 'w-28 h-28' }) => {
  const src = CHARACTER_PORTRAITS[type];
  const frameColors: Record<typeof type, string> = {
    boy_student: 'border-sky-400 bg-sky-900/40',
    girl_student: 'border-rose-400 bg-rose-900/40',
    pakguru: 'border-amber-400 bg-[#4b6747]',
    buguru: 'border-emerald-400 bg-[#546e50]',
  };
  const labels: Record<typeof type, string> = {
    boy_student: 'Siswa Laki-laki',
    girl_student: 'Siswa Perempuan',
    pakguru: 'Pak Guru',
    buguru: 'Bu Guru',
  };
  const imageStyles: Record<typeof type, React.CSSProperties> = {
    boy_student: { transform: 'scale(1.08)' },
    girl_student: { transform: 'scale(1.08)' },
    pakguru: {
      transform: 'scale(1.08) translate(-14.5%, 4%)',
      WebkitMaskImage: 'linear-gradient(to right, black 86%, transparent 100%)',
      maskImage: 'linear-gradient(to right, black 86%, transparent 100%)',
    },
    buguru: {
      transform: 'scale(1.1) translate(17.5%, 1.5%)',
      WebkitMaskImage: 'linear-gradient(to left, black 86%, transparent 100%)',
      maskImage: 'linear-gradient(to left, black 86%, transparent 100%)',
    },
  };
  const isTeacher = type === 'pakguru' || type === 'buguru';

  return (
    <div
      className={`${className} relative aspect-square animate-float select-none drop-shadow-xl rounded-full overflow-hidden border-4 ${frameColors[type]} shadow-2xl`}
    >
      {isTeacher && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover object-center scale-125 blur-[6px] brightness-95 pointer-events-none"
        />
      )}
      <img
        src={src}
        alt={labels[type]}
        referrerPolicy="no-referrer"
        style={imageStyles[type]}
        className="relative w-full h-full object-cover object-center"
      />
    </div>
  );
};

export const FallbackPropSVG: React.FC<{ itemKey: PropKey }> = ({ itemKey }) => {
  switch (itemKey) {
    case 'bel':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <path d="M51 8 C46 8, 44 28, 50 45 L70 45 C76 28, 74 8, 69 8 Z" fill="#9A3412" />
          <rect x="48" y="42" width="24" height="8" rx="4" fill="#FDE047" stroke="#78350F" strokeWidth="1.5" />
          <path d="M39 49 C36 74, 22 89, 16 97 L104 97 C98 89, 84 74, 81 49 Z" fill="#F59E0B" stroke="#78350F" strokeWidth="2" />
          <circle cx="60" cy="105" r="9" fill="#FDE047" stroke="#78350F" strokeWidth="2" />
        </svg>
      );
    case 'telepon_kaleng':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <rect x="10" y="40" width="28" height="40" rx="6" fill="#0284C7" stroke="#0C4A6E" strokeWidth="2" />
          <rect x="82" y="40" width="28" height="40" rx="6" fill="#E11D48" stroke="#881337" strokeWidth="2" />
          <line x1="38" y1="60" x2="82" y2="60" stroke="#F59E0B" strokeWidth="4" strokeDasharray="5,3" />
        </svg>
      );
    case 'botol_air':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <rect x="18" y="30" width="22" height="66" rx="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <rect x="20" y="66" width="18" height="28" rx="4" fill="#EF4444" />
          <rect x="49" y="30" width="22" height="66" rx="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <rect x="51" y="50" width="18" height="44" rx="4" fill="#F59E0B" />
          <rect x="80" y="30" width="22" height="66" rx="6" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
          <rect x="82" y="38" width="18" height="56" rx="4" fill="#10B981" />
        </svg>
      );
    case 'seruling':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <g transform="rotate(-32 60 60)">
            <rect x="14" y="51" width="92" height="18" rx="9" fill="#D97706" stroke="#78350F" strokeWidth="2.5" />
            <rect x="20" y="51" width="14" height="18" rx="4" fill="#FDE68A" stroke="#78350F" strokeWidth="1.5" />
            <circle cx="48" cy="60" r="3.5" fill="#451A03" />
            <circle cx="60" cy="60" r="3.5" fill="#451A03" />
            <circle cx="72" cy="60" r="3.5" fill="#451A03" />
            <circle cx="84" cy="60" r="3.5" fill="#451A03" />
          </g>
          <text x="84" y="34" fill="#0284C7" fontSize="22" fontWeight="bold">♪</text>
        </svg>
      );
    case 'biola':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <rect x="56" y="10" width="8" height="44" fill="#451A03" />
          <circle cx="60" cy="10" r="6" fill="#78350F" />
          <path d="M44 48 C30 50, 34 66, 44 70 C30 78, 30 106, 60 106 C90 106, 90 78, 76 70 C86 66, 90 50, 76 48 Z" fill="#B45309" stroke="#451A03" strokeWidth="2.5" />
          <rect x="52" y="88" width="16" height="10" rx="3" fill="#1C1917" />
          <line x1="22" y1="84" x2="104" y2="54" stroke="#E2E8F0" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'angklung':
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <rect x="20" y="18" width="80" height="8" rx="4" fill="#92400E" />
          <rect x="20" y="92" width="80" height="10" rx="4" fill="#78350F" />
          <rect x="24" y="18" width="7" height="84" rx="3" fill="#92400E" />
          <rect x="89" y="18" width="7" height="84" rx="3" fill="#92400E" />
          <rect x="38" y="28" width="16" height="64" rx="4" fill="#FDE68A" stroke="#B45309" strokeWidth="2" />
          <rect x="62" y="42" width="16" height="50" rx="4" fill="#FCD34D" stroke="#B45309" strokeWidth="2" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 120 120" className="w-full h-full">
          <circle cx="60" cy="60" r="40" fill="#FDE68A" stroke="#D97706" strokeWidth="4" />
          <text x="60" y="72" textAnchor="middle" fill="#92400E" fontSize="40" fontWeight="bold">♫</text>
        </svg>
      );
  }
};

interface PropIconBoxProps {
  itemKey: PropKey;
  label?: string;
  className?: string;
  customVisuals?: Record<string, string>;
  editMode?: boolean;
  onUploadVisual?: (key: string, dataUrl: string) => void;
  onResetVisual?: (key: string) => void;
}

export const PropIconBox: React.FC<PropIconBoxProps> = ({
  itemKey,
  label,
  className = '',
  customVisuals,
  editMode = false,
  onUploadVisual,
  onResetVisual,
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const customSrc = customVisuals?.[itemKey];
  const defaultSrc = DEFAULT_PROP_IMAGES[itemKey];
  const activeSrc = customSrc || defaultSrc;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadVisual) return;
    try {
      const dataUrl = await processImageFileToDataUrl(file, 480);
      setImgFailed(false);
      onUploadVisual(itemKey, dataUrl);
    } catch {
      // Ignore invalid image
    }
  };

  return (
    <div className={`prop-visual-box ${className}`} title={label} aria-label={label}>
      {activeSrc && !imgFailed ? (
        <img
          src={activeSrc}
          alt={label || itemKey}
          referrerPolicy="no-referrer"
          onError={() => setImgFailed(true)}
          className="w-full h-full object-contain drop-shadow-sm"
        />
      ) : (
        <FallbackPropSVG itemKey={itemKey} />
      )}

      {editMode && onUploadVisual && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-0 bg-slate-900/65 backdrop-blur-[1px] flex flex-col items-center justify-center gap-1 p-1 z-20"
        >
          <label className="cursor-pointer px-2 py-0.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-game font-bold text-[10px] flex items-center gap-1 shadow">
            <Upload className="w-3 h-3" />
            <span>Ganti</span>
            <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </label>
          {customSrc && onResetVisual && (
            <button
              type="button"
              onClick={() => onResetVisual(itemKey)}
              className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white text-[9px] font-bold flex items-center gap-0.5"
            >
              <RotateCcw className="w-2.5 h-2.5" /> Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};
