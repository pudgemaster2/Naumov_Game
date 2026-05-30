import React from 'react';

interface CustomAvatarProps {
  gender: 'male' | 'female';
  hairColor: string;
  skinColor: string;
  outfitColor: string;
  faceStyle: number;
  className?: string;
}

export const CustomAvatar: React.FC<CustomAvatarProps> = ({
  gender,
  hairColor,
  skinColor,
  outfitColor,
  faceStyle,
  className = "w-32 h-32"
}) => {
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background frame */}
      <circle cx="50" cy="50" r="47" fill="#0c0c10" stroke="#c5a028" strokeWidth="2" />
      
      {/* Back Hair (for long female hair) */}
      {gender === 'female' && (
        <path
          d="M22,55 C17,30 25,15 50,15 C75,15 83,30 78,55 C78,72 73,82 68,88 L32,88 C27,82 22,72 22,55 Z"
          fill={hairColor}
        />
      )}

      {/* Shoulders / Outfit */}
      <path
        d="M25,95 C25,82 35,72 50,72 C65,72 75,82 75,95 Z"
        fill={outfitColor}
        stroke="#0c0c10"
        strokeWidth="1.5"
      />
      
      {/* Collar/neck detail */}
      <path d="M43,72 L50,80 L57,72 Z" fill={skinColor} stroke="#0c0c10" strokeWidth="1" />

      {/* Head / Face */}
      <circle cx="50" cy="49" r="21" fill={skinColor} stroke="#0c0c10" strokeWidth="2" />

      {/* Elven ears */}
      <path d="M29,46 C19,39 22,49 29,49 Z" fill={skinColor} stroke="#0c0c10" strokeWidth="1" />
      <path d="M71,46 C81,39 78,49 71,49 Z" fill={skinColor} stroke="#0c0c10" strokeWidth="1" />

      {/* Eyes based on faceStyle */}
      {faceStyle === 0 && (
        <>
          {/* Blue / Determined */}
          <ellipse cx="43" cy="47" rx="3.5" ry="2.5" fill="#fff" />
          <circle cx="43" cy="47" r="1.5" fill="#38bdf8" />
          <ellipse cx="57" cy="47" rx="3.5" ry="2.5" fill="#fff" />
          <circle cx="57" cy="47" r="1.5" fill="#38bdf8" />
          <path d="M38,43 L47,45" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M62,43 L53,45" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {faceStyle === 1 && (
        <>
          {/* Amber / Confident Smirk */}
          <ellipse cx="43" cy="47" rx="3.5" ry="2.5" fill="#fff" />
          <circle cx="44" cy="47" r="1.5" fill="#e5c158" />
          <ellipse cx="57" cy="47" rx="3.5" ry="2.5" fill="#fff" />
          <circle cx="56" cy="47" r="1.5" fill="#e5c158" />
          <path d="M38,43 C41,41 45,43 45,43" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M62,43 C59,41 55,43 55,43" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {faceStyle === 2 && (
        <>
          {/* Emerald / Wise, calm */}
          <ellipse cx="43" cy="47" rx="3.5" ry="2.5" fill="#fff" />
          <circle cx="43" cy="47" r="1.5" fill="#34d399" />
          <ellipse cx="57" cy="47" rx="3.5" ry="2.5" fill="#fff" />
          <circle cx="57" cy="47" r="1.5" fill="#34d399" />
          <path d="M38,42 L46,42" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M62,42 L54,42" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}

      {/* Nose */}
      <path d="M50,48 L48,53 L52,53" stroke="#0c0c10" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" fill="none" />

      {/* Mouth based on faceStyle */}
      {faceStyle === 0 && <path d="M46,58 Q50,62 54,58" stroke="#991b1b" strokeWidth="1.5" fill="none" />}
      {faceStyle === 1 && <path d="M45,58 C47,59 52,56 55,57" stroke="#991b1b" strokeWidth="1.5" fill="none" />}
      {faceStyle === 2 && <path d="M46,59 Q50,56 54,59" stroke="#991b1b" strokeWidth="1.5" fill="none" />}

      {/* Front Hair */}
      {gender === 'male' ? (
        /* Spiky male style */
        <path
          d="M26,36 C26,23 35,12 50,15 C65,12 74,23 74,36 C70,28 64,26 59,30 C54,23 46,23 41,30 C36,26 30,28 26,36 Z"
          fill={hairColor}
          stroke="#0c0c10"
          strokeWidth="1"
        />
      ) : (
        /* Styled braids/bangs style */
        <path
          d="M26,36 C28,23 35,18 50,20 C65,18 72,23 74,36 C70,30 62,28 55,32 C50,23 42,30 38,32 C33,28 28,30 26,36 Z"
          fill={hairColor}
          stroke="#0c0c10"
          strokeWidth="1"
        />
      )}
    </svg>
  );
};

export const DEFAULT_AVATAR_COLORS = {
  hair: [
    { label: 'Золотой', value: '#ffd54f' },
    { label: 'Изумрудный', value: '#10b981' },
    { label: 'Рубиновый', value: '#ef4444' },
    { label: 'Серебряный', value: '#cbd5e1' },
    { label: 'Обсидиан', value: '#1e293b' },
    { label: 'Фиолетовый', value: '#8b5cf6' },
  ],
  skin: [
    { label: 'Светлый эльф', value: '#fde047' }, // golden tinted pale
    { label: 'Персиковый', value: '#ffedd5' }, // warm peach
    { label: 'Темный эльф', value: '#475569' }, // drow grey
    { label: 'Ночной эльф', value: '#818cf8' }, // violet blue
    { label: 'Лесной эльф', value: '#bbf7d0' }, // green tint
  ],
  outfit: [
    { label: 'Королевский золотой', value: '#e5c158' },
    { label: 'Пурпурный эльфийский', value: '#6b21a8' },
    { label: 'Лесной зеленый', value: '#166534' },
    { label: 'Океанический синий', value: '#1e40af' },
    { label: 'Пепельно-черный', value: '#111827' },
  ],
};
