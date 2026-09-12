interface TrendSparklineProps {
  points: number[];
  color?: string;
  width?: number;
  height?: number;
}

export function TrendSparkline({ points, color = 'var(--green)', width = 280, height = 60 }: TrendSparklineProps) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const stepX = width / (points.length - 1);
  const pad = 6;

  const coords = points.map((p, i) => {
    const x = i * stepX;
    const y = pad + (1 - (p - min) / range) * (height - pad * 2);
    return [x, y] as const;
  });

  const polylinePoints = coords.map(([x, y]) => `${x},${y}`).join(' ');
  const [lastX, lastY] = coords[coords.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height}>
      <polyline points={polylinePoints} fill="none" stroke={color} strokeWidth="2" />
      <circle cx={lastX} cy={lastY} r="3.5" fill={color} />
    </svg>
  );
}
