const mongoose = require('mongoose');

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: function(value) {
        return /^\d{2,3}-\d+$/.test(value);
      },
      message: props => `${props.value} is not a valid phone number! Format should be XX-XXXXXXX or XXX-XXXXXXX`
    }
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
})

const Person = new mongoose.model('Person', personSchema);

module.exports = Person;
