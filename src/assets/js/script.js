// Function

// Makes some ajax request with a link and his data.
function ajax_request(link, method, data, success = null, failed = null) {
    // Creating a new "xml http request" and Opens the xhr with the passed parameters.
    let xhr = new XMLHttpRequest(); xhr.open(method, link, true);
    // Changes the default header.
    xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
    // Sends the passed data.
    xhr.send(JSON.stringify(data)); xhr.onload = () => {
        // A 200 status has been returned.
        if (xhr.status === 200) success(JSON.parse(xhr.responseText), xhr.status);
        // Otherwise.
        else failed(xhr.status);
    }
}

/**
 * 
 * @param {*String Parent Bloc where message will be display} bloc 
 * @param {*String  Message to display} message 
 */
function displayWaitingMsg(bloc, message) {
    let loaderCode = '<div id="waiting-message">\
    <div id="loader" class="loader"></div>\
    <div id="message" class="meessage">' + message + '</div></div>'

    document.querySelector(bloc).innerHTML = loaderCode;
}




// Logic script

// Get input field on DOM
let uploadInput = document.getElementById('upload-image');

// Listen the select file with input
uploadInput.addEventListener('change', () => {
    // Display loader for user
    displayWaitingMsg(".text-converted", "Upload image...");

    let inputFile = uploadInput.files[0];

    // Display preview image to user to confirm selected succeful
    document.querySelector(`#img-selected-preview`).src = URL.createObjectURL(inputFile);
    // Create form to send image on server
    let ajax_data = new FormData();


    ajax_data.set('upload', inputFile);


    let request = new XMLHttpRequest();
    request.open('POST', 'http://localhost:3000/ocr-start', true);

    request.upload.addEventListener('progress', (e) => {
        document.querySelector('.upload-progress-bar').style.width = "0%";
        let percent_complete = (e.loaded / e.total) * 100;
        console.log(percent_complete)

        document.querySelector('.upload-progress-bar').style.display = "flex";
        document.querySelector('.upload-progress-bar').style.width = `${Math.floor(percent_complete)}%`;

        if(percent_complete == 100)
            displayWaitingMsg(".text-converted", "Character recognition...");
    });


    request.send(ajax_data);

    // Listen upload image
    request.onload = (e) => {
        // If upload is done and text from image is return
        if (request.status == 200) {
            // Get text from server response
            let text = JSON.parse(request.responseText).text;
            // Display text
            document.querySelector('.text-converted').innerHTML = text;
        } else {
            console.log(JSON.parse(request.responseText));
        }
    };

})