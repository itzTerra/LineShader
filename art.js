const generateForm = document.getElementById("generateForm");
const artDiv = document.getElementById("art");

const DEFAULT_SETTINGS = {
  width: 1000,
  height: 800,
  bg: "#333",
};

function getImg(sourceType) {
  const image = {
    data: null,
    url: null,
  };
  if (sourceType == "upload" && originalImg) {
    const context = resultCanvas.getContext("2d");

    context.drawImage(originalImg, 0, 0, originalImg.width, originalImg.height);
    image.data = context.getImageData(
      0,
      0,
      originalImg.width,
      originalImg.height
    );
    image.url = originalImg.src;
  } else if (processedImg) {
    image.data = processedImg.imageData;
    image.url = processedImg.imageUrl;
  }

  console.log(image);
  return image;
}

function getSettings(formData) {
  return {
    ...DEFAULT_SETTINGS,
    color: formData.get("color"),
    resolution: formData.get("resolution"),
  };
}

function generateArt() {
  try {
    const formData = new FormData(generateForm);

    const img = getImg(formData.get("source"));
    const settings = getSettings(formData);

    drawSVG("#art", settings, img);
  } catch (err) {
    console.error(err);
  }

  return false;
}

const maxRadius = 16;
const lineWidth = 1;
const branchiness = 0.3;
const colorStrength = 0.5;
const maxDepth = 10;
let curDepth = 0;

function drawSVG(elID, settings, image) {
  artDiv.innerHTML = "";
  var draw = SVG().addTo(elID).size(settings.width, settings.height);

  if (settings.bg) {
    draw.css({ "background-color": settings.bg });
  }

  if (image && image.url && image.data) {
    draw
      .image(image.url)
      .size(
        image.data.width * settings.resolution,
        image.data.height * settings.resolution
      );
  }

  var center = draw.group();

  const cx = settings.width / 2;
  const cy = settings.height / 2;

  const tree = new Branch(cx, cy);
  tree.grow();
  tree.draw(center);

  center
    .stroke({ color: settings.color, width: 1, linecap: "round" })
    .center(cx, cy);
}

class Branch {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.branches = [];
    this.depth = 0;
  }

  grow() {
    this.depth++;
    console.log(this.depth);
    if (this.depth >= maxDepth) return;

    const newBranchCount = Math.max(
      Math.floor(branchiness * Math.random() * 10),
      1
    );

    for (let i = 0; i < newBranchCount; i++) {
      // Calculate a random angle in radians
      const randomAngle = Math.random() * Math.PI * 2;

      // Calculate random displacements along x and y axes
      const deltaX = Math.cos(randomAngle) * maxRadius;
      const deltaY = Math.sin(randomAngle) * maxRadius;
    }
  }

  draw(svg) {
    for (const branch of this.branches) {
      svg.line(this.x, this.y, branch.x, branch.y);
      branch.draw(svg);
    }
  }
}
