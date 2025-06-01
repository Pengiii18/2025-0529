let video;
let handpose;
let predictions = [];

let currentSelection = ""; // 左或右的選擇
let selected = false;

// 首頁狀態
let showHome = true;
let homeSelection = false;
let homeSelectionStartTime = null;

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

// ====== 新增：提示模式相關變數 ======
let hintButtonImg;
let showHintBox = false;
let hintButtonHoldStart = null;
let closeHintHoldStart = null;
const hintButtonW = 64;
const hintButtonH = 64;
const hintBoxW = 420;
const hintBoxH = 180;
const hintBoxCloseW = 80;
const hintBoxCloseH = 40;
const hintTexts = [
  '注意校名與系名的正確翻譯方式，是否真的叫 "Engineering"？',
  '想想這個系的名字：「教育」與「科技」結合意味著什麼？',
  '名稱中有「科技」，這代表他們會完全忽略科技嗎？',
  '課程中有「互動科技」、「遊戲化學習」等相關內容，你猜？',
  '你覺得會不會還有像數位學習、科技業等其他出路？',
  '想進入教育現場當老師？這個系有開設哪些相關訓練？',
  '記得有「媒體實驗室」、「專題課程」等實作機會嗎？',
  '教育科技比較偏向教育學與資訊，會屬於哪個學院？',
  '數位學習是教育科技的核心之一，這點有沒有教？',
  '想做互動教學或媒體設計，會不會需要這類空間？'
];

function preload() {
  hintButtonImg = loadImage('1.png');
}

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
  drawWoodenFrame();
  image(video, 0, 0, width, height);

  // ====== 畫面最左側中央的提示按鈕 ======
  drawHintButton();
  checkHintButtonGesture();

  // 若提示框開啟，顯示提示框並暫停其他互動
  if (showHintBox) {
    drawHintBox();
    checkCloseHintGesture();
    return;
  }

  if (showHome) {
    drawHome();
    checkHomeSelectionGesture();
    checkHomeSelectionHoldToConfirm();
    return;
  }

  drawOptions();
  drawHands();
  // 回饋訊息優先顯示，且暫停互動與題目切換
  if (showResult) {
    // 只顯示回饋，不顯示題目
    fill(255);
    textSize(48);
    text(resultText, width / 2, height / 2);
    textSize(24);
    return;
  }
  if (!quizFinished) {
    drawQuestion();
    drawHint();
  }
  checkSelectionGesture();
  checkSelectionHoldToConfirm();
  if (quizFinished) {
    fill(255, 255, 0);
    textSize(36);
    text("所有題目作答完畢！", width / 2, height / 2);
    textSize(24);
  }
}

// 木頭風格邊框繪製
function drawWoodenFrame() {
  // 外層深色
  noFill();
  stroke(102, 51, 0);
  strokeWeight(32);
  rect(0, 0, width, height, 40);

  // 中層較淺
  stroke(153, 102, 51);
  strokeWeight(16);
  rect(16, 16, width - 32, height - 32, 28);

  // 內層亮色
  stroke(204, 153, 102);
  strokeWeight(8);
  rect(32, 32, width - 64, height - 64, 16);

  // 還原
  noStroke();
}

// 首頁繪製
function drawHome() {
  // 標題
  fill(255, 255, 0);
  textSize(40);
  textAlign(CENTER, CENTER);
  text("教育科技學系知識王", width / 2, height / 2 - 120);

  // 互動方塊
  const boxW = 240;
  const boxH = 100;
  const boxX = width / 2 - boxW / 2;
  const boxY = height / 2 - boxH / 2;

  if (homeSelection) {
    fill(180, 255, 180);
    stroke(0, 255, 0);
    strokeWeight(4);
  } else {
    fill(255);
    noStroke();
  }
  rect(boxX, boxY, boxW, boxH, 20);

  fill(0);
  noStroke();
  textSize(32);
  text("進入遊戲", width / 2, height / 2);

  // 綠燈顯示
  if (homeSelection) {
    fill(0, 255, 0);
    ellipse(width / 2, boxY - 30, 24, 24);
  }

  // 提示
  fill(255, 255, 0);
  textSize(18);
  text("請將食指移到方塊上，停留3秒進入遊戲", width / 2, height / 2 + 90);
  textSize(24);
}

function drawQuestion() {
  fill(255);
  textSize(18);
  text(`第 ${currentQuestion + 1} 題 / ${questions.length}`, width / 2, height / 2 - 80);
  textSize(20);
  // 讓題目內文置中顯示（垂直與水平皆置中）
  textAlign(CENTER, CENTER);
  text(
    questions[currentQuestion],
    width / 2,
    height / 2 - 10,      // 調整y，讓多行能更居中
    width * 0.6,
    100                   // 區塊高度
  );
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
      }, 2000); // 顯示回饋2秒
    }
  }
}

// 首頁手勢偵測
function checkHomeSelectionGesture() {
  if (predictions.length > 0 && showHome) {
    let index = predictions[0].landmarks[8]; // 食指尖端
    let x = index[0];
    let y = index[1];
    const boxW = 240;
    const boxH = 100;
    const boxX = width / 2 - boxW / 2;
    const boxY = height / 2 - boxH / 2;
    let prevSelection = homeSelection;
    if (x > boxX && x < boxX + boxW && y > boxY && y < boxY + boxH) {
      homeSelection = true;
    } else {
      homeSelection = false;
    }
    if (homeSelection !== prevSelection) {
      homeSelectionStartTime = homeSelection ? millis() : null;
    }
  } else {
    homeSelection = false;
    homeSelectionStartTime = null;
  }
}

// 首頁停留3秒自動進入遊戲
function checkHomeSelectionHoldToConfirm() {
  if (homeSelection && homeSelectionStartTime !== null && showHome) {
    let holdTime = millis() - homeSelectionStartTime;
    fill(255, 255, 0);
    textSize(20);
    let sec = Math.ceil((3000 - holdTime) / 1000);
    if (sec > 0) {
      text(`將於 ${sec} 秒後進入遊戲`, width / 2, height / 2 + 140);
    }
    if (holdTime >= 3000) {
      showHome = false;
      homeSelection = false;
      homeSelectionStartTime = null;
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

// ====== 畫提示按鈕 ======
function drawHintButton() {
  let x = 24;
  let y = height / 2 - hintButtonH / 2;
  image(hintButtonImg, x, y, hintButtonW, hintButtonH);
}

// ====== 檢查手指是否碰觸提示按鈕並停留3秒 ======
function checkHintButtonGesture() {
  if (showHome || showResult || quizFinished || showHintBox) return;
  if (predictions.length > 0) {
    let index = predictions[0].landmarks[8];
    let x = index[0];
    let y = index[1];
    let bx = 24;
    let by = height / 2 - hintButtonH / 2;
    if (x > bx && x < bx + hintButtonW && y > by && y < by + hintButtonH) {
      if (!hintButtonHoldStart) hintButtonHoldStart = millis();
      let holdTime = millis() - hintButtonHoldStart;
      fill(255,255,0);
      textSize(16);
      let sec = Math.ceil((3000 - holdTime) / 1000);
      if (sec > 0) {
        text(`將於 ${sec} 秒後顯示提示`, bx + hintButtonW/2, by + hintButtonH + 20);
      }
      if (holdTime >= 3000) {
        showHintBox = true;
        hintButtonHoldStart = null;
      }
    } else {
      hintButtonHoldStart = null;
    }
  } else {
    hintButtonHoldStart = null;
  }
}

// ====== 畫提示框 ======
function drawHintBox() {
  let boxW = min(hintBoxW, width * 0.9);
  let boxH = hintBoxH;
  let bx = width/2 - boxW/2;
  let by = height/2 - boxH/2;
  // 方框底
  fill(255,255,220);
  stroke(180,140,60);
  strokeWeight(4);
  rect(bx, by, boxW, boxH, 24);
  // 文字
  fill(60,40,0);
  noStroke();
  textSize(20);
  textAlign(CENTER, CENTER);
  let txt = hintTexts[currentQuestion];
  let txtW = boxW - 40;
  let txtH = boxH - 60;
  // 計算自動換行
  push();
  let words = txt.split(/(?<=。|？|！|,|，|\s)/g);
  let lines = [];
  let line = '';
  for (let i = 0; i < words.length; i++) {
    let testLine = line + words[i];
    if (textWidth(testLine) > txtW && line.length > 0) {
      lines.push(line);
      line = words[i];
    } else {
      line = testLine;
    }
  }
  if (line.length > 0) lines.push(line);
  let totalLineH = lines.length * 28;
  let startY = by + boxH/2 - totalLineH/2 + 4;
  for (let i = 0; i < lines.length; i++) {
    text(lines[i], bx + boxW/2, startY + i * 28, txtW, 28);
  }
  pop();
  // 關閉按鈕
  let closeX = bx + boxW - hintBoxCloseW - 16;
  let closeY = by + hintBoxH - hintBoxCloseH - 16;
  fill(255, 180, 180);
  stroke(200,0,0);
  strokeWeight(2);
  rect(closeX, closeY, hintBoxCloseW, hintBoxCloseH, 12);
  fill(120,0,0);
  noStroke();
  textSize(22);
  text('關閉', closeX + hintBoxCloseW/2, closeY + hintBoxCloseH/2);
  textAlign(CENTER, CENTER);
}

// ====== 檢查手指是否碰觸關閉按鈕並停留3秒 ======
function checkCloseHintGesture() {
  if (!showHintBox) return;
  if (predictions.length > 0) {
    let index = predictions[0].landmarks[8];
    let x = index[0];
    let y = index[1];
    let bx = width/2 - hintBoxW/2;
    let by = height/2 - hintBoxH/2;
    let closeX = bx + hintBoxW - hintBoxCloseW - 16;
    let closeY = by + hintBoxH - hintBoxCloseH - 16;
    if (x > closeX && x < closeX + hintBoxCloseW && y > closeY && y < closeY + hintBoxCloseH) {
      if (!closeHintHoldStart) closeHintHoldStart = millis();
      let holdTime = millis() - closeHintHoldStart;
      fill(255,0,0);
      textSize(16);
      let sec = Math.ceil((3000 - holdTime) / 1000);
      if (sec > 0) {
        text(`將於 ${sec} 秒後關閉提示`, closeX + hintBoxCloseW/2, closeY - 18);
      }
      if (holdTime >= 3000) {
        showHintBox = false;
        closeHintHoldStart = null;
      }
    } else {
      closeHintHoldStart = null;
    }
  } else {
    closeHintHoldStart = null;
  }
}
