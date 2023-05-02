/* globals random, PI, cos, sin, constrain, translate, rotate, text, rect, 
createCanvas, textSize, clear, noStroke, textAlign, stroke, millis, dist, RIGHT, LEFT, resetMatrix, frameRate, fill, ellipse */
const DEBUG = false;
const Builder = (superclass) => class extends superclass {
  build(){
    if (this.hunger > 0.9) { return; }
    let distanceToClosestMud = Number.POSITIVE_INFINITY;
    for (let i = 0; i < this.world.things.length; i++) {
      const thing = this.world.things[i];
      const distance = dist(this.x, this.y, thing.x, thing.y);
      if (distance < distanceToClosestMud){
        distanceToClosestMud = distance;
      }
    }
    if (distanceToClosestMud > 8 && distanceToClosestMud < 12){
      this.world.things.push({type: 'mud', x: this.x, y: this.y})
    }
  } 
};
const Forager = (superclass) => class extends superclass {
  forage() {
    
  }
}
class Ant extends Forager(Builder(Object)) { 
  constructor(world){
    super()
    this.hunger = 1;
    this.id = Ant.counter++;
    this.world = world;
    this.x = this.y = 0;
    this.speed = random(30,120); 
    this.rotation = random(PI * 2);
    this.type = 'builder';
    this.foragersSeen = 0;
    this.scaleFactor = random(0.5,1);
  }
  update(delta){  
    const range = PI / 8
    this.rotation += random(-range, range); 
    if (abs(this.x) > this.world.w / 2) { this.rotation = (this.rotation + PI) % TAU } 
    if (abs(this.y) > this.world.h / 2) { this.rotation = (this.rotation + PI) % TAU } 
    
    this.x += cos(this.rotation) * this.speed * delta;
    this.y += sin(this.rotation) * this.speed * delta;
    this.x = constrain(this.x, -this.world.w / 2, this.world.w / 2);
    if (this.x === -this.world.w / 2 || this.x === this.world.w / 2) {
      this.x = -this.x;
    }
    this.y = constrain(this.y, -this.world.h / 2, this.world.h / 2);
    if (this.y === -this.world.h / 2 || this.y === this.world.h / 2) {
      this.y = -this.y;
    }
    
    this.foragersSeen += this.nearbyForagers() - 1;
    if (this.hunger > 0.5 && this.foragersSeen < -100) {
      this.foragersSeen = 0;
      this.type = 'forager';
    }
    if (this.hunger <= 0.5 && this.foragersSeen > 100) {
      this.foragersSeen = 0;
      this.type = 'builder';
    }
    
    if (this.type === 'forager'){
      this.forage();
    }
    else {
      this.build();
    }
    
    this.draw();
  }
  nearbyForagers() {
    return this.world.ants.filter(ant => ant.id !== this.id && ant.type === 'forager' && dist(this.x, this.y, ant.x, ant.y) < 50).length; 
  } 
  draw() {
    translate(this.x, this.y); 
    
    if (DEBUG) {
      fill('lightgrey');
      textAlign(RIGHT);
      text(this.id, -10, 0);  
      textAlign(LEFT);
      text([this.speed.toFixed(2), this.foragersSeen].join('\n'), 10, 0);  
    }
    
    rotate(this.rotation); 
    // fill(this.type === 'forager' ? 'blue' : 'orange');
    fill('black');
    rect(-3*this.scaleFactor*2, -1.5*this.scaleFactor*2, 6*this.scaleFactor, 3*this.scaleFactor);
    rotate(-this.rotation); 
    translate(-this.x, -this.y);
  }
}
Ant.counter = 0;

class World {   
  setup() {
    this.lastMillis = millis();
    this.w = this.h = 512;
    const canvas = createCanvas(this.w, this.h);
    canvas.parent('sketch');
    textSize(9);
    noStroke();
    frameRate(60);
    
    this.things = [{type: 'mud', x: 0, y: 0}];
    
    this.ants = [];
    for (let i = 0; i < 500; i++){
      this.ants.push(new Ant(this)); 
    }
  }
  draw() {
    const curMillis = millis();
    const delta = (curMillis - this.lastMillis) / 1000;
    this.lastMillis = curMillis; 
    clear();
    translate(this.w / 2, this.h /2);
    
    this.things.forEach(thing => {
      background('green');
      fill(107, 48, 44);
      ellipse(thing.x, thing.y, 70, 70);
      fill('black');
      ellipse(thing.x, thing.y, 10, 10);
    })
    
    this.ants.forEach(ant => ant.update(delta));
    resetMatrix();
  }
}

const world = new World();
window.setup = world.setup.bind(world);
window.draw = world.draw.bind(world);