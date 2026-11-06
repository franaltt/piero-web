import { forwardRef, useState } from 'react';

// Busca primero /logos/<slug>.svg, después .png; si no hay ninguno, muestra el provisorio.
const ToolTile = forwardRef(function ToolTile({ tool, tabIndex }, ref) {
  const [src, setSrc] = useState(`/logos/${tool.slug}.svg`);
  const [state, setState] = useState('loading'); // loading | logo | temp

  const onError = () => {
    if (src.endsWith('.svg')) setSrc(`/logos/${tool.slug}.png`);
    else setState('temp');
  };

  return (
    <button
      ref={ref}
      type="button"
      tabIndex={tabIndex}
      className={'tile tile--' + state + (tool.full && state === 'logo' ? ' tile--full' : '')}
      style={{ '--c': tool.color, '--t': tool.text }}
      aria-label={tool.name}
      title={tool.name}
    >
      {state !== 'temp' && (
        <img src={src} alt="" draggable="false" onLoad={() => setState('logo')} onError={onError} />
      )}
      {state === 'temp' && (
        <>
          <b>{tool.mark}</b>
          <small>{tool.name}</small>
        </>
      )}
    </button>
  );
});

export default ToolTile;
