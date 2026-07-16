const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Uploads folder
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-memory stores (for demo)
let records = [];
let recordId = 1;
let forumThreads = [];
let threadId = 1;

// Sheets (partituras)
app.post('/sheets', upload.single('sheet'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  res.json({ filename: req.file.filename, originalname: req.file.originalname });
});

app.get('/sheets/:filename', (req, res) => {
  const file = path.join(uploadsDir, req.params.filename);
  if (!fs.existsSync(file)) return res.status(404).json({ error: 'Not found' });
  res.download(file);
});

// Records (registros musicales)
app.get('/records', (req, res) => res.json(records));
app.post('/records', (req, res) => {
  const item = Object.assign({ id: recordId++ }, req.body);
  records.push(item);
  res.status(201).json(item);
});
app.get('/records/:id', (req, res) => {
  const r = records.find(x => x.id === Number(req.params.id));
  if (!r) return res.status(404).json({ error: 'Not found' });
  res.json(r);
});
app.put('/records/:id', (req, res) => {
  const idx = records.findIndex(x => x.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  records[idx] = Object.assign(records[idx], req.body);
  res.json(records[idx]);
});
app.delete('/records/:id', (req, res) => {
  records = records.filter(x => x.id !== Number(req.params.id));
  res.status(204).end();
});

// Instruments info
app.get('/instruments', (req, res) => {
  res.json([
    { id: 'violin', name: 'Violin', family: 'Strings' },
    { id: 'trumpet', name: 'Trumpet', family: 'Brass' },
    { id: 'flute', name: 'Flute', family: 'Woodwind' }
  ]);
});

// Forums (threads)
app.get('/forums/threads', (req, res) => res.json(forumThreads));
app.post('/forums/threads', (req, res) => {
  const t = Object.assign({ id: threadId++, posts: [] }, req.body);
  forumThreads.push(t);
  res.status(201).json(t);
});
app.get('/forums/threads/:id', (req, res) => {
  const t = forumThreads.find(x => x.id === Number(req.params.id));
  if (!t) return res.status(404).json({ error: 'Not found' });
  res.json(t);
});

app.listen(port, () => console.log(`Music Folder server listening on http://localhost:${port}`));
