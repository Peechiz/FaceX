'use strict';

var app = angular.module('faceX',[]);

app.controller('snapPhoto', snapPhoto)

function snapPhoto() {
  var snap_c = this;

  snap_c.showVideo = true;
  snap_c.showCanvas = false;

  snap_c.snapPhoto = function(){
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').
    drawImage(video, 0, 0, canvas.width, canvas.height);

    snap_c.showVideo = false;
    snap_c.showCanvas = true;

    snap_c.snapped = canvas.toDataURL('image/jpeg;base64;',0.1)
  }

  snap_c.submit = function(){
    console.log('submit photo');
  }

  snap_c.retake = function(){
    console.log('retaking photo');
  }

  var video = document.querySelector('video');
  var canvas = window.canvas = document.querySelector('canvas');
  canvas.width = 480;
  canvas.height = 360;

  var constraints = {
    audio: false,
    video: true
  };

  function handleSuccess(stream) {
    window.stream = stream; // make stream available to browser console
    video.srcObject = stream;
  }

  function handleError(error) {
    console.log('navigator.getUserMedia error: ', error);
  }

  navigator.mediaDevices.getUserMedia(constraints).
  then(handleSuccess).catch(handleError);
}
