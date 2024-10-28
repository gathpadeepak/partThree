const express = require('express');
require('dotenv').config()
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('dist'))

const Person = require('./models/person.js');

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

const password = process.env.PASSWORD;
const mongodb_connection_URI = `mongodb+srv://2100031817:${password}@cluster0.bwj1o.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`;
mongoose.set('strictQuery', false);
mongoose.connect(mongodb_connection_URI).then(()=>{
  console.log('connection with mongodb is successful');
}).catch(error=>{
    console.log('failed to establish connection with mongodb: ', error);
  })

app.get('/api/persons', (request, response)=>{
  Person.find({}).then(people=>{
    response.json(people);
  })
})


app.get('/info', async (request, response, next) => {
  try {
    const persons = await Person.find({});
    const personsLength = persons.length;
    const requestReceivedTime = new Date();
    
    response.send(`<p>Phonebook has info for ${personsLength} people</p> <br/>${requestReceivedTime}`);
  } catch (error) {
    next(error); 
  }
});

app.get('/api/persons/:id', (request, response, next)=>{
  Person.findById(request.params.id)
    .then(person=>{
      if(person) {
        response.status(200).json(person);
      }
      else {
        response.status(404).end();
      }
    }).catch(error=>next(error));
})

app.delete('/api/persons/:id',  (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(deletedPerson=>{
      response.status(204).end();
    }).catch(error=>next(error));
});


app.post('/api/persons', async (request, response, next) => {
  const body = request.body;

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "name or number fields are missing"
    });
  }

  const nameExists = await Person.findOne({ name: body.name });
  if (nameExists) {
    return response.status(400).json({
      error: 'name must be unique'
    });
  }

  const person = new Person({
    name: body.name,
    number: body.number
  });

  person.save()
    .then(savedPerson => {
      response.json(savedPerson);
    })
    .catch(error => next(error)); 
});

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body;

  const person = { name, number };

  Person.findByIdAndUpdate(request.params.id, person, {
    new: true,
    runValidators: true,
    context: 'query'
  })
    .then(updatedPerson => {
      if (updatedPerson) {
        response.json(updatedPerson);
      } else {
        response.status(404).end();
      }
    })
    .catch(error => next(error));
});



const unknownEndPoint = (request, response) => {
  response.status(404).send({
    error: 'unknown endpoint'
  })
}

app.use(unknownEndPoint);


const errorHandler = (error, request, response, next) => {
  console.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  next(error); 
};

app.use(errorHandler);



const PORT = process.env.PORT;
app.listen(PORT, ()=>{
  console.log(`Server is running on port:${PORT}`);
})




