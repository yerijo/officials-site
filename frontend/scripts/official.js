var xhr = null;
const officialsSection = document.getElementById('officials-container')
let candidateCiceroData;

getXmlHttpRequestObject = function () {
  if (!xhr) {
      // Create a new XMLHttpRequest object 
      xhr = new XMLHttpRequest();
  }
  return xhr;
};

function getOfficialInfo() {
  // Check response is ready or not
  console.log("Getting info on official...");
  xhr = getXmlHttpRequestObject();
  xhr.onreadystatechange = populate;
  // asynchronous requests
  xhr.open("GET", "http://localhost:6969/official", true);
  // Send the request over the network
  xhr.send(null);
}

function populate() {
  if (xhr.readyState == 4 && xhr.status == 200) {
    console.log("Populating data...");
    const response = JSON.parse(xhr.response);
    console.log(response);
    const official = response.response.results.candidates[0].officials;
    for (const person of official) {
      candidateCiceroData = person;
      getScrapingInfo(person);
      populateHeader(person);
      // populateProfile(person);
      // populateDetails(person);
      break;
    }
  }
}

function getScrapingInfo(cand) {
  let name = cand.first_name;
  if (cand.preferred_name != "") {
    name = cand.preferred_name;
  }
  name = name.concat("_", cand.last_name);
  sendSearchName(name);
}

function sendSearchName(name) {
  console.log("Sending name to search to backend: " + name);
  xhr = getXmlHttpRequestObject();
  xhr.onreadystatechange = sendSearchNameCallback;
  xhr.open("POST", "http://localhost:6969/officialdetails", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  // Send the request over the network
  xhr.send(JSON.stringify({"search-name": name}));
}

function sendSearchNameCallback() {
  if (xhr.readyState == 4 && xhr.status == 201) {
    console.log("name sent successfully");
    // do scraping
    populateDetails();
  }
}

function populateHeader(official) {
  let name = concatName(official);
  const headerdiv = document.getElementById("header");
  const nameElem = document.createElement("h2");
  document.title = name;
  nameElem.textContent = name;
  headerdiv.appendChild(nameElem);
}

function concatName(cand) {
  let name = cand.first_name;
  if (cand.preferred_name != "") {
    name = cand.preferred_name;
  } 
  if (cand.nickname != "") {
    name = name.concat(" ","\""+cand.nickname+"\"");
  }
  name = name.concat(" ", cand.last_name);
  console.log("official's name is: " + name);
  return name;
}

function populateProfile() {
  const candidate = candidateCiceroData;
  const officialsDiv = document.getElementById('official-container');
  officialsDiv.style.padding = '2vh';
  const profile = document.createElement('div');
  
  const name = document.createElement('h3');
  name.style.padding = '0';
  name.style.margin = '0';
  const imgElem = getImage(candidate);
  const titleElem = document.createElement('p');
  const urls = makeURLs(candidate);
  
  profile.setAttribute('id','profile');
  name.textContent = concatName(candidate);
  titleElem.textContent = `${candidate.office.chamber.name_formal}`;

  profile.appendChild(name);
  profile.appendChild(imgElem);
  profile.appendChild(titleElem);
  profile.appendChild(urls);

  officialsDiv.insertBefore(profile, officialsDiv.firstChild);
}

// TODO: make header for url and return that
function makeURLs(cand) {
  const urlDiv = document.createElement('div');
  urlDiv.setAttribute('id','urls');
  urls = cand.urls;
  for (const url of urls) {
    const a = document.createElement('a');
    a.href = url;
    a.innerText = a.hostname;

    urlDiv.appendChild(a);
  }
  return urlDiv;
}

function getImage(cand) {
  let img = new Image();
  img.src = cand.photo_origin_url;
  if (cand.photo_cropping) {
    return cropPhoto(cand, img);
  } 
  let photo = document.createElement("div");
  photo.setAttribute('id','photo');
  photo.appendChild(img);
  return photo;
}

function cropPhoto(cand) {
  const crop = cand.photo_cropping;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d'); //context
  let img = new Image();
  img.context=context;
  img.src = cand.photo_origin_url;
  // calculate image size to display
  const dimensions = calcPhotoDimensions(crop.width, crop.height);
  canvas.width = dimensions[0];
  canvas.height = dimensions[1];
  // must wait until image loads
  if (img.complete) {
    context.drawImage(img, crop.x, crop.y, crop.width, crop.height,
      0,0, canvas.width, canvas.height);  
  } else {
    img.onload = function () {
      context.drawImage(img, crop.x, crop.y, crop.width, crop.height,
        0,0, canvas.width, canvas.height);  ;    
    };
  }
  let ret = document.createElement("div");
  ret.setAttribute('class','photo');
  ret.appendChild(canvas);
  return ret;
}

function calcPhotoDimensions (w,h) {
  const canvWidth = vw(30);
  const canvHeight = vh(30);
  let dWidth = canvWidth;
  let ratio = h/w;
  let dHeight = ratio*dWidth;
  if (dHeight > canvHeight) {
    dHeight = canvHeight;
    ratio = w/h;
    dWidth = ratio*dHeight;
  }
  return [dWidth, dHeight];
}

// code to convert viewpoint height and width to pixels
// source: https://stackoverflow.com/questions/44109314/javascript-calculate-with-viewport-width-height
function vh(percent) {
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (percent * h) / 100;
}

function vw(percent) {
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (percent * w) / 100;
}

function populateDetails() {
  console.log("Getting details data...");
  xhr = getXmlHttpRequestObject();
  xhr.onreadystatechange = populateDetailsCallback;
  // asynchronous requests
  xhr.open("GET", "http://localhost:6969/officialdetails", true);
  // Send the request over the network
  xhr.send(null);
}

function populateDetailsCallback() {
  if (xhr.readyState == 4 && xhr.status == 200) {
    console.log("Populating details...");
    const officialsDiv = document.getElementById('official-container');
    const details = document.getElementById('details');
    const response = JSON.parse(xhr.response);
    if (!response.scraping.localeCompare("success")) {
      // officialsDiv.style = 'display: "inline-grid"; grid-display-columns: "2fr 5fr"';
      console.log("There is a wikipedia page!");
      scrapedResponse = response.html;
      domElem = new DOMParser().parseFromString(scrapedResponse, "text/html");
      const hideTop = domElem.getElementsByClassName("hatnote navigation-not-searchable");
      for (const hide of hideTop) {
        hide.style.display = "none"
      }
      const hideEdit = domElem.getElementsByClassName("mw-editsection");
      for (const hide of hideEdit) {
        hide.style.display = "none"
      }

      details.appendChild(domElem.documentElement);
    } else {
      officialsDiv.style.display = 'inline-grid';
      officialsDiv.style.gridTemplateColumns = '2fr 5fr';
      console.log("There is no wikipedia page :(");
      const notes = candidateCiceroData.notes;
      let detailsText = notes[0];
      detailsText = detailsText.replaceAll("\\n", "<br>");
      details.innerHTML = detailsText;
      populateProfile();
    }
  }
}

(function () {
  var ranGetOfficial = 0;
  if (ranGetOfficial == 0) {
    ranGetOfficial = 1;
    getOfficialInfo();
  }
})();