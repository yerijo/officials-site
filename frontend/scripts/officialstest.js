var xhr = null;

getXmlHttpRequestObject = function () {
  if (!xhr) {
      // Create a new XMLHttpRequest object 
      xhr = new XMLHttpRequest();
  }
  return xhr;
};

function getTest() {
  // Check response is ready or not
  console.log("Get test...");
  xhr = getXmlHttpRequestObject();
  xhr.onreadystatechange = populate;
  // asynchronous requests
  xhr.open("GET", "http://localhost:6969/test", true);
  // Send the request over the network
  xhr.send(null);
}

function populate() {
  if (xhr.readyState == 4 && xhr.status == 200) {
    console.log("Populating data...");
    // console.log(xhr.responseText);
    // document.getElementById('officials-container').innerHTML = xhr.responseText;
    const response = JSON.parse(xhr.response);
    populateOfficials(response);
  }
}

function populateOfficials(obj) {
  let section = document.getElementById('transnational');
  const officials = obj.response.results.candidates[0].officials;
  for (const candidate of officials) {
    const article = createArticle(candidate);
    switch(candidate.office.district.district_type) {
      case "NATIONAL_EXEC":
      case "NATIONAL_UPPER":
      case "NATIONAL_LOWER":
        section = document.getElementById('national');
        break;
      case "STATE_EXEC":
      case "STATE_UPPER":
      case "STATE_LOWER":
        section = document.getElementById('state');
        break;
      case "LOCAL_EXEC":
      case "LOCAL":
        section = document.getElementById('local');
        break;
      default:
        section = document.getElementById('non-legislative');
        break;
    }
    section.appendChild(article);
  }
}

function createArticle(candidate) {
  const myArticle = document.createElement("article");
  const imgElem = getImage(candidate);
  let nameElem = document.createElement("button"); // name
  const titleElem = document.createElement("p"); // title
  const partyElem = document.createElement("p"); // party
  const termElem = document.createElement("p"); // term
  
  nameElem = concatName(candidate, nameElem);
  titleElem.textContent = `${candidate.office.chamber.name_formal}`;
  partyElem.textContent = `${candidate.party}`;
  termElem.textContent = concatTerm(candidate);

  nameElem.onclick = function() {
    clickedOfficial(nameElem);
  }

  myArticle.appendChild(imgElem);
  myArticle.appendChild(nameElem);
  myArticle.appendChild(titleElem);
  myArticle.appendChild(partyElem);
  myArticle.appendChild(termElem);

  return myArticle;
}

function clickedOfficial(button) {
  lastName = button.getElementById('last-name').textContent;
  if (!lastName) {
    console.log("Last name is null.");
    return;
  }
  sendLastName(lastName);
}

function sendLastName(lastName) {
  console.log("Sending official last name to backend: " + lastName);
  xhr = getXmlHttpRequestObject();
  xhr.onreadystatechange = sendLastNameCallback();
  xhr.open("POST", "http://localhost:6969/official", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  // Send the request over the network
  xhr.send(JSON.stringify({"lastName": dataToSend}));
}

function sendLastNameCallback() {
  if (xhr.readyState == 4 && xhr.status == 201) {
    window.open("./official.html", "_self");
  }
}

function getImage(cand) {
  // console.log("getting image...");
  let img = new Image();
  img.src = cand.photo_origin_url;
  if (cand.photo_cropping) {
    return cropPhoto(cand, img);
    // console.log("cropping image");
    // dWidth = window.innerWidth * 0.20;
    // dHeight = window.innerHeight * 0.20;
    // const crop = cand.photo_cropping;
    // ctx.drawImage(, 0, 0, dWidth, dHeight);
    // img.style.margin = `${crop.y} ${crop.width} ${crop.height} ${crop.x} `;
  } 
  let photo = document.createElement("div");
  photo.setAttribute('class','photo');
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
  const canvWidth = vw(20);
  const canvHeight = vh(20);
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

// https://stackoverflow.com/questions/44109314/javascript-calculate-with-viewport-width-height
function vh(percent) {
  var h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
  return (percent * h) / 100;
}

function vw(percent) {
  var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
  return (percent * w) / 100;
}

function concatName(cand, elem) {
  let first = cand.first_name;
  if (cand.preferred_name != "") {
    first = cand.preferred_name;
  } 
  if (cand.nickname != "") {
    first.concat(" ","\""+cand.nickname+"\"");
  }
  elem.textContent = first+" ";
  const last = document.createElement("div");
  last.setAttribute('class', 'last-name');
  last.textContent = cand.last_name;
  elem.appendChild(last);
  return elem;
}

function concatTerm(cand) {
  var term = cand.current_term_start_date.split(' ')[0];
  term = term.concat(" to ", cand.term_end_date.split(' ')[0]);
  return term;
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
  var ranGetOfficials = 0;
  if (ranGetOfficials == 0) {
    ranGetOfficials = 1;
    getTest();
  }
})();