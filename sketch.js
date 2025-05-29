let video;
let handpose;
let predictions = [];

let currentSelection = ""; // 左或右的選擇
let selected = false;

function setup() {
  createCanvas(windowWidth, windowHeight);
  video = createCapture(VIDEO);
  video.size(windowWidth, windowHeight);
  video.hide();

  handpose = ml5.handpose(video, modelReady);
  handpose.on("predict", results => {
    predictions = results;
  });

  textAlign(CENTER, CENTER);
  textSize(24);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  video.size(windowWidth, windowHeight);
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
  // 白板尺寸
  const boardW = 120;
  const boardH = 80;
  const margin = 20;

  // 左上方白板（正確）
  fill(255);
  rect(margin, margin, boardW, boardH, 16);
  fill(0);
  text("正確", margin + boardW / 2, margin + boardH / 2);

  // 右上方白板（錯誤）
  fill(255);
  rect(width - margin - boardW, margin, boardW, boardH, 16);
  fill(0);
  text("錯誤", width - margin - boardW / 2, margin + boardH / 2);

  // 綠燈或紅燈顯示
  if (currentSelection === "left") {
    fill(0, 255, 0); // 綠燈
    ellipse(margin + boardW / 2, margin - 10, 24, 24);
  } else if (currentSelection === "right") {
    fill(255, 0, 0); // 紅燈
    ellipse(width - margin - boardW / 2, margin - 10, 24, 24);
  }
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
    let y = index[1];
    const boardW = 120;
    const boardH = 80;
    const margin = 20;
    // 判斷是否在左上白板
    if (x > margin && x < margin + boardW && y > margin && y < margin + boardH) {
      currentSelection = "left";
    }
    // 判斷是否在右上白板
    else if (x > width - margin - boardW && x < width - margin && y > margin && y < margin + boardH) {
      currentSelection = "right";
    }
    else {
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
  if (currentSelection === "left") {
    alert("你選擇了：正確");
  } else if (currentSelection === "right") {
    alert("你選擇了：錯誤");
  }
}
