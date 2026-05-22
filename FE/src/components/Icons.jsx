// Reusable inline SVG icons (FontAwesome paths)
const Icon = ({ d, className = 'w-4 h-4', fill = true, viewBox = '0 0 512 512' }) => (
  <svg className={className} viewBox={viewBox} fill={fill ? 'currentColor' : 'none'} stroke={fill ? 'none' : 'currentColor'} strokeWidth={fill ? '0' : '2'} strokeLinecap="round" strokeLinejoin="round">
    {Array.isArray(d) ? d.map((p, i) => <path key={i} d={p} />) : <path d={d} />}
  </svg>
)

// --- Navigation / UI ---
export const IconBook = ({ className }) => <Icon className={className} viewBox="0 0 24 24" fill={false} d={['M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z', 'M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z']} />
export const IconSearch = ({ className }) => <Icon className={className} viewBox="0 0 24 24" fill={false} d={['M19.023 16.977a35.13 35.13 0 0 1-1.367-1.384c-.372-.378-.596-.653-.596-.653l-2.8-1.337A6.962 6.962 0 0 0 16 9c0-3.859-3.14-7-7-7S2 5.141 2 9s3.14 7 7 7c1.763 0 3.37-.66 4.603-1.739l1.337 2.8s.275.224.653.596c.387.363.896.854 1.384 1.367l1.358 1.392.604.646 2.121-2.121-.646-.604c-.379-.372-.885-.866-1.391-1.36zM9 14c-2.757 0-5-2.243-5-5s2.243-5 5-5 5 2.243 5 5-2.243 5-5 5z']} />
export const IconLogout = ({ className }) => <Icon className={className} viewBox="0 0 24 24" fill={false} d={['M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4', 'M16 17l5-5-5-5', 'M21 12H9']} />
export const IconMenu = ({ className }) => <Icon className={className} viewBox="0 0 24 24" fill={false} d={['M3 12h18', 'M3 6h18', 'M3 18h18']} />
export const IconClose = ({ className }) => <Icon className={className} viewBox="0 0 24 24" fill={false} d={['M18 6L6 18', 'M6 6l12 12']} />
export const IconChevronRight = ({ className }) => <Icon className={className} viewBox="0 0 320 512" d="M285.5 261.6l-192 160c-9.1 7.6-22.7 6.4-30.3-2.7s-6.4-22.7 2.7-30.3L226.7 256 65.9 123.4c-9.1-7.6-10.3-21.2-2.7-30.3s21.2-10.3 30.3-2.7l192 160c5 4.2 7.9 10.4 7.9 16.9s-2.9 12.7-7.9 16.9z" />

// --- Section icons ---
export const IconFolder = ({ className }) => <Icon className={className} d="M464 128H272l-64-64H48C21.5 64 0 85.5 0 112v288c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48V176c0-26.5-21.5-48-48-48z" />
export const IconBookmark = ({ className }) => <Icon className={className} viewBox="0 0 384 512" d="M0 512V48C0 21.5 21.5 0 48 0h288c26.5 0 48 21.5 48 48v464L192 400 0 512z" />
export const IconSeedling = ({ className }) => <Icon className={className} d="M64 96H0c0 123.7 100.3 224 224 224v144c0 8.8 7.2 16 16 16h32c8.8 0 16-7.2 16-16V320C288 196.3 187.7 96 64 96zm384-64c-84.2 0-157.4 46.5-195.7 115.2 27.7 30.2 48.2 66.9 59 107.6C424 243.1 512 147.9 512 32h-64z" />
export const IconTrophy = ({ className }) => <Icon className={className} viewBox="0 0 576 512" d="M552 64H448V24c0-13.3-10.7-24-24-24H152c-13.3 0-24 10.7-24 24v40H24C10.7 64 0 74.7 0 88v56c0 66.5 47.9 121.9 112 132.5V320h-8c-13.3 0-24 10.7-24 24v24H56c-13.3 0-24 10.7-24 24v64c0 13.3 10.7 24 24 24h464c13.3 0 24-10.7 24-24v-64c0-13.3-10.7-24-24-24h-24v-24c0-13.3-10.7-24-24-24h-8v-43.5c64.1-10.6 112-66 112-132.5V88c0-13.3-10.7-24-24-24zM48 140V112h80v74.5C91.2 180.8 48 165.1 48 140zm256 204h-32v-36h32v36zm176-204c0 25.1-43.2 40.8-80 46.5V112h80v28z" />
export const IconTag = ({ className }) => <Icon className={className} d="M0 252.1V48C0 21.5 21.5 0 48 0h204.1a48 48 0 0 1 33.9 14.1l211.9 211.9c18.7 18.7 18.7 49.1 0 67.9L293.8 497.9c-18.7 18.7-49.1 18.7-67.9 0L14.1 286.1A48 48 0 0 1 0 252.1zM112 64c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48z" />
export const IconGift = ({ className }) => <Icon className={className} d="M32 448c0 17.7 14.3 32 32 32h160V320H32v128zm256 32h160c17.7 0 32-14.3 32-32V320H288v160zm192-320h-42.1c6.2-12.1 10.1-25.5 10.1-40 0-48.5-39.5-88-88-88-41.6 0-68.5 21.3-103 68.3-34.5-47-61.4-68.3-103-68.3-48.5 0-88 39.5-88 88 0 14.5 3.8 27.9 10.1 40H32c-17.7 0-32 14.3-32 32v80c0 8.8 7.2 16 16 16h480c8.8 0 16-7.2 16-16v-80c0-17.7-14.3-32-32-32zm-326.1 0c-22.1 0-40-17.9-40-40s17.9-40 40-40c19.9 0 34.6 3.3 86.1 80h-86.1zm186.2 0h-86.1c51.4-76.5 65.7-80 86.1-80 22.1 0 40 17.9 40 40s-17.9 40-40 40z" />

// --- Detail / Profile ---
export const IconStar = ({ className, filled }) => <Icon className={className} viewBox="0 0 24 24" fill={filled} d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
export const IconBox = ({ className }) => <Icon className={className} viewBox="0 0 448 512" d="M50.7 58.5L0 160h208V32H93.7c-18.2 0-34.8 10.3-43 26.5zM240 160h208L397.3 58.5c-8.2-16.2-24.8-26.5-43-26.5H240v128zm208 32H0v224c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V192z" />
export const IconTrendingUp = ({ className }) => <Icon className={className} viewBox="0 0 24 24" fill={false} d={['M23 6l-9.5 9.5-5-5L1 18', 'M17 6h6v6']} />
export const IconUser = ({ className }) => <Icon className={className} viewBox="0 0 448 512" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z" />
export const IconEnvelope = ({ className }) => <Icon className={className} d="M48 64C21.5 64 0 85.5 0 112c0 15.1 7.1 29.3 19.2 38.4L236.8 313.6c11.4 8.5 27 8.5 38.4 0L492.8 150.4c12.1-9.1 19.2-23.3 19.2-38.4 0-26.5-21.5-48-48-48H48zM0 176v208c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V176L294.4 339.2a63.9 63.9 0 0 1-76.8 0L0 176z" />
export const IconCalendar = ({ className }) => <Icon className={className} d="M152 24c0-13.3-10.7-24-24-24s-24 10.7-24 24v40H64C28.7 64 0 92.7 0 128v16 48V448c0 35.3 28.7 64 64 64h384c35.3 0 64-28.7 64-64V192 144 128c0-35.3-28.7-64-64-64h-40V24c0-13.3-10.7-24-24-24s-24 10.7-24 24v40H152V24zM48 192h416V448c0 8.8-7.2 16-16 16H64c-8.8 0-16-7.2-16-16V192z" />
export const IconShield = ({ className }) => <Icon className={className} d="M256 0c4.6 0 9.2 1 13.4 2.9L457.7 82.8c22 9.3 38.4 31 38.3 57.2-.5 99.2-41.3 280.7-213.6 363.2-16.7 8-36.1 8-52.8 0C57.3 420.7 16.5 239.2 16 140c-.1-26.2 16.3-47.9 38.3-57.2L242.7 2.9C246.8 1 251.4 0 256 0z" />
export const IconFilter = ({ className }) => <Icon className={className} d="M0 73.7C0 50.7 18.7 32 41.7 32h428.6c23 0 41.7 18.7 41.7 41.7 0 9.6-3.3 18.9-9.4 26.3L336 304.5V447.7c0 17.8-14.5 32.3-32.3 32.3-7.6 0-15-2.7-20.8-7.6l-84.6-71.1c-7.3-6.1-11.5-15.1-11.5-24.7V304.5L9.4 100C3.3 92.6 0 83.3 0 73.7z" />
export const IconHeart = ({ className }) => <Icon className={className} viewBox="0 0 24 24" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
export const IconWarning = ({ className }) => <Icon className={className} d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480H40c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24V296c0 13.3 10.7 24 24 24s24-10.7 24-24V184c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0-64 0 32 32 0 1 0 64 0z" />
export const IconMap = ({ className }) => <Icon className={className} viewBox="0 0 576 512" d="M384 476.1L192 421.2V35.9L384 90.8v385.3zm32-1.2V88.4L543.1 37.5c15.8-6.3 32.9 5.3 32.9 22.3v334.8c0 9.8-6 18.6-15.1 22.3L416 474.9zM15.1 95.1L160 37.2V423.6L32.9 474.5C17.1 480.8 0 469.2 0 452.2V117.4c0-9.8 6-18.6 15.1-22.3z" />

// Small X for close/remove chips
export const IconX = ({ className = 'w-3 h-3' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
  </svg>
)
