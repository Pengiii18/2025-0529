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

  // 若有偵測到手，於每個手指關節畫圈圈
  for (let i = 0; i < predictions.length; i++) {
    const hand = predictions[i];
    // 畫每個關節的圈圈
    for (let j = 0; j < hand.landmarks.length; j++) {
      const [x, y] = hand.landmarks[j];
      fill(255, 0, 0, 180);
      stroke(255);
      strokeWeight(2);
      ellipse(x, y, 20, 20);
    }

    // 畫骨架
    stroke(0, 0, 255);
    strokeWeight(3);
    for (let k = 0; k < hand.annotations.thumb.length - 1; k++) {
      let [x1, y1] = hand.annotations.thumb[k];
      let [x2, y2] = hand.annotations.thumb[k + 1];
      line(x1, y1, x2, y2);
    }
    for (let k = 0; k < hand.annotations.indexFinger.length - 1; k++) {
      let [x1, y1] = hand.annotations.indexFinger[k];
      let [x2, y2] = hand.annotations.indexFinger[k + 1];
      line(x1, y1, x2, y2);
    }
    for (let k = 0; k < hand.annotations.middleFinger.length - 1; k++) {
      let [x1, y1] = hand.annotations.middleFinger[k];
      let [x2, y2] = hand.annotations.middleFinger[k + 1];
      line(x1, y1, x2, y2);
    }
    for (let k = 0; k < hand.annotations.ringFinger.length - 1; k++) {
      let [x1, y1] = hand.annotations.ringFinger[k];
      let [x2, y2] = hand.annotations.ringFinger[k + 1];
      line(x1, y1, x2, y2);
    }
    for (let k = 0; k < hand.annotations.pinky.length - 1; k++) {
      let [x1, y1] = hand.annotations.pinky[k];
      let [x2, y2] = hand.annotations.pinky[k + 1];
      line(x1, y1, x2, y2);
    }
    for (let k = 0; k < hand.annotations.palmBase.length; k++) {
      let [x1, y1] = hand.landmarks[0];
      let [x2, y2] = hand.annotations.palmBase[k];
      line(x1, y1, x2, y2);
    }
  }
}
