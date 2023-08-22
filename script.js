const generateForm = document.getElementById("generateForm");
const artDiv = document.getElementById("art");

// IN DEV
originalImg = document.createElement("img");
originalImg.src = "test.png";

var art;

function getImg(sourceType, settings) {
  const image = {};

  const sizeX = settings.width;
  const sizeY = settings.height;

  if (sourceType == "upload" && originalImg) {
    resultCanvas.width = sizeX;
    resultCanvas.height = sizeY;
    const context = resultCanvas.getContext("2d");
    context.drawImage(originalImg, 0, 0, sizeX, sizeY);

    image.data = context.getImageData(0, 0, sizeX, sizeY);
    image.base64 = resultCanvas.toDataURL();
    image.url = originalImg.src;
  } else if (processedImg) {
    image.data = processedImg.imageData;
    image.base64 = processedImg.toBase64();
    image.url = processedImg.imageUrl;
  }

  console.log(image, sizeX, sizeY);
  return image;
}

function getImages(settings) {
    const images = []
    originalImg = document.createElement("img");
    originalImg.src = "img/0.png";
    images.push(getImg("upload", settings))
    originalImg.src = "img/1.png";
    images.push(getImg("upload", settings))

  return images;
}

function getSettings(formData) {
  return new ArtSettings({
    width: Number(formData.get("width")),
    height: Number(formData.get("height")),
    showImage: Boolean(formData.get("showImage")),
    bg: formData.get("bg"),
    color: formData.get("color"),
    opacity: Number(formData.get("opacity")),
    maxAgents: Number(formData.get("maxAgents")),
    startAgents: Number(formData.get("startAgents")),
    precision: Number(formData.get("precision")),
    colorRadius: Number(formData.get("colorRadius")),
    vanishRate: Number(formData.get("vanishRate")),
  });
}

function generateArt() {
  try {
    const formData = new FormData(generateForm);

    const settings = getSettings(formData);
    const images = getImages(settings);

    if (art) {
      artDiv.innerHTML = "";
      art.p5.remove();
      art = null;
    }

    art = new CurveArt("art", settings, images, true);
  } catch (err) {
    console.error(err);
  }

  return false;
}

function playPause() {
  art.playPause();
}

function switchImage() {
  art.switchImage();
}
