import { useId, useState, type FormEvent } from 'react';
import { validarCombustible } from '../dominio/nave';

interface Props {
  // Completa la misión con ese combustible restante; lanza un Error si falla
  onConfirmar: (combustible: number) => Promise<void>;
  onCancelar: () => void;
}

// Formulario que se abre dentro de una misión (spec 07, DESIGN.md §6.7, bloque 9).
export default function CompletarMision({ onConfirmar, onCancelar }: Props) {
  const idCampo = useId();
  const [texto, setTexto] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [fallo, setFallo] = useState(false);

  async function confirmar(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setFallo(false);
    const resultado = validarCombustible(texto);
    if (!resultado.ok) {
      setError(resultado.error);
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await onConfirmar(resultado.valor);
      // Si sale bien, MisionesNave cierra el formulario: no se vuelve a tocar el estado
    } catch {
      setFallo(true);
      setGuardando(false);
    }
  }

  return (
    <form className="completar-mision" noValidate onSubmit={(e) => void confirmar(e)}>
      <div className="campo">
        <label htmlFor={idCampo}>Combustible restante</label>
        <input
          id={idCampo}
          type="text"
          inputMode="numeric"
          className="campo-control cifra"
          value={texto}
          disabled={guardando}
          onChange={(e) => setTexto(e.target.value)}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${idCampo}-error` : undefined}
        />
        {error && (
          <p id={`${idCampo}-error`} className="campo-error" role="alert">
            {error}
          </p>
        )}
      </div>
      <div className="completar-mision-botones">
        <button type="submit" className="boton boton--primario" disabled={guardando}>
          Confirmar
        </button>
        <button
          type="button"
          className="boton boton--secundario"
          disabled={guardando}
          onClick={onCancelar}
        >
          Cancelar
        </button>
      </div>
      {fallo && (
        <p className="aviso aviso--error" role="alert">
          No se pudo completar la misión.
        </p>
      )}
    </form>
  );
}
