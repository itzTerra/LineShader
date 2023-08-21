class Agent {
  constructor(x, y, parent, agentArray) {
    this.parent = parent;
    this.x = x;
    this.y = y;
    this.agents = agentArray;
    this.angle = Math.random() * Math.PI * 2;
    this.stopped = false;
  }

  draw(p) {
    if (!this.parent) return;

    p.line(this.parent.x, this.parent.y, this.x, this.y);
    p.point(this.x, this.y);
  }

  update(deltaTime) {
    if (this.stopped) return;
    let lightness = img.get(this.position.x, this.position.y)[0];

    this.x += Math.cos(this.angle) * moveSpeed * deltaTime;
    this.y += Math.sin(this.angle) * moveSpeed * deltaTime;

    let distance = dist(this.parent.x, this.parent.y, this.x, this.y);
    if (distance > random(50, 150)) {
      this.stopped = true;
      this.branch();
    }
  }

  branch() {
    const newBranchCount = Math.max(
      Math.floor(branchiness * Math.random() * 4),
      1
    );

    for (let i = 0; i < newBranchCount; i++) {
      this.agents.push(new Agent(this.x, this.y, this));
    }
  }
}
