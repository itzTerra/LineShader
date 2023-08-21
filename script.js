const generateForm = document.getElementById("generateForm");
const artDiv = document.getElementById("art");

// IN DEV
originalImg = document.createElement("img");
originalImg.src = "img.png";

var art;

function getImg(sourceType, settings) {
  const image = {
    data: null,
    url: null,
  };

  const sizeX = originalImg.width * settings.resolution;
  const sizeY = originalImg.height * settings.resolution;

  if (sourceType == "upload" && originalImg) {
    resultCanvas.width = sizeX
    resultCanvas.height = sizeY
    const context = resultCanvas.getContext("2d");
    context.drawImage(originalImg, 0, 0, sizeX, sizeY);

    image.data = context.getImageData(0, 0, sizeX, sizeY);
    image.base64 = resultCanvas.toDataURL()
    image.url = originalImg.src;
  } else if (processedImg) {
    image.data = processedImg.imageData;
    image.base64 = processedImg.toBase64()
    image.url = processedImg.imageUrl;
  }

  console.log(image, sizeX, sizeY);
  return image;
}

function getSettings(formData) {
  return new ArtSettings({
    color: formData.get("color"),
    resolution: formData.get("resolution"),
    maxAgents: 1000,
  });
}

function generateArt() {
  try {
    const formData = new FormData(generateForm);

    const settings = getSettings(formData);
    const img = getImg(formData.get("source"), settings);

    if (art) {
      artDiv.innerHTML = "";
      art.p5.noLoop()
      art = null;
    }

    art = new CurveArt("art", settings, img, true);
  } catch (err) {
    console.error(err);
  }

  return false;
}

function playPause() {
  art.playPause();
}
