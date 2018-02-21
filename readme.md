# FaceX

A collaboration with data scientist @JostineHo, this webapp was meant to showcase her facial recognition API.

![image of site splash](http://mrpeech.com/img/mememoji.png)

From the API:

> Mememoji is an interactive emotion recognition system that detects emotions based on facial expressions. The core of the app is a deep convolutional neural network that predicts the compositions of the emotions expressed by users. We hope you enjoy the special features we designed and give feedback to help us further train the algorithm.

> For the technology used behind the application, please visit: github.com/JostineHo/Mememoji.

## Goals and Challenges

For my part, I was responsible for the UX of her application.  The intention was to allow users to upload, link, or snap a webcam photo and send it to her API running on AWS.  The response payload would include JSON detailing any faces that were discovered and an array of percentages representing likely emotions depicted on the user's face.

This project was one of my first attempts at an angular front end, so the controller code is a little disorganized, and there were some issues with deployment as the api does not currently support HTTPS (necessary for `getUserMedia()` and parts of `<canvas>`)
