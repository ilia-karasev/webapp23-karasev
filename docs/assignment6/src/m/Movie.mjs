/**movie
 * @fileOverview  The model class Movie with attribute definitions, (class-level)
 *                check methods, setter methods, and the special methods saveAll
 *                and retrieveAll
 */
import Person from "./Person.mjs";
import {cloneObject, isIntegerOrIntegerString} from "../../lib/util.mjs";
import { ConstraintViolation, FrozenValueConstraintViolation, MandatoryValueConstraintViolation,
  NoConstraintViolation, PatternConstraintViolation, RangeConstraintViolation,
  UniquenessConstraintViolation} from "../../lib/errorTypes.mjs";
import { Enumeration } from "../../lib/Enumeration.mjs";  

/**
 * Enumeration type
 * @global
 */
const MovieCategoryEL = new Enumeration(["Biography", "TvSeriesEpisode"]);
/**
  
/**
 * The class Movie
 * @class
 * @param {object} slots - Object creation slots.
 */
class Movie {
  // using a record parameter with ES6 function parameter destructuring
  constructor ({movieId, title, releaseDate, category, director, director_id, actors, actorIdRefs, tvSeriesName, episodeNo, about}) {
    this.movieId = movieId;
    this.title = title;
    this.releaseDate = releaseDate;
    // assign object references or ID references (to be converted in setter)
    this.actors = actors || actorIdRefs;
    this.director = director || director_id;
    if (category) this.category = category;
    if (tvSeriesName) this.tvSeriesName = tvSeriesName;
    if (episodeNo) this.episodeNo = episodeNo;
    if (about) this.about = about;
  }
  get movieId() {
    return this._movieId;
  }
  static checkMovieId( movieId) {
    if (!movieId) return new NoConstraintViolation();
    else if (!(typeof(movieId) === 'number' && Number.isInteger(movieId) && movieId > 0 ||
    typeof(movieId) === 'string' && movieId.search(/^-?[0-9]+$/) === 0 && movieId > 0)) {
      return new RangeConstraintViolation(
          "The movie ID must be a Positive Integer!");
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkMovieIdAsId( movieId) {
    var validationResult = Movie.checkMovieId( movieId);
    if ((validationResult instanceof NoConstraintViolation)) {
      if (!movieId) {
        validationResult = new MandatoryValueConstraintViolation(
            "A value for Movie ID must be provided!");
      } else if (movieId in Movie.instances) {
        validationResult = new UniquenessConstraintViolation(
            `There is already a movie with this ID!`);
      } else {
        validationResult = new NoConstraintViolation();
      }
    }
    return validationResult;
  }
  set movieId( id) {
    const validationResult = Movie.checkMovieIdAsId( id);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = id;
    } else {
      throw validationResult;
    }
  }
  get title() {
    return this._title;
  }
  static checkTitle(t) {
    if (!t) {
      return new MandatoryValueConstraintViolation(
          'A title must be provided!');
    } else if (!(typeof(t) === 'string' && t.trim() !== '')) {
      return new RangeConstraintViolation(
          'The title must be a non-empty string!');
    } else {
      return new NoConstraintViolation();
    }
  };
  set title( t) {
    const validationResult = Movie.checkTitle( t);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = t;
    } else {
      throw validationResult;
    }
  }
  get releaseDate() {
    return this._releaseDate;
  }
  static checkReleaseDate(d) {
    if (!d) {
      return new MandatoryValueConstraintViolation(
          'A release date must be provided!');
    } else {
      return new NoConstraintViolation();
    }
  };
  set releaseDate( d) {
    const validationResult = Movie.checkReleaseDate( d);
    if (validationResult instanceof NoConstraintViolation) {
      this._releaseDate = d;
    } else {
      throw validationResult;
    }
  }

  get category() {return this._category;}

  static checkCategory( c) {
    if (c === undefined) {
      return new NoConstraintViolation();  // category is optional
    } else if (!isIntegerOrIntegerString( c) || parseInt( c) < 1 ||
        parseInt( c) > MovieCategoryEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for category: ${c}`);
    } else {
      return new NoConstraintViolation();
    }
  }

  set category( c) {
    var validationResult = null;
    if (this.category) {  // already set/assigned
      validationResult = new FrozenValueConstraintViolation(
          "The category cannot be changed!");
    } else {
      validationResult = Movie.checkCategory( c);
    }
    if (validationResult instanceof NoConstraintViolation) {
      this._category = parseInt( c);
    } else {
      throw validationResult;
    }
  }

  get director() {
    return this._director;
  }
  static checkDirector( director_id) {
    var validationResult = null;
    if (!director_id) {
      validationResult = new MandatoryValueConstraintViolation(
        'A director must be specified!');
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( director_id);
    }
    return validationResult;
  }
  set director( d) {
    // d can be an ID reference or an object reference
    const director_id = (typeof d !== "object") ?  d : d.personId;
    
    const validationResult = Movie.checkDirector( director_id);
    if (validationResult instanceof NoConstraintViolation) {
      // create the new director reference
      this._director = Person.instances[director_id];
    } else {
      throw validationResult;
    }
  }
  get actors() {
    return this._actors;
  }
  static checkActor( actor_id) {
    var validationResult = null;
    if (!actor_id) {
      // actor(s) are optional
      validationResult = new NoConstraintViolation();
    } else {
      // invoke foreign key constraint check
      validationResult = Person.checkPersonIdAsIdRef( actor_id);
    }
    return validationResult;
  }
  addActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.personId;
    const validationResult = Movie.checkActor( actor_id);
    if (actor_id && validationResult instanceof NoConstraintViolation) {
      // add the new actor reference
      this._actors[actor_id] = Person.instances[actor_id];
      } else {
        throw validationResult;
      }
  }
  removeActor( a) {
    // a can be an ID reference or an object reference
    const actor_id = (typeof a !== "object") ? parseInt( a) : a.actorId;
    const validationResult = Movie.checkActor( actor_id);
    if (validationResult instanceof NoConstraintViolation) {    
      // delete the actor reference
      delete this._actors[actor_id];
      } else {
        throw validationResult;
      }
  }
  set actors( a) {
    this._actors = {};
    if (Array.isArray(a)) {  // array of IdRefs
      for (const idRef of a) {
        this.addActor( idRef);
      }
    } else {  // map of IdRefs to object references
      for (const idRef of Object.keys( a)) {
        this.addActor( a[idRef]);
      }
    }
  }

  get tvSeriesName() {return this._tvSeriesName;}
  static checkTvSeriesName( sN, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !sN) {
      return new MandatoryValueConstraintViolation(
          "A TV series name must be provided for a TV series episode!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && sN) {
      return new ConstraintViolation("A TV series name must not " +
          "be provided if the movie is not a TV series episode!");
    } else if (sN && (typeof(sN) !== "string" || sN.trim() === "")) {
      return new RangeConstraintViolation(
          "The TV series name must be a non-empty string!");
    } else {
      return new NoConstraintViolation();
    }
  }  

  set tvSeriesName( v) {
    const validationResult = Movie.checkTvSeriesName( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._tvSeriesName = v;
    } else {
      throw validationResult;
    }
  }

  get episodeNo() {return this._episodeNo;}
  static checkEpisodeNo( eN, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.TVSERIESEPISODE && !eN) {
      return new MandatoryValueConstraintViolation(
          "An Episode Number must be provided for a TV series episode!");
    } else if (cat !== MovieCategoryEL.TVSERIESEPISODE && eN) {
      return new ConstraintViolation("A Episode Number must not " +
          "be provided if the movie is not a TV series episode!");
    } else if (!(typeof(eN) === 'number' && Number.isInteger(eN) && eN > 0 ||
    typeof(eN) === 'string' && eN.search(/^-?[0-9]+$/) === 0 && eN > 0)) {
      return new RangeConstraintViolation(
          "The Episode Number must be a positive integer!");
    } else {
      return new NoConstraintViolation();
    }
  }  

  set episodeNo( v) {
    const validationResult = Movie.checkEpisodeNo( v, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._episodeNo = v;
    } else {
      throw validationResult;
    }
  }

  get about() {return this._about;}
  static checkAbout( a, c) {
    const cat = parseInt( c);
    if (cat === MovieCategoryEL.BIOGRAPHY && !a) {
      return new MandatoryValueConstraintViolation(
          "A biography movie record must have an 'about' field!");
    } else if (cat !== MovieCategoryEL.BIOGRAPHY && a) {
      return new ConstraintViolation("An 'about' field value must not " +
          "be provided if the movie is not a biography!");
    } else {
      const validationResult = (typeof a !== "object") ? Person.checkPersonIdAsIdRef( a) : Person.checkPersonIdAsIdRef( a.personId);
      return validationResult;
    }
  }
  set about( v) {
    const about_id = (typeof v !== "object") ?  v : v.personId;
    const validationResult = Movie.checkAbout( about_id, this.category);
    if (validationResult instanceof NoConstraintViolation) {
      this._about = v;
    } else {
      throw validationResult;
    }
  }

  // Serialize movie object
  toString() {
    var movieStr = `Movie{ Movie ID: ${this.movieId}, title: ${this.title}, releaseDate: ${this.releaseDate}, director: ${this.director.name}`;
    switch (this.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        movieStr += `, TV series name: ${this.tvSeriesName}, episode: ${this.episodeNo}`;
        break;
      case MovieCategoryEL.BIOGRAPHY:
        movieStr += `, biography about: ${this.about}`;
        break;
    }
    return `${movieStr}, actors: ${Object.keys( this.actors).join(",")} }`;
  }
  // Convert object to record with ID references
  toJSON() {  // is invoked by JSON.stringify in Movie.saveAll
    const rec = {};
    for (const p of Object.keys( this)) {
      // copy only property slots with underscore prefix
      if (p.charAt(0) === "_") {
        switch (p) {
          case "_director":
            // convert object reference to ID reference
            rec.director = this._director;
            break;
          case "_about":
              // convert object reference to ID reference
              rec.about = this._about;
              break;
          case "_actors":
            // convert the map of object references to a list of ID references
            rec.actorIdRefs = [];
            for (const actorIdStr of Object.keys( this.actors)) {
              rec.actorIdRefs.push( parseInt( actorIdStr));
            }
            break;
          default:
            // remove underscore prefix
            rec[p.substr(1)] = this[p];
        }
      }
    }
    return rec;
  }
}
/***********************************************
*** Class-level ("static") properties **********
************************************************/
// initially an empty collection (in the form of a map)
Movie.instances = {};

/********************************************************
*** Class-level ("static") storage management methods ***
*********************************************************/
/**
 *  Create a new movie record/object
 */
Movie.add = function (slots) {
  var movie =null;
  try {
    movie = new Movie( slots);
    Movie.instances[movie.movieId] = movie;
    console.log(`Movie record ${movie.toString()} created!`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 *  Update an existing Movie record/object
 */
Movie.update = function ({movieId, title, releaseDate, director, category, tvSeriesName, episodeNo, about,
    actorIdRefsToAdd, actorIdRefsToRemove }) {
  const movie = Movie.instances[movieId],
        objectBeforeUpdate = cloneObject( movie);
  var noConstraintViolated=true, updatedProperties=[];
  try {
    if (title && movie.title !== title) {
      movie.title = title;
      updatedProperties.push("title");
    }
    if (releaseDate && movie.releaseDate !== releaseDate) {
      movie.releaseDate = releaseDate;
      updatedProperties.push("releaseDate");
    }
    if (director && String(movie.director.personId) !== director) {
      movie.director = Person.instances[director];
      updatedProperties.push("director");
    }
    if (category) {
      if (movie.category === undefined) {
        movie.category = category;
        updatedProperties.push("category");
      } else if (category !== movie.category) {
        throw new FrozenValueConstraintViolation(
            "The movie category must not be changed!");
      }
    } else if (category === "" && "category" in movie) {
      throw new FrozenValueConstraintViolation(
          "The movie category must not be unset!");
    }
    if (tvSeriesName && movie.tvSeriesName !== tvSeriesName) {
      movie.tvSeriesName = tvSeriesName;
      updatedProperties.push("tvSeriesName");
    }
    if (episodeNo && movie.episodeNo !== episodeNo) {
      movie.episodeNo = episodeNo;
      updatedProperties.push("episodeNo");
    }
    if (about && movie.about !== about) {
      movie.about = about;
      updatedProperties.push("about");
    }
    if (actorIdRefsToAdd) {
      updatedProperties.push("actors(added)");
      for (const actorIdRef of actorIdRefsToAdd) {
        movie.addActor( actorIdRef);
      }
    }
    if (actorIdRefsToRemove) {
      updatedProperties.push("actors(removed)");
      for (const actor_id of actorIdRefsToRemove) {
        movie.removeActor( actor_id);
      }
    }
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      let ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log(`Propert${ending} ${updatedProperties.toString()} modified for movie ${movieId}`);
    } else {
      console.log(`No property value changed for movie ${movie.movieId}!`);
    }
  }
};
/**
 *  Delete an existing Movie record/object
 */
Movie.destroy = function (movieId) {
  const movie = Movie.instances[movieId];
  if (movie) {
    console.log(`${Movie.instances[movieId].toString()} deleted!`);
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with the ID ${movieId} in the database!`);
  }
};
/**
 *  Load all movie table rows and convert them to objects 
 *  Precondition: people must be loaded first
 */
Movie.retrieveAll = function () {
  var movies = {};
  try {
    if (!localStorage["movies"]) {
      localStorage.setItem("movies", JSON.stringify({}));
    } else {
      movies = JSON.parse( localStorage["movies"]);
      console.log(`${Object.keys( movies).length} movie records loaded.`);
    }
  } catch (e) {
    console.error( "Error when reading from Local Storage\n" + e);
  }
  for (const movieId of Object.keys( movies)) {
    try {
      Movie.instances[movieId] = Movie.convertRec2Obj( movies[movieId]);
    } catch (e) {
      console.error(`${e.constructor.name} while deserializing movie ${movieId}: ${e.message}`);
    }
  }
};

/**
 * Convert movie record to movie object
 */
Movie.convertRec2Obj = function (movieRow) {
  var movie=null;
  try {
    movie = new Movie( movieRow);
  } catch (e) {
    console.log(`${e.constructor.name} while deserializing a movie record: ${e.message}`);
  }
  return movie;
};

/**
 *  Save all movie objects
 */
Movie.saveAll = function () {
  const nmrOfMovies = Object.keys( Movie.instances).length;
  try {
    localStorage["movies"] = JSON.stringify( Movie.instances);
    console.log(`${nmrOfMovies} movies saved.`);
  } catch (e) {
    console.error( "Error when writing to Local Storage\n" + e);
  }
};

export default Movie;
export { MovieCategoryEL };
