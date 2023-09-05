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

// IN DEV
// originalImg = document.createElement("img");
// originalImg.src = "img/0.png";

const generateForm = document.getElementById("generateForm");
generateForm.addEventListener("submit", (e) => {
  e.preventDefault();

  generateArt();
});

const artDiv = document.getElementById("art");

var art;

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
    const settings = getSettings(formData);
    let images = [];

    if (formData.get("source") == "upload" && originalImg) {
      images.push(originalImg);
    } else if (formData.get("source") == "process" && processedImg) {
      images.push(processedImg.image);
    } else {
      images = await LineArt.getImagesFromSources(DRAGON_SOURCES);
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
