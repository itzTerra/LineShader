const generateForm = document.getElementById("generateForm");
generateForm.addEventListener("submit", (e) => {
  e.preventDefault();

  generateArt();
});

const artDiv = document.getElementById("art");

// IN DEV
// originalImg = document.createElement("img");
// originalImg.src = "img/0.png";

var art;

function getImg(source, settings) {
  const image = {};

  const sizeX = settings.width;
  const sizeY = settings.height;
  resultCanvas.width = sizeX;
  resultCanvas.height = sizeY;
  const context = resultCanvas.getContext("2d");

  if (source == "upload") {
    context.drawImage(originalImg, 0, 0, sizeX, sizeY);
    image.data = context.getImageData(0, 0, sizeX, sizeY);
    image.src = originalImg.src;
  } else if (source == "process") {
    context.drawImage(processedImg.image, 0, 0, sizeX, sizeY);
    image.data = context.getImageData(0, 0, sizeX, sizeY);
    image.src = processedImg.toBase64();
  } else {
    context.drawImage(source, 0, 0, sizeX, sizeY);
    image.data = context.getImageData(0, 0, sizeX, sizeY);
    image.src = source.src;
  }

  // console.log(image, sizeX, sizeY);
  return image;
}

function getImages(srcList, settings) {
  return new Promise((resolve, reject) => {
    const loadedImages = [];
    let imagesToLoad = srcList.length;

    srcList.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        loadedImages.push(getImg(img, settings));
        imagesToLoad--;
        if (imagesToLoad === 0) {
          resolve(loadedImages);
        }
      };
      img.onerror = () => {
        imagesToLoad--;
        console.error(`Failed to load image from ${src}`);
        if (imagesToLoad === 0) {
          resolve(loadedImages);
        }
      };
    });
  });
}

function getSettings(formData) {
  return new ArtSettings({
    width: Number(formData.get("width")),
    height: Number(formData.get("height")),
    showImage: Boolean(formData.get("showImage")),
    fps: Number(formData.get("fps")),
    
    color: formData.get("color"),
    opacity: Number(formData.get("opacity")),
    bg: formData.get("bg"),
    bgOpacity: Number(formData.get("bgOpacity")),
    vanishRate: Number(formData.get("vanishRate")),

    startAgents: Number(formData.get("startAgents")),
    maxAgents: Number(formData.get("maxAgents")),
    moveSpeed: Number(formData.get("moveSpeed")),
    branchiness: Number(formData.get("branchiness")),

    precision: Number(formData.get("precision")),
    intensityRadius: Number(formData.get("intensityRadius")),
    sightRadius: Number(formData.get("sightRadius")),
    sensitivity: Number(formData.get("sensitivity")),
    brightness: Number(formData.get("brightness")),
  });
}

async function generateArt() {
  try {
    const formData = new FormData(generateForm);

    let images = [];

    const settings = getSettings(formData);
    if (
      (formData.get("source") == "upload" && originalImg) ||
      (formData.get("source") == "process" && processedImg)
    ) {
      images = [getImg(formData.get("source"), settings)];
    } else {
      images = await getImages(["img/0.png", "img/1.png"], settings);
    }

    if (art) {
      artDiv.innerHTML = "";
      art.p5.remove();
      art = null;
    }

    art = new CurveArt("art", settings, images, true);
    console.log(art);
  } catch (err) {
    console.error(err);
  }
}

function playPause() {
  art.playPause();
}

function switchImage() {
  art.switchImage();
}
