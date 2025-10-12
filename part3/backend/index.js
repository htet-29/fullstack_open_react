const express = require('express');
const morgan = require('morgan');
const mongoose = require('mongoose');

const app = express();

// For Database
const password = encodeURIComponent(process.argv[2]);
const url = `mongodb+srv://htethlaingwin:${password}@cluster0.d2lojpy.mongodb.net/noteApp?retryWrites=true&w=majority&appName=Cluster0`

// Customize logger
morgan.token('body', (req, res) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return JSON.stringify(req.body);
  }
  return ''
});

const customFormat = ':method :url :status :res[content-length] - :response-time ms :body';

// Express Setup
app.use(express.static('dist'));
app.use(express.json());

// Logger Setup
app.use(morgan(customFormat));

// Database Setup
mongoose.set('strictQuery', false);
mongoose.connect(url);

const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
});

noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

const Note = mongoose.model('Note', noteSchema);

// All API Endpoints
app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
    Note.find({}).then(notes => {
      response.json(notes);
    })
});

app.get('/api/notes/:id', (request, response) => {
    const id = request.params.id;
    const note = notes.find(note => note.id === id);

    if (note) {
        response.json(note);
    } else {
        response.status(404).end();
    }
});

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  notes = notes.filter(note => note.id !== id);
  
  response.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => Number(n.id)))
    : 0;
  return String(maxId + 1);
}

app.post('/api/notes', (request, response) => {
  const body = request.body;
  
  if (!body.content) {
    return response.status(400).json({ error: 'content missing'});
  }
  
  const note = {
    content: body.content,
    important: body.important || false,
    id: generateId(),
  }
  
  notes = notes.concat(note);
  
  response.json(note);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});