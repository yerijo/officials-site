var xhr = null;
const officialsSection = document.getElementById('officials-container')

getXmlHttpRequestObject = function () {
  if (!xhr) {
      // Create a new XMLHttpRequest object 
      xhr = new XMLHttpRequest();
  }
  return xhr;
};

function getDate() {
  date = new Date().toString();
  document.getElementById('time-container').textContent
      = date;
}

function populate() {
  if (xhr.readyState == 4 && xhr.status == 200) {
    console.log("Officials data received!");
    const response = JSON.parse(xhr.responseText);
    populateOfficials(response);
  }
}

function populateOfficials(obj) {
  const section = document.getElementById('officials-container').innerHTML;
  const officials = obj.response.results.candidates;
  for (const candidate of officials) {
    const myArticle = document.createElement("article");
    const nameElem = document.createElement("h2"); // name
    const titleElem = document.createElement("p"); // title
    const partyElem = document.createElement("p"); // party
    const termElem = document.createElement("p"); // term
    
    nameElem.textContent = concatName(candidate);
    titleElem.textContent = `${candidate.office.title}`;
    partyElem.textContent = `${candidate.party}`;
    termElem.textContent = concatTerm(candidate);

    myArticle.appendChild(nameElem);
    myArticle.appendChild(titleElem);
    myArticle.appendChild(partyElem);
    myArticle.appendChild(termElem);

    section.appendChild(myArticle);
  }
}

// TODO: change this... create array for name parts and then create switch statement in a for loop and concats in the end of every iteration
function concatName(cand) {
  var name = cand.first_name;
  const pref = cand.preferred_name;
  const nick = cand.nickname;
  const middle = cand.middle_initial;
  const last = cand.last_name;
  const suffix = cand.name_suffix;

  if (pref != "") {
    name = name.concat(" ","("+pref+")");
  }
  if (nick != "") {
    name = name.concat(" ","\""+nick+"\"");
  }
  if (middle != "") {
    name = name.concat(" ",middle);
  }
  if (last != "") {
    name = name.concat(" ",last);
  }
  if (suffix != "") {
    name = name.concat(" ",suffix);
  }
  return name;
}

function concatTerm(cand) {
  var term = cand.current_term_start_date.split(' ')[0];
  term.concat(" to ", cand.term_end_date.split(' ')[0]);
  return term;
}

function dataCallback() {
  // check response is ready or not
  if (xhr.readyState == 4 && xhr.status == 200) {
    console.log("Officials data received!");
    // getDate();
    // console.log(xhr.responseText);
    document.getElementById('officials-container').innerHTML = xhr.responseText;
  }
}

function getOfficials() {
  // Check response is ready or not
  console.log("Get officials...");
  xhr = getXmlHttpRequestObject();
  xhr.onreadystatechange = populate;
  // asynchronous requests
  xhr.open("GET", "http://localhost:6969/api", true);
  // Send the request over the network
  xhr.send(null);
}

(function () {
  getDate();
  var ranGetOfficials = 0;
  if (ranGetOfficials == 0) {
    ranGetOfficials = 1;
    getOfficials();
    // populate();
  }
})();