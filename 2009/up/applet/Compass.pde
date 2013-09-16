class Compass {
  PVector ali;
  
  Compass() {
    PVector ali = new PVector(0,0,0);
  }
  
  void render(int _x, int _y) {
    align(flock.boids);
    
    float r = 5;
    // Draw a triangle rotated in the direction of velocity
    float theta = ali.heading2D() + radians(90);
    fill(255,0,0);
    stroke(0);
    pushMatrix();
    translate(_x,_y);
    rotate(theta);
    translate(0,-r*2);
    beginShape(TRIANGLES);
    vertex(0, -r*2);
    vertex(-r, r*2);
    vertex(r, r*2);
    endShape();
    popMatrix();
    
    theta = ali.heading2D() - radians(90);
    fill(0,0,255);
    stroke(0);
    pushMatrix();
    translate(_x,_y);
    rotate(theta);
    translate(0,-r*2);
    beginShape(TRIANGLES);
    vertex(0, -r*2);
    vertex(-r, r*2);
    vertex(r, r*2);
    endShape();
    popMatrix();
    
    noFill();
    stroke(0);
    pushMatrix();
    translate(_x,_y);
    ellipseMode(CENTER);
    ellipse(0,0,50,50);
    popMatrix();
  }
  
  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  void align (ArrayList boids) {
    float neighbordist = 50.0;
    PVector steer = new PVector(0,0,0);
    int count = 0;
    
    for (int i = 0 ; i < boids.size(); i++) {
      Boid other = (Boid) boids.get(i);
      steer.add(other.vel);
      count++;
    }
    
    if (count > 0) {
      steer.div((float)count);
    }
    /*
    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxspeed);
      steer.sub(vel);
      steer.limit(maxforce);
    }*/
    ali = steer;
  }
}
