
var maindiv = document.getElementById('main');

var canvas = document.createElement('canvas');
canvas.id = 'mycanvas';
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
canvas.style.borderStyle = 'solid';
canvas.style.borderWidth = '1px';

maindiv.append(canvas);

var ctx = canvas.getContext('2d');

class Boid {
  constructor() {
    this.position = {x: Math.random() * canvas.width + 0.1, y: Math.random() * canvas.height + 0.1};
    this.velocity = {x: ((Math.random() < 0.5 ? -1 : 1) * Math.random()) * 2, y: ((Math.random() < 0.5 ? -1 : 1) * Math.random()) * 2};
    this.angle = this.getAngle();
    this.acceleration = {x: 0, y: 0};
    this.anglechecker = true;
    this.maxSpeed = 4;

    this.h = 15;
    this.w = 10;
  }

  edges() {
    if (this.position.x > canvas.width) {
      this.position.x = 0;
    } else if (this.position.x < 0) {
      this.position.x = canvas.width;
    }
    if (this.position.y > canvas.height) {
      this.position.y = 0;
    } else if (this.position.y < 0) {
      this.position.y = canvas.height;
    }
  }

  getAngle() {
    var dx = this.velocity.x;
    var dy = this.velocity.y;

    var angle = Math.atan2(dy, dx);

    return angle;
  }

  show(ctx) {
    ctx.save();
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(this.getAngle());
    ctx.beginPath();

    ctx.stroke();
    ctx.moveTo(this.h, 0);
    ctx.lineTo(-this.h, -this.w);
    ctx.lineTo(-this.h, this.w);
    
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  add(vector1, vector2) {
    vector1.x += vector2.x;
    vector1.y += vector2.y;
    return
  }

  divide(vector1, num) {
    vector1.x = vector1.x / num;
    vector1.y = vector1.y / num;
    return
  }

  mult(vector, num) {
    vector.x *= num;
    vector.y *= num;
  }

  sub(vector1, vector2) {
    vector1.x -= vector2.x;
    vector1.y -= vector2.y;
    return
  }

  newSub(vector1, vector2) {
    var x = vector1.x - vector2.x;
    var y = vector1.y - vector2.y;
    return {x: x, y: y};
  }

  normalizeAndClamp(vector, max) {
    var x = vector.x;
    var y = vector.y;
    
    var length = Math.sqrt(x*x+y*y);

    var f = Math.min(length, max) / length;

    return {x: f * x, y: f * y};

  } 

  setMag(vector, mag) {
    var x = vector.x;
    var y = vector.y;
    
    var angle = Math.atan2(y, x); 

    return {x: Math.cos(angle) * mag, y: Math.sin(angle) * mag};
  }

  dist(x1, y1, x2, y2) {
    var a = x1 - x2;
    var b = y1 - y2;

    return Math.sqrt( a*a + b*b );
  }

  align(boids) {
    var perception = 100;
    var steering = {x: 0, y: 0};
    var total = 0;

    for(var other of boids) {
      var d = this.dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );

      if(other !== this && d < perception) {
        this.add(steering, other.velocity);
        total++;
      }
    }

    if(total > 0) {
      this.divide(steering, total);
      steering = this.setMag(steering, this.maxSpeed);
      this.sub(steering, this.velocity);
      steering = this.normalizeAndClamp(steering, 0.08);
    }

    return steering;

  }

  separation(boids) {
    var perception = 100;
    var steering = {x: 0, y: 0};
    var total = 0;

    for(var other of boids) {
      var d = this.dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );

      if(other !== this && d < perception) {
        var diff = this.newSub(this.position, other.position);

        this.divide(diff, d*d);

        this.add(steering, diff);
        total++;
      }
    }

    if(total > 0) {
      this.divide(steering, total);
      steering = this.setMag(steering, this.maxSpeed);
      this.sub(steering, this.velocity);
      steering = this.normalizeAndClamp(steering, 0.09);
    }

    return steering;

  }

  cohesion(boids) {
    var perception = 100;
    var steering = {x: 0, y: 0};
    var total = 0;

    for(var other of boids) {
      var d = this.dist(
        this.position.x,
        this.position.y,
        other.position.x,
        other.position.y
      );

      if(other !== this && d < perception) {
        this.add(steering, other.position);
        total++;
      }
    }

    if(total > 0) {
      this.divide(steering, total);
      this.sub(steering, this.position);
      steering = this.setMag(steering, this.maxSpeed);
      this.sub(steering, this.velocity);
      steering = this.normalizeAndClamp(steering, 0.08);
    }

    return steering;

  }

  flock(boids) {
    var alignment = this.align(boids);
    var cohesion = this.cohesion(boids);
    var separation = this.separation(boids);

    this.add(this.acceleration, alignment);
    this.add(this.acceleration, cohesion);
    this.add(this.acceleration, separation);
  }

  update() {
    
    // this.velocity = this.setMag(this.velocity, this.maxSpeed);
    this.add(this.position, this.velocity)
    this.add(this.velocity, this.acceleration)
    this.angle = this.getAngle();
    this.mult(this.acceleration, 0);
    
  }

}

var flock = [];

for(var i = 0; i < 100; i++) {
  flock.push(new Boid());
}

loop();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for( var boid in flock) {
    flock[boid].edges();
    flock[boid].flock(flock);
    flock[boid].show(ctx);
    flock[boid].update();
  }
  
}

function update() {

}

function loop() {
  window.requestAnimationFrame(loop);
  update();
  draw();
}
