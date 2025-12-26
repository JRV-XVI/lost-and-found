const express = require('express');
const bodyParser = require('body-parser');
const { MessagingResponse } = require('twilio').twiml;
const ngrok = require("@ngrok/ngrok");

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/sms', (req, res) => {
    const twiml = new MessagingResponse();

    if (req.body.Body == 'hello') 
    {
        twiml.message('Hi!');
    } 
    else if (req.body.Body == 'bye') 
    {
        twiml.message('Goodbye');
    } 
    else 
    {
        twiml.message('No Body param match, Twilio sends this in the request to your server.');
    }
    
    res.type('text/xml').send(twiml.toString());
});

app.listen(3002, () => {
    console.log('Express server listening on port 3002');
});

// import ngrok from '@ngrok/ngrok' // if inside a module
(async function() {
    // Establish connectivity
    const listener = await ngrok.forward({ addr: 3002, authtoken: "2nvFSpVwRZBuBjyRVvVnFGRj1AE_6uVR75YYPmgQXnpSDbTNp" }); // Port 3002 is the port your express app is running on
  
    // Output ngrok url to console
    console.log(`Ingress established at: ${listener.url()}`);
  })();
  
  process.stdin.resume();
