let capture;
let handposeModel;
let predictions = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  capture = createCapture(VIDEO);
  capture.size(windowWidth, windowHeight);
  handposeModel = ml5.handpose(capture, modelReady);
  handposeModel.on("predict", gotResults);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  capture.size(windowWidth, windowHeight);
}

function modelReady() {
  console.log("Handpose model loaded!");
  capture.hide();
}

function gotResults(results) {
  predictions = results;
  console.log(predictions);
}

function draw() {
  background(220);
  image(capture, 0, 0, width, height);

  // 繪製手部20個節點
  for (let i = 0; i < predictions.length; i++) {
    const hand = predictions[i];
    for (let j = 0; j < hand.landmarks.length; j++) {
      const [x, y] = hand.landmarks[j];
      fill(0, 255, 0);
      noStroke();
      ellipse(x, y, 10, 10);
    }
  }
}
