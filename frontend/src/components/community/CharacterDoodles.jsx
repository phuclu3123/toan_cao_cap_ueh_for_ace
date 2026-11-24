/** Original vector doodles for the interactive margins. */
export default function CharacterDoodles({ kind }) {
  if (kind === 'mcqueen') return <g strokeWidth="1.8">
    <path d="m26 90 12-22 36-6 13-21 40 4 19 24 14 14 2 28-12 13H30l-12-13 2-16Z" fill="currentColor" fillOpacity=".09"/>
    <path d="m74 63 15-18 35 4 13 19ZM42 69l-11 23 22 6 72-1 24-15M25 105l14 4m105-5 12-6M55 105q37 20 73-2M47 120v13H28v-17m106 8v10h18v-18"/>
    <path d="m87 58 10 1m13 1 10 1M61 77l-17 10 15-2-6 12 27-18-17 3 8-9"/><circle cx="97" cy="59" r="2" fill="currentColor"/><circle cx="114" cy="60" r="2" fill="currentColor"/>
    <text x="105" y="91" style={{font:'italic 700 17px sans-serif'}}>95</text><path d="m49 144 20 3m-35-2 7 1m80-5 18-4"/>
  </g>;
  if (kind === 'woody') return <g strokeWidth="1.8">
    <path d="M51 44q-25-1-21-12 5-9 27 2l8-20q24 13 46 0l12 21q27-13 29-2 3 13-26 14Z" fill="currentColor" fillOpacity=".1"/>
    <path d="m65 31 53 2M63 46q0 39 27 41 28-3 30-42M76 57h2m25 0h2M83 70q9 7 18-1M60 88l-20 12-17 35 12 8 20-29-3 42h75l-5-43 22 29 12-10-20-34-22-10M73 85l17 11 19-10M80 92l10 22 11-22M59 94l16 17-8 39m47-57-14 20 11 38M54 130h70M89 114v40"/>
    <path d="m111 115 3 6 6 1-4 4 1 7-6-3-5 3 1-7-5-4 7-1Z"/><path d="M44 110h12m-15 12h13m68-12h13m-11 12h17M59 156l-5 15m33-15v17m12-17v17m25-17 4 15"/>
  </g>;
  if (kind === 'buzz') return <g strokeWidth="1.8">
    <path d="M58 66C38 3 144 3 124 66M61 39q5-20 29-18 29 0 32 21M69 38v22q22 20 43-1V39M77 46h2m22 0h2M81 59q9 5 18-1"/>
    <path d="m55 65 17-5h37l19 7 5 53-16 16H66l-16-17ZM57 75l-38 31 33-7m73-24 38 31-32-7M71 75h37v21H71ZM77 105h24m-43 19 16 10-2 24-18 5v8h31l5-38 7 38h31v-8l-18-5-1-24 16-10M50 83l-10 39 10 19 10-10m72-47 10 38-10 19-10-10" fill="currentColor" fillOpacity=".07"/>
    <circle cx="116" cy="88" r="4"/><path d="M78 83h22m-19 6h13M83 111l7 5 7-5M76 67l14 5 15-5"/>
  </g>;
  if (kind === 'lotso') return <g strokeWidth="1.8">
    <circle cx="53" cy="34" r="21" fill="currentColor" fillOpacity=".1"/><circle cx="127" cy="34" r="21" fill="currentColor" fillOpacity=".1"/>
    <path d="M41 64q-1-42 49-43 49 0 49 43 0 31-49 34-49-3-49-34ZM57 93Q25 99 25 124q0 17 20 9m77-40q32 6 32 31 0 17-20 9M54 91q-22 26-13 55 5 24 49 21 44 3 49-21 9-29-13-55" fill="currentColor" fillOpacity=".07"/>
    <ellipse cx="90" cy="72" rx="30" ry="20"/><ellipse cx="90" cy="62" rx="14" ry="10" fill="currentColor" fillOpacity=".22"/>
    <path d="m60 47 15 3m30 0 15-3M65 56v4m50-4v4M90 72v7m-15 1q15 9 30 0M47 147q18-13 29 6l-4 14m38 0-3-14q13-19 28-6"/>
    <ellipse cx="90" cy="124" rx="25" ry="26"/><path d="m83 110 7 5 8-6-1 9q-1 18-8 21-8-5-10-20Zm2 14 1 1m8-3 1 1m-6 8 1 1"/>
  </g>;
  return null;
}
