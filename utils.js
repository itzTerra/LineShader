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

function calculateIntegralImage(pixels, width, height) {
  let integral = [];
  for (let i = 0; i < width * height; i++) {
    integral.push(0);
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let index = x + y * width;

      let sum = pixels[index*4];
      if (x > 0) sum += integral[index - 1];
      if (y > 0) sum += integral[index - width];
      if (x > 0 && y > 0) sum -= integral[index - 1 - width];

      integral[index] = sum;
    }
  }

  return integral;
}
