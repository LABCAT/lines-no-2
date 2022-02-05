export default class AnimatedLine {
    constructor(p5, beginX, beginY, endX, endY, lifetime, fromColour, toColour) {
        this.p = p5;
        this.beginX = beginX; 
        this.beginY = beginY;
        this.endX = endX; 
        this.endY = endY; 
        this.fromColour = this.p.color(fromColour);
        this.toColour = this.p.color(toColour);
        this.distX = this.endX - this.beginX; // X-axis distance to move
        this.distY = this.endY - this.beginY; // Y-axis distance to move
        this.x = 0.0; // Current x-coordinate
        this.y = 0.0; // Current y-coordinate
        this.pointIndex = 0;
        this.totalsFrames = this.p.frameRate() * lifetime;
    }

    draw() {
        if(this.pointIndex < 1.0) {
            const fill = this.p.lerpColor(this.fromColour, this.toColour, this.pointIndex);
            this.p.fill(fill);
            this.p.noStroke();
            for (let i = 0; i < 1000 / this.totalsFrames; i++) {
                this.x = this.beginX + this.pointIndex * this.distX;
                this.y = this.beginY + this.p.pow(this.pointIndex, 4) * this.distY;
                this.p.ellipse(this.x, this.y, this.p.height/ 64, this.p.height/ 64);
                this.pointIndex += 0.001;    
            }
        }
        
    }
}