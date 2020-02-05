const MAXSPEED = 2;
const MAXFORCE = .03;
const ALIGNMENT_WEIGHT  = 1;
const COHESION_WEIGHT   = 1;
const SEPARATION_WEIGHT = 5;
const FLIGHT_WEIGHT = 15;
const BOUNDS_WEIGHT = 0.01;

class Boid {

    constructor(x, y, aquarium) {

        this.aquarium = aquarium;

        this.pos = vec2.create(x, y);
        this.vel = vec2.fromAngleAndMagnitude(Math.random() * Math.PI * 2, 3);
        this.acc = vec2.create(0, 0);
        this.angle = this.vel.getAngle();
        this.fear_level = 0.1;

        this.size = 10;
        this.cohere_field = 8 * this.size;
        this.vision_field = 30;
        this.color;
        this.opacity;
        this.speed;
        this.animation_level;


    }

    update(boids, noises) {

        let nearBoids = boids.filter(b => {
            return (this.pos.distanceTo(b.pos) < this.cohere_field && b != this);
        });

        let total = vec2.create(0, 0);

        if(nearBoids.length != 0) {
            total.add(vec2.mult(this.align(nearBoids), ALIGNMENT_WEIGHT));
            total.add(vec2.mult(this.cohere(nearBoids), COHESION_WEIGHT));
            total.add(vec2.mult(this.separate(nearBoids), SEPARATION_WEIGHT));
        }

        total.add(vec2.mult(this.fleeNoises(noises), FLIGHT_WEIGHT));
        total.add(vec2.mult(this.stayInside(), BOUNDS_WEIGHT));
        

        this.acc = total;
        
        this.move();

    }

    move() {

        this.vel.add(this.acc);
        this.vel.limit(MAXSPEED);
        this.pos.add(this.vel);

        this.angle = this.vel.getAngle();

        if(this.pos.x < this.aquarium.pos.x) {
            this.pos.x = this.aquarium.pos.x;
        }
        if(this.pos.y < this.aquarium.pos.y) {
            this.pos.y = this.aquarium.pos.y;
        }
        if(this.pos.x > this.aquarium.pos.x + this.aquarium.width) {
            this.pos.x = this.aquarium.pos.x + this.aquarium.width;
        }
        if(this.pos.y > this.aquarium.pos.y + this.aquarium.height) {
            this.pos.y = this.aquarium.pos.y + this.aquarium.height;
        }

        this.acc.mult(0);

    }

    align(near) {

        let sum = vec2.create(0, 0);
        near.map(b => sum.add(b.vel));
        sum.div(near.length);
        sum.limit(MAXFORCE);

        return sum;

    }

    cohere(near) {

        let sum = vec2.create(0, 0);
        near.map(b => sum.add(b.pos));
        sum.div(near.length);

        return this.steerTo(sum);

    }

    separate(near) {

        let sum = vec2.create(0, 0);

        let nearBoids = near.filter(b => {
            return (this.pos.distanceTo(b.pos) < this.size * 2 && b != this);
        });

        nearBoids.map(b => {

            let tmp = vec2.sub(this.pos, b.pos);
            tmp.norm();
            tmp.div(this.pos.distanceTo(b.pos) + (this.size * 2 + b.size * 2) / 2);
            sum.add(tmp);

            return b;

        });

        if(sum.mag() > 0)
            sum.div(nearBoids.length);

        sum.mult(this.vel.mag() * 2);

        return sum;
    }

    fleeNoises(noises) {

        let sum = vec2.create(0, 0);

        let nearNOISES = noises.filter(o => {
            return (this.pos.distanceTo(o.pos) < this.size * 2 + o.size * 2);
        });

        nearNOISES.map(b => {

            let tmp = vec2.sub(this.pos, b.pos);
            tmp.norm();
            tmp.div(this.pos.distanceTo(b.pos) + (this.size * 2 + b.size * 2) / 2);
            sum.add(tmp);

            return b;

        });


        if(sum.mag() > 0)
            sum.div(nearNOISES.length);

        sum.mult(this.vel.mag() * 2);

        if(sum.mag() > 0)
            this.fear_level = sum.mag() * 5 + 0.1;
        else this.fear_level = 0.1;

        return sum;
    }

    stayInside() {

        let sum = vec2.create(0, 0);
        
        if (this.pos.x < this.aquarium.pos.x + this.vision_field) {
            let mult = this.pos.distanceTo(vec2.create(this.aquarium.pos.x, this.pos.y));
            sum.x = mult;
            }
        else if (this.pos.x > this.aquarium.pos.x + this.aquarium.width - this.vision_field) {
            let mult = this.pos.distanceTo(vec2.create(this.aquarium.pos.x + this.aquarium.width, this.pos.y));
            //console.log(mult);
            sum.x = -mult;
            }
        
        if(this.pos.y < this.aquarium.pos.y + this.vision_field) {
            let mult = this.pos.distanceTo(vec2.create(this.pos.x, this.aquarium.pos.y));
            sum.y = mult;
            
        }
        else if (this.pos.y > this.aquarium.pos.y + this.aquarium.height - this.vision_field) {
            let mult = this.pos.distanceTo(vec2.create(this.pos.x, this.aquarium.pos.y + this.aquarium.height));
            sum.y = -mult;
            
        }

        return sum;
    }


    steerTo(target) {

        let destination = vec2.sub(target, this.pos);
        let distance    = destination.mag();

        if(distance > 0) {

            destination.norm();

            if(distance < this.cohere_field)
                destination.mult(MAXSPEED * (distance / this.cohere_field));
            else
                destination.mult(MAXSPEED);

            destination.sub(this.vel);
            destination.limit(MAXFORCE);

        }
        else
            destination = vec2.create(0, 0);

        return destination;
    }

    render() {

        ctx.fillStyle = 'rgba(20, 20, 20, ' + this.fear_level + ')';
        ctx.save();

        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.angle);

        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo( this.size / 2, this.size);
        ctx.lineTo(-this.size / 2, this.size);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}
