

class Boid {

    // BEHAVIOR

    static _max_speed = 1;
static MAXFORCE = .03; // Alignment and cohere max force
static ALIGNMENT_WEIGHT  = 1;
static COHESION_WEIGHT   = 1;
static SEPARATION_WEIGHT = 5;
static FLIGHT_WEIGHT = 2;
static BOUNDS_WEIGHT = 1;

static vision_field = 100;
static hearing_field = 50;
static cohere_radius = 100;
static separate_radius = 80;
static avoid_walls_radius = 60;

static max_fear = 255;
static cowardise = 50;
static calm_down_speed = 1;

// ASPECT
static width = 15;
static length = 60;
static head_length = 2.2;
static tail_width = 4;
static num_of_body_sections = 5;
static num_of_tail_sections = 4;
static num_of_sections = Boid.num_of_body_sections + Boid.num_of_tail_sections;
static section_length = Boid.length / (Boid.num_of_sections);
static _max_waving_angle = 0.125;
static waving_speed = 0.038;
static shadow_color = "rgba(0, 0, 0, 0)";
static shadow_blur = 6;
static shadow_offset_x = 3;
static shadow_offset_y = 8;

constructor(x, y, aquarium, id) {

    this.aquarium = aquarium;
    this.id = id;

    this.pos = vec2.create(x, y);
    this.vel = vec2.fromAngleAndMagnitude(Math.random() * Math.PI * 2, 3);
    this.acc = vec2.create(0, 0);
    this.angle = this.vel.getAngle(); // General direction the fish is facing
    this.current_waving_angle = 0;
    this.current_waving_direction = 1; // Alternates between -1 and 1
    this.fear_level = 0;

    this._color = {
        r: 225,
        g: 225,
        b: 225,
    };

    this.spine = Array(Boid.num_of_sections).fill().map(
        (s, i) => vec2.create(this.pos.x + (Boid.width / 2), this.pos.y + (i * Boid.section_length))
    );

    this.random_direction = vec2.fromAngleAndMagnitude(Math.random() * Math.PI * 2, 3);

}

get color() {
    return {
        r: this._color.r - (this.fear_level),
        g: this._color.g - (this.fear_level),
        b: this._color.b - (this.fear_level)
    };
}

get max_speed() {
    return Boid._max_speed + this.fear_level / 50;
}

get max_waving_angle() {
    return this.vel.mag() * Boid._max_waving_angle;
}

update(boids, noises) {

    let nearBoids = boids.filter(b => {
        return (this.pos.distanceTo(b.pos) < Boid.vision_field && b != this);
    });

    let total = vec2.create(0, 0);


    if(nearBoids.length != 0) {
        total.add(vec2.mult(this.align(nearBoids), Boid.ALIGNMENT_WEIGHT));
        total.add(vec2.mult(this.cohere(nearBoids), Boid.COHESION_WEIGHT));
        total.add(vec2.mult(this.separate(nearBoids), Boid.SEPARATION_WEIGHT));
    }


    total.add(vec2.mult(this.fleeNoises(noises), Boid.FLIGHT_WEIGHT));
    total.add(vec2.mult(this.stayInside(), Boid.BOUNDS_WEIGHT));

    this.acc = total;

    this.move();

}

move() {


    if(Math.random() + ((this.fear_level / Boid.max_fear) / 32) > 0.96) {
        this.random_direction = vec2.fromAngleAndMagnitude(Math.random() * Math.PI * 2, 1);
        this.random_direction.mult(this.fear_level / Boid.max_fear);
        this.random_direction.limit(this.max_speed);
    }

    this.vel.add(this.random_direction);
    this.vel.add(this.acc);
    this.vel.limit(this.max_speed);
    this.pos.add(this.vel);

    if(this.aquarium.shape === Aquarium.SHAPE.RECTANGLE) {
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
    } else if(this.aquarium.shape === Aquarium.SHAPE.ELLIPSE) {

        let vec = vec2.sub(this.pos, this.aquarium.pos);
        let angle = vec.getAngle();

        if(vec.mag() >= this.aquarium.width / 2) {

            this.pos.x = this.aquarium.pos.x + ((this.aquarium.width / 2) * Math.cos(angle));
            this.pos.y = this.aquarium.pos.y + ((this.aquarium.width / 2) * -Math.sin(angle));

            this.pos.add(vec2.div(this.random_direction, 1));
            //this.vel.limit(this.max_speed);
        }
    }



    // WAVE
    if(this.current_waving_angle * this.current_waving_direction > this.max_waving_angle) {
        this.current_waving_direction *= -1;
    }

    this.current_waving_angle += Boid.waving_speed * this.vel.mag() * this.current_waving_direction;
    let displacement = vec2.create(this.vel.x * Math.cos(this.current_waving_angle) - this.vel.y * Math.sin(this.current_waving_angle), 
                                   this.vel.y * Math.cos(this.current_waving_angle) + this.vel.x * Math.sin(this.current_waving_angle));
    displacement.mult(Boid.section_length / this.vel.mag());
    this.spine[1] = vec2.sub(this.pos, displacement);


    // MOVE SPINE
    this.spine[0] = this.pos;

    for(let i = 2; i < this.spine.length; i++) {

        // CORRECT DISTANCE

        let total = vec2.create(0, 0);

        let destination = vec2.sub(this.spine[i - 1], this.spine[i]);
        let distance = destination.mag();
        let diff = distance - Boid.section_length;

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
    sum.limit(Boid.MAXFORCE);

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
        return (this.pos.distanceTo(b.pos) < Boid.separate_radius && b != this);
    });

    nearBoids.map(b => {
        let tmp = vec2.sub(this.pos, b.pos);
        tmp.norm();
        tmp.div(this.pos.distanceTo(b.pos) + Boid.separate_radius);
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

    let ratio = canvas.width / canvas.height;

    let nearNOISES = noises.filter(n => {
        return (this.pos.distanceTo(n.pos) < Boid.hearing_field + Math.max(n.radius, n.radius * ratio));
    });

    nearNOISES.map(n => {

        let tmp = vec2.sub(this.pos, n.pos);
        tmp.norm();
        tmp.mult(Boid.cowardise * n.strength);
        sum.add(tmp);

        return n;

    });


    if(sum.mag() > 0)
        sum.div(nearNOISES.length);

    sum.mult(this.vel.mag() * 2);

    let fear_level = nearNOISES.reduce((acc, noise) => acc + noise.strength, 0);
    if(sum.mag() > 0 && this.fear_level <= Boid.max_fear)
        this.fear_level += fear_level;
    else if(this.fear_level > 0) {
        this.fear_level -= Boid.calm_down_speed;
    } else {
        this.fear_level = 0;
    }

    return sum;
}

stayInside() {

    let sum = vec2.create(0, 0);
    if(this.aquarium.shape === Aquarium.SHAPE.RECTANGLE) {
        if (this.pos.x < this.aquarium.pos.x + Boid.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.aquarium.pos.x, this.pos.y));
            sum.x = 1 / (1 + mult);
        }
        else if (this.pos.x > this.aquarium.pos.x + this.aquarium.width - Boid.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.aquarium.pos.x + this.aquarium.width, this.pos.y));
            sum.x = -1 / (1 + mult);
        }

        if(this.pos.y < this.aquarium.pos.y + Boid.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.pos.x, this.aquarium.pos.y));
            sum.y = 1 / (1 + mult);

        }
        else if (this.pos.y > this.aquarium.pos.y + this.aquarium.height - Boid.avoid_walls_radius) {
            let mult = this.pos.distanceTo(vec2.create(this.pos.x, this.aquarium.pos.y + this.aquarium.height));
            sum.y = -1 / (1 + mult);

        }
    } else if(this.aquarium.shape === Aquarium.SHAPE.ELLIPSE) {
        let distance = vec2.sub(this.pos, this.aquarium.pos).mag();
        if(distance >= this.aquarium.width / 2 - Boid.avoid_walls_radius) {
            sum = vec2.mult(vec2.sub(this.pos, this.aquarium.pos), -0.00008 * (distance / (this.aquarium.width / 2)));
        }
    }

    return sum;
}


steerTo(target) {

    let destination = vec2.sub(target, this.pos);
    let distance = destination.mag();

    if(distance > 0) {

        destination.norm();

        if(distance < Boid.cohere_radius)
            destination.mult(Boid._max_speed * (distance / Boid.cohere_radius));
        else
            destination.mult(Boid._max_speed);

        destination.sub(this.vel);
        destination.limit(Boid.MAXFORCE);

    }
    else
        destination = vec2.create(0, 0);

    return destination;
}

render() {

    ctx.save();

    //ctx.font = "10px Arial";
    //ctx.fillStyle = 'black';
    //ctx.fillText(this.a, this.pos.x + 15, this.pos.y + 15);


    // HEAD


    let center = vec2.create(this.spine[0].x, this.spine[0].y);
    let section_angle = vec2.create(this.spine[1].x - this.spine[0].x, this.spine[1].y - this.spine[0].y);
    let normal = vec2.norm(vec2.create(section_angle.y, -section_angle.x));

    let head_start = vec2.add(center, vec2.mult(normal, -Boid.width / 2));
    let anchor_point_head_left = vec2.sub(vec2.add(center, vec2.mult(normal, -Boid.width / 2)), vec2.mult(section_angle, Boid.head_length));
    let anchor_point_head_right = vec2.sub(vec2.add(center, vec2.mult(normal, Boid.width / 2)), vec2.mult(section_angle, Boid.head_length));
    let head_end = vec2.add(center, vec2.mult(normal, Boid.width / 2));


    let anchor_points = [{
        center: center,
        left: head_start,
        right: head_end,
        section_angle: section_angle,
        normal: normal

    }];

    // ADD BODY ANCHOR POINTS
    for(let i = 1; i < Boid.num_of_sections - 1; i++) {

        center = vec2.create(this.spine[i].x, this.spine[i].y);
        section_angle = vec2.create(this.spine[i + 1].x - this.spine[i].x, this.spine[i + 1].y - this.spine[i].y);
        normal = vec2.norm(vec2.create(section_angle.y, -section_angle.x));

        if(i < Boid.num_of_body_sections - 1) {
            anchor_points[i] = {
                center: center,
                left: vec2.add(center, vec2.mult(normal, -Boid.width / (2 + i - 1))),
                right: vec2.add(center, vec2.mult(normal, Boid.width / (2 + i - 1))),
                section_angle: section_angle,
                normal: normal
            };
        } else if(i === Boid.num_of_body_sections - 1) {
            anchor_points[i] = {
                center: center,
                left: vec2.add(center, vec2.mult(normal, -Boid.width / (38))),
                right: vec2.add(center, vec2.mult(normal, Boid.width / (38))),
                section_angle: section_angle,
                normal: normal
            } ;
        } else if(i > Boid.num_of_body_sections - 1) {
            anchor_points[i] = {
                center: center,
                left: vec2.add(center, vec2.mult(normal, -Boid.tail_width)),
                right: vec2.add(center, vec2.mult(normal, Boid.tail_width)),
                section_angle: section_angle,
                normal: normal
            } ;
        }

    }

    // ADD ENDS

    for(let i = 0; i < (Boid.num_of_sections) % 3; i++) {

        anchor_points[Boid.num_of_sections - 1 + i] = {
            left: vec2.create(this.spine[Boid.num_of_sections - 1].x, this.spine[Boid.num_of_sections - 1].y),
            right: vec2.create(this.spine[Boid.num_of_sections - 1].x, this.spine[Boid.num_of_sections - 1].y)
        }
    }


    let fins = {
        left: [],
        right: []
    };

    fins.left.push(
        vec2.add(anchor_points[0].center, vec2.mult(anchor_points[0].section_angle, -0.8)),
        vec2.add(vec2.add(anchor_points[0].left, vec2.mult(anchor_points[0].normal, -Boid.width / (1.5))), vec2.mult(anchor_points[0].section_angle, 0)),
        vec2.add(vec2.add(anchor_points[1].left, vec2.mult(anchor_points[1].normal, -Boid.width / (1.5))), vec2.mult(anchor_points[1].section_angle, 0.5)),
        vec2.add(anchor_points[1].center, vec2.mult(anchor_points[1].section_angle, -0.8))
    );

    fins.right.push(
        vec2.add(anchor_points[0].center, vec2.mult(anchor_points[0].section_angle, -0.8)),
        vec2.add(vec2.add(anchor_points[0].right, vec2.mult(anchor_points[0].normal, Boid.width / (1.5))), vec2.mult(anchor_points[0].section_angle, 0)),
        vec2.add(vec2.add(anchor_points[1].right, vec2.mult(anchor_points[1].normal, Boid.width / (1.5))), vec2.mult(anchor_points[1].section_angle, 0.5)),
        vec2.add(anchor_points[1].center, vec2.mult(anchor_points[1].section_angle, -0.8))
    );



    ctx.shadowColor = Boid.shadow_color;
    ctx.shadowBlur = Boid.shadow_blur;
    ctx.shadowOffsetX =  Boid.shadow_offset_x;
    ctx.shadowOffsetY =  Boid.shadow_offset_y;

    ctx.fillStyle = 'rgb(' + this.color.r + ',' + this.color.g + ',' + this.color.b + ')';

    // DRAW HEAD
    ctx.beginPath();
    ctx.moveTo(head_start.x, head_start.y);
    ctx.bezierCurveTo(anchor_point_head_left.x, anchor_point_head_left.y, anchor_point_head_right.x, anchor_point_head_right.y, head_end.x, head_end.y);

    // DRAW BODY
    for(let i = 1; i < anchor_points.length - 2; i++) {

        ctx.bezierCurveTo(anchor_points[i].right.x, anchor_points[i].right.y, anchor_points[i + 1].right.x, anchor_points[i + 1].right.y, anchor_points[i + 2].right.x, anchor_points[i + 2].right.y);
    }

    for(let i = anchor_points.length - 2; i > 1 ; i--) {
        ctx.bezierCurveTo(anchor_points[i].left.x, anchor_points[i].left.y, anchor_points[i - 1].left.x, anchor_points[i - 1].left.y, anchor_points[i - 2].left.x, anchor_points[i - 2].left.y);
    }

    ctx.fill();

    ctx.shadowColor = "transparent";
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
