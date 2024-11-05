const buttonColours = ["red", "blue", "green", "yellow"];
let gamePattern = [];
let userClickedPattern = [];
let started = false;
let level = 0;
let countdownTimer;
let timeLeft = 300;
let levelStartTime;
let levelLogs = [];
let playerNumber = 1; 

function nextSequence() {
  userClickedPattern = [];
  level++;
  $("#level-title").text("Level " + level);
  
  levelStartTime = Date.now();
  
  const randomNumber = Math.floor(Math.random() * 4);
  const randomChosenColour = buttonColours[randomNumber];
  gamePattern.push(randomChosenColour);

  $("#" + randomChosenColour).fadeIn(100).fadeOut(100).fadeIn(100);
  playSound(randomChosenColour);
}

function startTimer() {
  countdownTimer = setInterval(() => {
    if (timeLeft <= 0) {
      clearInterval(countdownTimer);
      gameOver("Time's Up!");
    } else {
      timeLeft--;
      displayTime();
    }
  }, 1000);
}

function displayTime() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  $("#timer").text(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
}

$(".btn").click(function() {
  const userChosenColour = $(this).attr("id");
  userClickedPattern.push(userChosenColour);

  playSound(userChosenColour);
  animatePress(userChosenColour);

  checkAnswer(userClickedPattern.length - 1);
});

function getCurrentTimestamp() {
  const now = new Date();
  return now.toTimeString().split(" ")[0]; 
}

function checkAnswer(currentLevel) {
  if (gamePattern[currentLevel] === userClickedPattern[currentLevel]) {
    if (userClickedPattern.length === gamePattern.length) {
      const timeTaken = ((Date.now() - levelStartTime) / 1000);
      const currentTime = getCurrentTimestamp();
      levelLogs.push(`${currentTime};${level};${timeTaken};1;2;${playerNumber}`);
      
      setTimeout(() => {
        nextSequence();
      }, 1000);
    }
  } else {
    const timeTaken = ((Date.now() - levelStartTime) / 1000);
    const currentTime = getCurrentTimestamp();
    levelLogs.push(`${currentTime};${level};${timeTaken};0;2;${playerNumber}`);

    playSound("wrong");
    $("body").addClass("game-over");
    setTimeout(() => {
      $("body").removeClass("game-over");
    }, 200);

    $("#level-title").text("Game Over, Press Any Key to Restart");

    saveToFile();
    startOver();
  }
}

function gameOver(message) {
  clearInterval(countdownTimer);
  const currentTime = getCurrentTimestamp();
  levelLogs.push(`[${currentTime}] Game Over - ${message}`);
  $("#level-title").text(message);
  saveToFile();
  startOver();
}

$(document).keypress(() => {
  if (!started) {
    $("#level-title").text("Level " + level);
    nextSequence();
    startTimer();
    started = true;
  }
});

$(document).on("touchstart", function() {
  if (!started) {
    $("#level-title").text("Level " + level);
    nextSequence();
    startTimer();
    started = true;
  }
});

function animatePress(currentColour) {
  $("#" + currentColour).addClass("pressed");

  setTimeout(() => {
    $("#" + currentColour).removeClass("pressed");
  }, 100);
}

function playSound(name) {
  const audio = new Audio("sounds/" + name + ".mp3");
  audio.play();
}

function startOver() {
  level = 0;
  gamePattern = [];
  started = false;
  timeLeft = 300;
  clearInterval(countdownTimer);
  levelLogs = [];
  playerNumber++; 
}

function saveToFile() {
  const header = `timestamp;level;time;level_passed;game_type;user\n`;
  const textData = header + levelLogs.join('\n'); 
  
  const fileName = `Gracz_${playerNumber}_Gra2_logs.csv`; 
  const blob = new Blob([textData], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
}
