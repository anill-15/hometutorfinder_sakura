import { initials, hashIndex } from '../../utils/helpers.js';

const PALETTE = [
  ['#2f4bab', '#1b2b63'],
  ['#0e7c66', '#085f4e'],
  ['#b45309', '#92400e'],
  ['#b42318', '#7a271a'],
  ['#5b21b6', '#3f1580'],
  ['#0e7490', '#075985'],
  ['#9d174d', '#701a3c'],
  ['#3f6212', '#2f4a0f'],
];

const SIZES = {
  xs: 28,
  sm: 34,
  md: 44,
  lg: 64,
  xl: 96,
};

/**
 * Initials avatar. The background colour is derived from the name so a given
 * person always gets the same colour, without needing an image file.
 */
export default function Avatar({ name = '', size = 'md', square = false, className = '', src = '' }) {
  const px = SIZES[size] || SIZES.md;
  const [from, to] = PALETTE[hashIndex(name || 'anon', PALETTE.length)];

  if (src) {
    return (
      <img
        src={src}
        alt={name ? `${name}'s photo` : 'Profile photo'}
        className={`avatar ${square ? 'avatar--square' : ''} ${className}`}
        style={{ width: px, height: px, objectFit: 'cover' }}
      />
    );
  }

  return (
    <span
      className={`avatar avatar--${size} ${square ? 'avatar--square' : ''} ${className}`}
      style={{ background: `linear-gradient(140deg, ${from}, ${to})` }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}