//https://stackoverflow.com/questions/8682085/can-i-sync-up-multiple-image-onload-calls

function loader(items, callback, allDone) { // eslint-disable-line no-unused-vars
  if (!items) {
    return;
  }

  if ("undefined" === items.length) {
    items = [items];
  }

  var count = items.length;

  var callbackCompleted = function (items, i) {
    count--;
    if (0 == count) {
      allDone(items);
    }
  };

  for (var i = 0; i < items.length; i++) {
    callback(items, i, callbackCompleted);
  }
}

function loadImage(items, i, onComplete) { // eslint-disable-line no-unused-vars
  var onLoad = function (e) {
    e.target.removeEventListener("load", onLoad);
    
    onComplete(items, i);
  };
  
  var img = new Image();
  img.addEventListener("load", onLoad, false);
  img.src = items[i];
}

