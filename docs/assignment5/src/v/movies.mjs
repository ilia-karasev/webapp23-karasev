/**
 * @fileOverview  View code of UI for managing Movie data
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions, createListFromMap, createMultipleChoiceWidget }
    from "../../lib/util.mjs";

/***************************************************************
 Load data
 ***************************************************************/
Person.retrieveAll();
Movie.retrieveAll();

/***************************************************************
 Set up general, use-case-independent UI elements
 ***************************************************************/
// set up back-to-menu buttons for all use cases
for (const btn of document.querySelectorAll("button.back-to-menu")) {
  btn.addEventListener("click", function() {refreshManageDataUI();});
}
// neutralize the submit event for all use cases
for (const frm of document.querySelectorAll("section > form")) {
  frm.addEventListener("submit", function (e) {
    e.preventDefault();
    frm.reset();
  });
}
// save data when leaving the page
window.addEventListener("beforeunload", function () {
  Movie.saveAll();
});
/**********************************************
 Use case Retrieve/List All Movies
 **********************************************/
document.getElementById("moviesRetrieveAndListAll")
    .addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Movie-R > table > tbody");
  tableBodyEl.innerHTML = "";  // drop old content
  for (const key of Object.keys( Movie.instances)) {
    const movie = Movie.instances[key];
    // create list of actors for this movie
    const actListEl = createListFromMap( movie.actors, "name");
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = movie.movieId;
    row.insertCell().textContent = movie.title;
    row.insertCell().textContent = movie.releaseDate;
    row.insertCell().textContent = movie.director.name;
    row.insertCell().appendChild( actListEl);
  }
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";
});

/**********************************************
  Use case Create Movie
 **********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
      selectDirectorEl = createFormEl.selectDirector,
      selectActorsEl = createFormEl.selectActors;
document.getElementById("Create").addEventListener("click", function () {
  // set up a single selection list for selecting a director
  fillSelectWithOptions( selectDirectorEl, Person.instances, "name");
  // set up a multiple selection list for selecting actors
  fillSelectWithOptions( selectActorsEl, Person.instances,
      "personId", {displayProp: "name"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.movieId.addEventListener("input", function () {
  createFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( createFormEl.movieId.value).message);
});
createFormEl.title.addEventListener("input", function () {
  createFormEl.title.setCustomValidity(
      Movie.checkTitle( createFormEl["title"].value).message);
});
createFormEl.releaseDate.addEventListener("input", function () {
  createFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( createFormEl["releaseDate"].value).message);
});

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const slots = {
    movieId: createFormEl.movieId.value,
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    director: createFormEl.selectDirector.value,
    actorIdRefs: []
  };
  // check all input fields and show error messages
  createFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( slots.movieId).message);
  createFormEl.title.setCustomValidity(
      Movie.checkTitle( slots.title).message);
  createFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( slots.releaseDate).message);  
  // get the list of selected actors
  const selActOptions = createFormEl.selectActors.selectedOptions;
  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    // construct a list of person ID references
    for (const opt of selActOptions) {
      slots.actorIdRefs.push( opt.value);
    }
    Movie.add( slots);
  }
});

/**********************************************
 * Use case Update Movie
**********************************************/
const updateFormEl = document.querySelector("section#Movie-U > form");
const updSelMovieEl = updateFormEl.selectMovie;

document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  updSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( updSelMovieEl, Movie.instances,
      "movieId", {displayProp: "title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-U").style.display = "block";
  updateFormEl.reset();
});
updSelMovieEl.addEventListener("change", handleMovieSelectChangeEvent);
/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
function handleMovieSelectChangeEvent() {
  const saveButton = updateFormEl.commit,
    selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    selectDirectorEl = updateFormEl.selectDirector,
    movieId = updateFormEl.selectMovie.value;
  if (movieId !== "") {
    const movie = Movie.instances[movieId];
    updateFormEl.movieId.value = movie.movieId;
    updateFormEl.title.value = movie.title;
    updateFormEl.releaseDate.value = movie.releaseDate;
    // set up the associated director selection list
    fillSelectWithOptions( selectDirectorEl, Person.instances, "personId", {displayProp: "name"});
    // set up the associated persons selection widget
    createMultipleChoiceWidget( selectActorsWidget, movie.actors,
        Person.instances, "personId", "name", 1);  // minCard=1
    // assign associated director as the selected option to select element
    updateFormEl.selectDirector.value = movie.director.personId;
    saveButton.disabled = false;
  } else {
    updateFormEl.reset();
    updateFormEl.selectDirector.selectedIndex = 0;
    selectActorsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
}

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = updSelMovieEl.value,
    selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    selectedActorsListEl = selectActorsWidget.firstElementChild;
  if (!movieIdRef) return;
  const slots = {
    movieId: updateFormEl.movieId.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    director: updateFormEl.selectDirector.value
  };
  // add event listeners for responsive validation
  updateFormEl.movieId.setCustomValidity(
      Movie.checkMovieIdAsId( slots.movieId).message);
  updateFormEl.title.setCustomValidity(
      Movie.checkTitle( slots.title).message);
  updateFormEl.releaseDate.setCustomValidity(
      Movie.checkReleaseDate( slots.releaseDate).message);
   
  // commit the update only if all form field values are valid
  if (updateFormEl.checkValidity()) {
    // construct actorIdRefs-ToAdd/ToRemove lists from the association list
    let actorIdRefsToAdd=[], actorIdRefsToRemove=[];
    for (const actorItemEl of selectedActorsListEl.children) {
      if (actorItemEl.classList.contains("removed")) {
        actorIdRefsToRemove.push( actorItemEl.getAttribute("data-value"));
      }
      if (actorItemEl.classList.contains("added")) {
        actorIdRefsToAdd.push( actorItemEl.getAttribute("data-value"));
      }
    }
    // if the add/remove list is non-empty, create a corresponding slot
    if (actorIdRefsToRemove.length > 0) {
      slots.actorIdRefsToRemove = actorIdRefsToRemove;
    }
    if (actorIdRefsToAdd.length > 0) {
      slots.actorIdRefsToAdd = actorIdRefsToAdd;
    }
  }
    Movie.update( slots);
    // update the movie selection list's option element
    updSelMovieEl.options[updSelMovieEl.selectedIndex].text = slots.title;
    // drop widget content
    selectActorsWidget.innerHTML = "";

});

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const delSelMovieEl = deleteFormEl.selectMovie;

document.getElementById("Delete").addEventListener("click", function () {
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";  
  // reset selection list (drop its previous contents)
  delSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelMovieEl, Movie.instances,
      "movieId", {displayProp: "title"});
  deleteFormEl.reset();
});

// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const movieIdRef = delSelMovieEl.value;
  if (!movieIdRef) return;
  if (confirm("Do you really want to delete this movie?")) {
    Movie.destroy( movieIdRef);
    // remove deleted movie from select options
    delSelMovieEl.remove( delSelMovieEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Movies Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage movie UI and hide the other UIs
  document.getElementById("Movie-M").style.display = "block";
  document.getElementById("Movie-R").style.display = "none";
  document.getElementById("Movie-C").style.display = "none";
  document.getElementById("Movie-U").style.display = "none";
  document.getElementById("Movie-D").style.display = "none";
}

// Set up Manage Movie UI
refreshManageDataUI();
