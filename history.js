class History {

    /**
     * 
     * @param {*} x 
     * @param {*} y 
     * @param {*} radius 
     */
    constructor(x, y) {

        this.pos = vec2.create(x, y);

        this.radius = 100;

        /*
        let configs = [
            {

            }
        ]*/


        // Milliseconds between each update
        this.step = 1000;
        // Time period covered in milliseconds
        this.covered_period_duration = 60000;
        // Number of step
        this.nb_of_steps = this.covered_period_duration / this.step;
        // Number of steps to clear before current step
        this.shift = 1;

        this.steps_min_value = 0.0002;
        this.steps_base_value = 20;
        this.steps_value = Array(this.covered_period_duration / this.step).fill(this.steps_min_value);

        // Last recorded time since app launching in milliseconds
        this.last_time = 0;

        this.time_passed_since_last_step = 0;
        this.time_passed_since_last_period = 0;
        this.nb_of_updates_since_current_step_start = 0;
        this.nb_of_steps_since_current_period_start = 0;
        this.steps_noise_buffers = Array(this.covered_period_duration / this.step).fill([]);
    }

    /**
     * 
     * @param {*} noise a value
     */
    update(noise, time) {

        let time_passed_since_last_update = time - this.last_time;
        this.time_passed_since_last_step += time_passed_since_last_update;

        this.last_time = time;
        this.steps_noise_buffers[this.nb_of_steps_since_current_period_start].push(noise);

        if(this.time_passed_since_last_step >= this.step) {

            // Average noise for current_step

            this.steps_value[this.nb_of_steps_since_current_period_start] = 
                Math.max(this.steps_noise_buffers[this.nb_of_steps_since_current_period_start].reduce((acc, volume) => acc + volume, 0) / (this.steps_noise_buffers[this.nb_of_steps_since_current_period_start].length * 1.0), this.steps_min_value);

            //this.steps_noise_buffers.push([]);


            this.nb_of_steps_since_current_period_start++;
            this.time_passed_since_last_step = 0;

            this.steps_noise_buffers[this.nb_of_steps_since_current_period_start % (this.steps_value.length)] = [];

            for(let i = 0; i < this.shift; i++) {

                this.steps_noise_buffers[(this.nb_of_steps_since_current_period_start + i) % (this.steps_value.length)] = [];

                this.steps_value[(this.nb_of_steps_since_current_period_start + i) % (this.steps_value.length)] = 0; 
            }
        } 

        if(this.nb_of_steps_since_current_period_start >= this.nb_of_steps) {
            this.nb_of_steps_since_current_period_start = 0;
        }


    }

    /**
     * 
     */
    render() {

        let angle = ((Math.PI * 2) / this.steps_value.length);
        let step_width = (2 * Math.PI) * this.radius / this.steps_value.length;
        let step_height = 0;

        ctx.fillStyle = "rgba(0, 0, 0, 0.2)";


        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);

        /*
        ctx.beginPath();

        for (var i = 0; i < this.steps_value.length; i++) {


            ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
            ctx.strokeStyle = `rgb(0, 0, 0)`;

            step_height = this.steps_value[i] * 5000; 

            ctx.rotate(angle);


            // Bars
            ctx.fillRect(-(step_width / 2), this.radius, step_width, step_height);

            // Dots
            /*ctx.beginPath();
            ctx.arc(-(step_width / 2), this.radius + step_height, 2, 0, 2 * Math.PI);
            ctx.fill();*/

            //Line
            //ctx.lineTo(-(step_width / 2), this.radius + step_height);

            // Disks
            //ctx.fillText(step_height, 50, 50);
            //ctx.fillStyle = `rgba(${255 / step_height}, ${255 / step_height}, ${255 / step_height}, 0.1)`;

        //}
        
        
        let cumulative_sizes = 0;
        let index = this.nb_of_steps_since_current_period_start;
        
        while (index !== (this.nb_of_steps_since_current_period_start + 1) % this.steps_value.length && cumulative_sizes < canvas.height / 2.5) {
            
            ctx.fillStyle = `rgba(0, 0, 0, ${(this.steps_value[index] * 5000) / 220})`;
            
            //disk_size = this.steps_value[index] * 5000; 

            ctx.beginPath();
            ctx.arc(0, 0, cumulative_sizes, 0, 2 * Math.PI);
            cumulative_sizes += this.steps_base_value;
            ctx.arc(0, 0, cumulative_sizes, 0, 2 * Math.PI, true);
            ctx.fill();
            
            if(index === 0) index = this.steps_value.length - 1;
            else index--;
        }
        

        //ctx.stroke();

        ctx.restore();
        /*
        ctx.save();
        ctx.fillStyle = `rgb(255, 255, 255)`;
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate((3 + this.nb_of_steps_since_current_period_start) * ((Math.PI * 2) / this.steps_value.length));
        ctx.fillRect(-(step_width / 2), this.radius - 20, 40, 200);
        ctx.restore();
        */

    }
}