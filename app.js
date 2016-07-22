'use strict';

var app = angular.module('faceX', ['ngMessages']);

app.controller('useWebCam', useWebCam)
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

angular.
module('faceX').
filter('percent', function() {
  return function(input) {
    input *= 100;
    var pct = input.toFixed(1);
    if (pct.charAt(pct.length - 1) === '0') {
      pct = pct.slice(0, pct.length - 2)
    }
    return pct;
  };
});

function results($rootScope) {
  var res = this;
  var rt = $rootScope;

  res.feedback = {};
  res.emote = {};
  res.submitted = {};
  res.nofaces = rt.results.faces.length === 0;

  var img_container = document.querySelector('#imgcontainer');
  var img = document.querySelector('#og');

  console.log('hello');
  img.addEventListener('load', function(){
    img_container.style.width = img.width + 'px';
    img_container.style.height = img.height + 'px';

    rt.results.faces.forEach(function(face){
      var width = face.width;
      var height = face.height;
      var left = face.location_xy[0];
      var top = face.location_xy[1];
      var index = face.index;
      var meme;
      var dieRoll = Math.random();
      console.log(dieRoll);

      // die roll <= .3
      // if face is over 80%, render that emotion
      // else, rageface representing top two emotions

      if (dieRoll <= .3){
        var sorted = face.prediction.sort(function(a,b){
          return b.percent - a.percent
        })
        if (sorted[0].percent >= .8){
          meme = sorted[0].emotion;
          meme = `${meme}-${meme}.png`;
        }
        else {
          var emo1 = sorted[0].emotion;
          var emo2 = sorted[1].emotion;
          meme = `${emo1}-${emo2}.png`
        }

        $('#imgcontainer').append(`<img class="abs" src="graphics/meme_faces/${meme}" id="${index}">`)
        $(`#${index}`).width(width);
        $(`#${index}`).height(height);
        $(`#${index}`).css('top', top);
        $(`#${index}`).css('left', left);
      }
    })
  })


  res.submitFeedback = function(face) {
    console.log('submitting feedback');
    console.log(rt.results.id);
    console.log(face.index);
    console.log(res.emote[face.index]);
    res.feedback[face.index] = false;
    res.submitted[face.index] = true;
  }

  res.confirm = function(face) {
    res.feedback[face.index] = false;
    res.submitted[face.index] = true;
  }

  res.getFeedback = function(face) {
    res.feedback[face.index] = true;
  }

  res.isBiggest = function(face_index, result) {
    var arr = rt.results.faces[face_index].prediction;

    // console.log('current face:',face_index);
    // console.log('current emoji result:',result);

    function getMax(arr) {
      return arr.reduce(function(out, item) {
        // console.log('item:',item);
        if (item.percent > out) {
          return item.percent
        } else {
          return out
        }
      }, 0)
    }

    var biggest = getMax(arr);

    if (result.percent === biggest) {
      return true;
    } else {
      return false;
    }

  }

}

function useUpload($http, $rootScope) {
  var p = this;
  var rt = $rootScope;

  p.submit = function() {
    $http({
      method: 'POST',
      url: 'http://54.164.65.15:5000/v1.0.0/predict',
      params: {
        image_base64: loadedPhoto,
        annotate_image: true,
        crop_image: true
      }
    }).then(function success(data) {
      console.log(data);
      rt.useUpload = false;
      rt.results_received = true;
      rt.results = data.data
      rt.original = loadedPhoto;
    }, function fail(data) {
      console.log('error: ', data);
    })
  }

}

function useURL($http, $rootScope) {
  var u = this;
  var rt = $rootScope;

  u.submit = function() {
    console.log(u.url)
    $http({
      method: 'POST',
      url: 'http://54.164.65.15:5000/v1.0.0/predict',
      params: {
        image_url: u.url,
        annotate_image: true,
        crop_image: true
      }
    }).then(function success(data) {
      console.log(data);
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

function useWebCam($http, $rootScope) {
  var w = this;
  var rt = $rootScope;

  w.showVideo = true;
  w.showCanvas = false;

  var video = document.querySelector('video');
  var canvas = window.canvas = document.querySelector('canvas');
  canvas.width = 480;
  canvas.height = 360;

  var constraints = {
    audio: false,
    video: true
  };

  w.snapPhoto = function() {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').
    drawImage(video, 0, 0, canvas.width, canvas.height);

    w.showVideo = false;
    w.showCanvas = true;

    w.snapped = canvas.toDataURL('image/jpeg;base64;', 0.1)
  }

  w.submit = function() {
    console.log('submit photo');
    window.stream.getVideoTracks()[0].stop();
    // play waiting animation by setting some varianle WAITING to true
    w.waiting = true;
    w.showCanvas = false;
    $http({
      method: 'POST',
      url: 'http://54.164.65.15:5000/v1.0.0/predict',
      params: {
        image_base64: w.snapped,
        annotate_image: true,
        crop_image: true
      }
    }).then(function success(data) {
      console.log(data);
      w.waiting = false;
      rt.useWebCam = false;
      rt.results_received = true;
      rt.results = data.data
      rt.original = w.snapped
    }, function fail(data) {
      // set WAITING to false
      console.log('error: ', data);
    })
  }

  w.retake = function() {
    console.log('retaking photo');
    w.showVideo = true;
    w.showCanvas = false;
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
  var file = document.getElementById('getImage').files[0];
  var reader = new FileReader();

  reader.addEventListener("load", function() {
    preview.src = reader.result;
    loadedPhoto = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
}
