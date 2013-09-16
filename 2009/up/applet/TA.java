import processing.core.*; 
import processing.xml.*; 

import java.applet.*; 
import java.awt.Dimension; 
import java.awt.Frame; 
import java.awt.event.MouseEvent; 
import java.awt.event.KeyEvent; 
import java.awt.event.FocusEvent; 
import java.awt.Image; 
import java.io.*; 
import java.net.*; 
import java.text.*; 
import java.util.*; 
import java.util.zip.*; 
import java.util.regex.*; 

public class TA extends PApplet {

// Flocking
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code, Spring 2009

// Demonstration of Craig Reynolds' "Flocking" behavior
// See: http://www.red3d.com/cwr/
// Rules: Cohesion, Separation, Alignment

// Click mouse to add boids into the system

Flock flock;
Compass brujula;

PImage yo, noyo;
boolean avoidWalls, thumbs = false;
float wallScale = 1;

public void setup() {
  size(800,600);
  flock = new Flock();
  brujula = new Compass();
  // Add an initial set of boids into the system
  for (int i = 0; i < 100; i++) {
    flock.addBoid(new Boid(new PVector(width/2,height/2),3.0f,0.05f));
  }
  smooth();
  
  yo = loadImage("self.png");
  noyo = loadImage("noSelf.png");
}

public void draw() {
  background(255);
  noFill();
  if (avoidWalls)
    rect(width-width*wallScale,height-height*wallScale,width*wallScale*wallScale,height*wallScale*wallScale);
  fill(255);
  flock.run();
  
  brujula.render(50,50); 
}

public void keyPressed(){
  if (key == 'a') avoidWalls = !avoidWalls;
  if (key == 'v') thumbs = !thumbs;
  if (key == '-') wallScale -= 0.01f;
  if (key == '+') wallScale += 0.01f;
}

// Add a new boid into the System
public void mousePressed() {
  flock.addBoid(new Boid(new PVector(mouseX,mouseY),brujula.ali,2.0f,0.05f));
}


// Flocking
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code, Spring 2009

// Boid class
// Methods for Separation, Cohesion, Alignment added

class Boid {
  PVector loc;
  PVector vel;
  PVector acc;
  float r;
  float maxforce;    // Maximum steering force
  float maxspeed;    // Maximum speed
  
  boolean ext = false;

  Boid(PVector l, float ms, float mf) {
    acc = new PVector(0,0);
    vel = new PVector(random(-1,1),random(-1,1));
    loc = l.get();
    r = 3.0f;
    maxspeed = ms;
    maxforce = mf;
  }
  
  Boid(PVector l, PVector a, float ms, float mf) {
    acc = a;
    ext = true;
    vel = new PVector(random(-1,1),random(-1,1));
    loc = l.get();
    r = 3.0f;
    maxspeed = ms;
    maxforce = mf;
  }

  public void run(ArrayList boids) {
    flock(boids);
    update();
    borders();
    render();
  }

  // We accumulate a new acceleration each time based on three rules
  public void flock(ArrayList boids) {
    PVector ali = new PVector(0,0,0);
    PVector coh = new PVector(0,0,0);
    PVector sep = new PVector(0,0,0);
    
    if (!ext){
      ali = align(boids);      // Alignment
      sep = separate(boids);   // Separation
      coh = cohesion(boids);   // Cohesion
    }
    
    // Arbitrarily weight these forces
    sep.mult(1.5f);
    ali.mult(1.0f);
    coh.mult(1.0f);
    // Add the force vectors to acceleration
    acc.add(sep);
    acc.add(ali);
    acc.add(coh);
  }

  // Method to update location
  public void update() {
    // Update velocity
    vel.add(acc);
    // Limit speed
    vel.limit(maxspeed);
    loc.add(vel);
    // Reset accelertion to 0 each cycle
    acc.mult(0);
  }

  public void seek(PVector target) {
    acc.add(steer(target,false));
  }

  public void arrive(PVector target) {
    acc.add(steer(target,true));
  }


  // A method that calculates a steering vector towards a target
  // Takes a second argument, if true, it slows down as it approaches the target
  public PVector steer(PVector target, boolean slowdown) {
    PVector steer;  // The steering vector
    PVector desired = PVector.sub(target,loc);  // A vector pointing from the location to the target
    float d = desired.mag(); // Distance from the target is the magnitude of the vector
    // If the distance is greater than 0, calc steering (otherwise return zero vector)
    if (d > 0) {
      // Normalize desired
      desired.normalize();
      // Two options for desired vector magnitude (1 -- based on distance, 2 -- maxspeed)
      if ((slowdown) && (d < 100.0f)) desired.mult(maxspeed*(d/100.0f)); // This damping is somewhat arbitrary
      else desired.mult(maxspeed);
      // Steering = Desired minus Velocity
      steer = PVector.sub(desired,vel);
      steer.limit(maxforce);  // Limit to maximum steering force
    } 
    else {
      steer = new PVector(0,0);
    }
    return steer;
  }

  public void render() {
    // Draw a triangle rotated in the direction of velocity
    float theta = vel.heading2D() + radians(90);
    if (!thumbs){
      fill(175);
      stroke(0);
      pushMatrix();
      translate(loc.x,loc.y);
      rotate(theta);
      beginShape(TRIANGLES);
      vertex(0, -r*2);
      vertex(-r, r*2);
      vertex(r, r*2);
      endShape();
      popMatrix();
    } else {
      pushMatrix();
      translate(loc.x,loc.y);
      rotate(theta);
      scale(0.08f,0.08f);
      if(!ext)
        image(yo,0,0);
       else
        image(noyo,0,0);
      popMatrix();
    }
  }

  // Wraparound
  public void borders() {
    if (loc.x < -r) loc.x = width+r;
    if (loc.y < -r) loc.y = height+r;
    if (loc.x > width+r) loc.x = -r;
    if (loc.y > height+r) loc.y = -r;
    
    if (avoidWalls){
      acc.add(PVector.mult(avoid(new PVector(loc.x,height*wallScale),true),5));
      acc.add(PVector.mult(avoid(new PVector(loc.x,height-height*wallScale),true),5));
      acc.add(PVector.mult(avoid(new PVector(width*wallScale,loc.y),true),5));
      acc.add(PVector.mult(avoid(new PVector(height-height*wallScale,loc.y),true),5));
    }
  }

  // Separation
  // Method checks for nearby boids and steers away
  public PVector separate (ArrayList boids) {
    float desiredseparation = 25.0f;
    PVector steer = new PVector(0,0,0);
    int count = 0;
    // For every boid in the system, check if it's too close
    for (int i = 0 ; i < boids.size(); i++) {
      Boid other = (Boid) boids.get(i);
      float d = PVector.dist(loc,other.loc);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        PVector diff = PVector.sub(loc,other.loc);
        diff.normalize();
        diff.div(d);        // Weight by distance
        steer.add(diff);
        count++;            // Keep track of how many
      }
    }
    // Average -- divide by how many
    if (count > 0) {
      steer.div((float)count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxspeed);
      steer.sub(vel);
      steer.limit(maxforce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  public PVector align (ArrayList boids) {
    float neighbordist = 50.0f;
    PVector steer = new PVector(0,0,0);
    int count = 0;
    for (int i = 0 ; i < boids.size(); i++) {
      Boid other = (Boid) boids.get(i);
      float d = PVector.dist(loc,other.loc);
      if ((d > 0) && (d < neighbordist)) {
        steer.add(other.vel);
        count++;
      }
    }
    if (count > 0) {
      steer.div((float)count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(maxspeed);
      steer.sub(vel);
      steer.limit(maxforce);
    }
    return steer;
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby boids, calculate steering vector towards that location
  public PVector cohesion (ArrayList boids) {
    float neighbordist = 50.0f;
    PVector sum = new PVector(0,0,0);   // Start with empty vector to accumulate all locations
    int count = 0;
    for (int i = 0 ; i < boids.size(); i++) {
      Boid other = (Boid) boids.get(i);
      float d = PVector.dist(loc,other.loc);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(other.loc); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div((float)count);
      return steer(sum,false);  // Steer towards the location
    }
    return sum;
  }
  
  //avoid. If weight == true avoidance vector is larger the closer the boid is to the target
  public PVector avoid(PVector target,boolean weight){
    PVector steer = new PVector(); //creates vector for steering
    steer.set(PVector.sub(loc,target)); //steering vector points away from target
    if(weight)
      steer.mult(1/sq(PVector.dist(loc,target)));
    //steer.limit(maxSteerForce); //limits the steering force to maxSteerForce
    return steer;
  }
}

class Compass {
  PVector ali;
  
  Compass() {
    PVector ali = new PVector(0,0,0);
  }
  
  public void render(int _x, int _y) {
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
  public void align (ArrayList boids) {
    float neighbordist = 50.0f;
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
// Flocking
// Daniel Shiffman <http://www.shiffman.net>
// The Nature of Code, Spring 2009

// Flock class
// Does very little, simply manages the ArrayList of all the boids

class Flock {
  ArrayList boids; // An arraylist for all the boids

  Flock() {
    boids = new ArrayList(); // Initialize the arraylist
  }

  public void run() {
    for (int i = 0; i < boids.size(); i++) {
      Boid b = (Boid) boids.get(i);  
      b.run(boids);  // Passing the entire list of boids to each boid individually
    }
  }

  public void addBoid(Boid b) {
    boids.add(b);
  }

}
  static public void main(String args[]) {
    PApplet.main(new String[] { "--bgcolor=#FFFFFF", "TA" });
  }
}
