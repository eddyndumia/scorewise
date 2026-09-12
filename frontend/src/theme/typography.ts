export const fontFamily = {
  body: "'Inter', sans-serif",
  numeric: "'Space Grotesk', sans-serif",
} as const;

// Sizes drawn from the consumer Home screen snippet + written brief. Numeric
// entries (score, big stats) use fontFamily.numeric; everything else uses body.
export const type = {
  scoreDisplay: { fontFamily: fontFamily.numeric, fontSize: '40px', fontWeight: 500, lineHeight: 1 },
  h1: { fontFamily: fontFamily.body, fontSize: '22px', fontWeight: 600, lineHeight: 1.2 },
  h2: { fontFamily: fontFamily.body, fontSize: '16px', fontWeight: 600, lineHeight: 1.3 },
  body: { fontFamily: fontFamily.body, fontSize: '14px', fontWeight: 400, lineHeight: 1.5 },
  bodySmall: { fontFamily: fontFamily.body, fontSize: '13px', fontWeight: 400, lineHeight: 1.5 },
  caption: { fontFamily: fontFamily.body, fontSize: '12px', fontWeight: 400, lineHeight: 1.5 },
  micro: { fontFamily: fontFamily.body, fontSize: '11px', fontWeight: 500, lineHeight: 1.4 },
} as const;
