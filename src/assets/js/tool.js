/**
 * This function read url and get id of templates.
 * @returns Id of template
 */
function getTemplateId() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    return urlParams.get('templateId');
}

/**
 * This function read check if id of template is valid and has number type
 * @param {*number, Id of template} templateId 
 * @returns Boolean. 
 */
function checkTemplateId(templateId) {
    // Check if template id is a not number or null
    if (isNaN(templateId) || templateId == null)
        // And return false
        return false;
    // Otherwise
    else
        // Return True
        return true
}

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
 * This function get path of current template and load this in live preview block
 * @param {*String This is template folder path } folderPath 
 */
function loadPreview(folderPath) {
    document.getElementById('live-preview').src = "http://localhost:3000" + folderPath;
}

/**
 * This function create session variable for task
 * @param {*String Template edit folder path} folderPath 
 * @param {*String  ID of Session} idSession 
 * @param {*Number Id of template} idTemplate 
 */
function setDataSession(folderPath, idSession, idTemplate, templateName) {
    let sessionData = {
        pathEditFolder: folderPath,
        sessionID: idSession,
        templateID: idTemplate,
        templateName: templateName
    }
    localStorage.setItem("sessionData", JSON.stringify(sessionData))
}

/**
 * 
 * @returns Data Session
 */
function getDataSession() {
    return JSON.parse(localStorage.getItem("sessionData"));
}

/**
 * This function check if data session is defined.
 * @returns Boolean, 
 */
function checkDataSession() {
    if (localStorage.getItem("sessionData") == null) {
        return false;
    } else {
        return true;
    }
}

/**
 * This function delete session data.
 */
function removeDataSession() {
    localStorage.removeItem("sessionData");
}

/**
 * 
 * @param {String Path of template folder} pathFolder 
 * @returns JSON Editable Data 
 */
function getEditableData(pathFolder) {
    return new Promise((resolve, reject) => {
        // Execute ajax request to get data
        ajax_request('/api/edit/get-editable-data', 'POST',
            new Object({ pathEditFolder: pathFolder }),
            dataSuccess => { resolve(dataSuccess) },
            dataFailed => { reject(dataFailed) }
        );
    });
}


/**
 * 
 * @param {*Array This is the new data to insert in html file} newData 
 * @param {*String Path of edit templates folder} pathFolder 
 * @returns 
 */
function writeNewData(newData, pathFolder) {
    // Use Promise
    return new Promise((resolve, reject) => {
        // Execute ajax request to write new data in html file
        ajax_request('/api/edit/write-data', 'POST',
            new Object({ data: newData, pathEditFolder: pathFolder }),
            // If data is write succeful, return succeful message
            dataWriteSucceful => { resolve(dataWriteSucceful) },
            // Otherwise, return error message from server
            dataWriteFailed => { reject(dataWriteFailed) });
    })
}

function buildForms(jsonData) {
    let codeForms = ''
    return new Promise((resolve, reject) => {
        try {
            // Read each element of jsonData and get data
            jsonData.forEach((element, index, array) => {
                // If  data type is section,
                if (element.type == 'section') {
                    // Initiate html code for an session bloc
                    codeForms += '<div class="form-section">';
                    codeForms += '<div class="form-section-name">' + element.message + '</div>';
                    // Read next elements and get fileds for this section
                    for (let i = index + 1; i < jsonData.length; i++) {
                        // If data type is site title and text format
                        if (array[i].type == 'site-title' || array[i].type == 'text') {
                            // Create input with text format
                            codeForms += '<input type="text" id="' + jsonData[i].id + '" name="' + jsonData[i].id + '" class="form-field" placeholder="' + jsonData[i].value + '">';
                            // If data type is file
                        } //else if (jsonData[i].type == 'image') {
                        // Create input with type file
                        //codeForms += '<input type="file" id="' + jsonData[i].id + '" class="form-field">'; }
                        // Catch next data type section
                        else if (jsonData[i].type == 'section') {
                            // and add close tag
                            codeForms += '</div>';
                            // and Stop loop.
                            break;
                        }
                    }
                }

                // Catch last iteration
                if (index === array.length - 1) {
                    // To return forms html code
                    resolve(codeForms);
                }
            });
            // If error to build forms,
        } catch (error) {
            // return error
            reject(error)
        }
    })
}

/**
 * This function redirect user
 * @param {*String New url to rediret user} url 
 */
function redirectUser(url) {
    window.location.href = url;
}

/**
 * 
 * @param {*number, Id of template} templateID 
 * @returns session data
 */
function createSession(templateID) {
    // Use Promise
    return new Promise((resolve, reject) => {
        // Execute ajax request to create session
        ajax_request("/api/edit/start", "POST",
            // Send template ID into ajax request header
            new Object({ id: templateID }),
            // If session is create succeful, return data
            createSucceful => { resolve(createSucceful) },
            // If fail to create session, return failled error
            createFailed => { reject(createFailed) });
    });
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

/**
 *This function observe change on edit. 
 * @param {*} jsonData 
 */
function observeChange(jsonData) {
    document.querySelector('#live-preview').addEventListener("load", () => {
        let iframDoc = window.frames[0].document;
        jsonData.forEach(element => {
            if (element.type == 'text') {
                let el = document.getElementById(element.id);

                // Active border for each element who is will edit
                iframDoc.getElementById(element.id).style.border = "2px dashed #1E86FF";
                iframDoc.getElementById(element.id).style["border-radius"] = "5px";
                iframDoc.getElementById(element.id).style.padding = "5px";

                // Active current element if edit start
                el.addEventListener('keyup', () => {
                    iframDoc.getElementById(element.id).style.border = "2px dashed #1E86FF";
                    iframDoc.getElementById(element.id).style["border-radius"] = "5px";
                    iframDoc.getElementById(element.id).style.padding = "5px";
                    iframDoc.getElementById(element.id).innerHTML = el.value;
                });

                // After edit element, disable style
                el.addEventListener('focus', () => {
                    iframDoc.getElementById(element.id).style.border = "2px dashed #1E86FF";
                    iframDoc.getElementById(element.id).style["border-radius"] = "5px";
                    iframDoc.getElementById(element.id).style.padding = "5px";
                });

                el.addEventListener('focusout', () => {
                    iframDoc.getElementById(element.id).style.border = "none";
                    iframDoc.getElementById(element.id).style.padding = "0px";
                })

                // If one element is click on iframe, active input on edit panel
                iframDoc.getElementById(element.id).addEventListener('click', () => {
                    el.focus();
                })
            }
        });
    })
}

function saveData(folderPath) {
    // Use promise
    return new Promise((resolve, reject) => {
        // Get Forms on DOM
        let forms = document.querySelector('form');
        let newData = [];
        // Check each field and get value changes
        for (let field of forms.elements) {
            // Get field with text type
            if (field.type == "text") {
                // ignore empty field
                if (field.value != "") {
                    // Save data to array
                    newData.push({
                        id: field.id,
                        value: field.value
                    });
                }
            }
        }

        // Send data to server
        ajax_request("/api/edit/write-data", "POST",
            // Data to send
            new Object({ data: newData, pathEditFolder: folderPath }),
            // If data  write succeful, return msg success
            writeSuccess => { resolve(writeSuccess) },
            // If data write failed, return msg error
            writeFailed => { reject(writeFailed) });
    });
}

/**
 * This function get HTML code for froms and inject this on DOM
 * @param {String Forms Code HTML} formCode 
 */
function loadForms(formCode) {
    document.querySelector('form').innerHTML = formCode;
}

/**
 * 
 * @param {*String This function open in new tab site preview} folderPath 
 */
function previewSite(folderPath) {
    // Buil valid url
    let url = "http://localhost:3000" + folderPath;
    // Open url in new tab
    window.open(url, '_blank');
}


// Modal Box Manage
function modalBox(width, height, child_element, header_msg, header_icon,) {
    var modalView = '<div class="modal-box" id="modal-box">\
    <div class="modal-content" style="width:' + width + '; height:' + height + ';">\
        <div class="modal-header">\
            <div id="header-message"> <span class="' + header_icon + ' header-message-icon"></span>' + header_msg + '</div>\
            <div class="close-modal">&times;</div>\
        </div>\
        <div class="modal-body">' + child_element + '</div>\
    </div>\
</div>'

    // Insert modal box on body
    document.querySelector('body').insertAdjacentHTML('beforeend', modalView);

    // After display, identify this on DOM.
    var modal = document.getElementById("modal-box");
    var close_modal = document.querySelector('.close-modal');

    // Listen close modal event
    close_modal.onclick = function () {
        // Remove modal box on dom
        modal.parentElement.removeChild(modal);
    }
    window.onclick = function (event) {
        if (event.target == modal) {
            // Remove modal box on dom
            modal.parentElement.removeChild(modal);
        }
    }
}

function downloadBlocView() {
    // View Code
    const downloadView = '<div class="download-bloc">\
    <div class="download-options">\
        <div class="zip-format" id="download-zip"> <span class="download-option-icon bi-file-zip"></span> Fichier Zip</div>\
        <div class="ftp-upload" id="upload-ftp"> <span class="download-option-icon bi-cloud-arrow-up"></span>Mettre en ligne</div>\
    </div>\
    <div class="download-bloc-content" id="download-bloc-content"></div></div>';
    // Return this code
    return downloadView;
}

function manageDownloadOption() {
    // Download Option content view code
    var downloadZipCode = '<div class="name-option">Téléchargement au format zip.</div>\
    <ul class="info-option">\
        <li>Votre site sera disponible dans un dossier compressé</li>\
        <li>Toutes vos modifications seront prises en compte</li>\
        <li>Assurez-vous alors d\'enrégistrer au préalable, toutes vos modifications; prévisualisez si nécéssaire</li>\
        <li>Cliquez sur le bouton télécharger</li>\
    </ul>\
    <div class="download-zip-btn" id="download-zip-btn"> <span class="bi-download"></span> Télécharger</div>\
    <div class="status-download" id="status-download"> </div>'

    // Upload Ftp option view code
    var uploadFtpCode = '<div class="name-option">Hébergez votre site.</div>\
    <ul class="info-option">\
        <li>Votre site sera exporté sur votre serveur et sera immédiatement disponible.</li>\
        <li>Assurez-vous alors d\'enrégistrer au préalable, toutes vos modifications; prévisualisez si nécéssaire</li>\
        <li>Entrez les informations d\'accès à votre serveur.</li>\
    </ul>\
    <form action="" method="post" id="ftp-credential-form">\
        <div class="forms-row">\
            <input type="text" name="server-host" id="server-host" placeholder="Host">\
            <input type="text" name="server-port" id="server-port" placeholder="Port">\
        </div>\
        <div class="forms-row">\
            <input type="text" name="server-user" id="server-user" placeholder="User">\
            <input type="text" name="server-password" id="server-password" placeholder="Password">\
        </div>\
    </form>\
    <div class="upload-ftp-btn" id="upload-ftp-btn"> <span class="bi-cloud-arrow-up"></span> Héberger </div>\
    <div class="status-download" id="status-download"> </div>'

    // Use array to store all data for each download option.
    var options = [
        {
            // Download Zip Option data
            id: "download-zip", // Id of option in DOM
            viewCode: downloadZipCode, // View Code
            status: true, // Default Status of option
            toExec: // This function  is execute after option is display
                () => {
                    // Listen download zip button to catch click
                    document.getElementById('download-zip-btn').addEventListener('click', () => {
                        // Display Waiting message
                        displayWaitingMsg('.status-download', "Préparation du lien de téléchargement");

                        //Execute function to get download link
                        getDownloadLink(getDataSession().sessionID).then(
                            // If get link success,
                            link => {
                                // Open in new windows to start download
                                window.open(link, '_blank');
                                // Display link for user if auto download not start
                                document.querySelector('.status-download').innerHTML = "<div>Votre téléchargement devrait commencer.  <br> Sinon,\
                                <a href='"+ link + "' target='_blank'>Cliquez ici</a> pour le lancer.</div>"
                            },
                            // If error to get download link
                            linkError => {
                                // Display error
                                document.querySelector('.status-download').innerHTML = "Echec dans la récupération du lien de téléchargement. <br>\
                                Veuillez réssayer." }
                        );
                    });
                }
        },
        {
            // Upload to ftp server option
            id: "upload-ftp", // Id of option on DOM
            viewCode: uploadFtpCode, // View Code
            status: false, // Default status of option
            toExec: // This function is execute after option is display
                () => {
                    // Listen click on ftp upload button
                    document.getElementById('upload-ftp-btn').addEventListener('click', () => {

                        // Check form is valid
                        checkForms('#ftp-credential-form').then(
                            // If forms is valid
                            validForm => {
                                // Display waiting message before start checking ftp credential
                                displayWaitingMsg('.status-download', "Vérification des identifiants")
                                // Check credential ftp
                                checkFtpCredential(validForm.data["server-host"], validForm.data["server-port"], validForm.data["server-user"], validForm.data["server-password"])
                                    .then(
                                        // If connection succeful, 
                                        connect => {
                                            // display success message for a time.
                                            displaySuccess('.status-download', connect);
                                            // After display message, wait for a time before start upload
                                            setTimeout(() => {
                                                // Display loading message
                                                displayWaitingMsg('.status-download', "Mise en ligne du site...");
                                                // start upload
                                                uploadDataToFtp(getDataSession().sessionID, validForm.data["server-host"], validForm.data["server-port"], validForm.data["server-user"], validForm.data["server-password"]).then(
                                                    // If upload is success, display an message on  user
                                                    uploadSuccess => { displaySuccess('.status-download', uploadSuccess); },
                                                    // If upload failed
                                                    uploadFail => { displayError('.status-download', uploadFail); }
                                                ) // Time to wait before start upload to server
                                            }, 2000);
                                        },
                                        // but if it is wrong, display error message
                                        error => { displayError('.status-download', error) }
                                    )
                            },
                            // If forms is not valid
                            errorForm => { displayError('.status-download', "Un champs est vide.") }
                        )
                    })
                }
        }]

    // This function check if an option status is true and display
    //  this content on DOM
    function displayActiveContent(option) {
        // If option status is true
        if (option.status == true) {
            // Display content bloc in page
            document.getElementById('download-bloc-content').innerHTML = option.viewCode;
            // And add actve style to option on page
            document.getElementById(option.id).classList.add('download-option-active');
            // Execute function for each option
            option.toExec();
        }
    }

    // After the download bloc is display on DOM,
    options.map((option) => {
        // check option who is active to display this.
        displayActiveContent(option);
    })

    // This function listen click on option to display content matches
    function listenOptionClick() {
        // Read all options
        options.map((option) => {
            // Listen each option to catch click event
            document.getElementById(option.id).addEventListener('click', () => {
                // If option is click, change option status to true
                option.status = true;
                // and display content for this option
                displayActiveContent(option);
                // After remove active style on other option
                for (let opt of options) {
                    if (opt.id != option.id)
                        document.getElementById(opt.id).classList.remove('download-option-active');
                }
            });
        })
    }

    // Init function to catch event
    listenOptionClick();
}

/**
 * This function get download zip link.
 * @param {*String} sessionID 
 * @returns 
 */
function getDownloadLink(sessionID) {
    // Use promise
    return new Promise((resolve, reject) => {
        ajax_request('/api/edit/download', "POST",
            new Object({ sessionID: sessionID }),
            link => { resolve(link["download-link"]) },
            error => { reject(error) }
        );
    })
}

/**
 * This function check if ftp credential is validd
 * @param {*} host 
 * @param {*} port 
 * @param {*} user 
 * @param {*} password 
 * @returns 
 */
function checkFtpCredential(host, port, user, password) {
    // use promise
    return new Promise((resolve, reject) => {
        // Use ajax request to check credentials
        ajax_request('/api/edit/ftp-auth', "POST",
            new Object({ host: host, port: port, user: user, password: password }),
            authSuccess => { resolve(authSuccess.message) },
            authFailed => { reject(authFailed.message) }
        );
    });
}

/**
 * This function, upload data to server ftp
 * @param {*} sessionID 
 * @returns 
 */
function uploadDataToFtp(sessionID, host, port, user, password) {
    // Use promise
    return new Promise((resolve, reject) => {
        // Use ajax request to upload data on server
        ajax_request('/api/edit/ftp-upload', "POST",
            new Object({ sessionID: sessionID, host: host, port: port, user: user, password: password }),
            uploadSuccess => { resolve(uploadSuccess.msg) },
            uploadFail => { reject(uploadFail.msg) }
        );
    });
}

/**
 * This function display error message
 * @param {*} bloc 
 * @param {*} message 
 */
function displayError(bloc, message) {
    document.querySelector(bloc).innerHTML = `<div class="error-msg"> ${message} </div>`
}

/**
 * This function display success message
 * @param {*} bloc 
 * @param {*} message 
 */
function displaySuccess(bloc, message) {
    document.querySelector(bloc).innerHTML = `<div class="success-msg"> ${message} </div>`
}

/**
 * This function check if forms data is valid and return this for next process
 * @param {*} formBloc 
 * @returns 
 */
function checkForms(formBloc) {
    // Use promise
    return new Promise((resolve, reject) => {
        let values = {}
        let status = false;
        // Get form on DOM
        let form = document.querySelector(formBloc);
        // check each input of forms
        for (let field of form.elements) {
            // Select input with text type and number type
            if (field.type == "text") {
                // Check if field is empity
                if (field.value == "") {
                    status = false;
                    // Stop iteration
                    break;
                } else {
                    status = true;
                    values[field.id] = field.value;
                }
            }
        }

        if (status) {
            resolve(new Object({ status: true, data: values }))
        } else {
            // If is empity, display error
            displayError('.status-download', "Un champs est vide");
            reject('Error to get forms data.')
        }
    })
}

/**
 * This function close session and clean data session.
 */
function destroySession() {
    // Confirm message code
    let confirmLogout = "<ul class='confirm-logout-msg'><li>Avant de quitter la seession d'édition, \
    vérifiez que vous avez enrégistré toutes vos modification et télécharger votre site.</li>\
    <li>Après avoir quitter la session, toutes vos modifications ne seront plus disponibles.</li><div id='confirm-logout-btn'>Quitter</div></ul>";

    // Display message in modal box
    modalBox('35%', '40%', confirmLogout, "Voulez-vous quitter la session", "bi-box-arrow-left");
    // After, display message, listen if user click on confirm logout button
    document.getElementById('confirm-logout-btn').addEventListener('click', () => {
        // remove session data
        removeDataSession();
        // Redirect user
        redirectUser('https://google.com');
    });
}

/**
 * This function listen responsive button and update live preview bloc size
 */
function responsive() {
    document.getElementById('laptop-view').addEventListener('click', () => {
        document.getElementById('live-preview').style.width='98%'
    })

    document.getElementById('tablet-view').addEventListener('click', () => {
        document.getElementById('live-preview').style.width='768px'
    })

    document.getElementById('smartphone-view').addEventListener('click', () => {
        document.getElementById('live-preview').style.width='360px'
    })
}


/**
 * Get all editable image.
 */
function editImageData(jsonData){
    let editView = ""

    // Read all editable data 
    for(let media of jsonData) {
        // and get data of type image   
        if(media.type == "image") {
            let img_src = window.frames[0].document.getElementById(media.id).getAttribute('src');
            editView += `<div class="edit-image-row">
            <div class="image-name">${media.name}</div>
            <div class="info-edit-image">
                <img class="image-thumbnail" id="thumbnail-${media.id}" src="http://localhost:3000/content/edit/${getDataSession().sessionID}/${img_src}">
                <div id="img-preview-btn-${media.id}" class="img-preview-btn"><span class="bi-eye-fill"></span>Aperçu</div>
                <div id="edit-img-btn"> 
                    <label for="${media.id}" class="edit-img-btn"><span class="bi-pencil-fill"></span> Sélectionner </label>  
                    <input class="edit-img-input" type="file" id="${media.id}" name="${media.id}" accept=".jpg, .jpeg, .png">
                </div>
                <div id="download-${media.id}" class="import-image-btn">Envoyer</div>
            </div>
            <div class="state-upload">
                <div id="${media.id}-state-upload-bar" class="state-upload-bar">
                    <div id="${media.id}-state-upload-progress-bar" class="state-upload-progress-bar"></div>
                </div>
                <div id="${media.id}-final-state-upload" class="" id="final-state-upload"></div>
            </div>
            </div>`;
        }
    }
return editView;
}

function editImage(){
getEditableData(`/content/edit/${getDataSession().sessionID}`).then(
    data => { 
            modalBox('35%', '75%', editImageData(data), "Editer les images", "bi-file-image-fill");

            for (const media of data) {
                if(media.type == "image") {
                    let input = document.getElementById(media.id);
                    input.addEventListener('change', (e)=>{
            
                        let inputFile = input.files[0];
                        let uploadBtn = document.querySelector(`#download-${media.id}`);
                        document.querySelector(`#thumbnail-${media.id}`).src = URL.createObjectURL(inputFile);
                        uploadBtn.addEventListener('click', (e)=>{
                            let ajax_data = new FormData();
                            
                            
                                ajax_data.set('upload', inputFile);
                                ajax_data.set('path', getDataSession().pathEditFolder);
                                
                            
                            let request = new XMLHttpRequest();
                            request.open('POST', '/api/edit/upload', true);

                            request.upload.addEventListener('progress', (e)=>{
                                document.querySelector(`#${media.id}-state-upload-progress-bar`).style.width = "0%";
                                let percent_complete = (e.loaded / e.total)*100;
                                document.querySelector(`#${media.id}-state-upload-bar`).style.display = "flex";
                                document.querySelector(`#${media.id}-state-upload-progress-bar`).style.width = `${Math.floor(percent_complete)}%`;
                            });

                         
                            request.send(ajax_data);
                           
                            request.onload = (e) => {
                                if(request.status == 200) {
                                    writeNewData([{type: media.type, id: media.id, value: JSON.parse(request.responseText).fileLink}], getDataSession().pathEditFolder).then(
                                        success => { document.querySelector(`#${media.id}-final-state-upload`).classList.add("bi-cloud-check-fill") ; loadPreview(getDataSession().pathEditFolder)},
                                        failed => {  document.querySelector(`#${media.id}-final-state-upload`).classList.add("bi-x-circle-fill"); }
                                    )
                                }
                            };
                            
                            
                        })
                    })
                }
            }
     }
)
}