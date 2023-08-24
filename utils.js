function clamp(a, min = 0, max = 1) {
  return Math.min(max, Math.max(min, a));
}

function lerp(a, b, t) {
  return a * (1 - t) + b * t;
}

function inverseLerp(a, b, v) {
  return clamp((v - a) / (b - a));
}

function combineLerp(min1, max1, min2, max2, val) {
  let t = inverseLerp(min1, max1, val);
  return lerp(min2, max2, t);
}

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

function randint(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getImageIntensityMap(pixels, width, height) {
  const intensityMap = new Float32Array(width * height);

  for (let i = 0; i < intensityMap.length; i++) {
    intensityMap[i] = pixels[i * 4] / 255.0;
  }

  return intensityMap;
}

function getIntensityMapInRadius(
  imageIntensityMap,
  x,
  y,
  radius,
  width,
  height
) {
  const cx = Math.floor(x);
  const cy = Math.floor(y);
  const intensityMap = [];
  let total = 0;

  for (let y = cy - radius; y <= cy + radius; y++) {
    for (let x = cx - radius; x <= cx + radius; x++) {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const index = y * width + x;
        intensityMap.push(imageIntensityMap[index]);
        total += imageIntensityMap[index];
      } else {
        intensityMap.push(0);
      }
    }
  }

  return { map: intensityMap, total: total };
}

function getWeightedIndex(weights, total = null) {
  if (total === null) {
    total = weights.reduce((sum, weight) => sum + weight, 0);
  }
  let randomBreakpoint = Math.random() * total;

  for (let i = 0; i < weights.length; i++) {
    if (randomBreakpoint < weights[i]) {
      return i;
    }
    randomBreakpoint -= weights[i];
  }

  return Math.floor(Math.random() * weights.length);
}

function calculateIntegralImage(pixels, width, height) {
  let integral = [];
  for (let i = 0; i < width * height; i++) {
    integral.push(0);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = x + y * width;

      let sum = pixels[index * 4];
      if (x > 0) sum += integral[index - 1];
      if (y > 0) sum += integral[index - width];
      if (x > 0 && y > 0) sum -= integral[index - 1 - width];

      integral[index] = sum;
    }
  }

  return integral;
}

function calculateIntegralImageFromMap(intensityMap, width, height) {
  const l = intensityMap.length;
  let integral = new Float32Array(l);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = x + y * width;

      let sum = intensityMap[index];
      if (x > 0) sum += integral[index - 1];
      if (y > 0) sum += integral[index - width];
      if (x > 0 && y > 0) sum -= integral[index - 1 - width];

      integral[index] = sum;
    }
  }

  return integral;
}

function hexToRgb(hex) {
  if (!hex) return;
  // Remove the hash character if it's included
  hex = hex.replace("#", "");

  // Convert the hexadecimal values to integers
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return the RGB values as an object
  return { r, g, b };
}
