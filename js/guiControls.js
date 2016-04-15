var remote = require("remote");

var arrowKeys = [37, 38, 39, 40];
// all numbers + backspace
var validNumericFieldInputs = [8, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 110, 190];

function onNumericInputKeyDown(event) { 
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  if (validNumericFieldInputs.indexOf(keyCode) < 0) {
    event.preventDefault();
    return;
  }
}

function onWidthKeyUp(event) { 
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newWidth = parseFloat($("#widthInput").val());
  
  if (isNaN(newWidth)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  bounds.width = newWidth;
  
  var center = globals.selected.path.position.clone();
  center.x -= bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onWidthChange(event) { 
  var newWidth = parseFloat($("#widthInput").val());
  
  if (isNaN(newWidth)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  bounds.width = newWidth;
  
  var center = globals.selected.path.position.clone();
  center.x -= bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onHeightKeyUp(event) { 
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newHeight =  parseFloat($("#heightInput").val());
  
  if (isNaN(newHeight)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  bounds.height = newHeight;
  
  var center = globals.selected.path.position.clone();
  center.x -= bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onHeightChange(event) { 
  var newHeight =  parseFloat($("#heightInput").val());
  
  if (isNaN(newHeight)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  bounds.height = newHeight;
  
  var center = globals.selected.path.position.clone();
  center.x -= bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onXKeyUp(event) { 
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newX = parseFloat($("#xInput").val());
  
  if (isNaN(newX)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  var center = globals.selected.path.position.clone();
  
  center.x = newX - bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onXChange(event) { 
  var newX = parseFloat($("#xInput").val());
  
  if (isNaN(newX)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  var center = globals.selected.path.position.clone();

  center.x = newX - bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onYKeyUp(event) { 
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newY = parseFloat($("#yInput").val());
  
  if (isNaN(newY)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  var center = globals.selected.path.position.clone();
  
  center.x -= bounds.width / 2;
  center.y = newY - bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onYChange(event) { 
  var newY = parseFloat($("#yInput").val());
  
  if (isNaN(newY)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  var center = globals.selected.path.position.clone();
  
  center.x -= bounds.width / 2;
  center.y = newY - bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onNameKeyUp(event) { 
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  globals.selected.path.name = $("#nameInput").val();
}

function arrangeImages(changeToImage) { 
  if (globals.bgImages.length <= 1) {
    return;
  }
  
  changeToImage = changeToImage ? changeToImage : 0;
  
  var modalRoot = document.createElement("div");
  var jRoot = $(modalRoot);
  jRoot.attr("id", "modal");
  jRoot.addClass("mui--no-user-select");
  
  // construct header
  
  var modalHeader = $("<div></div>'");
  modalHeader.attr("id", "modalHeader");
  
  modalHeader.append("<div>Arrange Images</div>");
  
  // construct content
  
  var modalContent = $("<div></div>'");
  modalContent.attr("id", "modalContent");
  modalContent.addClass("mui-container");
  
  var modalList = $("<ol></ol>");
  modalList.addClass("modalSortable");
  
  for (var i = 0; i < globals.thumbnails.length; ++i) {
    var row = $("<li></li>");
    row.addClass("modalRow");
    
    row.append(globals.thumbnails[i]);
    row.append("<div class='index' style='display: none;'>" + i + "</div>");
    
    modalList.append(row);
  }
  
  modalContent.append(modalList);
  
  // construct footer
  
  var modalFooter = $("<div></div>'");
  modalFooter.attr("id", "modalFooter");
  
  var acceptButton = $("<button>Accept</button>");
  acceptButton.addClass("mui-btn");
  acceptButton.addClass("mui-btn--primary");
  acceptButton.click(function() {
    var sortedBgImages = new Array(globals.bgImages.length);
    var sortedThumbnails = new Array(globals.thumbnails.length);
    
    var allRows = modalList.children();
    for (var i = 0; i < allRows.length; ++i) {
      var jRow = $(allRows[i]);
      var originalIndex = parseInt(jRow.find(".index").html());
      
      sortedBgImages[i] = globals.bgImages[originalIndex];
      sortedThumbnails[i] = globals.thumbnails[originalIndex];
      
      if (originalIndex === globals.curBg) {
        globals.curBg = i;
      }
    }
    
    globals.bgImages = sortedBgImages;
    globals.thumbnails = sortedThumbnails;
    
    updateCurBgIndex(changeToImage);
    changeBackgroundRaster(changeToImage);
    
    mui.overlay("off");
  });
  
  var cancelButton = $("<button>Cancel</button>");
  cancelButton.addClass("mui-btn");
  cancelButton.addClass("mui-btn--primary");
  cancelButton.click(function() {
    mui.overlay("off");
  });
  
  modalFooter.append(acceptButton);
  modalFooter.append(cancelButton);
  
  //construct modal
  jRoot.append(modalHeader);
  jRoot.append(modalContent);
  jRoot.append(modalFooter);
  
  jRoot.css("visibility", "hidden");
  $("body").append(jRoot);
  
  $(".modalSortable").sortable({
    hoverClass: "is-hovered"
  });
  
  // adjust content size/position
  modalContent.css("top", modalHeader.outerHeight(true) + "px");
  modalContent.css("height", (jRoot.height() - modalHeader.outerHeight(true) - modalFooter.outerHeight(true)) + "px");
  
  // center modal window
  var xPos = $(window).width() / 2 - jRoot.width() / 2;
  var yPos = $(window).height() / 2 - jRoot.height() / 2;
  
  jRoot.css("visibility", "visible");
  
  modalRoot.style.left = xPos + "px";
  modalRoot.style.top = yPos + "px";
  
  var onModalClose = function() {
    
  };

  var options = {
    "keyboard": false,
    "static": true,
    "onclose": onModalClose
  };

  // show modal
  mui.overlay("on", options, modalRoot);
}

function closeProject() { 
  if (globals.bgImages.length === 0) {
    return;
  }
  
  var numImages = globals.bgImages.length;
  for (var i = 0; i < numImages; ++i) {
    var imagePaths = globals.paths[i];
    for (var j = 0; j < imagePaths.length; ++j) {
      imagePaths[j].remove();
    }
  }
  
  globals.bgRaster.remove();
  
  paper.view.draw();
  
  globals.fileName = null;
  
  globals.curBg = 0;
  globals.bgImages = [];
  globals.thumbnails = [];
  globals.paths = [];
  globals.pathTypeCount = [];
  globals.zoomLevels = [];
  
  $("#rightMenu").css("visibility", "hidden");
  hideControlButtons();
}

function onionSettings() { 
  if (globals.bgImages.length <= 1) {
    return;
  }
  
  var modalRoot = document.createElement("div");
  var jRoot = $(modalRoot);
  jRoot.attr("id", "modal");
  jRoot.addClass("mui--no-user-select");
  
  // construct header
  
  var modalHeader = $("<div id='modalHeader'></div>'");
  modalHeader.append("<div>Onion Skin Settings</div>");
  
  // construct content
  
  var modalContent = $("<div id='modalContent' class='mui-container mui--text-center'></div>'");
  
  var modalOnionEnabled = $("<div class='mui-checkbox'>" +
                              "<label>" +
                                "<input type='checkbox'" + (globals.onionSettings.enabled ? "checked" : "") + ">" +
                                "Enable Onion Skin" +
                              "</label>" +
                            "</div>");
  modalContent.append(modalOnionEnabled);
  
  modalContent.append("<div class='mui-divider'></div><br />");
  
  // transparency inputs
  
  var transparencySlider = document.createElement("div");
  noUiSlider.create(transparencySlider, {
    start: [globals.onionSettings.transparency],
    step: 1,
    range: {
      "min": 0,
      "max": 100
    },
    animate: false
  });
  if (!globals.onionSettings.enabled) {
    transparencySlider.setAttribute("disabled", true);
  }
  modalContent.append(transparencySlider);
  
  var jTransparencySlider = $(transparencySlider);
  jTransparencySlider.attr("id", "transparencySlider");
  jTransparencySlider.addClass("noUi-extended");
  
  var transparencyInput = $("<input type='number' id='transparencyInput' class='mui--text-dark' min='0' max='100' step='1' value='" + globals.onionSettings.transparency + "' " + (globals.onionSettings.enabled ? "" : "disabled") + " />");
  modalContent.append(transparencyInput);
  
  // misc inputs
  
  var modalOnionLoop = $("<div class='mui-checkbox'>" +
                              "<label>" +
                                "<input type='checkbox'" + (globals.onionSettings.loop ? "checked" : "") + ">" +
                                "Loop" +
                              "</label>" +
                            "</div>");
  modalContent.append(modalOnionLoop);
  
  // connect events
  
  modalOnionEnabled.change(function() {
    var checkbox = modalOnionEnabled.find("input[type='checkbox']");
    var value = checkbox.prop("checked");
    
    if (value) {
      transparencySlider.removeAttribute("disabled");
    }
    else {
      transparencySlider.setAttribute("disabled", true);
    }
    
    transparencyInput.prop("disabled", !value);
    
    globals.onionSettings.enabled = value;
    globals.onionRaster.visible = value;
    
    paper.view.draw();
  });
  
  transparencySlider.noUiSlider.on("update", function() {
    var value = transparencySlider.noUiSlider.get();
    
    transparencyInput.val(Math.floor(value));
    
    globals.onionSettings.transparency = value;
    globals.onionRaster.opacity = value / 100;
    
    paper.view.draw();
  });
  
  transparencyInput.bind("input", function() {
    var value = transparencyInput.val();
    
    transparencySlider.noUiSlider.set(value);
    
    globals.onionSettings.transparency = value;
    globals.onionRaster.opacity = value / 100;
    
    paper.view.draw();
  });
  
  modalOnionLoop.change(function() {
    var checkbox = modalOnionLoop.find("input[type='checkbox']");
    var value = checkbox.prop("checked");
    
    globals.onionSettings.loop = value;
    
    if (globals.curBg === 0) {
      globals.onionRaster.visible = value;
      
      paper.view.draw();
    }
  });
  
  // construct footer
  
  var modalFooter = $("<div id='modalFooter'></div>'");
 
  var doneButton = $("<button class='mui-btn mui-btn--primary'>Done</button>");
  doneButton.click(function() {
    mui.overlay("off");
  });
  
  modalFooter.append(doneButton);
  
  //construct modal
  jRoot.append(modalHeader);
  jRoot.append(modalContent);
  jRoot.append(modalFooter);
  
  jRoot.css("visibility", "hidden");
  $("body").append(jRoot);
  
  // adjust content size/position
  modalContent.css("top", modalHeader.outerHeight(true) + "px");
  modalContent.css("height", (jRoot.height() - modalHeader.outerHeight(true) - modalFooter.outerHeight(true)) + "px");
  
  // center modal window
  var xPos = $(window).width() / 2 - jRoot.width() / 2;
  var yPos = $(window).height() / 2 - jRoot.height() / 2;
  
  jRoot.css("visibility", "visible");
  
  modalRoot.style.left = xPos + "px";
  modalRoot.style.top = yPos + "px";
  
  var onModalClose = function() {
    
  };

  var options = {
    "keyboard": false,
    "static": true,
    "onclose": onModalClose
  };

  // show modal
  mui.overlay("on", options, modalRoot);
}

function previewAnimation() { 
  if (globals.bgImages.length <= 1) {
    return;
  }
  
  var modalRoot = document.createElement("div");
  var jRoot = $(modalRoot);
  jRoot.attr("id", "modal");
  jRoot.addClass("mui--no-user-select");
  
  // construct header
  
  var modalHeader = $("<div id='modalHeader'></div>'");
  modalHeader.append("<div>Preview Animation</div>");
  
  // construct content
  
  var modalContent = $("<div id='modalContent' class='mui-container mui--text-center'></div>'");
  var modalImageContainer = $("<div id='animationContainer'></div>");
  
  modalContent.append(modalImageContainer);
  
  modalContent.append("<div class='mui-divider'></div><br />");
  
  // animation timing inputs
  
  var frameDelaySlider = document.createElement("div");
  noUiSlider.create(frameDelaySlider, {
    start: [globals.animationSettings.frameDelay],
    step: 1,
    range: {
      "min": 1,
      "max": 250
    },
    animate: false
  });
  modalContent.append(frameDelaySlider);
  
  var jFrameDelaySlider = $(frameDelaySlider);
  jFrameDelaySlider.attr("id", "frameDelaySlider");
  jFrameDelaySlider.addClass("noUi-extended");
  
  var frameDelayInputRow = $("<label>Frame Delay (ms): <input type='number' id='frameDelayInput' class='mui--text-dark' min='1' max='250' step='1' value='" + globals.animationSettings.frameDelay + "' /></label>");
  modalContent.append(frameDelayInputRow);
  
  var frameDelayInput = frameDelayInputRow.find("input[type='number']");
  
  // events
  
  var nextDrawFrame = null;
  var draw = function() {
    modalImage = $(globals.bgImages[globals.animationSettings.currentFrame]).clone();
    modalImage.attr("id", "animationPreviewImage");
    modalImageContainer.html(modalImage);
    
    globals.animationSettings.currentFrame++;
    
    if (globals.animationSettings.currentFrame >= globals.bgImages.length) {
      globals.animationSettings.currentFrame = 0;
      
      if (!globals.animationSettings.loop) {
        return;
      }
    }
    
    nextDrawFrame = setTimeout(draw, globals.animationSettings.frameDelay);
  };
  
  draw();
  
  frameDelaySlider.noUiSlider.on("update", function() {
    var value = frameDelaySlider.noUiSlider.get();
    
    frameDelayInput.val(Math.floor(value));
    
    globals.animationSettings.frameDelay = value;
    
    if (nextDrawFrame) {
      clearTimeout(nextDrawFrame);
      
      nextDrawFrame = setTimeout(draw, globals.animationSettings.frameDelay);
    }
  });
  
  frameDelayInput.bind("input", function() {
    var value = frameDelayInput.val();
    
    frameDelaySlider.noUiSlider.set(value);
    
    globals.animationSettings.frameDelay = value;
    
    if (nextDrawFrame) {
      clearTimeout(nextDrawFrame);
      
      nextDrawFrame = setTimeout(draw, globals.animationSettings.frameDelay);
    }
  });
  
  // construct footer
  
  var modalFooter = $("<div id='modalFooter'></div>'");
 
  var doneButton = $("<button class='mui-btn mui-btn--primary'>Done</button>");
  doneButton.click(function() {
    mui.overlay("off");
  });
  
  modalFooter.append(doneButton);
  
  //construct modal
  jRoot.append(modalHeader);
  jRoot.append(modalContent);
  jRoot.append(modalFooter);
  
  jRoot.css("visibility", "hidden");
  $("body").append(jRoot);
  
  // adjust content size/position
  modalContent.css("top", modalHeader.outerHeight(true) + "px");
  modalContent.css("height", (jRoot.height() - modalHeader.outerHeight(true) - modalFooter.outerHeight(true)) + "px");
  
  // center modal window
  var xPos = $(window).width() / 2 - jRoot.width() / 2;
  var yPos = $(window).height() / 2 - jRoot.height() / 2;
  
  jRoot.css("visibility", "visible");
  
  modalRoot.style.left = xPos + "px";
  modalRoot.style.top = yPos + "px";
  
  var onModalClose = function() {
    
  };

  var options = {
    "keyboard": false,
    "static": true,
    "onclose": onModalClose
  };

  // show modal
  mui.overlay("on", options, modalRoot);
}

function updatePathPosition() { 
  var position = globals.selected.path.position;
  
  position.x = Math.round(position.x * 100) / 100;
  position.y = Math.round(position.y * 100) / 100;
  
  $("#xInput").val(position.x);
  $("#yInput").val(position.y);
}

function updatePathDimensions() { 
  var bounds = globals.selected.path.bounds;
  
  bounds.width = Math.round(bounds.width * 100) / 100;
  bounds.height = Math.round(bounds.height * 100) / 100;
  
  $("#widthInput").val(bounds.width);
  $("#heightInput").val(bounds.height);
}

function previousBackground() { 
  if (globals.bgImages.length <= 1) {
    return;
  }
  
  var index = globals.curBg - 1;
  
  if (index < 0) {
    index = globals.bgImages.length - 1;
  }
  
  updateCurBgIndex(index);
  changeBackgroundRaster(index);
}

function nextBackground() { 
  if (globals.bgImages.length <= 1) {
    return;
  }
  
  var index = globals.curBg + 1;
  
  if (index >= globals.bgImages.length) {
    index = 0;
  }
  
  updateCurBgIndex(index);
  changeBackgroundRaster(index);
}

function updateCurBgIndex(index, incrementIndex) {
  incrementIndex = incrementIndex !== false; // default to true
  
  if (incrementIndex) {
    index++;
  }
  
  $("#curBgIndex").html(index + "/" + globals.bgImages.length);
}

function calculateButtonsWidth() {
  var width = 0;
  var allButtons = $("#footer").children();
  for (var i = 0; i < allButtons.length; ++i) {
    var domButton = allButtons[i];
    var jButton = $(domButton);
    
    if (jButton.is(":visible")) {
      width += jButton.outerWidth(true);
    }
  }
  
  return width;
}

function calculateButtonsHeight() {
  var height = 0;
  var allButtons = $("#footer").children();
  for (var i = 0; i < allButtons.length; ++i) {
    var domButton = allButtons[i];
    var jButton = $(domButton);
    
    if (jButton.is(":visible")) {
      var curButtonHeight = jButton.outerHeight(true);
      
      if (curButtonHeight > height) {
        height = curButtonHeight;
      }
    }
  }
  
  return height;
}

function calculateButtonsSize() { 
  return {
    "width": calculateButtonsWidth(),
    "height": calculateButtonsHeight()
  };
}

function showControlButtons() { 
  if (globals.bgImages.length > 1) {
    $("#previousBackground").show();
    $("#curBgIndex").show();
    $("#nextBackground").show();
  }
  else {
    $("#previousBackground").hide();
    $("#curBgIndex").hide();
    $("#nextBackground").hide();
  }
  
  $("#addRect").show();
  $("#addEllipse").show();
  $("#removeShape").show();
  
  adjustWindowConstraints();
  fixWindow();
}

function hideControlButtons() { 
  $("#previousBackground").hide();
  $("#curBgIndex").hide();
  $("#nextBackground").hide();
  $("#addRect").hide();
  $("#addEllipse").hide();
  $("#removeShape").hide();
  
  adjustWindowConstraints();
  fixWindow();
}

function adjustWindowConstraints() {
  var minWidth = calculateButtonsWidth();
  
  var win = remote.getCurrentWindow();
  win.setMinimumSize(minWidth + 140, 0);
}

function removeHiddenAtStart() { 
  $("#rightMenu").removeClass("hiddenAtStart");
  $("#footerBackground").removeClass("hiddenAtStart");
}

function fixRightMenu() { 
  var rightMenu = $("#rightMenu");
  var allChildren = rightMenu.children();
  var allButtons = rightMenu.find(".mui-btn");
  
  var maxWidth = 0;
  for (var i = 0; i < allChildren.length; ++i) {
    var domChild = allChildren[i];
    var jChild = $(domChild);
    var outerWidth = jChild.outerWidth(true);
    
    if (outerWidth > maxWidth) {
      maxWidth = outerWidth;
    }
  }
  
  for (var i = 0; i < allButtons.length; ++i) {
    var domButton = allButtons[i];
    var jButton = $(domButton);
    
    if (maxWidth > jButton.outerWidth(true)) {
      jButton.outerWidth(maxWidth);
    }
  }
  
  var padding = (allButtons.length * 10);
  rightMenu.css("min-width", maxWidth + padding);
}

function fixWindow() {
  var win = remote.getCurrentWindow();
  
  var minSize = win.getMinimumSize();
  var curSize = win.getSize();
  
  var adjustedWidth = -1;
  var adjustedHeight = -1;
  
  if (minSize[0] > curSize[0]) {
    adjustedWidth = minSize[0];
  }
  if (minSize[1] > curSize[1]) {
    adjustedHeight = minSize[1];
  }
  
  if (adjustedWidth > -1 || adjustedHeight > -1) {
    if (adjustedWidth < 0) {
      adjustedWidth = curSize[0];
    }
    if (adjustedHeight < 0) {
      adjustedHeight = curSize[1];
    }
    
    win.setSize(adjustedWidth, adjustedHeight);
  }
}

function fixModal() { 
  var jModal = $("#modal");
  
  if (jModal) {
    var xPos = $(window).width() / 2 - jModal.width() / 2;
    var yPos = $(window).height() / 2 - jModal.height() / 2;
    
    jModal.css("left", xPos + "px");
    jModal.css("top", yPos + "px");
  }
}
