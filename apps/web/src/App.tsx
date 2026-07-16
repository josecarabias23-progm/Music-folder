import React, { useEffect, useState } from 'react';

type Health = { status: string; service: string };

type Sheet = { id: number; title: string; type: string; owner: string };

type RecordItem = { id: number; title: string; artist: string; date: string };

type Thread = { id: number; title: string; posts: number };

export default function App() {
  const [health, setHealth] = useState<Health | null>(null);
  const [sheets, setSheets] = useState<Sheet[]>([]);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [threads, setThreads] = useState<Thread[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/health')
      .then((res) => res.json())
      .then(setHealth)
      .catch(() => setHealth({ status: 'offline', service: 'unknown' }));

    fetch('http://localhost:3001/sheets')
      .then((res) => res.json())
      .then(setSheets)
      .catch(() => setSheets([]));

    fetch('http://localhost:3001/records')
      .then((res) => res.json())
      .then(setRecords)
      .catch(() => setRecords([]));

    fetch('http://localhost:3001/forums/threads')
      .then((res) => res.json())
      .then(setThreads)
      .catch(() => setThreads([]));
  }, []);

  return (
    <main style={{ padding: 24 }}>
      <h1>Music Folder</h1>
      <p>Frontend React + TypeScript conectado a la API NestJS.</p>
      <p>Estado de la API: {health ? `${health.status} (${health.service})` : 'cargando...'}</p>

      <section>
        <h2>Partituras</h2>
        <ul>
          {sheets.map((sheet) => (
            <li key={sheet.id}>{sheet.title} — {sheet.type} — {sheet.owner}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Registros</h2>
        <ul>
          {records.map((record) => (
            <li key={record.id}>{record.title} — {record.artist} — {record.date}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Foros</h2>
        <ul>
          {threads.map((thread) => (
            <li key={thread.id}>{thread.title} ({thread.posts} posts)</li>
          ))}
        </ul>
      </section>
    </main>
  );
}
