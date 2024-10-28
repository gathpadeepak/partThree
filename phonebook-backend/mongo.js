const mongoose = require('mongoose');

if (process.argv.length < 3) {
  console.log('Error: Password should be passed as an argument. Currently, password is missing. Aborting the process.');
  process.exit(1);
}

const password = process.argv[2];
const connectionUrl = `mongodb+srv://2100031817:${password}@cluster0.bwj1o.mongodb.net/Phonebook?retryWrites=true&w=majority&appName=Cluster0`;

mongoose.set('strictQuery', false);
mongoose.connect(connectionUrl)
  .then(() => {
    console.log('Connection has been established');
  })
  .catch(error => {
    console.log('Error establishing connection:', error);
    process.exit(1); // Exit if the connection fails
  });

const personSchema = mongoose.Schema({
  name: String,
  number: String,
});
const Person = mongoose.model('Person', personSchema);

const argsLength = process.argv.length;

if (argsLength === 5) {
  const personToBeAdded = new Person({
    name: process.argv[3],
    number: process.argv[4],
  });

  personToBeAdded.save()
    .then(response => {
      console.log(`Added ${response.name} number ${response.number} to phonebook`);
      mongoose.connection.close();
    })
    .catch(error => {
      console.log('Failed to add person, process unsuccessful:', error);
      mongoose.connection.close();
    });
} else {
  Person.find({})
    .then(response => {
      console.log('Phonebook:');
      response.forEach(person => {
        console.log(`${person.name} ${person.number}`);
      });
      mongoose.connection.close();
    })
    .catch(error => {
      console.log('Error retrieving phonebook entries:', error);
      mongoose.connection.close();
    });
}
