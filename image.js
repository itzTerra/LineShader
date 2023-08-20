const input = document.getElementById("imageInput");
const preview = document.getElementById("imagePreview");
const resultDiv = document.getElementById("imageResult");
const resultCanvas = document.getElementById("resultCanvas")
const processBtn = document.getElementById("processBtn");
const downloadBtn = document.getElementById("downloadBtn");
var originalImg;
var originalName;
var processedImg;

function uploadImg() {
  if (!input.files || !input.files[0]) return;

  const file = input.files[0];
  const reader = new FileReader();

  reader.onload = function (e) {
    // Display image preview
    originalImg = document.createElement("img");
    originalImg.src = e.target.result;
    originalImg.style.maxWidth = "100%";
    originalImg.style.height = "auto";
    preview.innerHTML = "";
    preview.appendChild(originalImg);

    originalName = file.name;

    // You can also send the file to the server using AJAX if needed
    // For demonstration purposes, I'm just logging the file details here
    console.log("File Name:", file.name);
    console.log("File Type:", file.type);
    console.log("File Size:", file.size);
  };

  reader.readAsDataURL(file);

  processBtn.disabled = false;
}

function downloadImg() {
  if (!processedImg) return;

  let a = document.createElement("a");
  a.href = processedImg.toBase64();
  a.download = originalName;
  a.click();
}

function processImg() {
  const newCanvas = document.createElement("canvas");
  newCanvas.style.maxWidth = "100%";
  newCanvas.style.height = "auto";
  resultDiv.innerHTML = "";
  resultDiv.appendChild(newCanvas);

  Caman(newCanvas, originalImg.src, function () {
    this.greyscale();
    this.render(() => {
      processedImg = this;
    });
  });
  downloadBtn.disabled = false;
}
