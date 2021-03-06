var globals = {
  canvas: null,
  ctx: null,
  
  images: [],
  curImage: 0,
  
  bgRaster: null,
  onionRasters: {
    "previous": [],
    "next": []
  },
  
  bgOutline: null,
  
  bgImages: [],
  curBg: 0,
  
  bgFilePaths: [],
  
  centerIndicators: {
    "vertical": null,
    "horizontal": null
  },
  
  origins: [],
  
  onionSettings: {
    previousEnabled: false,
    nextEnabled: false,
    transparency: 30,
    transparencyStep: 0.05,
    loop: true,
    framesToDisplay: 1
  },
  
  animationSettings: {
    currentFrame: 0,
    frameDelay: 80,
    loop: true
  },
  
  thumbnails: [],
  
  pathTypeCount: [],
  
  paths: [],
  
  useIndividualZoomLevels: false,
  
  masterZoomLevel: 1,
  zoomLevels: [],
  
  selected: {
    path: null,
    draggable: null,
    isSegment: false,
    isCurve: false
  },
  
  keyDown: {
    "space": false,
    "x": false,
    "y": false
  },
  
  fileName: null
};

paper.install(window);

$(document).ready(function() {
  globals.canvas = document.getElementById("paperCanvas");
  globals.ctx = globals.canvas.getContext("2d");
  
  removeHiddenAtStart();
  
  fixRightMenu();
  
  $("#paperCanvas").hide();
  hideControlButtons();
  
  $("#zoomControls").hide();
  $("#originControls").hide();
  
  $("#shapeControls").hide();
  $("#propertiesControls").hide();
  $("#positionControls").hide();
  $("#sizeControls").hide();
  
  $("#rightMenu").css("visibility", "hidden");
  
  var rgbaObjectConvert = function(css) {
    var openingParnethesis = css.indexOf("(");
    var firstComma = css.indexOf(",");
    var secondComma = css.indexOf(",", firstComma + 1);
    var thirdComma = css.indexOf(",", secondComma + 1);
    var closingParenthesis = css.indexOf(")");
    
    var r = parseInt(css.substring(openingParnethesis + 1, firstComma));
    var g = parseInt(css.substring(firstComma + 1, secondComma));
    var b = parseInt(css.substring(secondComma + 1, thirdComma >= 0 ? thirdComma : closingParenthesis));
    var a = thirdComma >= 0 ? parseFloat(css.substring(thirdComma + 1, closingParenthesis)) : 1;
    
    return { "r": r, "g": g, "b": b, "a": a };
  };
  
  var colorChanged = function(value, opacity) {
    var rgba = rgbaObjectConvert(value);
    
    var fillColor = new Color(rgba.r / 255, rgba.g / 255, rgba.b / 255, rgba.a);
    var selectionColor = findComplimentaryColor(fillColor);
    
    globals.selected.path.fillColor = fillColor;
    globals.selected.path.selectedColor = selectionColor;
    
    paper.view.draw();
  };

  $("#pathColor").minicolors({
    format: "rgb",
    opacity: true,
    change: colorChanged,
    changeDelay: 250
  });
  
  paper.setup("paperCanvas");
    
  // create tools to control mouse and keyboard commands
  
  var tool = new Tool();
  
  tool.onMouseDown = onMouseDown;
  tool.onMouseUp = onMouseUp;
  tool.onMouseDrag = onMouseDrag;
  
  tool.onKeyDown = onKeyDown;
  tool.onKeyUp = onKeyUp;
  
  $("#paperCanvas").mousewheel(onMouseWheel);
  
  $(window).resize(onResize);
  
  // prevent buttons from recieving focus, so spacebar/enter doesn't activate the previously clicked button
  $("button").mousedown(function(event) {
    event.preventDefault();
  });
  
  $("#nameInput").keyup(onNameKeyUp);
  
  $("#zoomLevelInput").keydown(onNumericInputKeyDown);
  $("#xOriginInput").keydown(onNumericInputKeyDown);
  $("#yOriginInput").keydown(onNumericInputKeyDown);
  $("#xPosInput").keydown(onNumericInputKeyDown);
  $("#yPosInput").keydown(onNumericInputKeyDown);
  $("#widthInput").keydown(onNumericInputKeyDown);
  $("#heightInput").keydown(onNumericInputKeyDown);
  
  $("#zoomLevelInput").bind("input", onZoomLevelChange);
  $("#xOriginInput").bind("input", onXOriginChange);
  $("#yOriginInput").bind("input", onYOriginChange);
  $("#xPosInput").bind("input", onXPosChange);
  $("#yPosInput").bind("input", onYPosChange);
  $("#widthInput").bind("input", onWidthChange);
  $("#heightInput").bind("input", onHeightChange);
  
  $("#individualZoomLevels").change(onIndividualZoomLevelsChange);
  
  $(window).trigger("resize");
});

function panView(delta, speed) {
  var horizontalPan = globals.keyDown.x;
  var verticalPan = globals.keyDown.y;
  
  var viewCenter = paper.view.center;
  
  var offset = new Point(-delta.x, -delta.y);
  
  if (horizontalPan) {
    offset.y = 0;
  }
  else if (verticalPan) {
    offset.x = 0;
  }
  
  offset = offset.multiply(speed ? speed : 0.4);
  viewCenter = viewCenter.add(offset);
  
  paper.view.center = viewCenter;
  paper.view.draw();
  
  if (globals.bgImages.length > 0) {
    fixCenterLines();
  }
}

function onMouseDown(event) {
  if (document.activeElement) {
    document.activeElement.blur();
  }
  
  if (globals.selected.path) {
    globals.selected.path.selected = false;
  }
  
  var selectedThisFrame = false;
  if (event.item) {
    var cantBeSelected = [
      globals.bgRaster,
      globals.bgOutline,
      globals.centerIndicators["horizontal"],
      globals.centerIndicators["vertical"]
    ];
    cantBeSelected = cantBeSelected.concat(globals.onionRasters["previous"]);
    cantBeSelected = cantBeSelected.concat(globals.onionRasters["next"]);
    
    if (cantBeSelected.indexOf(event.item) > -1) {
      deselectPath();
      
      return;
    }
    
    selectedThisFrame = (event.item != globals.selected.path);
    
    globals.selected.draggable = event.item.position;
    
    if (selectedThisFrame) {
      selectPath(event.item);
    }
  }
  else {
    deselectPath();
    
    return;
  }
  
  if (globals.selected.path && !selectedThisFrame) {
    var hitResult;
    
    if (globals.selected.path.shapeType === "ellipse") {
      hitResult = globals.selected.path.hitTest(event.point, { 
        segments: true,
        fill: true,
        tolerance: 5
      });
    }
    else {
      hitResult = globals.selected.path.hitTest(event.point, { 
        fill: true,
        curves: true,
        tolerance: 5
      });
    }
    
    if (hitResult) {
      globals.selected.path.selected = true;
      globals.selected.isSegment = false;
      globals.selected.isCurve = false;
      
      if (hitResult.type == "handle-in") {
        globals.selected.draggable = hitResult.segment.handleIn;
      } 
      else if (hitResult.type == "handle-out") {
        globals.selected.draggable = hitResult.segment.handleOut;
      }
      else if (hitResult.type == "segment") {
        globals.selected.draggable = hitResult.segment;
        globals.selected.isSegment = true;
      }
      else if (hitResult.type == "fill") {
        globals.selected.draggable = hitResult.item.position;
      }
      else if (hitResult.type == "curve") {
        globals.selected.draggable = hitResult.location.curve;
        globals.selected.isCurve = true;
      }
      else {
        console.log("Unknown element clicked: " + hitResult.type);
      }
    }
  }
}

function onMouseUp(event) {
  globals.selected.draggable = null;
}

function dragLeftRight(firstPoints, secondPoints, delta) {
  if (firstPoints.length !== secondPoints.length) {
    // error
    return null;
  }
  
  var numPoints = firstPoints.length;
  
  for (var i = 0; i < numPoints; ++i) {
    var firstPoint = firstPoints[i];
    var secondPoint = secondPoints[i];
    
    var biggerPos, smallerPos;
    if (firstPoint.x > secondPoint.x) {
      biggerPos = firstPoint;
      smallerPos = secondPoint;
    }
    else {
      biggerPos = secondPoint;
      smallerPos = firstPoint;
    }
    
    firstPoint.x += delta;
    secondPoint.x -= delta;
    
    if (biggerPos.x <= smallerPos.x) {
      firstPoint.x -= delta;
      secondPoint.x += delta;
      
      return;
    }
    
    var actualFirstPos = paper.view.projectToView(firstPoint);
    var actualSecondPos = paper.view.projectToView(secondPoint);
    
    var dif = 0;
    var canvasWidth = $("#paperCanvas").width();
    
    if (actualFirstPos.x > canvasWidth) {
      dif = -delta;
    }
    else if (actualFirstPos.x < 0) {
      dif = -delta;
    }
    
    if (actualSecondPos.x > canvasWidth) {
      dif = -delta;
    }
    else if (actualSecondPos.x < 0) {
      dif = -delta;
    }
    
    firstPoint.x += dif;
    secondPoint.x -= dif;
  }
  
  updatePathDimensions();
}

function dragUpDown(firstPoints, secondPoints, delta) {
  if (firstPoints.length !== secondPoints.length) {
    // error
    return null;
  }
  
  var numPoints = firstPoints.length;
  
  for (var i = 0; i < numPoints; ++i) {
    var firstPoint = firstPoints[i];
    var secondPoint = secondPoints[i];
    
    var biggerPos, smallerPos;
    if (firstPoint.y > secondPoint.y) {
      biggerPos = firstPoint;
      smallerPos = secondPoint;
    }
    else {
      biggerPos = secondPoint;
      smallerPos = firstPoint;
    }
    
    firstPoint.y += delta;
    secondPoint.y -= delta;
    
    if (biggerPos.y <= smallerPos.y) {
      firstPoint.y -= delta;
      secondPoint.y += delta;
      
      return;
    }

    var actualFirstPos = paper.view.projectToView(firstPoint);
    var actualSecondPos = paper.view.projectToView(secondPoint);
    
    var dif = 0;
    var canvasHeight = $("#paperCanvas").height();
    var canvasTop = $("#headerBackground").outerHeight(true) - $("#paperCanvas").position().top;
    
    if (actualFirstPos.y > canvasHeight) {
      dif = -delta;
    }
    else if (actualFirstPos.y < canvasTop) {
      dif = -delta;
    }
    
    if (actualSecondPos.y > canvasHeight) {
      dif = -delta;
    }
    else if (actualSecondPos.y < canvasTop) {
      dif = -delta;
    }
    
    firstPoint.y += dif;
    secondPoint.y -= dif;
  }
  
  updatePathDimensions();
}

function onMouseDrag(event) {
  if (globals.keyDown.space) {
    panView(event.delta);
  }
  else if (globals.selected.draggable) {
    var ellipseChanged = false;
    
    if (globals.selected.isSegment) {
      ellipseChanged = (globals.selected.path.shapeType === "ellipse");
      
      if (globals.selected.draggable.index % 2 === 0) {
        var firstPoints = [globals.selected.draggable.point];
        var secondPoints = [globals.selected.draggable.next.next.point];
        
        dragLeftRight(firstPoints, secondPoints, event.delta.x);
      }
      else {
        var firstPoints = [globals.selected.draggable.point];
        var secondPoints = [globals.selected.draggable.next.next.point];
        
        dragUpDown(firstPoints, secondPoints, event.delta.y);
      }
    }
    else if (globals.selected.isCurve) {
      if (globals.selected.draggable.index % 2 == 0) {
        var oppositeCurve = globals.selected.draggable.next.next;
        
        var firstPoints = [globals.selected.draggable.point1, globals.selected.draggable.point2];
        var secondPoints = [oppositeCurve.point1, oppositeCurve.point2];
        
        dragLeftRight(firstPoints, secondPoints, event.delta.x);
      }
      else {
        var oppositeCurve = globals.selected.draggable.next.next;
        
        var firstPoints = [globals.selected.draggable.point1, globals.selected.draggable.point2];
        var secondPoints = [oppositeCurve.point1, oppositeCurve.point2];
        
        dragUpDown(firstPoints, secondPoints, event.delta.y);
      }
    }
    else {
      var horizontalPan = globals.keyDown.x;
      var verticalPan = globals.keyDown.y;
  
      if (!verticalPan) {
        globals.selected.draggable.x += event.delta.x;
      }
      if (!horizontalPan) {
        globals.selected.draggable.y += event.delta.y;
      }
      
      updatePathPosition();
    }
    
    if (ellipseChanged) {
      replaceEllipse();
      
      if (globals.selected.isSegment) {
        globals.selected.draggable = globals.selected.path.segments[globals.selected.draggable.index];
      }
    }
  }
  else {
    panView(event.delta);
  }
}

function onMouseWheel(event) {
  var setZoomConstrained = function(zoom) {
    zoom = Math.max(zoom, 0.1);
    
    if (zoom != view.zoom) {
      view.zoom = zoom;
      return zoom;
    }
    
    return null;
  };
  
  var delta = event.deltaY;
  
  //var centerPos = new Point(globals.canvas.width / 2, globals.canvas.height / 2);
  var centerPos = new Point(event.clientX, event.clientY);
  var oldZoom = view.zoom;
  var oldCenter = view.center;
  var viewPos = view.viewToProject(centerPos);
  
  var zoomFactor = 1.1;
  var newZoom = delta > 0
      ? view.zoom * zoomFactor
      : view.zoom / zoomFactor;
  newZoom = setZoomConstrained(newZoom);
  
  if (!newZoom) {
    return;
  }
  
  if (globals.useIndividualZoomLevels) {
    globals.zoomLevels[globals.curBg] = newZoom;
  }
  else {
    globals.masterZoomLevel = newZoom;
  }
  
  $("#zoomLevelInput").val(Math.round(newZoom * 100) / 100);
  
  var zoomScale = oldZoom / newZoom;
  var centerAdjust = viewPos.subtract(oldCenter);
  var offset = viewPos.subtract(centerAdjust.multiply(zoomScale)).subtract(oldCenter);

  view.center = view.center.add(offset);
  
  paper.view.draw();
  
  fixCenterLines();
}

function onKeyDown(event) {
  if (event.key === "space") {
    globals.keyDown.space = true;
  }
  else if (event.key === "x") {
    globals.keyDown.x = true;
  }
  else if (event.key === "y") {
    globals.keyDown.y = true;
  }
}

function onKeyUp(event) {
  if (event.key === "delete" && globals.selected.path) {
    removeShape();
  }
  else if (event.key === "space") {
    globals.keyDown.space = false;
  }
  else if (event.key === "x") {
    globals.keyDown.x = false;
  }
  else if (event.key === "y") {
    globals.keyDown.y = false;
  }
}

function onResize(event) {
  var width, height;
  
  // calculate new side menu size
  var rightMenu = $("#rightMenu");
  height = $(window).height() - $("#headerBackground").outerHeight(true);
  rightMenu.height(height - 3);
  
  fixWindow();
  
  // calculate new canvas size
  var jCanvas = $(globals.canvas);
  
  width = $(window).width() - rightMenu.outerWidth(true);
  height -= $("#footerBackground").outerHeight(true);
  
  var viewOffset = new Point(
    (jCanvas.width() - width) / 2 / paper.view.zoom,
    (jCanvas.height() - height) / 2 / paper.view.zoom
  );
  
  jCanvas.width(width);
  jCanvas.height(height);
  
  paper.view.viewSize = new Size(width, height);
  if (globals.bgRaster) {
    paper.view.center = paper.view.center.add(viewOffset);
  }
  
  $("#footerBackground").width(width);
  
  if (globals.bgImages.length > 0) {
    fixCenterLines();
  }
  
  fixModal();
  
  paper.view.draw();
}
