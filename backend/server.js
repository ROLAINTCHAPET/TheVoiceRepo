// backend/server.js
import fs from 'fs';
import path from 'path';
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const VOTES_FILE = path.join(__dirname, 'votes.json');

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Lire les votes depuis le fichier
function readVotes() {
  if (!fs.existsSync(VOTES_FILE)) {
    fs.writeFileSync(VOTES_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(VOTES_FILE, 'utf8');
  return JSON.parse(data);
}

// Écrire les votes dans le fichier
function writeVotes(votes) {
  fs.writeFileSync(VOTES_FILE, JSON.stringify(votes, null, 2));
}

// SSE clients
let clients = [];
app.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  res.flushHeaders();

  clients.push(res);

  req.on('close', () => {
    clients = clients.filter(client => client !== res);
  });
});

// Notifier tous les clients
function notifyClients(event, data) {
  clients.forEach(client => {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}

// API votes
app.get('/votes', (req, res) => {
  res.json(readVotes());
});

app.post('/votes', (req, res) => {
  const { candidateId, receiptPreviewUrl } = req.body;
  const votes = readVotes();

  const newVote = {
    id: Date.now().toString(),
    candidateId,
    receiptPreviewUrl: receiptPreviewUrl || null,
    status: 'pending',
    timestamp: new Date(),
  };

  votes.push(newVote);
  writeVotes(votes);
  res.json(newVote);
});

app.post('/votes/:id/receipt', (req, res) => {
  const voteId = req.params.id;
  const { receiptPreviewUrl } = req.body;
  const votes = readVotes();
  const voteIndex = votes.findIndex(v => v.id === voteId);

  if (voteIndex === -1) return res.status(404).json({ error: 'Vote not found' });

  votes[voteIndex].receiptPreviewUrl = receiptPreviewUrl;
  writeVotes(votes);
  res.json(votes[voteIndex]);
});

app.put('/votes/:id/validate', (req, res) => {
  const voteId = req.params.id;
  const votes = readVotes();
  const voteIndex = votes.findIndex(v => v.id === voteId);

  if (voteIndex === -1) return res.status(404).json({ error: 'Vote not found' });

  votes[voteIndex].status = 'confirmed';
  writeVotes(votes);

  // Notifier tous les clients que le vote est validé
  notifyClients('voteValidated', votes[voteIndex]);

  res.json(votes[voteIndex]);
});

// Servir le frontend Angular
const angularDistPath = path.join(__dirname, '../frontend/dist/frontend'); // Vérifie ton outputPath
app.use(express.static(angularDistPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(angularDistPath, 'index.html'));
});

// Lancer le serveur
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
