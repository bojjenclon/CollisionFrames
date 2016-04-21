# Collision Frames #

This is a small program made with Electron to help setup collision shapes for animations in a game.

---

## Preview: ##

![Preview image of Collision Frames application](/preview.png?raw=true)

---

Controls:
* Hold "Space" while clicking/dragging: always moves the camera, even when clicking over a shape
* Hold "x" key while dragging: lock movement of camera and dragging of shapes to the x-axis
* Hold "y" key while dragging: lock movement of camera and dragging of shapes to the y-axis
* Delete: removes the currently selected shape from the frame (note: this cannot be undone!)

---

Current Features:
* Open multiple images at once
* Add images to the currently opened list of images
* Rearrange the order of the images in the "animation"
* Add primitive collision shapes (rectangle and ellipse) per image
* Save info for all images in the "animation" to a JSON file
* Basic onion skinning
* Preview the current animation
* Control the origin point of each frame

---

Current Limitations:
* No custom polygons
* Animations must consist of individual image files

---

Planned Features:
* Support spritesheets
* Support custom polygons
