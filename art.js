class CurveArt {
  constructor(elementId, settings, image, autoplay = false) {
    this.cx = settings.width / 2;
    this.cy = settings.height / 2;

    this.settings = settings;
    this.image = image;
    this.integralImage = calculateIntegralImage(
      image.data.data,
      image.data.width,
      image.data.height
    );

    console.log(this.integralImage);

    this.agents = [];
    this.agentCount = 0;
    this.capped = true;

    const s = (p) => {
      p.preload = () => {
        this.image = p.loadImage(image.base64);
      };
      p.setup = () => {
        p.createCanvas(settings.width, settings.height);
        p.frameRate(60);

        // Draw block
        p.background(settings.bg);
        p.image(this.image, 0, 0);
        p.translate(this.cx, this.cy);

        if (!autoplay) {
          p.noLoop();
        }

        this.addAgent(this.cx, this.cy, {
          x: this.cx,
          y: this.cy,
        });

        console.log(this.agents);
      };

      p.draw = () => {
        if (p.deltaTime > 200) {
          return;
        }
        p.stroke(...settings.color);
        p.fill(...settings.color);

        for (let i = this.agents.length - 1; i >= 0; i--) {
          this.agents[i].update(p.deltaTime);
          this.agents[i].draw(p);
          if (this.agents[i].stopped) {
            this.agents.splice(i, 1);
            this.agentCount--;
          }
        }
      };
    };

    this.p5 = new p5(s, elementId);
  }

  playPause() {
    if (this.p5.isLooping()) {
      this.p5.noLoop();
    } else {
      this.p5.loop();
    }
  }

  addAgent(x, y, parent) {
    this.agents.push(new Agent(x, y, parent, this));
    this.agentCount++;
    console.log(this.agentCount);

    if (!this.capped && this.agentCount > this.settings.maxAgents) {
      this.capped = true;
    }
  }

  colorInRadius(x, y, draw = false) {
    x = Math.floor(x);
    y = Math.floor(y);
    let radius = this.settings.colorRadius;
    let width = this.settings.width;
    let height = this.settings.height;
    let iimg = this.integralImage;

    let topLeftX = Math.max(x - radius, 0);
    let topLeftY = Math.max(y - radius, 0);
    let bottomRightX = Math.min(x + radius, width - 1);
    let bottomRightY = Math.min(y + radius, height - 1);

    if (draw) {
      let color = this.settings.color;
      color[3] = 10;
      this.p5.translate(0, 0);
      this.p5.stroke(...color);
      this.p5.rectMode(this.p5.CORNERS);
      this.p5.rect(topLeftX, topLeftY, bottomRightX, bottomRightY);
      this.p5.translate(this.cx, this.cy);
    }

    let sum = iimg[bottomRightX + bottomRightY * width];
    if (topLeftX > 0) sum -= iimg[topLeftX - 1 + bottomRightY * width];
    if (topLeftY > 0) sum -= iimg[bottomRightX + (topLeftY - 1) * width];
    if (topLeftX > 0 && topLeftY > 0)
      sum += iimg[topLeftX - 1 + (topLeftY - 1) * width];

    console.log(sum, topLeftX, topLeftY, bottomRightX, bottomRightY);
    return sum;
  }
}

class Agent {
  constructor(x, y, parent, artInstance) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.art = artInstance;
    this.lmin = this.art.settings.lineLengthRange[0];
    this.lmax = this.art.settings.lineLengthRange[1];

    this.angle = Math.random() * Math.PI * 2;
  }

  draw() {
    if (!this.art.p5 || !this.parent) return;

    this.art.p5.strokeWeight(this.art.settings.lineWidth);
    this.art.p5.line(this.parent.x, this.parent.y, this.x, this.y);
    if (this.stopped) {
      this.art.p5.strokeWeight(this.art.settings.pointWidth);
      this.art.p5.point(this.x, this.y);
    }
  }

  update() {
    if (!this.art.p5) return;
    // let lightness = img.get(this.position.x, this.position.y)[0];

    this.x +=
      Math.cos(this.angle) *
      this.art.settings.moveSpeed *
      this.art.p5.deltaTime;
    this.y +=
      Math.sin(this.angle) *
      this.art.settings.moveSpeed *
      this.art.p5.deltaTime;

    let screenWidth = this.art.settings.width;
    let screenHeight = this.art.settings.height;
    if (this.x > screenWidth) {
      this.x = 0;
    } else if (this.x < 0) {
      this.x = screenWidth;
    }
    if (this.y > screenHeight) {
      this.y = 0;
    } else if (this.y < 0) {
      this.y = screenHeight;
    }

    this.art.colorInRadius(this.x, this.y, true);

    let distance = this.art.p5.dist(
      this.parent.x,
      this.parent.y,
      this.x,
      this.y
    );
    if (distance > this.art.p5.random(this.lmin, this.lmax)) {
      this.branch();
      this.stopped = true;
    }
  }

  branch() {
    const newBranchCount = this.art.capped
      ? 1
      : Math.max(
          Math.floor(this.art.settings.branchiness * Math.random() * 5),
          1
        );

    for (let i = 0; i < newBranchCount; i++) {
      this.art.addAgent(this.x, this.y, this);
    }
  }
}

class ArtSettings {
  constructor(options = {}) {
    this.width = options.width || 1000;
    this.height = options.height || 800;
    this.bg = options.bg || "#333";
    this.color = [100, 255, 100, 30];
    this.lineWidth = options.lineWidth || 1;
    this.pointWidth = options.pointWidth || 6;
    this.colorRadius = options.colorRadius || 20;
    this.maxAgents = options.maxAgents || 1000;
    this.lineWidth = options.lineWidth || 1;
    this.branchiness = options.branchiness || 0.6;
    this.precision = options.precision || 0.5;
    this.lineLengthRange = options.lineLengthRange || [50, 150];
    this.moveSpeed = options.moveSpeed || 0.1;
    this.resolution = options.resolution || 2;
  }
}
