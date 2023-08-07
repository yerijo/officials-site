var xhr = null;
const officialsSection = document.getElementById('officials-container')

getXmlHttpRequestObject = function () {
  if (!xhr) {
      // Create a new XMLHttpRequest object 
      xhr = new XMLHttpRequest();
  }
  return xhr;
};

function populate() {
  if (xhr.readyState == 4 && xhr.status == 200) {
    console.log("Populating data...");
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
  const nameElem = document.createElement("button"); // name
  const titleElem = document.createElement("p"); // title
  const partyElem = document.createElement("p"); // party
  const termElem = document.createElement("p"); // term
  
  nameElem.textContent = concatName(candidate);
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
  officialName = button.textContent;
}

function getImage(cand) {
  let img = new Image();
  img.src = cand.photo_origin_url;
  if (cand.photo_cropping) {
    return cropPhoto(cand, img);
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

function concatName(cand) {
  let name = "";
  if (cand.preferred_name != "") {
    name = cand.preferred_name;
  } else {
    name = cand.first_name;
  }
  const parts = [cand.nickname,
                 cand.last_name];
  for (var i = 0; i < 2; i++) {
    let part;
    if (parts[i] != "") {
      switch(i) {
        // nickname
        case 0:
          part = "\""+parts[i]+"\"";
          break;
        default:
          part = parts[i];
          break;
      }
      name = name.concat(" ", part);
    }
  }
  return name;
}

// function concatName(cand) {
//   let name = cand.first_name;
//   const parts = [cand.preferred_name, 
//                  cand.nickname, 
//                  cand.middle_initial, 
//                  cand.last_name, 
//                  cand.name_suffix];
//   for (var i = 0; i < 5; i++) {
//     let part;
//     if (parts[i] != "") {
//       switch(i) {
//         // preferred name
//         case 0:
//           part = "\""+parts[i]+"\"";
//           break;
//         // nickname
//         case 1:
//           part = "("+parts[i]+")";
//           break;
//         default:
//           part = parts[i];
//           break;
//       }
//       name = name.concat(" ", part);
//     }
//   }
//   return name;
// }

function concatTerm(cand) {
  var term = cand.current_term_start_date.split(' ')[0];
  term = term.concat(" to ", cand.term_end_date.split(' ')[0]);
  return term;
}

function getOfficials() {
  // Check response is ready or not
  console.log("Getting officials...");
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
    getOfficials();
  }
})();