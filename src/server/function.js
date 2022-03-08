const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const CloudmersiveOcrApiClient = require('cloudmersive-ocr-api-client');
const { Buffer } = require('buffer');
const { ocrSpace } = require('ocr-space-api-wrapper');



/**
 * This function upload file check and save this on server.
 * @param {*} uploadFolder 
 * @param {*} type 
 * @returns 
 */
function uploadFile(data, type,) {
    // Init Formidable
    let form = new formidable.IncomingForm();

    // Use Promise
    return new Promise((resolve, reject) => {
        // Params
        form.multiples = true;
        form.maxFileSize = 500 * 1024 * 1024; // 5MB
        // form.uploadDir = uploadFolder

        // Start upload
        form.parse(data, async (err, fields, files) => {
            // Get upload folder
            let uploadFolder = path.join(__dirname, "../../", "/content/");

            // If error to upload
            if (err) {
                // Display this
                console.log("Error parsing the files");
                // and return error
                reject({ status: "Fail", message: "There was an error parsing the files", error: err, });
                // If upload is success,
            } else {
                // Start checking file before finalize import
                if (type == 'image') {
                    console.log("Fichier de type image")
                    // Authorize jpg, jpeg, png image
                    if (!files.upload.originalFilename.match(/\.(jpg|jpeg|png)$/i)) {
                        // If image type is not good, return error
                        console.log("Extension non pris en charge")
                        reject({ status: "type error", message: "There was an error in the file type.", error: err, });
                        // If image type is valid
                    } else {
                        console.log("Nom de fichier valide")
                        // Get file name into temp folder
                        var oldPath = files.upload.filepath;
                        // Get original name for file
                        var newPath = uploadFolder + files.upload.originalFilename;
                        console.log(newPath)
                        // Get file link for index.html file
                        let fileLink = "content/" + files.upload.originalFilename;
                        // And rename file with original name
                        fs.rename(oldPath, newPath, function (err) {
                            // If error to rename, return error
                            if (err) { console.log("Erreur de renommage"); reject(err); }

                            // If rename succeful, return success message.
                            else { console.log("Renomage effectuée avec succès"); console.log(fileLink); resolve({ fileName: files.upload.originalFilename }); }
                        })
                    }
                }
            }
        });
    });
}

function ocr(pathImage) {
    return new Promise((resolve, reject) => {
        try {
            // Send image to ocr api
            ocrSpace(pathImage, { apiKey: "K86358094288957", language: 'fre' })
                // If api return response
                .then(
                    response => {
                        console.log(response);
                        // Extract text from response
                        let textConverted = response.ParsedResults[0].ParsedText;
                        resolve(textConverted);
                    });
            // If error to get text from image with api
        } catch (error) { reject(error) }
    });
}


exports.uploadFile = uploadFile;
exports.ocr = ocr;