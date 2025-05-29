let capture;
let handposeModel;
let predictions = [];

function setup() {
  createCanvas(400, 400);
  capture = createCapture(VIDEO);
  capture.size(400, 400);
  capture.hide();

  handposeModel = ml5.handpose(capture, modelReady);
  handposeModel.on("predict", gotResults);
}

function modelReady() {
  console.log("Handpose model loaded!");
}

function gotResults(results) {
  predictions = results;
  console.log(predictions);
}

function draw() {
  background(220);
  image(capture, 0, 0, width, height);
}
