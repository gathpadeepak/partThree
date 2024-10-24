const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
app.use(express.json());
app.use(cors());

const requestLogger = (request, response, next) => {
  console.log('Method: ', request.method);
  console.log('Path: ', request.path);
  console.log('Body: ', request.body);
  console.log('----');
  next();
}
app.use(requestLogger);

morgan.token('body', (req)=>{
  return req.method ===  "POST" ? JSON.stringify(req.body): '';
})

app.use(morgan(':method: :url :status :res[content-length] - :response-time ms :body'));



let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
] 

app.get('/', (request, response)=>{
  response.send('<h1>backend working</h1>');
})

app.get('/api/persons', (request, response)=>{
  response.json(persons);
})

app.get('/info', (request, response)=>{
  const personsLength = persons.length;
  const requestReceivedTime = new Date();
  response.send(`<p>Phonebook has info for ${personsLength} people</p> <br/>${requestReceivedTime}`);
})

app.get('/api/persons/:id', (request, response)=>{
  const id = request.params.id;
  const person = persons.find(p => p.id === id);
  if(person) {
    response.json(person);
  }
  else {
    response.status(404).json({
      status: '404',
      error: 'resource doesn not exist'
    });
  }
})
app.delete('/api/persons/:id', (request, response) => {
  const id = request.params.id;
  console.log(`Person with id: ${id} is to be deleted.`);
  persons = persons.filter(person => person.id !== id);
  response.status(204).end();
});

const generateId = () => {
  const max = 10000;
  const min = 100;
  const randId = Math.floor(Math.random() * (max-min+1)) + min;
  return String(randId);
}


app.post('/api/persons', (request, response) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'name or number is missing'
    });
  }

  const nameExists = persons.some(person => person.name === body.name);
  if (nameExists) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  }

  const person = {
    id: generateId(),
    name: body.name,
    number: body.number,
  };

  persons = persons.concat(person);
  response.json(person);
});

const unknownEndPoint = (request, response) => {
  response.status(404).send({
    error: 'unknown endpoint'
  })
}

app.use(unknownEndPoint);

const PORT = process.env.PORT || 3001;
app.listen(PORT, ()=>{
  console.log(`Server is running on port:${PORT}`);
})




