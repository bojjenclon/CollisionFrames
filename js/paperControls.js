function changeBackgroundRaster(index) { 
  $("#paperCanvas").show();
  
  deselectPath();
  
  for (var i = 0; i < globals.paths[globals.curBg].length; ++i) {
    var path = globals.paths[globals.curBg][i];
    path.visible = false;
  }
  
  globals.curBg = index;
  var image = globals.bgImages[index];
  var originPos = globals.origins[globals.curBg];
  
  if (globals.bgRaster) {
    globals.bgRaster.remove();
  }
  
  globals.bgRaster = new Raster(image);
  globals.bgRaster.sendToBack();
  
  if (globals.bgOutline) {
    globals.bgOutline.remove();
  }
  
  var outlineSize = [globals.bgRaster.size.width, globals.bgRaster.size.height];
  var outlinePos = [
    globals.bgRaster.position.x - (outlineSize[0] / 2),
    globals.bgRaster.position.y - (outlineSize[1] / 2)
  ];
  
  globals.bgOutline = new Path.Rectangle({
    strokeColor: "#111111",
    strokeWidth: 1,
    point: outlinePos,
    size: outlineSize,
    opacity: 0.25
  });
  //globals.bgOutline.moveAbove(globals.bgRaster);
  globals.bgOutline.sendToBack();
  
  globals.bgRaster.position.x = globals.bgOutline.position.x = originPos.x;
  globals.bgRaster.position.y = globals.bgOutline.position.y = originPos.y;
  
  for (var i = 0; i < globals.paths[globals.curBg].length; ++i) {
    var path = globals.paths[globals.curBg][i];
    path.visible = true;
  }
  
  paper.view.zoom = globals.zoomLevels[globals.curBg];
  centerView();
  
  fixCenterLines();
  
  $("#xOriginInput").val(globals.origins[globals.curBg].x);
  $("#yOriginInput").val(globals.origins[globals.curBg].y);
  
  changePreviousOnionRasters();
  changeNextOnionRasters();
}

function changePreviousOnionRasters() { 
  if (globals.bgImages.length <= 1 || !globals.onionSettings.previousEnabled) {
    return;
  }
  
  if (globals.onionRasters["previous"].length > 0) {
    globals.onionRasters["previous"].forEach(function(raster, index, array) {
      raster.remove();
    });
  }
  
  var numFrames = globals.onionSettings.framesToDisplay;
  var previousRasters = new Array(numFrames);
  var baseOpacity = globals.onionSettings.transparency / 100;
  
  for (var i = numFrames; i > 0; --i) {
    var index = globals.curBg - i;
    
    if (index < 0) {
      if (!globals.onionSettings.loop) {
        break;
      }
      
      index = globals.bgImages.length - 1;
    }
    
    var onionImage = globals.bgImages[index];
    var onionRaster = new Raster(onionImage);
    
    onionRaster.opacity = baseOpacity - ((i + 1) * globals.onionSettings.transparencyStep);
    onionRaster.position.x = globals.origins[index].x;
    onionRaster.position.y = globals.origins[index].y;
    
    onionRaster.moveBelow(globals.bgRaster);
    
    previousRasters[i] = onionRaster;
  }
  
  globals.onionRasters["previous"] = previousRasters;
  
  paper.view.draw();
}

function changeNextOnionRasters() {
  if (globals.bgImages.length <= 1 || !globals.onionSettings.nextEnabled) {
    return;
  }
  
  if (globals.onionRasters["next"].length > 0) {
    globals.onionRasters["next"].forEach(function(raster, index, array) {
      raster.remove();
    });
  }
  
  var numFrames = globals.onionSettings.framesToDisplay;
  var nextRasters = new Array(numFrames);
  var baseOpacity = globals.onionSettings.transparency / 100;
  
  for (var i = numFrames; i > 0; --i) {
    var index = globals.curBg + i;
    
    if (index >= globals.bgImages.length) {
      if (!globals.onionSettings.loop) {
        break;
      }
      
      index = globals.bgImages.length % index;
    }
    
    var onionImage = globals.bgImages[index];
    var onionRaster = new Raster(onionImage);
    
    onionRaster.opacity = baseOpacity - ((numFrames - i) * globals.onionSettings.transparencyStep);
    onionRaster.position.x = globals.origins[index].x;
    onionRaster.position.y = globals.origins[index].y;
    
    onionRaster.moveAbove(globals.bgRaster);
    
    nextRasters[i] = onionRaster;
  }
  
  globals.onionRasters["next"] = nextRasters;
  
  paper.view.draw();
}

function centerView() {   
  paper.view.center = new Point(0, 0);
  
  fixCenterLines();
}

function resetZoom() {
  if (globals.bgImages.length === 0) {
    return;
  }
  
  paper.view.zoom = globals.zoomLevels[globals.curBg] = 1;
  
  centerView();
}

function fixCenterLines() {
  // create lines to indicate the center of the canvas
  
  var width = globals.canvas.width;
  var height = globals.canvas.height;
  
  if (globals.centerIndicators["horizontal"]) {
    globals.centerIndicators["horizontal"].remove();
  }
  
  if (globals.centerIndicators["vertical"]) {
    globals.centerIndicators["vertical"].remove();
  }
  
  var halfWidth = (width / 2) / paper.view.zoom;
  var halfHeight = (height / 2) / paper.view.zoom;
  
  globals.centerIndicators["horizontal"] = new Path.Line({
    from: [-halfWidth + paper.view.center.x, 0],
    to: [halfWidth + paper.view.center.x, 0],
    strokeColor: "rgba(0, 0, 0, 0.1)"
  });
  globals.centerIndicators["horizontal"].bringToFront();
  
  globals.centerIndicators["vertical"] = new Path.Line({
    from: [0, -halfHeight + paper.view.center.y],
    to: [0, halfHeight + paper.view.center.y],
    strokeColor: "rgba(0, 0, 0, 0.1)"
  });
  globals.centerIndicators["vertical"].bringToFront();
  
  paper.view.draw();
}

function toggleCenterLines() {
  if (globals.centerIndicators["horizontal"]) {
    globals.centerIndicators["horizontal"].visible = !globals.centerIndicators["horizontal"].visible;
  }
  
  if (globals.centerIndicators["vertical"]) {
    globals.centerIndicators["vertical"].visible = !globals.centerIndicators["vertical"].visible;
  }
}

function selectPath(path) {
  path.selected = true;
  
  globals.selected.path = path;
  globals.selected.draggable = path.position;
  globals.selected.isCurve = false;
  globals.selected.path.bringToFront();
  
  var nameInput = $("#nameInput");
  nameInput.val(path.name);
  
  var colorPicker = $("#pathColor");
  colorPicker.minicolors("value", path.fillColor.toCSS(false));
  
  updatePathPosition();
  updatePathDimensions();
  
  $("#imageControls").hide();
  $("#shapeControls").show();
}

function deselectPath() {
  if (globals.selected.path) {
    globals.selected.path.selected = false;
  }
  
  globals.selected.path = null;
  globals.selected.draggable = null;
  globals.selected.isCurve = false;
  
  $("#imageControls").show();
  $("#shapeControls").hide();
}

function addRect() { 
  var fillColor = new Color(Math.random(), Math.random(), Math.random(), 0.75);
  var selectionColor = findComplimentaryColor(fillColor);
  
  var shapeTypeIndex = globals.pathTypeCount[globals.curBg]["rect"];
  var rect = new Path.Rectangle({
    name: "rect" + shapeTypeIndex,
    point: view.center,
    size: [30, 70],
    fillColor: fillColor,
    selectedColor: selectionColor
  });
  rect.shapeType = "rect";
  rect.shapeTypeIndex = shapeTypeIndex;
  globals.paths[globals.curBg].push(rect);
  
  deselectPath();
  selectPath(rect);
  
  paper.view.draw();
  
  globals.pathTypeCount[globals.curBg]["rect"] += 1;
}

function addEllipse() { 
  var fillColor = new Color(Math.random(), Math.random(), Math.random(), 0.75);
  var selectionColor = findComplimentaryColor(fillColor);
  
  var shapeTypeIndex = globals.pathTypeCount[globals.curBg]["ellipse"];
  var ellipse = new Path.Ellipse({
    name: "ellipse" + shapeTypeIndex,
    point: view.center,
    size: [30, 70],
    fillColor: fillColor,
    selectedColor: selectionColor
  });
  ellipse.shapeType = "ellipse";
  ellipse.shapeTypeIndex = shapeTypeIndex;
  globals.paths[globals.curBg].push(ellipse);
  
  deselectPath();
  selectPath(ellipse);
  
  paper.view.draw();
  
  globals.pathTypeCount[globals.curBg]["ellipse"] += 1;
}

function removeShape() { 
  if (globals.selected.path) {
    var pathToRemove = globals.selected.path;
    
    var bgPaths = globals.paths[globals.curBg];
    bgPaths.splice(bgPaths.indexOf(pathToRemove), 1);
    
    pathToRemove.remove();
    
    paper.view.draw();
    
    if (pathToRemove.shapeTypeIndex >= globals.pathTypeCount[globals.curBg][pathToRemove.shapeType] - 1) {
      globals.pathTypeCount[globals.curBg][pathToRemove.shapeType] -= 1;
    }
    
    deselectPath();
  }
}

function replaceRect(options) {
  if (!globals.selected.path) {
    return;
  }
  
  options = options ? options : {};
  
  if (globals.selected.path.shapeType === "rect") {
    var oldPath = globals.selected.path;
    oldPath.remove();
    
    var size = options.size ? options.size : oldPath.bounds;
    var center;
    if (options.center) {
      center = options.center;
    }
    else {
      center = oldPath.position.clone();
      center.x -= size.width / 2;
      center.y -= size.height / 2;
    }
    
    globals.selected.path = new Path.Rectangle({
      name: oldPath.name,
      point: center,
      size: [size.width, size.height],
      fillColor: oldPath.fillColor,
      selectedColor: oldPath.selectedColor,
      selected: oldPath.selected
    });
    globals.selected.path.shapeType = "rect";
    
    globals.paths[globals.curBg].splice(globals.paths[globals.curBg].indexOf(oldPath), 1);
    globals.paths[globals.curBg].push(globals.selected.path);
    
    paper.view.draw();
  }
}

function replaceEllipse(options) {
  if (!globals.selected.path) {
    return;
  }
  
  options = options ? options : {};
  
  if (globals.selected.path.shapeType === "ellipse") {
    var oldPath = globals.selected.path;
    oldPath.remove();
    
    var size = options.size ? options.size : oldPath.bounds;
    var center;
    if (options.center) {
      center = options.center;
    }
    else {
      center = oldPath.position.clone();
      center.x -= size.width / 2;
      center.y -= size.height / 2;
    }
    
    globals.selected.path = new Path.Ellipse({
      name: oldPath.name,
      point: center,
      size: [size.width, size.height],
      fillColor: oldPath.fillColor,
      selectedColor: oldPath.selectedColor,
      selected: oldPath.selected
    });
    globals.selected.path.shapeType = "ellipse";
    
    globals.paths[globals.curBg].splice(globals.paths[globals.curBg].indexOf(oldPath), 1);
    globals.paths[globals.curBg].push(globals.selected.path);
    
    paper.view.draw();
  }
}

function replacePath(options) { 
  if (globals.selected.path.shapeType === "rect") {
    replaceRect(options);
  }
  else if (globals.selected.path.shapeType === "ellipse") {
    replaceEllipse(options);
  }
}
