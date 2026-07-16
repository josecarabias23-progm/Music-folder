import React, { useEffect, useState } from 'react';

type Health = { status: string; service: string };

type Sheet = { id: number; title: string; type: string; owner: string };

type RecordItem = { id: number; title: string; artist: string; date: string };

type Thread = { id: number; title: string; posts: number };

const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    fetch(`${apiBase}/health`)
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', service: 'unknown' }));

    fetch(`${apiBase}/sheets`)
      .then((res) => res.json())
      .then(setSheets)
      .catch(() => setSheets([]));

    fetch(`${apiBase}/records`)
      .then((res) => res.json())
      .then(setRecords)
      .catch(() => setRecords([]));

    fetch(`${apiBase}/forums/threads`)
      .then((res) => res.json())
      .then(setThreads)
      .catch(() => setThreads([]));
  }, []);

  return (
    <main className="app-shell">
      <section className="hero-card">
        <div>
          <p className="eyebrow">Plataforma musical colaborativa</p>
          <h1>Music Folder</h1>
          <p className="hero-text">
            Centraliza partituras, registros de ensayos, información de instrumentos y conversaciones para músicos y orquestas.
          </p>
        </div>
        <div className="status-pill">
          Estado API: {health ? `${health.status} · ${health.service}` : 'cargando...'}
        </div>
      </section>

      <section className="grid">
        <article className="card">
          <h2>Partituras</h2>
          <ul>
            {sheets.map((sheet) => (
              <li key={sheet.id}>{sheet.title} <span>• {sheet.type}</span></li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Registros</h2>
          <ul>
            {records.map((record) => (
              <li key={record.id}>{record.title} <span>• {record.artist}</span></li>
            ))}
          </ul>
        </article>

        <article className="card">
          <h2>Foros</h2>
          <ul>
            {threads.map((thread) => (
              <li key={thread.id}>{thread.title} <span>• {thread.posts} posts</span></li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
