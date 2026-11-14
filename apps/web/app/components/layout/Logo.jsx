export default function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="30" height="28" viewBox="0 0 30 28" fill="none" aria-hidden="true">
        <path d="M23.5 5.2A11 11 0 1 0 23.5 22.8" stroke="url(#cg)" strokeWidth="5" strokeLinecap="round" />
        <path d="M23 9.5h5M23 18.5h5" stroke="#f59a3d" strokeWidth="3" strokeLinecap="round" />
        <defs>
          <linearGradient id="cg" x1="3" y1="2" x2="27" y2="26">
            <stop stopColor="#ffb347" />
            <stop offset="1" stopColor="#f2711c" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[22px] font-bold tracking-[.12em] text-white">CORVIAN</span>
    </div>
  );
}
