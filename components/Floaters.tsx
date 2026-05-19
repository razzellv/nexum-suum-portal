type OrbPosition = {
  size: number;
  color: string;
  duration: string;
  tx: string;
  ty: string;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
};

export default function Floaters() {
  const orbs: OrbPosition[] = [
    { size: 500, top: '-10%', right: '-5%', color: 'rgba(0,255,225,0.03)', duration: '28s', tx: '-40px', ty: '30px' },
    { size: 400, bottom: '-8%', left: '-8%', color: 'rgba(56,189,248,0.025)', duration: '35s', tx: '50px', ty: '-40px' },
    { size: 300, top: '40%', left: '35%', color: 'rgba(251,191,36,0.015)', duration: '22s', tx: '-30px', ty: '50px' },
    { size: 350, top: '15%', left: '60%', color: 'rgba(0,255,225,0.02)', duration: '40s', tx: '35px', ty: '-25px' },
    { size: 250, bottom: '20%', right: '15%', color: 'rgba(56,189,248,0.02)', duration: '32s', tx: '-45px', ty: '35px' },
    { size: 200, top: '65%', left: '10%', color: 'rgba(0,255,225,0.015)', duration: '26s', tx: '25px', ty: '-35px' },
  ];

  return (
    <>
      <style>{`
        ${orbs.map((o, i) => `
          @keyframes float${i} {
            0% { transform: translate(0, 0) scale(1); }
            100% { transform: translate(${o.tx}, ${o.ty}) scale(1.08); }
          }
        `).join('')}
      `}</style>
      {orbs.map((o, i) => (
        <div
          key={i}
          style={{
            position: 'fixed',
            width: o.size,
            height: o.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${o.color} 0%, transparent 70%)`,
            top: o.top,
            bottom: o.bottom,
            left: o.left,
            right: o.right,
            pointerEvents: 'none',
            zIndex: 0,
            animation: `float${i} ${o.duration} ease-in-out infinite alternate`,
          }}
        />
      ))}
    </>
  );
}
