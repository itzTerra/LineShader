class CurveArt {
  constructor(elementId, settings, images, autoplay = false) {
    this.cx = settings.width / 2;
    this.cy = settings.height / 2;

    this.settings = settings;
    console.log(settings);
    this.images = images;
    this.imageIndex = 0;

    this.integralImages = [];
    for (let i = 0; i < this.images.length; i++) {
      this.integralImages.push(
        calculateIntegralImage(
          images[i].data.data,
          images[i].data.width,
          images[i].data.height
        )
      );
    }
    this.maxColorInRadius = (2 * settings.colorRadius) ** 2 * 255;

    this.agents = [];
    this.agentCount = 0;
    this.capped = false;

    const s = (p) => {
      p.preload = () => {
        for (let i = 0; i < this.images.length; i++) {
          this.images[i] = p.loadImage(this.images[i].base64 || this.images[i].src);
        }
      };
      p.setup = () => {
        p.createCanvas(settings.width, settings.height);
        p.frameRate(60);

        // Draw block
        p.background(settings.bg.r, settings.bg.g, settings.bg.b, 255);
        if (settings.showImage) {
          p.image(this.images[this.imageIndex], 0, 0);
        }

        if (!autoplay) {
          p.noLoop();
        }

        this.addStarterAgents(this.settings.startAgents);

        console.log(this.agents);
      };

      p.draw = () => {
        if (p.deltaTime > 200) {
          return;
        }
        if (this.settings.vanishRate) {
          p.background(
            this.settings.bg.r,
            this.settings.bg.g,
            this.settings.bg.b,
            this.settings.vanishRate
          );
        }

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

  addStarterAgents(amount) {
    let anglePart = (Math.PI * 2) / amount;
    const parent = {
      x: this.cx,
      y: this.cy,
    };
    for (let i = 0; i < amount; i++) {
      this.addAgent(this.cx, this.cy, parent, anglePart * i);
    }
  }

  addAgent(x, y, parent, angle = null) {
    this.agents.push(new Agent(x, y, parent, this, angle));
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
    let iimg = this.integralImages[this.imageIndex];
    if (!iimg) {
      return 0.1;
    }

    let topLeftX = Math.max(x - radius, 0);
    let topLeftY = Math.max(y - radius, 0);
    let bottomRightX = Math.min(x + radius, width - 1);
    let bottomRightY = Math.min(y + radius, height - 1);

    if (draw) {
      let color = this.settings.color;
      color[3] = 10;
      this.p5.stroke(...color);
      this.p5.rectMode(this.p5.CORNERS);
      this.p5.rect(topLeftX, topLeftY, bottomRightX, bottomRightY);
    }

    let sum = iimg[bottomRightX + bottomRightY * width];
    if (topLeftX > 0) sum -= iimg[topLeftX - 1 + bottomRightY * width];
    if (topLeftY > 0) sum -= iimg[bottomRightX + (topLeftY - 1) * width];
    if (topLeftX > 0 && topLeftY > 0)
      sum += iimg[topLeftX - 1 + (topLeftY - 1) * width];

    return inverseLerp(0, this.maxColorInRadius, sum);
  }

  switchImage() {
    this.imageIndex = (this.imageIndex + 1) % this.images.length
  }
}

class Agent {
  constructor(x, y, parent, artInstance, angle = null) {
    this.x = x;
    this.y = y;
    this.parent = parent;
    this.art = artInstance;
    this.lmin = this.art.settings.lineLengthRange[0];
    this.lmax = this.art.settings.lineLengthRange[1];

    this.angle = angle !== null ? angle : Math.random() * Math.PI * 2;
  }

  draw() {
    const p5 = this.art.p5;
    const settings = this.art.settings;
    if (!p5 || !this.parent) return;

    const colorValue = this.art.colorInRadius(this.x, this.y);

    p5.stroke(
      settings.color[0],
      settings.color[1],
      settings.color[2],
      lerp(1, settings.color[3], colorValue ** settings.sensitivity)
    );
    p5.strokeWeight(settings.lineWidth);
    p5.line(this.parent.x, this.parent.y, this.x, this.y);
    if (this.stopped) {
      p5.strokeWeight(settings.pointWidth);
      p5.point(this.x, this.y);
    }
  }

  update() {
    if (!this.art.p5) return;

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
    if (
      this.x > screenWidth ||
      this.x < 0 ||
      this.y > screenHeight ||
      this.y < 0
    ) {
      this.reborn();
      return;
    }

    const colorValue = this.art.colorInRadius(this.x, this.y);

    let distance = this.art.p5.dist(
      this.parent.x,
      this.parent.y,
      this.x,
      this.y
    );
    if (
      distance >
      lerp(
        this.lmin,
        this.lmax,
        Math.pow(1 - colorValue, 1 + this.art.settings.precision)
      )
    ) {
      this.stopped = true;
      this.branch(colorValue);
    }
  }

  reborn() {
    this.stopped = true;
    this.art.addAgent(this.art.cx, this.art.cy, this.parent);
  }

  branch(colorValue) {
    const newBranchCount = this.art.capped
      ? 1
      : Math.max(
          Math.floor(
            this.art.settings.branchiness *
              colorValue ** this.art.settings.sensitivity *
              Math.random() *
              5
          ),
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
    this.showImage = options.showImage || false;
    const bg = hexToRgb(options.bg);
    this.bg = bg || { r: 30, g: 30, b: 30 };
    const color = hexToRgb(options.color);
    this.color = [color.r, color.g, color.b, options.opacity || 100];
    this.lineWidth = options.lineWidth || 1;
    this.pointWidth = options.pointWidth || 6;
    this.colorRadius = options.colorRadius || 20;
    this.startAgents = options.startAgents || 4;
    this.maxAgents = options.maxAgents || 1000;
    this.lineWidth = options.lineWidth || 1;
    this.branchiness = options.branchiness || 0.8;
    this.precision = options.precision || 2;
    this.sensitivity = options.sensitivity || 2;
    this.lineLengthRange = options.lineLengthRange || [30, 300];
    this.moveSpeed = options.moveSpeed || 0.5;
    this.vanishRate = options.vanishRate !== null ? options.vanishRate : 0;
  }
}
