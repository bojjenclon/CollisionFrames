var remote = require("remote");
var dialog = remote.dialog;
var fs = require("fs");

function openFile (doArrangeImages) { 
  // doArrangeImages = doArrangeImages !== false; // default to true
  
  dialog.showOpenDialog({
    "filters": [
      { name: "Images", extensions: ["jpg", "png", "gif"] }
    ],
    "properties": [
      "multiSelections"
    ]
  },
  function (fileNames) {
    if (fileNames === undefined) {
      return;
    }
    
    doArrangeImages = doArrangeImages && fileNames.length > 1;
    
    for (var i = 0; i < globals.paths.length; ++i) {
      var bgPaths = globals.paths[i];
      
      for (var k = 0; k < bgPaths.length; ++k) {
        var path = bgPaths[k];
        path.remove();
      }
    }
    
    globals.fileName = null;
    
    globals.curBg = 0;
    globals.bgImages = new Array(fileNames.length);
    globals.thumbnails = new Array(fileNames.length);
    globals.paths = new Array(fileNames.length);
    globals.pathTypeCount = new Array(fileNames.length);
    globals.zoomLevels = new Array(fileNames.length);
    
    var loadImage = function(images, i, onComplete) {
      var image = new Image();
      image.src = images[i];
      image.onload = function() {        
        onComplete(images, i);
      };
      
      var thumbnail = $(image).clone();
      thumbnail.css("width", "125px");
      thumbnail.css("height", "125px");
      
      globals.bgImages[i] = image;
      globals.thumbnails[i] = thumbnail;
      globals.paths[i] = [];
      globals.pathTypeCount[i] = {
        "rect": 0,
        "ellipse": 0
      };
      globals.zoomLevels[i] = 1;
    };
    
    var allImagesLoaded = function(images) { 
      $("#rightMenu").css("visibility", "visible");
      showControlButtons();
      updateCurBgIndex(0);
      
      if (doArrangeImages) {
        arrangeImages(0);
      }
      else {
        changeBackgroundRaster(0);
      }
    };
    
    fileNames.sort(naturalSort);
    
    var imageSrcs = new Array(fileNames.length);
    var filesLoaded = 0;
    fileNames.forEach(function(item, index) {
      var fileName = fileNames[index];
      var fileExt = fileName.substr(fileName.lastIndexOf("."));
      
      var dataExt;
      if (fileExt == "jpg") {
        dataExt = "jpeg";
      }
      else {
        dataExt = fileExt;
      }
      
      fs.readFile(fileName, function (err, data) {
        var base64 = btoa([].reduce.call(new Uint8Array(data), function(p, c) {
          return p + String.fromCharCode(c);
        }, ""));
        
        var src = "data:image/" + dataExt + ";base64," + base64;
        
        imageSrcs[index] = src;
        filesLoaded++;
        
        if (filesLoaded === fileNames.length) {
          loader(imageSrcs, loadImage, allImagesLoaded);
        }
      });
    });
  });
}

function addImages(doArrangeImages) { 
  if (globals.bgImages.length === 0) {
    return openFile(doArrangeImages);
  }
  
  // doArrangeImages = doArrangeImages !== false; // default to true
  
  dialog.showOpenDialog({
    "filters": [
      { name: "Images", extensions: ["jpg", "png", "gif"] }
    ],
    "properties": [
      "multiSelections"
    ]
  },
  function (fileNames) {
    if (fileNames === undefined) {
      return;
    }
    
    var loadImage = function(images, i, onComplete) {
      var image = new Image();
      image.src = images[i];
      image.onload = function() {        
        onComplete(images, i);
      };
      
      var thumbnail = $(image).clone();
      thumbnail.css("width", "125px");
      thumbnail.css("height", "125px");
      
      globals.bgImages.push(image);
      globals.thumbnails.push(thumbnail);
      globals.paths.push([]);
      globals.pathTypeCount.push({
        "rect": 0,
        "ellipse": 0
      });
      globals.zoomLevels.push(1);
    };
    
    var allImagesLoaded = function(images) { 
      $("#rightMenu").css("visibility", "visible");
      showControlButtons();
      updateCurBgIndex(0);
      
      if (doArrangeImages) {
        arrangeImages(0);
      }
      else {
        changeBackgroundRaster(0);
      }
    };
    
    var imageSrcs = new Array(fileNames.length);
    var filesLoaded = 0;
    fileNames.forEach(function(item, index) {
      var fileName = fileNames[index];
      var fileExt = fileName.substr(fileName.lastIndexOf("."));
      
      var dataExt;
      if (fileExt == "jpg") {
        dataExt = "jpeg";
      }
      else {
        dataExt = fileExt;
      }
      
      fs.readFile(fileName, function (err, data) {
        var base64 = btoa([].reduce.call(new Uint8Array(data), function(p, c) {
          return p + String.fromCharCode(c);
        }, ""));
        
        var src = "data:image/" + dataExt + ";base64," + base64;
        
        imageSrcs[index] = src;
        filesLoaded++;
        
        if (filesLoaded === fileNames.length) {
          loader(imageSrcs, loadImage, allImagesLoaded);
        }
      });
    });
  });
}

function constructJSON() {
  var json = [];
  
  var image = globals.bgImages[globals.curBg];
  var offset = new Point(image.width / 2, image.height / 2);
  
  for (var i = 0; i < globals.paths.length; ++i) {
    var allPaths = globals.paths[i];
    var jsonPaths = [];
    
    for (var k = 0; k < allPaths.length; ++k) {
      var curPath = allPaths[k];
      var rect = curPath.bounds;
      
      jsonPaths.push({
        "name": curPath.name,
        "type": curPath.shapeType,
        "x": rect.x + offset.x,
        "y": rect.y + offset.y,
        "width": rect.width,
        "height": rect.height
      });
    }
    
    json[i] = jsonPaths;
  }
  
  var jsonString = JSON.stringify(json, null, 2);
  
  return jsonString;
}

function save() { 
  if (globals.fileName) {
    var jsonString = constructJSON();
    
    fs.writeFile(globals.fileName, jsonString, function(error) {
      if (error) {
        return console.log(error);
      }
    });
  }
  else {
    saveAs();
  }
}

function saveAs() {
  var jsonString = constructJSON();
  
  dialog.showSaveDialog({
    "filters": [
      { name: "JSON", extensions: ["json"] }
    ]
  },
  function (fileName) {
    if (fileName === undefined) {
      return;
    }
    
    fs.writeFile(fileName, jsonString, function(error) {
      if (error) {
        return console.log(error);
      }
      
      // saved successfully
      globals.fileName = fileName;
    });
  });
}
