/** Small original line drawings, sharing the margin universe's vector language. */
export default function EverydayDoodles({ kind }) {
  if (kind === 'bunbo') return <g strokeWidth="1.8">
    <ellipse cx="89" cy="92" rx="65" ry="24" fill="currentColor" fillOpacity=".08"/>
    <path d="M24 92q7 65 65 65t65-65M60 151l-6 9q35 14 70 0l-7-9M39 97q20 10 42 6t56-5M43 88q5-9 14-1t15 0 14 0 14-1M50 98q4-6 12 0t15 0 13 0"/>
    <path d="m85 81 13-9 21 7-5 13-18 3Zm8 0 13-3 6 5-7 5-11-1M126 87l5-9 10 5-2 9-12 2M42 78l-5-13 15 5 2 10m-9-4 9-13 7 14m-4-7 12-6-4 16"/>
    <path d="m111 75 27-48m-21 50 30-47M56 53q-11-9 0-18t0-17M77 59q-12-9-1-18t0-17M96 55q-10-8 0-16"/>
    <circle cx="74" cy="91" r="2"/><circle cx="121" cy="98" r="2"/><path d="m77 115 11 3m8 0 10-1"/>
  </g>;
  if (kind === 'banhxeo') return <g strokeWidth="1.8">
    <ellipse cx="90" cy="103" rx="72" ry="45"/><path d="M23 105q12 33 67 34t67-35"/>
    <path d="M40 102Q89 22 142 96q-43 31-102 6Z" fill="currentColor" fillOpacity=".15"/>
    <path d="M40 102q46-16 102-6M54 89l4-3m11-10 4-3m19-12 4 1m17 14 4 2m-31 12 5-2m-27 15 6-2m41-7 5 1M75 88q-8-9-1-14 9-4 13 7l-5 6Zm5-10 1 6M107 89q-7-9 0-13 9-4 13 7l-6 5Z"/>
    <path d="m40 110 12 9m8-10 12 10m3-11 8 8m15-11 10 10M21 79q-9-19 5-20-2-15 12-11 6-15 17-4l-4 11m-28 5 25 22m-12-28 10 21"/>
    <ellipse cx="128" cy="146" rx="24" ry="12" fill="currentColor" fillOpacity=".08"/><path d="M104 146v9q22 18 48 0v-9m-33-2 4 2m10-4 3 2"/>
  </g>;
  return null;
}
