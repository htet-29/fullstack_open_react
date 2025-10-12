require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const Note = require('./models/note');

const app = express();

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


// All API Endpoints
app.get('/info', (request, response) => {
  response.send('<h1>Hello World!</h1>');
});

app.get('/api/notes', (request, response) => {
  Note.find({}).then(notes => {
    response.json(notes);
  })
});

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id).then(note => {
    if (note) {
      response.json(note);
    } else {
      response.status(404).end();
    }
  })
  .catch(error => next(error));
});

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  notes = notes.filter(note => note.id !== id);
  
  response.status(204).end();
});

app.post('/api/notes', (request, response) => {
  const body = request.body;
  
  if (!body.content) {
    return response.status(400).json({ error: 'content missing'});
  }
  
  const note = new Note({
    content: body.content,
    important: body.important || false,
  });
  
  note.save().then(savedNote => {
    response.json(savedNote);
  })
});

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message);
  
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  }
  
  next(error);
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});