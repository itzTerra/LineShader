const WEATHER_SOURCES = [
  "examples/weather/1.png",
  "examples/weather/2.png",
  "examples/weather/3.png",
  "examples/weather/4.png",
  "examples/weather/5.png",
  "examples/weather/6.png",
  "examples/weather/7.png",
  "examples/weather/8.png",
];

const DRAGON_SOURCES = [
  "examples/dragon/1.jpg",
  "examples/dragon/2.jpg",
  "examples/dragon/3.jpg",
  "examples/dragon/4.jpg",
  "examples/dragon/5.jpg",
  "examples/dragon/6.jpg",
  "examples/dragon/7.jpg",
  "examples/dragon/8.jpg",
  "examples/dragon/9.jpg",
];

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

    let i = 0;
    srcList.forEach((src) => {
      const index = i++;
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const imgData = getImg(img, settings);
        imgData.id = index;
        loadedImages.push(imgData);
        imagesToLoad--;
        if (imagesToLoad === 0) {
          loadedImages.sort((a, b) => {
            a.id - b.id;
          });
          resolve(loadedImages);
        }
      };
      img.onerror = () => {
        imagesToLoad--;
        console.error(`Failed to load image from ${src}`);
        if (imagesToLoad === 0) {
          loadedImages.sort((a, b) => {
            a.id - b.id;
          });
          resolve(loadedImages);
        }
      };
    });
  });
}

function getSettings(formData) {
  return new ArtSettings({
    intensityMode: formData.get("intensityMode"),
    width: Number(formData.get("width")),
    height: Number(formData.get("height")),
    showImage: Boolean(formData.get("showImage")),
    fps: Number(formData.get("fps")),
    imageDelay: Number(formData.get("imageDelay")),

    color: formData.get("color"),
    opacity: Number(formData.get("opacity")),
    bg: formData.get("bg"),
    bgOpacity: Number(formData.get("bgOpacity")),
    vanishRate: Number(formData.get("vanishRate")),

    startAgents: Number(formData.get("startAgents")),
    maxAgents: Number(formData.get("maxAgents")),
    moveSpeed: Number(formData.get("moveSpeed")),
    branchiness: Number(formData.get("branchiness")),
    lineLenMin: Number(formData.get("lineLenMin")),
    lineLenMax: Number(formData.get("lineLenMax")),

    lineLenContrast: Number(formData.get("lineLenContrast")),
    intensityRadius: Number(formData.get("intensityRadius")),
    sightRadius: Number(formData.get("sightRadius")),
    contrast: Number(formData.get("contrast")),
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
      images = await getImages(DRAGON_SOURCES, settings);
    }

    if (art) {
      artDiv.innerHTML = "";
      art.p5.remove();
      art = null;
    }

    art = new LineArt("art", settings, images, true);
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
