let vehicles = [];
let obstacles = [];
let debug = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  for (let i = 0; i < 25; i++) {
    vehicles.push(new Vehicle(random(width), random(height)))
  }

  for (let j = 0; j < 7; j++) {
    obstacles.push(new Obstacle(random(width), random(height), random(30, 70)));
  }
}

function mousePressed() {
  debug = !debug;
}

function draw() {
  background(5);
  for (const obstacle of obstacles) {
    obstacle.render();
  }

  for (let vehicle of vehicles) {
    vehicle.contain(obstacles);
    vehicle.update();
    vehicle.edges();
    vehicle.render();
  }
}

class Vehicle {
  constructor(x, y) {
    this.pos = createVector(x, y);
    this.vel = p5.Vector.random2D();
    this.acc = createVector();
    this.r = random(8, 18);
    this.maxspeed = 3;
    this.maxforce = 0.3;
  }
  
  applyForce(force) {
    this.acc.add(force);
  }
  
  seek(target) {
    const desired = p5.Vector.sub(target, this.pos);
    desired.setMag(this.maxspeed);
    const steering = p5.Vector.sub(desired, this.vel);
    steering.limit(this.maxforce);
    this.applyForce(steering);
  }
  
  contain(obstacles) {
    let futurePos = this.vel.copy();
    futurePos.setMag(50);
    futurePos.add(this.pos);
    if (debug) {
      stroke("lime");
      fill("cyan");
      line(this.pos.x, this.pos.y, futurePos.x, futurePos.y);
      circle(futurePos.x, futurePos.y, 4);
    }
    for (const obstacle of obstacles) {
      if (obstacle.intersects(futurePos)) {
        const normalVec = obstacle.normalVec(futurePos);
        if (debug) {
          circle(futurePos.x+normalVec.x, futurePos.y+normalVec.y, 4);
        }
        normalVec.mult(2);
        const target = p5.Vector.add(normalVec, futurePos);
        if (debug) {
          line(futurePos.x, futurePos.y, target.x, target.y);
          stroke(0);
          fill("red");
          circle(target.x, target.y, 8);
        }
        this.seek(target);
      }
    }
  }
  
  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }
  
  edges() {
    if (this.pos.x < 0) {
      this.pos.x = width;
    } else if (this.pos.x > width) {
      this.pos.x = 0;
    }
    if (this.pos.y < 0) {
      this.pos.y = height;
    } else if (this.pos.y > height) {
      this.pos.y = 0;
    }
  }
  
  render() {
    push();
    translate(this.pos.x, this.pos.y);
    rotate(this.vel.heading());
    stroke(0);
    fill(0, 204, 0);
    triangle(this.r*2, 0, -this.r*2, -this.r, -this.r*2, this.r);
    pop();
  }
}

class Obstacle {
  constructor(x, y, r) {
    this.pos = createVector(x, y);
    this.r = r;
  }
  
  intersects(pos) {
    return this.pos.dist(pos) < this.r;
  }
  
  normalVec(pos) {
    const normalVec = pos.copy();
    normalVec.sub(this.pos);
    const m = normalVec.mag();
    normalVec.setMag(this.r - m);
    return normalVec;
  }
  
  render() {
    stroke(0);
    fill("orange");
    circle(this.pos.x, this.pos.y, this.r*2);
  }
}