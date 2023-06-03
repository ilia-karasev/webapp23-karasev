/**
 * @fileOverview  Auxiliary data management procedures
 */
import Person, { PersonTypeEL } from "../m/Person.mjs";
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";

/*******************************************
 *** Auxiliary methods for testing **********
 ********************************************/
/**
 *  Create and save test data
 */
function generateTestData() {
  try {
    Person.instances["1"] = new Person({
      personId: 1,
      name: "Stephen Frears",
      category: [PersonTypeEL.DIRECTOR]
    });
    Person.instances["2"] = new Person({
      personId: 2,
      name: "George Lucas",
      category: [PersonTypeEL.DIRECTOR]
    });
    Person.instances["3"] = new Person({
      personId: 3,
      name: "Quentin Tarantino",
      category: [PersonTypeEL.DIRECTOR, PersonTypeEL.ACTOR]
    });
    Person.instances["4"] = new Person({
      personId: 4,
      name: "Uma Thurman",
      category: [PersonTypeEL.ACTOR],
      agent: 15
    });
    Person.instances["5"] = new Person({
      personId: 5,
      name: "John Travolta",
      category: [PersonTypeEL.ACTOR]
    });
    Person.instances["6"] = new Person({
      personId: 6,
      name: "Ewan McGregor",
      category: [PersonTypeEL.ACTOR]
    });
    Person.instances["7"] = new Person({
      personId: 7,
      name: "Natalie Portman",
      category: [PersonTypeEL.ACTOR]
    });
    Person.instances["8"] = new Person({
      personId: 8,
      name: "Keanu Reeves",
      category: [PersonTypeEL.ACTOR],
      agent: 16
    });
    Person.instances["9"] = new Person({
      personId: 9,
      name: "Russell Crowe",
      category: [PersonTypeEL.DIRECTOR, PersonTypeEL.ACTOR],
      agent: 16
    });
    Person.instances["10"] = new Person({
      personId: 10,
      name: "Seth MacFarlane",
      category: [PersonTypeEL.ACTOR]      
    });    
    Person.instances["11"] = new Person({
      personId: 11,
      name: "Naomi Watts",
      category: [PersonTypeEL.ACTOR]    
    });
    Person.instances["12"] = new Person({
      personId: 12,
      name: "Ed Harris",
      category: [PersonTypeEL.ACTOR],
      agent: 15  
    });
    Person.instances["13"] = new Person({
      personId: 13,
      name: "Marc Forster",
      category: [PersonTypeEL.DIRECTOR] 
    });
    Person.instances["14"] = new Person({
      personId: 14,
      name: "John Forbes Nash"
    });
    Person.instances["15"] = new Person({
      personId: 15,
      name: "John Doe"
    }); 
    Person.instances["16"] = new Person({
      personId: 16,
      name: "Jane Doe"
    });                                                       
    Person.saveAll();
    Movie.instances["1"] = new Movie({
      movieId: 1,
      title: "Pulp Fiction",
      releaseDate: "1994-05-12",
      director: Person.instances[3],
      actors: [3, 4 ,5]
    });
    Movie.instances["2"] = new Movie({
      movieId: 2,
      title: "Star Wars",
      releaseDate: "1999-08-19",
      director: Person.instances[2],
      actors: [6, 7]
    });
    Movie.instances["3"] = new Movie({
      movieId: 3,
      title: "Dangerous Liaisons",
      releaseDate: "1988-12-16",
      director: Person.instances[1],
      actors: [8, 4]
    });
    Movie.instances["4"] = new Movie({
      movieId: 4,
      title: "2015",
      releaseDate: "2019-06-30",
      director: Person.instances[1],
      actors: [9, 10, 11],
      category: MovieCategoryEL.TVSERIESEPISODE,
      episodeNo: 6,
      tvSeriesName: "The Loudest Voice"
    });
    Movie.instances["5"] = new Movie({
      movieId: 5,
      title: "A Beautiful Mind",
      releaseDate: "2001-12-21",
      director: Person.instances[9],
      actors: [9, 12],
      category: MovieCategoryEL.BIOGRAPHY,
      about: Person.instances[14]
    });
    Movie.instances["6"] = new Movie({
      movieId: 6,
      title: "Stay",
      releaseDate: "2005-09-24",
      director: Person.instances[13],
      actors: [6, 11]
    });     
    Movie.saveAll();
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
  }
}
/**
 * Clear data
 */
function clearData() {
  if (confirm( "Do you really want to delete all movie data")) {
    try {
      Person.instances = {};
      localStorage["persons"] = JSON.stringify({});
      Movie.instances = {};
      localStorage["movies"] = JSON.stringify({});
      console.log("All data cleared.");
    } catch (e) {
      console.log( `${e.constructor.name}: ${e.message}`);
    }
  }
}

export { generateTestData, clearData };
