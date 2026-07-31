// Config
const CORRECT = "0820"; // correct 4-digit code
const MAX_ATTEMPTS_BEFORE_HINT = 1;

// The user's message (exact as provided)
const birthdayMessage = `Happy birthday to my beautifully cute girl, Angelina 🥹❤️. I’m genuinely so grateful to have you in my life, and I hope you know how much you mean to me. You make me happy in ways you probably don’t even realize, and even through all our jokes, random conversations, teasing, and little moments together, you’ve become someone I care about so deeply. I love your personality and all the little things that make you uniquely you. You’re not just my girlfriend—you’re my favorite person, my comfort, and someone I always want by my side. I hope this new year of your life brings you nothing but happiness, peace, love, and everything your heart desires, because you truly deserve the world. I’m so proud of the woman you are, and I can’t wait to make even more memories with you. Happy birthday, my love. I love you so much, Angelinka, and I hope today makes you feel as special and appreciated as you make me feel every day ❤️🎂`;

// DOM
const startScreen = document.getElementById('start-screen');
const startBtn = document.getElementById('start-btn');
const unlockPanel = document.getElementById('unlock-panel');
const codeInput = document.getElementById('code-input');
const unlockBtn = document.getElementById('unlock-btn');
const hintEl = document.getElementById('hint');
const feedbackEl = document.getElementById('feedback');
const celebration = document.getElementById('celebration');
const hbHead = document.getElementById('hb-head');
const messageEl = document.getElementById('message');
const confettiCanvas = document.getElementById('confetti-canvas');
const replayBtn = document.getElementById('replay');
const stage = document.getElementById('stage');

let attempts = 0;

// helpers
function show(el){
  el.classList.remove('hidden');
  requestAnimationFrame(()=> el.classList.add('revealed'));
}
function hide(el){
  el.classList.remove('revealed');
  el.classList.add('hidden');
}
function formatToday(){
  const d = new Date();
  const mm = String(d.getMonth()+1).padStart(2,'0');
  const dd = String(d.getDate()).padStart(2,'0');
  const yy = d.getFullYear();
  return `${mm}/${dd}/${yy}`;
}

// Start
startBtn.addEventListener('click', () => {
  startScreen.style.transform = 'translate(-50%,-60%) scale(.98)';
  startScreen.style.opacity = '0';
  setTimeout(()=> {
    startScreen.style.display = 'none';
    show(unlockPanel);
    codeInput.focus();
  }, 420);
});

// Unlock flow
unlockBtn.addEventListener('click', tryUnlock);
codeInput.addEventListener('keydown', (e) => {
  if(e.key === 'Enter') tryUnlock();
});

function tryUnlock(){
  const val = (codeInput.value || "").trim();
  if(!/^\d{4}$/.test(val)){
    feedbackEl.textContent = "Please enter a 4-digit number.";
    return;
  }
  attempts++;
  if(val === CORRECT){
    successUnlock();
  } else {
    feedbackEl.textContent = "Incorrect — try again.";
    if(attempts >= MAX_ATTEMPTS_BEFORE_HINT){
      hintEl.textContent = `Hint: Today's date is ${formatToday()}`;
      hintEl.classList.remove('hidden');
      requestAnimationFrame(()=> hintEl.classList.add('revealed'));
    }
    // subtle motion
    unlockPanel.animate([
      { transform: 'translateY(0)' },
      { transform: 'translateY(-8px)' },
      { transform: 'translateY(0)' }
    ], { duration: 320, easing: 'cubic-bezier(.2,.9,.3,1)'});
  }
}

// Celebratory animation (DOF zoom, no letter typing for header)
async function successUnlock(){
  feedbackEl.textContent = '';
  hide(unlockPanel);

  // stage DOF: blur and dim the background panels
  stage.classList.add('dof');

  // show celebration panel
  show(celebration);

  // set header text (already in HTML) and animate zoom
  hbHead.classList.remove('zoomed');
  hbHead.style.transform = 'scale(.86)';
  hbHead.style.opacity = '0';
  // small delay for dramatic timing
  await wait(150);

  // Animate header zoom-in (depth-of-field effect comes from .stage.dof in CSS)
  hbHead.classList.add('zoomed');
  // Make message appear instantly but with soft reveal (no letter-by-letter)
  messageEl.textContent = birthdayMessage;
  await wait(400);
  messageEl.classList.add('visible');

  // start confetti
  startConfetti();

  // show replay
  replayBtn.classList.remove('hidden');
  setTimeout(()=> replayBtn.classList.add('revealed'), 140);
}

// simple wait helper
function wait(ms){ return new Promise(res => setTimeout(res, ms)); }

// replay handler
replayBtn.addEventListener('click', () => {
  attempts = 0;
  codeInput.value = '';
  hintEl.textContent = '';
  feedbackEl.textContent = '';
  messageEl.textContent = '';
  messageEl.classList.remove('visible');
  hbHead.classList.remove('zoomed');
  hide(celebration);
  confettiCanvas.classList.add('hidden');
  stopConfetti();
  stage.classList.remove('dof');
  // show unlock again
  show(unlockPanel);
  codeInput.focus();
});

/* --- confetti (kept lightweight) --- */
let confettiCtx, confettiEls = [], confettiRAF, confettiRunning=false;

function startConfetti(){
  confettiCanvas.classList.remove('hidden');
  confettiCanvas.width = innerWidth;
  confettiCanvas.height = innerHeight;
  confettiCtx = confettiCanvas.getContext('2d');
  confettiEls = createConfetti(120);
  confettiRunning = true;
  renderConfetti();
}

function stopConfetti(){
  confettiRunning = false;
  if(confettiRAF) cancelAnimationFrame(confettiRAF);
  if(confettiCtx) confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
}

function createConfetti(count){
  const colors = ['#ff6b9f','#ffd166','#66d9ff','#9b94ff','#ffb3c9'];
  const arr=[];
  for(let i=0;i<count;i++){
    arr.push({
      x: Math.random()*innerWidth,
      y: Math.random()*-innerHeight,
      w: 6 + Math.random()*12,
      h: 8 + Math.random()*14,
      vx: (Math.random()-0.5)*2.0,
      vy: 2 + Math.random()*3.5,
      rot: Math.random()*360,
      vrot: (Math.random()-0.5)*6,
      color: colors[Math.floor(Math.random()*colors.length)],
      drift: Math.random()*0.8
    });
  }
  return arr;
}

function renderConfetti(){
  if(!confettiRunning) return;
  confettiCtx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  for(let p of confettiEls){
    p.x += p.vx + Math.sin(p.y*0.01)*p.drift;
    p.y += p.vy;
    p.rot += p.vrot;
    confettiCtx.save();
    confettiCtx.translate(p.x, p.y);
    confettiCtx.rotate(p.rot * Math.PI/180);
    confettiCtx.fillStyle = p.color;
    confettiCtx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
    confettiCtx.restore();

    if(p.y > confettiCanvas.height + 60){
      p.x = Math.random()*confettiCanvas.width;
      p.y = -20 - Math.random()*200;
      p.vy = 2 + Math.random()*3.5;
    }
  }
  confettiRAF = requestAnimationFrame(renderConfetti);
}

window.addEventListener('resize', () => {
  if(confettiCanvas && !confettiCanvas.classList.contains('hidden')){
    confettiCanvas.width = innerWidth;
    confettiCanvas.height = innerHeight;
  }
});
