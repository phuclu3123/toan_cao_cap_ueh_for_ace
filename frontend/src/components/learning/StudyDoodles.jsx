/* Original pen paths, intentionally a little uneven like margin drawings. */
export function StudyIcon({ kind = 'book', className = '' }) {
  const paths = {
    book: <><path d="M14 22q17-5 35 3 17-8 36-3l-1 53q-17-3-35 5-18-8-35-5Z"/><path d="m49 25 1 53M23 34q10-2 17 2m-17 9 17 2m20-12 15-3m-15 15 15-3"/><path d="m8 82 4 1m77-3 4-1"/></>,
    exam: <><path d="m23 12 42 1 13 14-1 59-53 1Z"/><path d="m65 13-1 17 14-3M35 39l4 4 7-8m-11 20 4 4 7-8m-10 20 4 4 7-8m7-25 13 1m-13 16 13-1m-13 17 13 1"/><path d="m14 14-5-4m76 66 7 2"/></>,
    chat: <><path d="M17 22q29-15 61 1 17 15 1 36-15 13-36 8L22 82l3-22Q5 46 17 22Z"/><path d="M32 38q8-13 17-3 12-12 20-1 8 13-20 25-23-10-17-21Z"/><path d="m81 15 4-7m5 13 7-1"/></>,
    notes: <><path d="m20 18 57-1-1 69-56-1Zm-7 7-1 67 56 1M31 31l32 1m-33 12 26-1m-26 15 31 1m-31 13 17-1"/><path d="m72 11 4-7m7 12 8-2"/></>,
    pencil: <><path d="m19 65 43-48q8-9 17 0t0 17L35 81l-21 6Zm0 0 16 16m26-62 16 16m-51 38 39-44M15 86l7-3"/><path d="M44 89q20-7 38-2"/></>
  };
  return <svg className={`study-drawn-icon ${className}`} viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[kind] || paths.book}</svg>;
}

export function StudySketch({ className = '' }) {
  return <svg className={`study-person-sketch ${className}`} viewBox="0 0 280 230" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M99 73q-7-39 27-44 35-7 40 26 5 32-25 44-30 3-42-26Z" fill="var(--ui-canvas,#faf8f5)"/>
    <path d="M98 60q-15-26 10-39 23-14 48 2l14 14-14 3q-24 3-39-12 2 20-19 32Z" fill="var(--ui-pastel-peach,#edc4b0)"/>
    <path d="m107 62 17 1 1 11-16 1Zm30-1 17-1 1 13-17 1m-12-8 12-1m-8 12 4 3m-13 6q9 6 17-1M124 98l-2 16m25-18 5 18"/>
    <path d="m122 111-32 9-24 55 25 13 19-37m43-38 31 12 22 49-24 14-18-36M105 181l-4 35m67-35 9 35M79 218q50 5 119 0"/>
    <path d="m92 146 46 12 43-16 1 55-43 16-47-15Z" fill="var(--ui-pastel-mint,#acd6af)"/>
    <path d="m138 158 1 55m-34-46 20 6m-19 8 19 5m27-12 17-6m-16 20 17-6M71 171q14-7 24 4l-1 13-14 3m121-20q-14-7-22 4l2 14 13 2"/>
    <path d="M30 80q-17-14-9-24 8-7 16 3 9-12 17-4 11 10-24 25Zm190-27 5-13 4 13 14 3-14 4-5 13-4-13-13-4Z" stroke="var(--ui-muted,#64705d)"/>
    <path d="M25 137q-5 29 24 39m-7-10 7 10-12 1M218 116q20-17 34 1t-4 28q-12 2-15-7 2-9 12-4" stroke="var(--ui-pastel-peach,#d29c83)" strokeWidth="3"/>
  </svg>;
}

/* Original margin drawings; each subject has a different scene and silhouette. */
export function StudyScene({ kind }) {
  const sky = 'var(--ui-pastel-sky,#bedde7)';
  const mint = 'var(--ui-pastel-mint,#acd6af)';
  const sun = 'var(--ui-pastel-sun,#f8e6a4)';
  const paper = 'var(--ui-canvas,#faf8f5)';
  const peach = 'var(--ui-pastel-peach,#edc4b0)';
  const scenes = {
    courses: <>
      <path d="M17 262c64-74 94 42 165-16s100-95 154-42 93 29 159-74" stroke={peach} strokeWidth="7"/><path d="m482 131 15-6-1 17"/>
      <g transform="translate(136 4)">
        <path d="M99 73q-7-39 27-44 35-7 40 26 5 32-25 44-30 3-42-26Z" fill={paper}/><path d="M98 60q-15-26 10-39 23-14 48 2l14 14-14 3q-24 3-39-12 2 20-19 32Z" fill={peach}/>
        <path d="m107 62 17 1 1 11-16 1Zm30-1 17-1 1 13-17 1m-12-8 12-1m-8 12 4 3m-13 6q9 6 17-1M124 98l-2 16m25-18 5 18m-30-5-32 9-24 55 25 13 19-37m43-38 31 12 22 49-24 14-18-36M105 181l-4 35m67-35 9 35M79 218q50 5 119 0"/>
        <path d="m92 146 46 12 43-16 1 55-43 16-47-15Z" fill={mint}/><path d="m138 158 1 55m-34-46 20 6m-19 8 19 5m27-12 17-6m-16 20 17-6"/>
      </g>
      <path d="m46 179-3-66 62-4 4 65-63 5Z" fill={sun}/><path d="m57 129 31-2m-30 13 23-1m-23 13 29-1m-22 12 7 4 11-12M400 78l10-19 9 18 21 4-15 15 2 21-18-10-19 11 3-22-14-14Z"/>
      <path d="m369 245 21-39 12 6-22 39-15 10Zm21-39 11 7m-28 28 8 7M112 77q4-23 29-22m-8-5 8 5-6 8"/><circle cx="80" cy="221" r="5"/><path d="m446 189 12-1m-6-6 1 12"/>
    </>,
    resources: <>
      <path d="M41 276q193 4 411-2" strokeWidth="3"/>
      <path d="m78 271-2-147 36-2 3 148Z" fill={peach}/><path d="m119 270 4-173 43 2-2 172Z" fill={mint}/><path d="m173 271 1-129 33-2 2 131Z" fill={sun}/><path d="m216 146 31-9 38 126-33 10Z" fill={sky}/>
      <path d="m86 138 16-1m-16 9 17-1m-15 101 16 1m29-130 21 1m-21 9 20 1m-19 121h18m31-92h14m-13 8 13-1m38-2 14-5m-10 14 13-4"/>
      <path d="m306 269 5-67 92 3-4 66Z" fill={paper}/><path d="m319 219 71 2m-72 13 50 2m-50 13 62 2m-36-49 2-30 27 1-2 29"/>
      <path d="M329 151q-9-27 11-32 15-2 14 13-5 11-17 6m11-9q22-34 36-13 5 19-31 21m-7-3 15 39"/>
      <path d="M59 79q-9-34 20-39 28-3 31 20 1 20-27 19l-14 15 2-16m4-20 17 1m-16 9 11-1M412 134l8-18 6 17 17 5-17 6-6 17-7-17-16-6Z"/>
      <path d="M247 59q36-33 65-14m-12-5 13 5-9 10"/>
    </>,
    community: <>
      <path d="M47 66q69-37 153 2 37 41-1 83-44 26-96 7l-40 25 6-41Q18 110 47 66Z" fill={sky}/><path d="M110 94q-3-19 15-19 20 3 6 19-12 5-9 14m0 12v2m-58-23 21 1m-8 12 9-1m62 5 24-1"/>
      <path d="M278 145q81-33 160 1 36 28 9 70-27 36-101 20l-36 28 1-35q-70-35-33-84Z" fill={mint}/><path d="m322 182 20 19 43-40m16 37 19-2m-15 12 14 1"/>
      <path d="M211 212c-62 46-4 82 37 45m-11 0 12-1-4 12M272 93q35-57 68-17m-2-12 4 14-15-3" stroke={peach} strokeWidth="4"/>
      <path d="M382 110q-30-27-10-46 26-23 45 4 11 22-13 43l-1 13-21 1Zm1 22 20-1m-19 7 17-1m-12-28-1-20 12-1-5 20M87 231l5-12 5 12 13 4-13 4-4 12-6-12-12-4Z"/><circle cx="458" cy="99" r="4"/>
    </>,
    exams: <>
      <path d="m157 44 171 12-15 240-177-15Z" fill={sun}/><path d="m182 66 168-4 7 238-178 5Z" fill={paper}/>
      <path d="m206 93 119-3m-119 10 79-1m-75 36 9 7 13-17m12 8 73-2m-106 40 9 7 13-17m12 8 73-2m-106 42 9 7 13-17m12 8 73-2m-107 38 22 1m12-1 73-2"/>
      <path d="M99 120c-62 0-63-88-2-91s63 90 2 91Z" fill={sky}/><path d="m98 44 1 32 22 10m-45-36-5-5m53 3 5-6m-30-14v-9m-12-1 24-1"/>
      <path d="m349 260 48-126 17 6-48 126-20 13Zm48-126 16 7m-61 108 15 6" fill={peach}/>
      <path d="M67 198q-8-25 14-34m-13-1 14-1-1 13m336-94 8-17 6 17 18 5-18 6-6 17-8-17-16-5Z"/><path d="m65 269 13-1m-7-6 1 12"/>
    </>,
    blog: <>
      <path d="m55 72 171-10 14 233-177 10Z" fill={peach}/><path d="m80 53 168 4-7 238-178-5Z" fill={paper}/>
      <path d="m103 85 119 3m-119 6 79 3m-80 25 124 3m-124 15 117 4m-118 15 131 3m-130 15 92 3m-92 16 123 3m-124 15 74 3m-74 15 121 4m-76-186 2-15 41 1-1 17"/>
      <path d="m209 218 59-103 14 8-59 102-18 9Zm59-102 13 8m-66 86 12 7" fill={mint}/><path d="m343 75 114-33-46 86-14-34-54-19Zm54 19 60-52m-60 52-9 29 23-14" fill={sky}/>
      <path d="M387 140c43 63 17 101-27 95-37-6-28-44 1-29 49 24 44 74 110 63" strokeDasharray="5 8"/>
      <path d="M319 47l5-12 5 13 13 4-13 4-4 12-6-12-13-4Z"/>
    </>
  };
  return <svg className="study-scene" viewBox="0 0 520 330" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{scenes[kind] || scenes.courses}</svg>;
}
