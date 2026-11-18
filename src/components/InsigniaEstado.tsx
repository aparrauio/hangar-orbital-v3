import { describirEstadoMision } from '../dominio/mision';

type Variante = 'apta' | 'no-apta' | 'reparacion' | 'pendiente' | 'completada';

// Las insignias de misión usan los textos del dominio (spec 07)
const TEXTOS: Record<Variante, string> = {
  apta: 'Apta',
  'no-apta': 'No apta',
  reparacion: 'En reparación',
  pendiente: describirEstadoMision('pendiente'),
  completada: describirEstadoMision('completada'),
};

interface Props {
  variante: Variante;
}

export default function InsigniaEstado({ variante }: Props) {
  return <span className={`insignia insignia--${variante}`}>{TEXTOS[variante]}</span>;
}
