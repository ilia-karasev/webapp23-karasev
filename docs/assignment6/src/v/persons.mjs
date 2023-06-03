/**
 * @fileOverview  View code of UI for managing Person data
 */
/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
import Person, { PersonTypeEL } from "../m/Person.mjs";
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions, createListFromMap, createMultipleChoiceWidget } from "../../lib/util.mjs";
import { displaySegmentFields, undisplayAllSegmentFields } from "./app.mjs"

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
  btn.addEventListener('click', function () {refreshManageDataUI();});
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
  Person.saveAll();
  // also save movies because movies may be deleted when a person is deleted
  Movie.saveAll();
});

/**********************************************
 Use case Retrieve and List All Persons
 **********************************************/
document.getElementById("RetrieveAndListAll")
    .addEventListener("click", function () {
  const tableBodyEl = document.querySelector("section#Person-R > table > tbody");
  tableBodyEl.innerHTML = "";
  for (const key of Object.keys( Person.instances)) {
    const person = Person.instances[key];
    const row = tableBodyEl.insertRow();
    row.insertCell().textContent = person.personId;
    row.insertCell().textContent = person.name;
    if (person.category) row.insertCell().textContent = PersonTypeEL.toString(person.category);
    if (person.category && person.category.includes(PersonTypeEL.ACTOR)) {
      if (person.agent) row.insertCell().textContent = Person.instances[person.agent].name;
      }
    }
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-R").style.display = "block";
});

/**********************************************
 Use case Create Person
 **********************************************/
const createFormEl = document.querySelector("section#Person-C > form");
const createCategorySelectEl = createFormEl.category;
const selectAgentEl = createFormEl.selectAgent;
document.getElementById("Create").addEventListener("click", function () {
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-C").style.display = "block";
  undisplayAllSegmentFields( createFormEl, PersonTypeEL.labels);
  createFormEl.reset();
});
// set up event handlers for responsive constraint validation
createFormEl.personId.addEventListener("input", function () {
  createFormEl.personId.setCustomValidity(
      Person.checkPersonIdAsId( createFormEl.personId.value).message);
});

createFormEl.name.addEventListener("input", function () {
  createFormEl.name.setCustomValidity(
      Person.checkName( createFormEl.name.value).message);
});

// set up the person category selection list
fillSelectWithOptions( createCategorySelectEl, PersonTypeEL.labels);
createCategorySelectEl.addEventListener("change", handleCategorySelectChangeEvent);
fillSelectWithOptions( selectAgentEl, Person.instances, "name");

// handle Save button click events
createFormEl["commit"].addEventListener("click", function () {
  const categoryStr = createCategorySelectEl.selectedOptions;
  const slots = {
    personId: createFormEl.personId.value,
    name: createFormEl.name.value
  };
  if (categoryStr) {
    var cat = [];
      for (const cc of categoryStr) {
        cat.push(parseInt( cc.index)+1);
      }
    slots.category = cat;
    slots.agent = createFormEl.selectAgent.value;
      createFormEl.selectAgent.setCustomValidity(
        Person.checkAgent( createFormEl.selectAgent.value, slots.category).message);
  }

  // check all input fields and show error messages
  createFormEl.personId.setCustomValidity(
      Person.checkPersonIdAsId( slots.personId).message);
  
  createFormEl.name.setCustomValidity(
      Person.checkName( slots.name).message);

  // save the input data only if all form fields are valid
  if (createFormEl.checkValidity()) {
    Person.add( slots);
    undisplayAllSegmentFields( createFormEl, PersonTypeEL.labels);
  }
});

/**********************************************
 Use case Update Person
 **********************************************/
const updateFormEl = document.querySelector("section#Person-U > form");
const updSelPersonEl = updateFormEl.selectPerson;
const updateSelectCategoryEl = updateFormEl.category;
undisplayAllSegmentFields( updateFormEl, PersonTypeEL.labels);
// set up event handler for Update button
document.getElementById("Update").addEventListener("click", function () {
  // reset selection list (drop its previous contents)
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-U").style.display = "block";
    // populate the selection list
  fillSelectWithOptions( updSelPersonEl, Person.instances,
      "personId", {displayProp:"name"});
  updateFormEl.reset();
});
updSelPersonEl.addEventListener("change", handlePersonSelectChangeEvent);

// handle Save button click events
updateFormEl["commit"].addEventListener("click", function () {
  const categoryStr = updateSelectCategoryEl.selectedOptions;
  const personIdRef = updSelPersonEl.value;
  if (!personIdRef) return;
  var slots = {
    personId: updateFormEl.personId.value,
    name: updateFormEl.name.value
  };
  if (categoryStr) {
    var cat = [];
      for (const cc of categoryStr) {
        cat.push(parseInt( cc.index)+1);
      }
    slots.category = cat;
    if (slots.category.includes(PersonTypeEL.ACTOR)) {
      if (updateFormEl.selectAgent.selectedOptions) {
        slots.agent = updateFormEl.selectAgent.value;
        updateFormEl.selectAgent.setCustomValidity(
          Person.checkAgent( updateFormEl.selectAgent.value, slots.category).message);
        }
    }
  }

  // check all property constraints
  updateFormEl.name.setCustomValidity(
    Person.checkName( slots.name).message);
  // save the input data only if all of the form fields are valid
  if (updSelPersonEl.checkValidity()) {
    Person.update( slots);
    undisplayAllSegmentFields( updateFormEl, PersonTypeEL.labels);
    // update the person selection list's option element
    updSelPersonEl.options[updSelPersonEl.selectedIndex].text = slots.name;
  }
});
/**
 * handle person selection events
 * when a person is selected, populate the form with the data of the selected person
 */
function handlePersonSelectChangeEvent() {
  const saveButton = updateFormEl.commit,
    updateSelectCategoryEl = updateFormEl.category,
    selectAgentEl = updateFormEl.selectAgent,
    personId = updateFormEl.selectPerson.value;
  if (personId !== "") {
    const person = Person.instances[personId];
    updateFormEl.personId.value = person.personId;
    updateFormEl.name.value = person.name;
    // set up the associated agent selection list
    fillSelectWithOptions( selectAgentEl, Person.instances, "personId", {displayProp: "name"});
    // set up the associated category selection widget
    if (person.category) {
      let categorySelection = {};
      person.category.forEach(cat => categorySelection[cat-1] = true);
      console.log("Category Selection: ", categorySelection);
      updateSelectCategoryEl.multiple = true;
      fillSelectWithOptions( updateSelectCategoryEl, PersonTypeEL.labels, "category", {selection: categorySelection});
      updateSelectCategoryEl.addEventListener("change", handleCategorySelectChangeEvent);
      // disable category selection (category is frozen)
      updateFormEl.category.disabled = "disabled";
      // show category-dependent fields
      displaySegmentFields( updateFormEl, PersonTypeEL.labels, person.category);
      if (person.category.includes(PersonTypeEL.ACTOR)) {
        if ( person.agent ) {
          selectAgentEl.value = person.agent;
        }
      }
    } else {  // person has no value for category
      updateFormEl.category.value = "";
      updateFormEl.category.disabled = "";   // enable category selection
      updateFormEl.name.value = "";
      if (updateFormEl.agent) updateFormEl.agent.value = "";
      undisplayAllSegmentFields( updateFormEl, PersonTypeEL.labels);
    }
    saveButton.disabled = false;
  } else {
    updateFormEl.reset();
    updateFormEl.selectAgent.selectedIndex = 0;
    saveButton.disabled = true;
  }
}

/**********************************************
 Use case Delete Person
 **********************************************/
const deleteFormEl = document.querySelector("section#Person-D > form");
const delSelPersonEl = deleteFormEl.selectPerson;
document.getElementById("Delete").addEventListener("click", function () {
  fillSelectWithOptions( delSelPersonEl, Person.instances,
    "personId", {displayProp:"name"});  
  document.getElementById("Person-M").style.display = "none";
  document.getElementById("Person-D").style.display = "block";
  deleteFormEl.reset();
});
// handle Delete button click events
deleteFormEl["commit"].addEventListener("click", function () {
  const personIdRef = delSelPersonEl.value;
  if (!personIdRef) return;
  if (confirm("Do you really want to delete this person?")) {
    Person.destroy( personIdRef);
    delSelPersonEl.remove( delSelPersonEl.selectedIndex);
  }
});

/**********************************************
 * Refresh the Manage Persons Data UI
 **********************************************/
function refreshManageDataUI() {
  // show the manage person UI and hide the other UIs
  document.getElementById("Person-M").style.display = "block";
  document.getElementById("Person-R").style.display = "none";
  document.getElementById("Person-C").style.display = "none";
  document.getElementById("Person-U").style.display = "none";
  document.getElementById("Person-D").style.display = "none";
}

function handleCategorySelectChangeEvent (e) {
  const formEl = e.currentTarget.form,
        // the array index of PersonTypeEL.labels
        categoryIndexStr = formEl.category.value;
  if (categoryIndexStr) {
    displaySegmentFields( formEl, PersonTypeEL.labels,
        parseInt( categoryIndexStr) + 1);
  } else {
    undisplayAllSegmentFields( formEl, PersonTypeEL.labels);
  }
}

// Set up Manage Persons UI
refreshManageDataUI();
