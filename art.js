class CurveArt {
  constructor(elementId, settings, images, autoplay = false) {
    this.cx = settings.width / 2;
    this.cy = settings.height / 2;

    this.settings = settings;
    // console.log(settings);
    this.images = images;
    this.imageIndex = 0;
    this.intensityMaps = [];
    for (let i = 0; i < this.images.length; i++) {
      this.intensityMaps.push(
        getImageIntensityMap(
          this.images[i].data.data,
          this.images[i].data.width,
          this.images[i].data.height
        )
      );
    }

    this.integralImages = [];
    for (let i = 0; i < this.images.length; i++) {
      this.integralImages.push(
        calculateIntegralImageFromMap(
          this.intensityMaps[i],
          this.images[i].data.width,
          this.images[i].data.height
        )
      );
    }

    this.maxIntensityInRadius = (2 * settings.intensityRadius) ** 2 * (2-settings.brightness);

    this.agents = [];
    this.agentCount = 0;
    this.capped = false;

    const s = (p) => {
      p.preload = () => {
        var a = document.createElement("a");
        a.target = "_blank";

        for (let i = 0; i < this.images.length; i++) {
          //   a.href = this.images[i].src;
          //   var event = new MouseEvent("click");
          //   a.dispatchEvent(event);

          this.images[i] = p.loadImage(this.images[i].src);
        }
      };
      p.setup = () => {
        this.settings.colorP5 = p.color(
          settings.color.r,
          settings.color.g,
          settings.color.b,
          settings.color.a
        );
        this.settings.bgP5 = p.color(
          settings.bg.r,
          settings.bg.g,
          settings.bg.b
        );

        p.createCanvas(settings.width, settings.height);
        p.frameRate(settings.fps);
        p.background(this.settings.bgP5);
        this.settings.bgP5.setAlpha(settings.bg.a);

        if (settings.showImage) {
          p.image(this.images[this.imageIndex], 0, 0);
        }

        if (!autoplay) {
          p.noLoop();
        }

        this.addStarterAgents(this.settings.startAgents);
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
    console.log(this.agentCount);
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
    const newAgent = new Agent(x, y, parent, this, angle);
    this.agents.push(newAgent);
    this.agentCount++;

    if (!this.capped && this.agentCount > this.settings.maxAgents) {
      this.capped = true;
    }
  }

  intensityInRadius(x, y, draw = false) {
    x = Math.floor(x);
    y = Math.floor(y);
    let radius = this.settings.intensityRadius;
    let width = this.settings.width;
    let height = this.settings.height;
    let iimg = this.integralImages[this.imageIndex];
    if (!iimg || !iimg.length) {
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

    // console.log(sum);

    return (
      inverseLerp(0, this.maxIntensityInRadius, sum) **
      this.settings.sensitivity
    );
  }

  switchImage() {
    this.imageIndex = (this.imageIndex + 1) % this.images.length;
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

    this.angle = angle !== null ? angle : this.getAngleBasedOnColorInRadius();
  }

  draw() {
    const p5 = this.art.p5;
    const settings = this.art.settings;
    if (!p5 || !this.parent) return;

    const colorValue = this.art.intensityInRadius(this.x, this.y);

    // p5.stroke(
    //   settings.color[0],
    //   settings.color[1],
    //   settings.color[2],
    //   lerp(1, settings.color[3], colorValue)
    // );

    p5.stroke(p5.lerpColor(settings.bgP5, settings.colorP5, colorValue));

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
      this.rebirth();
      return;
    }

    const colorValue = this.art.intensityInRadius(this.x, this.y);

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

  rebirth() {
    this.stopped = true;
    this.art.addAgent(this.art.cx, this.art.cy, {
      x: this.art.cx,
      y: this.art.cy,
    });
  }

  branch(colorValue) {
    const newBranchCount = this.art.capped
      ? 1
      : Math.max(
          Math.floor(
            this.art.settings.branchiness * colorValue * Math.random() * 5
          ),
          1
        );

    for (let i = 0; i < newBranchCount; i++) {
      this.art.addAgent(this.x, this.y, this);
    }
  }

  getAngleBasedOnColorInRadius() {
    const currentImageIntMap = this.art.intensityMaps[this.art.imageIndex];
    const sightRadius = this.art.settings.sightRadius;
    const width = this.art.settings.width;
    const height = this.art.settings.height;

    const { map: radiusIntMap, total: totalIntensity } =
      getIntensityMapInRadius(
        currentImageIntMap,
        this.x,
        this.y,
        sightRadius,
        width,
        height
      );

    const weightedMapIndex = getWeightedIndex(radiusIntMap, totalIntensity);
    const chosenY = Math.floor(weightedMapIndex / (2 * sightRadius + 1));
    const chosenX = weightedMapIndex % (2 * sightRadius + 1);

    // console.log(currentImageIntMap, radiusIntMap, weightedMapIndex, chosenX, chosenY)

    return Math.atan2(chosenY - sightRadius, chosenX - sightRadius);
  }
}

class ArtSettings {
  constructor(options = {}) {
    this.width = options.width || 1000;
    this.height = options.height || 800;
    this.showImage = options.showImage || false;
    this.fps = options.fps || 60;

    const color = hexToRgb(options.color);
    this.color = { ...color, a: options.opacity };
    const bg = hexToRgb(options.bg);
    this.bg = { ...bg, a: options.bgOpacity };
    this.vanishRate = options.vanishRate !== null ? options.vanishRate : 0;

    this.startAgents = options.startAgents || 4;
    this.maxAgents = options.maxAgents || 1000;
    this.moveSpeed = options.moveSpeed || 0.5;
    this.branchiness = options.branchiness || 0.5;

    this.precision = options.precision || 2;
    this.intensityRadius = options.intensityRadius || 20;
    this.sightRadius = options.sightRadius || 50;
    this.sensitivity = options.sensitivity || 2;
    this.brightness = options.brightness || 1;

    this.lineWidth = options.lineWidth || 1;
    this.pointWidth = options.pointWidth || 6;
    this.lineLengthRange = options.lineLengthRange || [30, 300];
  }
}
