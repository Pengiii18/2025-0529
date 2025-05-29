let video;
let handpose;
let predictions = [];

let currentSelection = ""; // 左或右的選擇
let selected = false;

// 題目與答案
const questions = [
  '淡江大學教育科技學系的英文名稱是 "Department of Educational Engineering"。',
  "教育科技學系強調的是科技與教學的整合應用。",
  "教育科技學系的學生主要學習傳統教學法，不太接觸科技應用。",
  "淡江教育科技學系的學生可以學習程式設計與遊戲設計相關課程。",
  "該系只針對教師職涯發展設計課程，沒有其他就業方向。",
  "教育科技學系有提供師資培育課程，學生可取得教學資格。",
  "該系在實習課程上完全不涉及實際操作或專題製作。",
  "淡江教育科技學系隸屬於文學院。",
  "教育科技學系的課程涵蓋數位學習平台的開發與應用。",
  "該系設有專屬實驗室，如教學媒體實驗室與互動科技實驗室。"
];
const answers = [
  "錯", "對", "錯", "對", "錯", "對", "錯", "錯", "對", "對"
];

let currentQuestion = 0;
let showResult = false;
let resultText = "";
let quizFinished = false;

let selectionStartTime = null; // 新增：記錄選擇開始時間

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
  if (!quizFinished) {
    drawQuestion();
    drawHint();
  }
  // 回饋訊息優先顯示，且暫停互動與題目切換
  if (showResult) {
    fill(255);
    textSize(40);
    text(resultText, width / 2, height / 2);
    textSize(24);
    return;
  }
  checkSelectionGesture();
  checkSelectionHoldToConfirm(); // 新增：檢查停留確認
  if (quizFinished) {
    fill(255, 255, 0);
    textSize(36);
    text("所有題目作答完畢！", width / 2, height / 2);
    textSize(24);
  }
}

function drawQuestion() {
  fill(255);
  textSize(18);
  text(`第 ${currentQuestion + 1} 題 / ${questions.length}`, width / 2, height / 2 - 60);
  textSize(20);
  // 讓題目內文置中顯示
  textAlign(CENTER, CENTER);
  text(questions[currentQuestion], width / 2, height / 2 - 20, width * 0.6, 60);
  textAlign(CENTER, CENTER); // 保持後續繪製置中
  textSize(24);
}

function drawOptions() {
  // 白板尺寸（放大）
  const boardW = 180;
  const boardH = 120;
  const margin = 20;

  // 左上方白板（對）
  if (currentSelection === "left") {
    fill(180, 255, 180); // 高亮
    stroke(0, 255, 0);
    strokeWeight(4);
  } else {
    fill(255);
    noStroke();
  }
  rect(margin, margin, boardW, boardH, 16);
  fill(0);
  noStroke();
  text("對", margin + boardW / 2, margin + boardH / 2);

  // 右上方白板（錯）
  if (currentSelection === "right") {
    fill(255, 180, 180); // 高亮
    stroke(255, 0, 0);
    strokeWeight(4);
  } else {
    fill(255);
    noStroke();
  }
  rect(width - margin - boardW, margin, boardW, boardH, 16);
  fill(0);
  noStroke();
  text("錯", width - margin - boardW / 2, margin + boardH / 2);

  // 綠燈或紅燈顯示
  if (currentSelection === "left") {
    fill(0, 255, 0); // 綠燈
    ellipse(margin + boardW / 2, margin - 10, 24, 24);
  } else if (currentSelection === "right") {
    fill(255, 0, 0); // 紅燈
    ellipse(width - margin - boardW / 2, margin - 10, 24, 24);
  }
}

function drawHint() {
  fill(255, 255, 0);
  textSize(18);
  text("請將食指移到左上或右上區域選擇答案\n停留3秒自動確認", width / 2, height - 60);
  textSize(24);
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
  if (predictions.length > 0 && !showResult && !quizFinished) {
    let index = predictions[0].landmarks[8]; // 食指尖端
    let x = index[0];
    let y = index[1];
    const boardW = 180;
    const boardH = 120;
    const margin = 20;
    let prevSelection = currentSelection;
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
    // 若選擇變動，重設計時
    if (currentSelection !== prevSelection) {
      selectionStartTime = currentSelection ? millis() : null;
      selected = false;
    }
  } else {
    currentSelection = "";
    selectionStartTime = null;
    selected = false;
  }
}

// 新增：檢查是否在選擇區域停留3秒
function checkSelectionHoldToConfirm() {
  if (
    currentSelection !== "" &&
    !selected &&
    !showResult &&
    !quizFinished &&
    selectionStartTime !== null
  ) {
    let holdTime = millis() - selectionStartTime;
    // 顯示倒數提示
    fill(255, 255, 0);
    textSize(20);
    let sec = Math.ceil((3000 - holdTime) / 1000);
    if (sec > 0) {
      text(`將於 ${sec} 秒後自動確認`, width / 2, 40);
    }
    // 停留3秒自動確認
    if (holdTime >= 3000) {
      selected = true;
      checkAnswer();
      setTimeout(() => {
        showResult = false;
        selected = false;
        currentSelection = "";
        selectionStartTime = null;
        currentQuestion++;
        if (currentQuestion >= questions.length) {
          quizFinished = true;
        }
      }, 1200);
    }
  }
}

function checkAnswer() {
  let userAns = currentSelection === "left" ? "對" : "錯";
  if (userAns === answers[currentQuestion]) {
    resultText = "答對了！";
  } else {
    resultText = "歐歐，答錯瞜QQ";
  }
  showResult = true;
}
