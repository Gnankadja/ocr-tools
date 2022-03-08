// Dependencies
const express = require('express'); 
const path = require('path'); 
const bodyParser = require('body-parser');
const tools = require('./function');


// Instanciate express
const app = express(); 

// Initialize middleware to allow access folder
app.use("/content", express.static(path.resolve(__dirname, "../../", "content")));



// Initialize middleware parse incoming request body
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Initialize middleware to fix CORS Errors
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});


app.post('/ocr-start', (req, res) => {
    // First, receive image from user
    tools.uploadFile(req, 'image').then(
        // If image is upload succeful,
        success => { 
            // Start OCR
            tools.ocr(path.join(__dirname, "../../", "content", success.fileName)).then(
                // If done
                textConverted => { res.status(200).json({text: textConverted});},
                // Otherwise
                error => { console.log(error); res.status(200).json({error: error}); }
            );
         },
        error => { res.status(500).json(error); }
    );
})

module.exports = app;