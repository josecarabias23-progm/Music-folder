import { useState } from 'react';

type View = 'inicio' | 'biblioteca' | 'ensayos' | 'instrumentos' | 'foro';

const nav: Array<{ id: View; icon: string; label: string }> = [
  { id: 'inicio', icon: '⌂', label: 'Inicio' },
  { id: 'biblioteca', icon: '♫', label: 'Biblioteca' },
  { id: 'ensayos', icon: '◷', label: 'Ensayos' },
  { id: 'instrumentos', icon: '◉', label: 'Instrumentos' },
  { id: 'foro', icon: '◌', label: 'Comunidad' },
];

const titles: Record<View, [string, string]> = {
  inicio: ['Buenos días, Valentina', 'Aquí está el pulso de tu agrupación para hoy.'],
  biblioteca: ['Biblioteca de partituras', 'Organiza, encuentra y comparte el repertorio de tu ensamble.'],
  ensayos: ['Gestión de ensayos', 'Planifica cada encuentro y mantén a tu agrupación sincronizada.'],
  instrumentos: ['Enciclopedia de instrumentos', 'Conoce las voces que dan vida a tu ensamble.'],
  foro: ['Foro de la comunidad', 'Comparte conocimiento con músicos y directores.'],
};

function Cards({ view }: { view: View }) {
  if (view === 'biblioteca') return <><div className="filters"><button className="selected">Todos</button><button>Orquesta</button><button>Cámara</button><button>Favoritos</button><input aria-label="Buscar partituras" placeholder="Buscar por obra, compositor..." /></div><section className="score-grid">{[['Sinfonía n.º 5', 'L. van Beethoven', 'Orquesta completa'], ['Danzón n.º 2', 'Arturo Márquez', 'Orquesta completa'], ['Las cuatro estaciones', 'A. Vivaldi', 'Cuerdas'], ['El amor brujo', 'M. de Falla', 'Orquesta completa'], ['Clair de Lune', 'C. Debussy', 'Piano'], ['Suite Holberg', 'E. Grieg', 'Cuerdas']].map(([name, author, group], i) => <article className="score-card" key={name}><div className={'cover cover-' + i}>𝄞</div><div><h3>{name}</h3><p>{author}</p><span>{group}</span></div><button className="more">•••</button></article>)}</section></>;
  if (view === 'ensayos') return <><section className="schedule"><div><p className="eyebrow">PRÓXIMO ENSAYO</p><h2>Ensayo general</h2><p>Jueves, 31 de julio · 19:00–22:00</p><p>Auditorio Manuel de Falla</p></div><button className="primary">Ver detalles</button></section><section className="two-col"><article className="panel"><h2>Agenda de julio</h2>{['Lun 28 — Seccionales de cuerdas', 'Jue 31 — Ensayo general', 'Sáb 02 — Concierto de cámara'].map((x, i) => <div className="agenda" key={x}><b>{['28','31','02'][i]}</b><span>{x}</span></div>)}</article><article className="panel"><h2>Asistencia reciente</h2><div className="attendance"><b>92%</b><span>Promedio del mes<br />46 músicos confirmados</span></div></article></section></>;
  if (view === 'instrumentos') return <><div className="filters"><button className="selected">Todos</button><button>Cuerdas</button><button>Vientos</button><button>Percusión</button><input aria-label="Buscar instrumentos" placeholder="Buscar un instrumento" /></div><section className="instrument-grid">{[['Violín', 'Cuerdas frotadas', '♩'], ['Violonchelo', 'Cuerdas frotadas', '♭'], ['Flauta traversa', 'Viento madera', '♬'], ['Trompa', 'Viento metal', '♮'], ['Timbales', 'Percusión', '◒'], ['Arpa', 'Cuerdas pulsadas', '𝄞']].map(([name, cat, icon]) => <article className="instrument" key={name}><div>{icon}</div><p className="eyebrow">{cat}</p><h2>{name}</h2><a href="#detalle">Explorar →</a></article>)}</section></>;
  if (view === 'foro') return <><div className="forum-head"><div className="filters"><button className="selected">Todos los temas</button><button>Interpretación</button><button>Repertorio</button><button>Gestión</button></div><button className="primary">+ Crear publicación</button></div><section className="forum-list">{[['Recomendaciones para programar música latinoamericana', 'Valentina Ruiz', '12 respuestas · Hace 2 h'], ['¿Cómo trabajan las dinámicas en seccionales?', 'Martín López', '8 respuestas · Ayer'], ['Recursos para preparar una audición de violín', 'Elena Torres', '24 respuestas · Hace 2 días']].map(([title, author, meta], i) => <article className="post" key={title}><div className="avatar">{author[0]}</div><div><h2>{title}</h2><p>Por {author} · {meta}</p><span>{['Repertorio', 'Técnica', 'Recursos'][i]}</span></div><b className="reply">↗</b></article>)}</section></>;
  return <><section className="hero"><div><p className="eyebrow">ORQUESTA DE CÁMARA</p><h2>Tu música, siempre en orden.</h2><p>Centraliza partituras, ensayos y conversaciones en un mismo lugar.</p><button className="primary">Explorar biblioteca</button></div><div className="hero-note">𝄞</div></section><section className="metrics"><article><b>48</b><span>Partituras activas</span></article><article><b>3</b><span>Ensayos esta semana</span></article><article><b>12</b><span>Mensajes nuevos</span></article></section><section className="two-col"><article className="panel"><div className="panel-title"><h2>Próximos ensayos</h2><button>Ver calendario</button></div><div className="agenda"><b>31<br /><small>JUL</small></b><span><strong>Ensayo general</strong><br />19:00 · Auditorio M. de Falla</span></div><div className="agenda"><b>02<br /><small>AGO</small></b><span><strong>Concierto de cámara</strong><br />20:30 · Sala principal</span></div></article><article className="panel"><div className="panel-title"><h2>Actividad reciente</h2><button>Ver todo</button></div><p className="activity">✦ Sofía añadió <b>Sinfonía n.º 5</b></p><p className="activity">✦ Martín confirmó el próximo ensayo</p><p className="activity">✦ Hay 4 mensajes nuevos en Comunidad</p></article></section></>;
}

export default function App() {
  const [view, setView] = useState<View>('inicio');
  const [menuOpen, setMenuOpen] = useState(false);
  const [heading, subheading] = titles[view];
  return <div className="app-shell"><aside className={menuOpen ? 'sidebar open' : 'sidebar'}><div className="brand"><span>𝄞</span><strong>Music Folder</strong></div><nav>{nav.map(item => <button key={item.id} className={view === item.id ? 'active' : ''} onClick={() => { setView(item.id); setMenuOpen(false); }}><i>{item.icon}</i>{item.label}</button>)}</nav><div className="sidebar-foot"><div className="avatar">V</div><div><b>Valentina Ruiz</b><small>Directora</small></div></div></aside><main><header><button className="menu" onClick={() => setMenuOpen(!menuOpen)}>☰</button><div className="crumb">Music Folder <span>/</span> {nav.find(x => x.id === view)?.label}</div><div className="header-actions"><button>⌕</button><button>♧</button><div className="avatar">V</div></div></header><div className="content"><div className="page-heading"><div><h1>{heading}</h1><p>{subheading}</p></div>{view === 'biblioteca' && <button className="primary">+ Subir partitura</button>}{view === 'ensayos' && <button className="primary">+ Nuevo ensayo</button>}</div><Cards view={view} /></div></main></div>;
}
