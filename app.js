'use strict';

var app = angular.module('faceX', []);

app.controller('snapPhoto', snapPhoto)
app.controller('useURL', useURL)
app.controller('useUpload', useUpload)
app.controller('results', results)

var loadedPhoto;

angular.
  module('faceX').
  filter('emoji', function() {
    return function(input) {

      var faces = {
        neutral: 'img/emoji/static/neutral.svg',
        angry: 'img/emoji/static/Angry_flat.png',
        sad: 'img/emoji/static/Cry_flat.png',
        happy: 'img/emoji/static/Lol_flat.png',
        surprise: 'img/emoji/static/Wow_flat.png',
        fear: 'img/emoji/static/fear.svg'
      }
      return faces[input]
    };
  });

function results($rootScope){
  var res = this;
  var rt = $rootScope;

  res.feedback = false;

  res.submitFeedback = function(face){
    console.log('submitting feedback');
    console.log(rt.results);
    console.log(face);
  }

  res.confirm = function(){
    res.feedback = false;
  }

  res.getFeedback = function(){
    res.feedback = true;
  }

}

function useUpload($http) {
  var p = this;

  p.submit = function() {
    $http({
      method: 'POST',
      url: 'http://54.209.143.73:5000/v1.0.0/predict',
      params: {
        image_base64: loadedPhoto,
        annotate_image: true,
        crop_image: true
      }
    }).then(function success(data) {
      console.log(data);
    }, function fail(data){
      console.log('error: ', data);
    })
  }

}

function useURL($http,$rootScope) {
  var u = this;
  var rt = $rootScope;

  u.submit = function() {
    console.log(u.url)
    $http({
      method: 'POST',
      url: 'http://54.209.143.73:5000/v1.0.0/predict',
      params: {
        image_url: u.url,
        annotate_image: true,
        crop_image: true
      }
    }).then(function success(data) {
      console.log(data);
      u.test = data.data.annotated_image;
      rt.useURL = false;
      rt.results_received = true;
      rt.results = data.data
      rt.original = u.url
      console.log(rt.original);
    }, function fail(data) {
      console.log('error: ', data);
    })
  }
}

function snapPhoto($http) {
  var snap_c = this;

  snap_c.showVideo = true;
  snap_c.showCanvas = false;

  var video = document.querySelector('video');
  var canvas = window.canvas = document.querySelector('canvas');
  canvas.width = 480;
  canvas.height = 360;

  var constraints = {
    audio: false,
    video: true
  };

  snap_c.snapPhoto = function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').
    drawImage(video, 0, 0, canvas.width, canvas.height);

    snap_c.showVideo = false;
    snap_c.showCanvas = true;

    snap_c.snapped = canvas.toDataURL('image/jpeg;base64;', 0.1)
  }

  snap_c.submit = function() {
    console.log('submit photo');
    // play waiting animation by setting some varianle WAITING to true
    $http({
      method: 'POST',
      url: 'http://54.209.143.73:5000/v1.0.0/predict',
      params: {
        image_base64: snap_c.snapped,
        annotate_image: true,
        crop_image: true
      }
    }).then(function success(data) {
      console.log(data);
      snap_c.test = data.data.annotated_image;
    }, function fail(data) {
      // set WAITING to false
      console.log('error: ', data);
    })
  }

  snap_c.retake = function() {
    console.log('retaking photo');
  }



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

function previewFile() {
  var preview = document.getElementById('preview')
  var file    = document.getElementById('getImage').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    preview.src = reader.result;
    loadedPhoto = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}
