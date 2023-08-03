document.getElementById('data-input')
.addEventListener('keyup', function(event) {
  if (event.code === 'Enter')
  {
    event.preventDefault();
    document.querySelector('button').click();
  }
});

var xhr = null;

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

function sendDataCallback() {
  // Check response is ready or not
  if (xhr.readyState == 4 && xhr.status == 201) {
      console.log("Data creation response received!");
      getDate();
      dataDiv = document.getElementById('sent-data-container');
      // Set current data text
      dataDiv.innerHTML = xhr.responseText;
  }
  // window.open("./officials.html", "_self");
}

function sendData() {
  dataToSend = document.getElementById('data-input').value;
  if (!dataToSend) {
      console.log("Data is empty.");
      return;
  }
  console.log("Sending data: " + dataToSend);
  xhr = getXmlHttpRequestObject();
  xhr.onreadystatechange = sendDataCallback;
  // asynchronous requests
  xhr.open("POST", "http://localhost:6969/api", true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  
  // Send the request over the network
  xhr.send(JSON.stringify({"data": dataToSend}));
  
  
}
(function () {
  getDate();
})();