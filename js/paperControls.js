function changeBackgroundRaster(index) { 
  $("#paperCanvas").show();
  
  deselectPath();
  
  for (var i = 0; i < globals.paths[globals.curBg].length; ++i) {
    var path = globals.paths[globals.curBg][i];
    path.visible = false;
  }
  
  globals.curBg = index;
  var image = globals.bgImages[index];
  
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
  
  for (var i = 0; i < globals.paths[globals.curBg].length; ++i) {
    var path = globals.paths[globals.curBg][i];
    path.visible = true;
  }
  
  paper.view.zoom = globals.zoomLevels[globals.curBg];
  centerView();
  
  changeOnionRaster();
}

function changeOnionRaster(index) { 
  if (globals.bgImages.length <= 1) {
    return;
  }
  
  var overrideVisibility = null;
  if (index === undefined) {
    index = globals.curBg - 1;
    
    if (index < 0) {
      index = globals.bgImages.length - 1;
      
      if (!globals.onionSettings.loop) {
        overrideVisibility = false;
      }
    }
  }
  
  var image = globals.bgImages[index];
  
  if (globals.onionRaster) {
    globals.onionRaster.remove();
  }
  
  globals.onionRaster = new Raster(image);
  
  globals.onionRaster.visible = overrideVisibility == null ? globals.onionSettings.enabled : overrideVisibility;
  globals.onionRaster.opacity = globals.onionSettings.transparency / 100;
  
  globals.onionRaster.moveBelow(globals.bgRaster);
  
  paper.view.draw();
}

function centerView() {   
  paper.view.center = new Point(0, $("#footerBackground").outerHeight(true) / 2);
  
  paper.view.draw();
}

function resetZoom() {
  if (globals.bgImages.length === 0) {
    return;
  }
  
  paper.view.zoom = globals.zoomLevels[globals.curBg] = 1;
  
  centerView();
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
  
  $("#shapeControls").show();
}

function deselectPath() {
  if (globals.selected.path) {
    globals.selected.path.selected = false;
  }
  
  globals.selected.path = null;
  globals.selected.draggable = null;
  globals.selected.isCurve = false;
  
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
