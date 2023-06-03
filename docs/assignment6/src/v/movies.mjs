/**
 * @fileOverview  View code of UI for managing Movie data
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person from "../m/Person.mjs";
import Movie, { MovieCategoryEL } from "../m/Movie.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"
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
    if (movie.category) {
      row.insertCell().textContent = MovieCategoryEL.toString([movie.category]);
      switch (movie.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        row.insertCell().textContent = movie.episodeNo;
        row.insertCell().textContent = movie.tvSeriesName;
        row.insertCell().textContent = "";
        break;
      case MovieCategoryEL.BIOGRAPHY:
        row.insertCell().textContent = "";
        row.insertCell().textContent = "";
        row.insertCell().textContent = "Biography about " + movie.about.name;
        break;
      }
    } else {
      row.insertCell().textContent = "";
      row.insertCell().textContent = "";
      row.insertCell().textContent = "";
      row.insertCell().textContent = "";
    }
  }
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-R").style.display = "block";
});

/**********************************************
  Use case Create Movie
 **********************************************/
const createFormEl = document.querySelector("section#Movie-C > form"),
      selectDirectorEl = createFormEl.selectDirector,
      selectActorsEl = createFormEl.selectActors,
      createCategorySelectEl = createFormEl.category,
      selectAboutEl = createFormEl.selectAbout;
document.getElementById("Create").addEventListener("click", function () {
  // set up a single selection list for selecting a director
  fillSelectWithOptions( selectDirectorEl, Person.instances, "name");
  fillSelectWithOptions( selectAboutEl, Person.instances, "name");
  // set up a multiple selection list for selecting actors
  fillSelectWithOptions( selectActorsEl, Person.instances,
      "personId", {displayProp: "name"});
  
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-C").style.display = "block";
  undisplayAllSegmentFields( createFormEl, MovieCategoryEL.labels);
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
createFormEl.tvSeriesName.addEventListener("input", function () {
  createFormEl.tvSeriesName.setCustomValidity(
      Movie.checkTvSeriesName( createFormEl["tvSeriesName"].value).message);
});
createFormEl.episodeNo.addEventListener("input", function () {
  createFormEl.episodeNo.setCustomValidity(
      Movie.checkEpisodeNo( createFormEl["episodeNo"].value).message);
});
fillSelectWithOptions( createCategorySelectEl, MovieCategoryEL.labels);
createCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createFormEl.category.value;
  const slots = {
    movieId: createFormEl.movieId.value,
    title: createFormEl.title.value,
    releaseDate: createFormEl.releaseDate.value,
    director: createFormEl.selectDirector.value,
    actorIdRefs: []
  };
  if (categoryStr) {
    // enum literal indexes start with 1
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case MovieCategoryEL.TVSERIESEPISODE:
      slots.tvSeriesName = createFormEl.tvSeriesName.value;
      createFormEl.tvSeriesName.setCustomValidity(
        Movie.checkTvSeriesName( createFormEl.tvSeriesName.value, slots.category).message);
      slots.episodeNo = createFormEl.episodeNo.value;
      createFormEl.episodeNo.setCustomValidity(
        Movie.checkEpisodeNo( createFormEl.episodeNo.value, slots.category).message);
      break;
    case MovieCategoryEL.BIOGRAPHY:
      slots.about = createFormEl.selectAbout.value;
      createFormEl.selectAbout.setCustomValidity(
        Movie.checkAbout( createFormEl.selectAbout.value, slots.category).message);
      break;
      
    }}
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
const updateSelectCategoryEl = updateFormEl.category;
undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
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

fillSelectWithOptions( updateSelectCategoryEl, MovieCategoryEL.labels);
updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);

updateFormEl.tvSeriesName.addEventListener("input", function () {
  updateFormEl.tvSeriesName.setCustomValidity(
      Movie.checkTvSeriesName( updateFormEl.tvSeriesName.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.episodeNo.addEventListener("input", function () {
  updateFormEl.episodeNo.setCustomValidity(
      Movie.checkEpisodeNo( updateFormEl.episodeNo.value,
          parseInt( updateFormEl.category.value) + 1).message);
});
updateFormEl.selectAbout.addEventListener("input", function () {
  updateFormEl.selectAbout.setCustomValidity(
      Movie.checkAbout( updateFormEl.selectAbout.value,
          parseInt( updateFormEl.category.value) + 1).message);
});

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateFormEl.category.value;
  const movieIdRef = updSelMovieEl.value,
    selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    selectedActorsListEl = selectActorsWidget.firstElementChild;
  if (!movieIdRef) return;
  var slots = {
    movieId: updateFormEl.movieId.value,
    title: updateFormEl.title.value,
    releaseDate: updateFormEl.releaseDate.value,
    director: updateFormEl.selectDirector.value,
    about: updateFormEl.selectAbout.value
  };
  if (categoryStr) {
    // enum literal indexes start with 1
    slots.category = parseInt( categoryStr) + 1;
    switch (slots.category) {
    case MovieCategoryEL.TVSERIESEPISODE:
      slots.tvSeriesName = updateFormEl.tvSeriesName.value;
      updateFormEl.tvSeriesName.setCustomValidity(
        Movie.checkTvSeriesName( slots.tvSeriesName, slots.category).message);
      slots.episodeNo = updateFormEl.episodeNo.value;
      updateFormEl.episodeNo.setCustomValidity(
        Movie.checkEpisodeNo( slots.episodeNo, slots.category).message);
      break;
    case MovieCategoryEL.BIOGRAPHY:
      slots.about = Person.instances[updateFormEl.selectAbout.value];
      updateFormEl.selectAbout.setCustomValidity(
        Movie.checkAbout( slots.about, slots.category).message);
      break;
    }
  }

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

/**
 * handle movie selection events: when a movie is selected,
 * populate the form with the data of the selected movie
 */
function handleMovieSelectChangeEvent() {
  const saveButton = updateFormEl.commit,
    selectActorsWidget = updateFormEl.querySelector(".MultiChoiceWidget"),
    selectDirectorEl = updateFormEl.selectDirector,
    selectAboutEl = updateFormEl.selectAbout,
    movieId = updateFormEl.selectMovie.value;
  if (movieId !== "") {
    const movie = Movie.instances[movieId];
    updateFormEl.movieId.value = movie.movieId;
    updateFormEl.title.value = movie.title;
    updateFormEl.releaseDate.value = movie.releaseDate;
    // set up the associated director selection list
    fillSelectWithOptions( selectDirectorEl, Person.instances, "personId", {displayProp: "name"});
    fillSelectWithOptions( selectAboutEl, Person.instances, "personId", {displayProp: "name"});
    // set up the associated persons selection widget
    createMultipleChoiceWidget( selectActorsWidget, movie.actors,
        Person.instances, "personId", "name", 1);  // minCard=1
    // assign associated director as the selected option to select element
    updateFormEl.selectDirector.value = movie.director.personId;
    

    if (movie.category) {
      updateFormEl.category.selectedIndex = movie.category;
      // disable category selection (category is frozen)
      updateFormEl.category.disabled = "disabled";
      // show category-dependent fields
      displaySegmentFields( updateFormEl, MovieCategoryEL.labels, movie.category);
      switch (movie.category) {
      case MovieCategoryEL.TVSERIESEPISODE:
        updateFormEl.tvSeriesName.value = movie.tvSeriesName;
        updateFormEl.episodeNo.value = movie.episodeNo;
        updateFormEl.about.value = "";
        break;
      case MovieCategoryEL.BIOGRAPHY:
        updateFormEl.selectAbout.value = movie.about;
        updateFormEl.tvSeriesName.value = "";
        updateFormEl.episodeNo.value = "";
        break;
      }
    } else {  // movie has no value for category
      updateFormEl.category.value = "";
      updateFormEl.category.disabled = "";   // enable category selection
      updateFormEl.tvSeriesName.value = "";
      updateFormEl.episodeNo.value = "";
      updateFormEl.selectAbout.value = "";
      undisplayAllSegmentFields( updateFormEl, MovieCategoryEL.labels);
    }
    saveButton.disabled = false;
  } else {
    updateFormEl.reset();
    updateFormEl.selectDirector.selectedIndex = 0;
    updateFormEl.selectAbout.selectedIndex = 0;
    selectActorsWidget.innerHTML = "";
    saveButton.disabled = true;
  }
}

/**********************************************
 * Use case Delete Movie
**********************************************/
const deleteFormEl = document.querySelector("section#Movie-D > form");
const delSelMovieEl = deleteFormEl.selectMovie;

document.getElementById("Delete").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  delSelMovieEl.innerHTML = "";
  // populate the selection list
  fillSelectWithOptions( delSelMovieEl, Movie.instances,
      "movieId", {displayProp: "title"});
  document.getElementById("Movie-M").style.display = "none";
  document.getElementById("Movie-D").style.display = "block";  
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

function handleCategorySelectChangeEvent (e) {
  const formEl = e.currentTarget.form,
        // the array index of MovieCategoryEL.labels
        categoryIndexStr = formEl.category.value;
  if (categoryIndexStr) {
    displaySegmentFields( formEl, MovieCategoryEL.labels,
        parseInt( categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields( formEl, MovieCategoryEL.labels);
  }
}

// Set up Manage Movie UI
refreshManageDataUI();
