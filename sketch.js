let video;
let handpose;
let predictions = [];

let currentSelection = ""; // 左或右的選擇
let selected = false;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  video.size(width, height);
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  textAlign(CENTER, CENTER);
  textSize(24);
}

function modelReady() {
  console.log("🤖 Handpose model ready!");
}

function draw() {
  background(0);
  image(video, 0, 0, width, height);
  drawOptions();
  drawHands();
  checkSelectionGesture();
  checkClapToConfirm();
}

function drawOptions() {
  fill(currentSelection === "left" ? "lime" : "white");
  rect(50, 150, 200, 180, 20);
  fill(0);
  text("互動白板", 150, 240);

  fill(currentSelection === "right" ? "lime" : "white");
  rect(390, 150, 200, 180, 20);
  fill(0);
  text("投影機", 490, 240);
}

function drawHands() {
  if (predictions.length > 0) {
    for (let hand of predictions) {
      for (let i = 0; i < hand.landmarks.length; i++) {
        let [x, y] = hand.landmarks[i];
        fill(255, 0, 0);
        noStroke();
        ellipse(x, y, 10, 10);
      }
    }
  }
}

function checkSelectionGesture() {
  if (predictions.length > 0) {
    let index = predictions[0].landmarks[8]; // 食指尖端
    let x = index[0];
    if (x < width / 3) {
      currentSelection = "left";
    } else if (x > 2 * width / 3) {
      currentSelection = "right";
    } else {
      currentSelection = "";
    }
  }
}

function checkClapToConfirm() {
  if (predictions.length >= 2 && !selected) {
    let hand1 = predictions[0].landmarks[0]; // 左手掌心
    let hand2 = predictions[1].landmarks[0]; // 右手掌心
    let d = dist(hand1[0], hand1[1], hand2[0], hand2[1]);

    if (d < 60 && currentSelection !== "") {
      selected = true;
      console.log("✅ 選擇了：" + currentSelection);
      setTimeout(() => {
        selected = false;
        nextRound();
      }, 1000);
    }
  }
}

function nextRound() {
  // TODO: 下一關邏輯可寫在這邊
  alert("你選擇了：" + (currentSelection === "left" ? "互動白板" : "投影機"));
}
