// Repair legacy single-dollar blocks without treating ordinary inline math as a block.
export function normalizeStudyMathText(value, { inline = false } = {}) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/(^|\n)[ \t]*\$(?!\$)[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*\$(?!\$)(?=\r?\n|$)/g, (_match, start, math) => `${start}$$\n${math}\n$$`)
    .replace(/\$\$([\s\S]*?)\$\$|\$([^$\n]+)\$/g, (match, block, single) => {
      let math = (block ?? single).replace(/\\frac(?![a-zA-Z])/g, '\\dfrac');
      // Explicit authored rational-function notation, not a general algebra parser.
      math = math.replace(/\(x\^2-1\)\/\(x-1\)/g, '\\dfrac{x^2-1}{x-1}')
        .replace(/\(e\^x-1-x\)\/x\^2/g, '\\dfrac{e^x-1-x}{x^2}');
      const authoredFractions = [
        [String.raw`f(x)=1/x`, String.raw`f(x)=\dfrac1x`],
        [String.raw`\sin u/u`, String.raw`\dfrac{\sin u}{u}`],
        [String.raw`(e^u-1)/u`, String.raw`\dfrac{e^u-1}{u}`],
        [String.raw`\ln(1+u)/u`, String.raw`\dfrac{\ln(1+u)}{u}`],
        [String.raw`((1+u)^\alpha-1)/u`, String.raw`\dfrac{(1+u)^\alpha-1}{u}`],
        [String.raw`(1+u)^{1/u}`, String.raw`(1+u)^{\dfrac1u}`],
        [String.raw`\ln(1+4x)/\sin2x`, String.raw`\dfrac{\ln(1+4x)}{\sin2x}`],
        [String.raw`[\ln(1+4x)/(4x)]`, String.raw`\dfrac{\ln(1+4x)}{4x}`],
        [String.raw`[2x/\sin2x]`, String.raw`\dfrac{2x}{\sin2x}`],
        [String.raw`\sin(1/x)`, String.raw`\sin\left(\dfrac1x\right)`],
      ];
      for (const [before, after] of authoredFractions) math = math.replaceAll(before, after);
      const limit = /\\lim(?![a-zA-Z])/.test(math);
      if (limit && !/\\displaystyle\b/.test(math)) math = `\\displaystyle ${math}`;
      return block !== undefined || (limit && !inline) ? `$$${math}$$` : `$${math}$`;
    });
}

export function normalizeStudyMath(value) {
  if (typeof value === 'string') return normalizeStudyMathText(value);
  if (Array.isArray(value)) return value.map(normalizeStudyMath);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, normalizeStudyMath(item)]));
  return value;
}
