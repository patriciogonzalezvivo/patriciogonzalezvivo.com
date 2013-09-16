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

void setup() {
  size(800,600);
  flock = new Flock();
  brujula = new Compass();
  // Add an initial set of boids into the system
  for (int i = 0; i < 100; i++) {
    flock.addBoid(new Boid(new PVector(width/2,height/2),3.0,0.05));
  }
  smooth();
  
  yo = loadImage("self.png");
  noyo = loadImage("noSelf.png");
}

void draw() {
  background(255);
  noFill();
  if (avoidWalls)
    rect(width-width*wallScale,height-height*wallScale,width*wallScale*wallScale,height*wallScale*wallScale);
  fill(255);
  flock.run();
  
  brujula.render(50,50); 
}

void keyPressed(){
  if (key == 'a') avoidWalls = !avoidWalls;
  if (key == 'v') thumbs = !thumbs;
  if (key == '-') wallScale -= 0.01;
  if (key == '+') wallScale += 0.01;
}

// Add a new boid into the System
void mousePressed() {
  flock.addBoid(new Boid(new PVector(mouseX,mouseY),brujula.ali,2.0,0.05f));
}


