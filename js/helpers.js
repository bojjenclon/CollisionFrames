function findComplimentaryColor(color) { 
  var compliment = color.clone();
  
  compliment.hue += 180.0;
  
  while (compliment.hue >= 360.0) {
    compliment.hue -= 360.0;
  }
  
  return compliment;
}

