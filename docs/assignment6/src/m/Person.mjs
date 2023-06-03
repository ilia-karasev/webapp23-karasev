/**
 * @fileOverview  The model class Person with property definitions, (class-level)
 *                check methods, setter methods, and the special methods saveAll
 *                and retrieveAll
 */
import Movie from "./Movie.mjs";
import {cloneObject, isIntegerOrIntegerString} from "../../lib/util.mjs";
import { ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation}
  from "../../lib/errorTypes.mjs";

import { Enumeration } from "../../lib/Enumeration.mjs";

/**
 * Enumeration type
 * @global
 */
const PersonTypeEL = new Enumeration(["Actor", "Director"]);
/**

/**
 * The class Person
 * @class
 * @param {object} slots - Object creation slots.
 */
class Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name, category, agent}) {
    // assign properties by invoking implicit setters
    this.personId = personId;  // number (integer)
    this.name = name;  // string
    if (category) this.category = category;
    if (agent) this.agent = agent;
  }
  get personId() {
    return this._personId;
  }
  static checkPersonId( id) {
    if (!id) {
      return new NoConstraintViolation();
    } else {
      id = parseInt( id);  // convert to integer
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The person ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkPersonIdAsId( id) {
    var constraintViolation = Person.checkPersonId(id);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      // convert to integer
      id = parseInt(id);
      if (isNaN(id)) {
        return new MandatoryValueConstraintViolation(
            "A positive integer value for the person ID is required!");
      } else if (Person.instances[id]) {  // convert to string if number
        constraintViolation = new UniquenessConstraintViolation(
            "There is already a person record with this person ID!");
      } else {
        constraintViolation = new NoConstraintViolation();
      }
    }
    return constraintViolation;
  }
  static checkPersonIdAsIdRef( id) {
    var constraintViolation = Person.checkPersonId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && 
        id !== undefined) {
      if (!Person.instances[String(id)]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            "There is no person record with this person ID!");
      }
    }
    return constraintViolation;
  }
  set personId( id) {
    var constraintViolation = Person.checkPersonIdAsId( id);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._personId = parseInt( id);
    } else {
      throw constraintViolation;
    }
  }
  get name() {
    return this._name;
  }
  static checkName(n) {
    if (!n) {
      return new MandatoryValueConstraintViolation(
          'A name must be provided!');
    } else if (!(typeof(n) === 'string' && n.trim() !== '')) {
      return new RangeConstraintViolation(
          'The name must be a non-empty string!');
    } else {
      return new NoConstraintViolation();
    }
  };
  set name( n) {
    const validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw validationResult;
    }
  }

  get category() {return this._category;}

  static checkCategory( c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else for (const cc of c) {
      if (!isIntegerOrIntegerString( cc) || parseInt( cc) < 1 ||
        parseInt( cc) > PersonTypeEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for category: ${cc}`);
      }
    } 
    return new NoConstraintViolation();
  }

  set category( c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The category cannot be changed!");
    } else {
      validationResult = Person.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      var cat = [];
      for (const cc of c) {
        cat.push(parseInt( cc));
      }
      this._category = cat;
    } else {
      throw validationResult;
    }
  }

  get agent() {return this._agent;}
  static checkAgent( a, c) {
    var cat = [];
    for (const cc of c) {
      cat.push(parseInt( cc));
    }
     
    if (!cat.includes(PersonTypeEL.ACTOR) && a) {
      return new ConstraintViolation("An 'agent' field value must not " +
          "be provided if the person is not an actor!");
    } else {
      const validationResult = Person.checkPersonId( a);
      return validationResult;
    }
  }
  set agent( v) {
    const validationResult = Person.checkAgent( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._agent = v;
    } else {
      throw validationResult;
    }
  }

  toJSON() {  // is invoked by JSON.stringify
    const rec = {};
    for (const p of Object.keys( this)) {
      // remove underscore prefix
      if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
    }
    return rec;
  }
}
/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/
// initially an empty collection (in the form of a map)
Person.instances = {};

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new person record/object
 */
Person.add = function (slots) {
  try {
    const person = new Person( slots);
    Person.instances[person.personId] = person;
    console.log(`Saved: ${person.name}`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 *  Update an existing person record
 */
Person.update = function ({personId, name, category, agent}) {
  const person = Person.instances[String( personId)],
        objectBeforeUpdate = cloneObject( person);
  var noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && person.name !== name) {
      person.name = name;
      updatedProperties.push("name");
    }
    if (category) {
      if (person.category === undefined) {
        person.category = category;
        updatedProperties.push("category");
      }
    }
    if (agent && person.agent !== agent) {
      person.agent = agent;
      updatedProperties.push("agent");
    }
  }
  catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Person.instances[String(personId)] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for person ${name}`);
    } else {
      console.log( `No property value changed for person ${name}!`);
    }
  }
};
/**
 *  Delete an person object/record
 */
Person.destroy = function (personId) {
  const person = Person.instances[personId];
  // delete all directed movie records
  for (const movieId of Object.keys( Movie.instances)) {
    const movie = Movie.instances[movieId];
    if (person === movie.director) Movie.destroy(movieId);
  }
  // delete actors records  
  for (const movieId of Object.keys( Movie.instances)) { 
    let movie = Movie.instances[movieId];
    if (movie.actors[personId]) delete movie.actors[personId];
  }
  // delete agents
  for (const personId of Object.keys( Person.instances)) { 
    let per = Person.instances[personId];
    if (person.personId === per.agent) delete per._agent;
  }
  // delete the person object
  delete Person.instances[personId];
  console.log( `Person ${person.name} deleted.`);
  Person.saveAll();
  Movie.saveAll();
};
/**
 *  Load all person records and convert them to objects
 */
Person.retrieveAll = function () {
  var persons = {};
  if (!localStorage["persons"]) localStorage["persons"] = "{}";
  try {
    persons = JSON.parse( localStorage["persons"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    persons = {};
  }
  for (const key of Object.keys( persons)) {
    try {
      // convert record to (typed) object
      Person.instances[key] = Person.convertRec2Obj( persons[key]);
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing person ${key}: ${e.message}`);
    }
  }
  console.log( `${Object.keys( persons).length} person records loaded.`);
};

Person.convertRec2Obj = function (personRow) {
  var person=null;
  try {
    person = new Person( personRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a person record: ${e.message}`);
  }
  return person;
};


/**
 *  Save all person objects as records
 */
Person.saveAll = function () {
  const nmrOfPersons = Object.keys( Person.instances).length;
  try {
    localStorage["persons"] = JSON.stringify( Person.instances);
    console.log( `${nmrOfPersons} person records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};

export default Person;
export { PersonTypeEL };
