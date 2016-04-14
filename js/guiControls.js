var remote = require("remote");

var arrowKeys = [37, 38, 39, 40];
// all numbers + backspace
var validNumericFieldInputs = [8, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105];

function onNumericInputKeyDown(event) { // eslint-disable-line no-unused-vars
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  if (validNumericFieldInputs.indexOf(keyCode) < 0) {
    event.preventDefault();
    return;
  }
}

function onWidthKeyUp(event) { // eslint-disable-line no-unused-vars
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newWidth = parseInt($("#widthInput").val());
  
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

function onWidthChange(event) { // eslint-disable-line no-unused-vars
  var newWidth = parseInt($("#widthInput").val());
  
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

function onHeightKeyUp(event) { // eslint-disable-line no-unused-vars
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newHeight =  parseInt($("#heightInput").val());
  
  if (isNaN(newHeight)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  bounds.height = parseInt(newHeight);
  
  var center = globals.selected.path.position.clone();
  center.x -= bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onHeightChange(event) { // eslint-disable-line no-unused-vars
  var newHeight =  parseInt($("#heightInput").val());
  
  if (isNaN(newHeight)) {
    return;
  }
  
  var bounds = globals.selected.path.bounds.clone();
  bounds.height = parseInt(newHeight);
  
  var center = globals.selected.path.position.clone();
  center.x -= bounds.width / 2;
  center.y -= bounds.height / 2;
  
  replacePath({
    "size": bounds,
    "center": center
  });
}

function onXKeyUp(event) { // eslint-disable-line no-unused-vars
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newX = parseInt($("#xInput").val());
  
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

function onXChange(event) { // eslint-disable-line no-unused-vars
  var newX = parseInt($("#xInput").val());
  
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

function onYKeyUp(event) { // eslint-disable-line no-unused-vars
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  var newY = parseInt($("#yInput").val());
  
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

function onYChange(event) { // eslint-disable-line no-unused-vars
  var newY = parseInt($("#yInput").val());
  
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

function onNameKeyUp(event) { // eslint-disable-line no-unused-vars
  var keyCode = event.which;
  
  if (arrowKeys.indexOf(keyCode) > -1) {
    return;
  }
  
  globals.selected.path.name = $("#nameInput").val();
}

function arrangeImages(changeToImage) { // eslint-disable-line no-unused-vars
  if (globals.bgImages.length <= 1) {
    return;
  }
  
  var modalRoot = document.createElement("ol");
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
    
    if (changeToImage != null) {
      changeBackgroundRaster(changeToImage);
    }
    
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

function closeProject() { // eslint-disable-line no-unused-vars
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

function updatePathPosition() { // eslint-disable-line no-unused-vars
  var position = globals.selected.path.position.round();
  
  $("#xInput").val(position.x);
  $("#yInput").val(position.y);
}

function updatePathDimensions() { // eslint-disable-line no-unused-vars
  var bounds = globals.selected.path.bounds;
  
  bounds.width = Math.round(bounds.width);
  bounds.height = Math.round(bounds.height);
  
  $("#widthInput").val(bounds.width);
  $("#heightInput").val(bounds.height);
}

function previousBackground() { // eslint-disable-line no-unused-vars
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

function nextBackground() { // eslint-disable-line no-unused-vars
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

function calculateButtonsSize() { // eslint-disable-line no-unused-vars
  return {
    "width": calculateButtonsWidth(),
    "height": calculateButtonsHeight()
  };
}

function showControlButtons() { // eslint-disable-line no-unused-vars
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

function hideControlButtons() { // eslint-disable-line no-unused-vars
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

function removeHiddenAtStart() { // eslint-disable-line no-unused-vars
  $("#rightMenu").removeClass("hiddenAtStart");
  $("#footerBackground").removeClass("hiddenAtStart");
}

function fixRightMenu() { // eslint-disable-line no-unused-vars
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

function fixModal() { // eslint-disable-line no-unused-vars
  var jModal = $("#modal");
  
  if (jModal) {
    var xPos = $(window).width() / 2 - jModal.width() / 2;
    var yPos = $(window).height() / 2 - jModal.height() / 2;
    
    jModal.css("left", xPos + "px");
    jModal.css("top", yPos + "px");
  }
}
