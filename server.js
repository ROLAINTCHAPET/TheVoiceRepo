const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;
const VOTES_FILE = path.join(__dirname, 'votes.json');

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

// Obtenir tous les votes
app.get('/votes', (req, res) => {
  const votes = readVotes();
  res.json(votes);
});

// Ajouter un vote
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

// Attacher un reçu à un vote existant
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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Valider un vote
app.put('/votes/:id/validate', (req, res) => {
  const voteId = req.params.id;
  const votes = readVotes();
  const voteIndex = votes.findIndex(v => v.id === voteId);

  if (voteIndex === -1) return res.status(404).json({ error: 'Vote not found' });

  votes[voteIndex].status = 'confirmed';
  writeVotes(votes);

  // ✅ notifier tous les clients
  notifyClients('voteValidated', votes[voteIndex]);

  res.json(votes[voteIndex]);
});

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

// Fonction pour notifier les clients
function notifyClients(event, data) {
  clients.forEach(client => {
    client.write(`event: ${event}\n`);
    client.write(`data: ${JSON.stringify(data)}\n\n`);
  });
}
