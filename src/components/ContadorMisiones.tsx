import { MAX_MISIONES_SIN_REVISION } from '../dominio/aptitud';

interface Props {
  misiones: number;
}

export default function ContadorMisiones({ misiones }: Props) {
  // Hay tantas marcas como el máximo, aunque la nave lo supere (spec 02, decisión 3)
  const marcas = Array.from({ length: MAX_MISIONES_SIN_REVISION }, (_, i) => i < misiones);

  return (
    <div className="contador">
      <span className="etiqueta">Misiones desde la revisión</span>
      <span className="contador-valor">
        <span className="marcas" aria-hidden="true">
          {marcas.map((ocupada, i) => (
            <span key={i} className={ocupada ? 'marca marca--ocupada' : 'marca'} />
          ))}
        </span>
        <span className="cifra">
          {misiones} de {MAX_MISIONES_SIN_REVISION}
        </span>
      </span>
    </div>
  );
}
