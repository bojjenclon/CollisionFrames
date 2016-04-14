function findComplimentaryColor(color) { // eslint-disable-line no-unused-vars
  var compliment = color.clone();
  
  compliment.hue += 180.0;
  
  while (compliment.hue >= 360.0) {
    compliment.hue -= 360.0;
  }
  
  return compliment;
}

