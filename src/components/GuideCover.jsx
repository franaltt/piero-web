import { useState } from 'react';

// Portada de una guía. Si todavía no está la imagen, arma una portada tipográfica.
const PALETTE = [['#0C0C0D', '#F2F2EF'], ['#2E3CFF', '#FFFFFF'], ['#E9E4D8', '#0C0C0D'], ['#FFFFFF', '#0C0C0D']];
export default function GuideCover({ src, title, kind, index = 0 }) {
  const [failed, setFailed] = useState(!src);
  const [bg, fg] = PALETTE[index % PALETTE.length];
  if (!failed) return <img className="gcover" src={src} alt="" loading="lazy" draggable="false" onError={() => setFailed(true)} />;
  return (
    <span className="gcover gcover--type" style={{ '--bg': bg, '--fg': fg }} aria-hidden="true">
      <span className="gcover__kind">{kind}</span>
      <b>{title}</b>
      <span className="gcover__mark"><i /><i /></span>
    </span>
  );
}
