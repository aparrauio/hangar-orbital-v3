import { COMBUSTIBLE_MINIMO } from '../dominio/aptitud';

interface Props {
  combustible: number;
}

export default function BarraCombustible({ combustible }: Props) {
  const claseRelleno = combustible < COMBUSTIBLE_MINIMO ? 'relleno relleno--bajo' : 'relleno';

  return (
    <div className="combustible-fila">
      <div
        className="pista"
        role="meter"
        aria-label="Combustible"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={combustible}
      >
        {/* La única excepción a la regla de no usar estilos en línea (DESIGN.md §8) */}
        <span className={claseRelleno} style={{ width: `${combustible}%` }} />
        {/* La posición es un atributo de SVG para que el umbral salga del dominio sin otro style */}
        <svg className="umbral" aria-hidden="true">
          <rect x={`${COMBUSTIBLE_MINIMO}%`} width="2" height="100%" />
        </svg>
      </div>
      <span className="cifra">{combustible} %</span>
    </div>
  );
}
