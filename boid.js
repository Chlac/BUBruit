const MAXSPEED = 2;
const MAXFORCE = .03;
const ALIGNMENT_WEIGHT  = 1;
const COHESION_WEIGHT   = 1;
const SEPARATION_WEIGHT = 5;
const FLIGHT_WEIGHT = 15;
const BOUNDS_WEIGHT = 0.05;

class Boid {

    constructor(x, y, aquarium) {

        this.aquarium = aquarium;

        this.pos = vec2.create(x, y);
        this.vel = vec2.fromAngleAndMagnitude(Math.random() * Math.PI * 2, 3);
        this.acc = vec2.create(0, 0);
        this.angle = this.vel.getAngle(); // General direction the fish is facing
        this.current_waving_angle = 0;
        this.current_waving_direction = 1; // Alternates between -1 and 1
        this.fear_level = 0;
        this.color = {
            r: 240,
            g: 240,
            b: 240,
        };


        // BEHAVIOR
        this.cohere_radius = 100;
        this.separate_radius = 80;
        this.avoid_walls_radius = 60;
        this.hearing_field = 60;

        this.max_fear = 255;
        this.cowardise = 150;
        this.calm_down_speed = 1;

        // ASPECT
        this.width = 14;
        this.length = 80;
        this.head_length = 1.5;
        this.num_of_sections = 8;
        this.section_length = this.length / this.num_of_sections;
        this.spine = Array(this.num_of_sections).fill().map(
            (s, i) => vec2.create(this.pos.x + (this.width / 2), this.pos.y + (i * this.section_length))
        );
        this.max_waving_angle = 0.18;
        this.waving_speed = 0.04;


    }

    update(boids, noises) {

        let nearBoids = boids.filter(b => {
            return (this.pos.distanceTo(b.pos) < this.cohere_radius && b != this);
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
        this.vel.limit(MAXSPEED + this.fear_level / 50);
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

        // WAVE
        if(this.current_waving_angle * this.current_waving_direction > this.vel.mag() * this.max_waving_angle) {
            this.current_waving_direction *= -1;
        }

        this.current_waving_angle += this.waving_speed * this.vel.mag() * this.current_waving_direction;
        let displacement = vec2.create(this.vel.x * Math.cos(this.current_waving_angle) - this.vel.y * Math.sin(this.current_waving_angle), 
                                       this.vel.y * Math.cos(this.current_waving_angle) + this.vel.x * Math.sin(this.current_waving_angle));
        displacement.mult(this.section_length / this.vel.mag());
        this.spine[1] = vec2.sub(this.pos, displacement);


        // MOVE SPINE
        this.spine[0] = this.pos;

        for(let i = 2; i < this.spine.length; i++) {

            // CORRECT DISTANCE

            let total = vec2.create(0, 0);

            let destination = vec2.sub(this.spine[i - 1], this.spine[i]);
            let distance = destination.mag();
            let diff = distance - this.section_length;

            destination.norm();
            destination.mult(0.8 * diff);
            total.add(destination);

            this.spine[i].add(total);

            // CORRECT ANGLE

            let v1 = vec2.sub(this.spine[i - 1], this.spine[i - 2]);
            let v2 = vec2.sub(this.spine[i], this.spine[i - 1]);

            let angle = v2.angleFrom(v1);
            let angle_diff = 0 - angle; // / (Math.PI * 2);

            let p = vec2.create(
                Math.cos(angle_diff) * (this.spine[i].x - this.spine[i - 1].x) 
                - Math.sin(angle_diff) * (this.spine[i].y - this.spine[i - 1].y) 
                + this.spine[i - 1].x,
                Math.sin(angle_diff) * (this.spine[i].x - this.spine[i - 1].x) 
                + Math.cos(angle_diff) * (this.spine[i].y - this.spine[i - 1].y) 
                + this.spine[i - 1].y);

            p.sub(this.spine[i]);
            p.mult(0.25);
            this.spine[i].add(p);

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
            return (this.pos.distanceTo(b.pos) < this.separate_radius && b != this);
        });

        nearBoids.map(b => {

            let tmp = vec2.sub(this.pos, b.pos);
            tmp.norm();
            tmp.div(this.pos.distanceTo(b.pos) + (this.separate_radius + b.separate_radius) / 2);
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
            return (this.pos.distanceTo(o.pos) < this.hearing_field + o.radius);
        });

        nearNOISES.map(b => {

            let tmp = vec2.sub(this.pos, b.pos);
            tmp.norm();
            tmp.div(this.pos.distanceTo(b.pos) + (this.hearing_field + b.radius) / 2);
            sum.add(tmp);

            return b;

        });


        if(sum.mag() > 0)
            sum.div(nearNOISES.length);

        sum.mult(this.vel.mag() * 2);

        //console.log(sum.mag());

        if(sum.mag() > 0 && this.fear_level <= this.max_fear)
            this.fear_level += sum.mag() * this.cowardise;
        else if(this.fear_level > 0) {
            this.fear_level -= this.calm_down_speed;
        } else {
            this.fear_level = 0;
        }

        return sum;
    }

    stayInside() {

        let sum = vec2.create(0, 0);

        if (this.pos.x < this.aquarium.pos.x + this.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.aquarium.pos.x, this.pos.y));
            sum.x = this.avoid_walls_radius / (1 + mult);
        }
        else if (this.pos.x > this.aquarium.pos.x + this.aquarium.width - this.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.aquarium.pos.x + this.aquarium.width, this.pos.y));
            sum.x = -this.avoid_walls_radius / (1 + mult);
        }

        if(this.pos.y < this.aquarium.pos.y + this.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.pos.x, this.aquarium.pos.y));
            sum.y = this.avoid_walls_radius / (1 + mult);

        }
        else if (this.pos.y > this.aquarium.pos.y + this.aquarium.height - this.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.pos.x, this.aquarium.pos.y + this.aquarium.height));
            sum.y = -this.avoid_walls_radius / (1 + mult);

        }

        return sum;
    }


    steerTo(target) {

        let destination = vec2.sub(target, this.pos);
        let distance = destination.mag();

        if(distance > 0) {

            destination.norm();

            if(distance < this.cohere_radius)
                destination.mult(MAXSPEED * (distance / this.cohere_radius));
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

        ctx.save();


        ctx.fillStyle = 'rgb(' + (this.color.r - (this.fear_level)) + ',' + (this.color.g - (this.fear_level)) + ',' + (this.color.b - (this.fear_level)) + ')';

        // HEAD


        let center = vec2.create(this.spine[0].x, this.spine[0].y);
        let section_angle = vec2.create(this.spine[1].x - this.spine[0].x, this.spine[1].y - this.spine[0].y);
        let normal = vec2.norm(vec2.create(section_angle.y, -section_angle.x));

        let head_start = vec2.add(center, vec2.mult(normal, -this.width / 2));
        let anchor_point_head_left = vec2.sub(vec2.add(center, vec2.mult(normal, -this.width / 2)), vec2.mult(section_angle, this.head_length));
        let anchor_point_head_right = vec2.sub(vec2.add(center, vec2.mult(normal, this.width / 2)), section_angle);
        let head_end = vec2.add(center, vec2.mult(normal, this.width / 2));

        // DRAW HEAD
        ctx.beginPath();
        ctx.moveTo(head_start.x, head_start.y);
        ctx.bezierCurveTo(anchor_point_head_left.x, anchor_point_head_left.y, anchor_point_head_right.x, anchor_point_head_right.y, head_end.x, head_end.y);


        let anchor_points = [{
            center: center,
            left: head_start,
            right: head_end,
            section_angle: section_angle,
            normal: normal

        }];

        // ADD BODY ANCHOR POINTS
        for(let i = 1; i < this.num_of_sections - 1; i++) {

            center = vec2.create(this.spine[i].x, this.spine[i].y);
            section_angle = vec2.create(this.spine[i + 1].x - this.spine[i].x, this.spine[i + 1].y - this.spine[i].y);
            normal = vec2.norm(vec2.create(section_angle.y, -section_angle.x));

            if(i < 3) {
                anchor_points[i] = {
                    center: center,
                    left: vec2.add(center, vec2.mult(normal, -this.width / (2 + i - 1))),
                    right: vec2.add(center, vec2.mult(normal, this.width / (2 + i - 1))),
                    section_angle: section_angle,
                    normal: normal
                };
            } else if(i == 3) {
                anchor_points[i] = {
                    center: center,
                    left: vec2.add(center, vec2.mult(normal, -this.width / (8))),
                    right: vec2.add(center, vec2.mult(normal, this.width / (8))),
                    section_angle: section_angle,
                    normal: normal
                } ;
            } else if(i == 4) {
                anchor_points[i] = {
                    center: center,
                    left: vec2.add(center, vec2.mult(normal, -this.width / (18))),
                    right: vec2.add(center, vec2.mult(normal, this.width / (18))),
                    section_angle: section_angle,
                    normal: normal
                } ;
            } else {
                anchor_points[i] = {
                    center: center,
                    left: vec2.add(center, vec2.mult(normal, -this.width / (4))),
                    right: vec2.add(center, vec2.mult(normal, this.width / (4))),
                    section_angle: section_angle,
                    normal: normal
                };
            }

        }


        // ADD ENDS

        for(let i = 0; i < this.num_of_sections % 3; i++) {

            anchor_points[this.num_of_sections - 1 + i] = {
                left: vec2.create(this.spine[this.num_of_sections - 1].x, this.spine[this.num_of_sections - 1].y),
                right: vec2.create(this.spine[this.num_of_sections - 1].x, this.spine[this.num_of_sections - 1].y)
            }
        }


        let fins = {
            left: [],
            right: []
        };

        fins.left.push(
            vec2.add(anchor_points[0].center, vec2.mult(section_angle, 0)),
            vec2.add(vec2.add(anchor_points[0].left, vec2.mult(normal, -this.width / (1.5))), vec2.mult(section_angle, 1.2)),
            vec2.add(vec2.add(anchor_points[1].left, vec2.mult(normal, -this.width / (1.5))), vec2.mult(section_angle, 1.5)),
            vec2.add(anchor_points[1].center, vec2.mult(section_angle, 0))
        );

        fins.right.push(
            vec2.add(anchor_points[0].center, vec2.mult(section_angle, 0)),
            vec2.add(anchor_points[0].right, vec2.mult(normal, this.width / (1))),
            vec2.add(anchor_points[1].right, vec2.mult(normal, this.width / (1))),
            vec2.add(anchor_points[1].center, vec2.mult(section_angle, 0))
        );

        // DRAW BODY
        for(let i = 1; i < anchor_points.length - 2; i++) {

            ctx.bezierCurveTo(anchor_points[i].right.x, anchor_points[i].right.y, anchor_points[i + 1].right.x, anchor_points[i + 1].right.y, anchor_points[i + 2].right.x, anchor_points[i + 2].right.y);
        }

        for(let i = anchor_points.length - 2; i > 1 ; i--) {
            ctx.bezierCurveTo(anchor_points[i].left.x, anchor_points[i].left.y, anchor_points[i - 1].left.x, anchor_points[i - 1].left.y, anchor_points[i - 2].left.x, anchor_points[i - 2].left.y);
        }

        ctx.fill();

        //ctx.fillStyle = 'rgb(' + 255 + ',' + 0 + ',' + 0 + ')';

        // DRAW FINS
        ctx.beginPath();
        ctx.moveTo(fins.left[0].x, fins.left[0].y);
        ctx.bezierCurveTo(fins.left[1].x, fins.left[1].y, fins.left[2].x, fins.left[2].y, fins.left[3].x, fins.left[3].y);
        ctx.fill();

        //ctx.fillStyle = 'rgb(' + 0 + ',' + 0 + ',' + 255 + ')';

        ctx.beginPath();
        ctx.moveTo(fins.right[0].x, fins.right[0].y);
        ctx.bezierCurveTo(fins.right[1].x, fins.right[1].y, fins.right[2].x, fins.right[2].y, fins.right[3].x, fins.right[3].y);
        ctx.fill();

        ctx.restore();
    }
}
