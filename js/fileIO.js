var remote = require("remote");
var dialog = remote.dialog;
var fs = require("fs");

function imageLoadHelper(fileNames, allImagesLoaded) {
  for (var i = 0; i < globals.paths.length; ++i) {
    var bgPaths = globals.paths[i];
    
    for (var k = 0; k < bgPaths.length; ++k) {
      var path = bgPaths[k];
      path.remove();
    }
  }

  globals.curBg = 0;
  globals.bgImages = new Array(fileNames.length);
  globals.thumbnails = new Array(fileNames.length);
  globals.paths = new Array(fileNames.length);
  globals.pathTypeCount = new Array(fileNames.length);
  globals.zoomLevels = new Array(fileNames.length);
  globals.origins = new Array(fileNames.length);

  var loadImage = function(images, i, onComplete) {
    var image = new Image();
    image.src = images[i];
    image.onload = function() {        
      onComplete(images, i);
    };
    
    var thumbnail = $(image).clone();
    thumbnail.css("max-width", "125px");
    thumbnail.css("max-height", "125px");
    
    globals.bgImages[i] = image;
    globals.thumbnails[i] = thumbnail;
    globals.paths[i] = [];
    globals.pathTypeCount[i] = {
      "rect": 0,
      "ellipse": 0
    };
    globals.zoomLevels[i] = 1;
    globals.origins[i] = new Point(0, 0);
  };

  globals.bgFilePaths = fileNames;

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
}

function openProject() {
  dialog.showOpenDialog({
    "filters": [
      { name: "JSON", extensions: ["json"] }
    ]
  },
  function (fileNames) {
    if (fileNames === undefined) {
      return;
    }
    
    globals.fileName = fileNames[0];
    
    fs.readFile(fileNames[0], "utf-8", function (err, data) {
      if (err) {
        throw err;
      }
      
      var json = JSON.parse(data);
      
      var fileNames = [];
      for (var i = 0; i < json.frames.length; ++i) {
        fileNames.push(json.frames[i].path);
      }
      
      var readyToDisplay = function() {
        $("#rightMenu").css("visibility", "visible");
        showControlButtons();
        updateCurBgIndex(0);
        
        $(window).trigger("resize");
        
        changeBackgroundRaster(0);
      };
      
      var imagesLoaded = function(images) {
        for (var i = 0; i < json.frames.length; ++i) {
          var curFrame = json.frames[i];
          
          globals.origins[i].x = curFrame.origin.x;
          globals.origins[i].y = curFrame.origin.y;
          
          var allPaths = curFrame.paths;
          for (var j = 0; j < allPaths.length; ++j) {
            var curPath = allPaths[j];
            
            if (curPath.type === "rect") {
              var fillColor = new Color(Math.random(), Math.random(), Math.random(), 0.75);
              var selectionColor = findComplimentaryColor(fillColor);
              var shapeTypeIndex = globals.pathTypeCount[i]["rect"];
              
              var rect = new Path.Rectangle({
                name: "rect" + shapeTypeIndex,
                point: new Point(curPath.x, curPath.y),
                size: [curPath.width, curPath.height],
                fillColor: fillColor,
                selectedColor: selectionColor,
                visible: false
              });
              rect.shapeType = "rect";
              rect.shapeTypeIndex = shapeTypeIndex;
              globals.paths[i].push(rect);
              
              globals.pathTypeCount[i]["rect"] += 1;
            }
          }
        }
        
        readyToDisplay();
      };
      
      imageLoadHelper(fileNames, imagesLoaded);
    });
  });
}

function openImages (doArrangeImages) { 
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
    
    globals.fileName = null;
    
    doArrangeImages = doArrangeImages && fileNames.length > 1;
    fileNames.sort(naturalSort);
    
    var allImagesLoaded = function(images) {
      $("#rightMenu").css("visibility", "visible");
      showControlButtons();
      updateCurBgIndex(0);
      
      $(window).trigger("resize");
      
      if (doArrangeImages) {
        arrangeImages(0);
      }
      else {
        changeBackgroundRaster(0);
      }
    };
    
    imageLoadHelper(fileNames, allImagesLoaded);
  });
}

function addImages(doArrangeImages) { 
  if (globals.bgImages.length === 0) {
    return openImages(doArrangeImages);
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
    
    var numImages = globals.bgImages.length;
    
    var loadImage = function(images, i, onComplete) {
      var image = new Image();
      image.src = images[i];
      image.onload = function() {        
        onComplete(images, i);
      };
      
      var thumbnail = $(image).clone();
      thumbnail.css("max-width", "125px");
      thumbnail.css("max-height", "125px");
      
      globals.bgImages[numImages + i] = image;
      globals.thumbnails[numImages + i] = thumbnail;
      globals.paths[numImages + i] = [];
      globals.pathTypeCount[numImages + i] = {
        "rect": 0,
        "ellipse": 0
      };
      globals.zoomLevels[numImages + i] = 1;
      globals.origins[numImages + i] = new Point(0, 0);
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
    globals.bgFilePaths.concat(fileNames);
    
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
  var frames = [];
  
  for (var i = 0; i < globals.bgImages.length; ++i) {
    var imageJson = {};
    
    var image = globals.bgImages[i];
    var origin = globals.origins[i];
    
    imageJson["path"] = globals.bgFilePaths[i];
    
    imageJson["origin"] = {
      "x": origin.x,
      "y": origin.y
    };
    
    var allPaths = globals.paths[i];
    var imagePaths = [];
    
    for (var j = 0; j < allPaths.length; ++j) {
      var curPath = allPaths[j];
      var rect = curPath.bounds;
      
      imagePaths.push({
        "name": curPath.name,
        "type": curPath.shapeType,
        "x": rect.x,
        "y": rect.y,
        "width": rect.width,
        "height": rect.height
      });
    }
    
    imageJson["paths"] = imagePaths;
    
    frames.push(imageJson);
  }
  
  var json = {
    "frames": frames
  };
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
