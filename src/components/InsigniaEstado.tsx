type Variante = 'apta' | 'no-apta' | 'reparacion';

const TEXTOS: Record<Variante, string> = {
  apta: 'Apta',
  'no-apta': 'No apta',
  reparacion: 'En reparación',
};

interface Props {
  variante: Variante;
}

export default function InsigniaEstado({ variante }: Props) {
  return <span className={`insignia insignia--${variante}`}>{TEXTOS[variante]}</span>;
}
