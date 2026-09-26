/*const taskInput = document.getElementById('task-input');
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const errorMsg = document.getElementById('error-msg');
const taskCount = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskTimeInput = document.getElementById('task-time');
const taskDateInput = document.getElementById('task-date');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';
let editId = null;
let audioCtx = null;
let alarmInterval = null;

function saveTasks(){ localStorage.setItem('tasks', JSON.stringify(tasks)); }
function validateInput(v){ if(!v.trim()) return "Task cannot be empty"; if(v.trim().length<3) return "Min 3 chars"; return ""; }

function renderTasks(){
  taskList.innerHTML = '';
  let filtered = tasks.filter(t=>{
    if(currentFilter==='active') return!t.completed;
    if(currentFilter==='completed') return t.completed;
    return true;
  });
  
  filtered.forEach(task=>{
    const li=document.createElement('li');
    li.className=`task-item ${task.completed?'completed':''} ${task.notified?'ringing':''}`;
    const leftDiv=document.createElement('div');
    leftDiv.style.display='flex'; leftDiv.style.alignItems='center'; leftDiv.style.gap='10px'; leftDiv.style.flexWrap='wrap';
    const cb=document.createElement('input'); cb.type='checkbox'; cb.checked=task.completed;
    cb.addEventListener('change',()=>toggleComplete(task.id));
    const span=document.createElement('span'); span.className='task-text'; span.textContent=task.text+" ";
    if(task.time){
      const badge=document.createElement('span'); badge.className='task-time-badge has-alarm';
      let [h,m]=task.time.split(':'); let hour=parseInt(h); let suffix=hour>=12?'PM':'AM'; let hour12=hour%12||12;
      badge.textContent=`🔔 ${task.date||''} ${hour12}:${m} ${suffix}`;
      span.appendChild(badge);
    }
    leftDiv.append(cb,span);
    const act=document.createElement('div'); act.className='task-actions';
    const eb=document.createElement('button'); eb.className='edit-btn'; eb.textContent='Edit'; eb.onclick=()=>editTask(task.id);
    const db=document.createElement('button'); db.className='delete-btn'; db.textContent='Delete'; db.onclick=()=>deleteTask(task.id);
    act.append(eb,db); li.append(leftDiv,act); taskList.appendChild(li);
  });
  taskCount.textContent=`${tasks.filter(t=>!t.completed).length} tasks left`;
}

taskForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const err=validateInput(taskInput.value); if(err){ errorMsg.textContent=err; return; }
  errorMsg.textContent='';
  if(editId!==null){
    tasks=tasks.map(t=>t.id===editId?{...t, text:taskInput.value.trim(), time:taskTimeInput.value, date:taskDateInput.value, notified:false}:t);
    editId=null;
  }else{
    tasks.push({id:Date.now(), text:taskInput.value.trim(), time:taskTimeInput.value, date:taskDateInput.value, completed:false, notified:false});
  }
  saveTasks(); renderTasks(); taskInput.value=''; taskTimeInput.value=''; taskDateInput.value='';
});

window.editTask=(id)=>{ const t=tasks.find(x=>x.id===id); taskInput.value=t.text; taskTimeInput.value=t.time||""; taskDateInput.value=t.date||""; editId=id; taskInput.focus(); }
window.deleteTask=(id)=>{ tasks=tasks.filter(t=>t.id!==id); saveTasks(); renderTasks(); }
window.toggleComplete=(id)=>{ tasks=tasks.map(t=>t.id===id?{...t, completed:!t.completed}:t); saveTasks(); renderTasks(); }
filterBtns.forEach(b=>b.addEventListener('click',()=>{ filterBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentFilter=b.dataset.filter; renderTasks(); }));

// ALARM LOGIC
function playBeepSound(){
  try{
    if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==='suspended') audioCtx.resume();
    const osc=audioCtx.createOscillator(); const gain=audioCtx.createGain();
    osc.frequency.value=900; osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.8,audioCtx.currentTime); osc.start(); osc.stop(audioCtx.currentTime+0.4);
  }catch(e){}
}
function playAlarm(text){
  const modal=document.getElementById('alarm-modal'); const txt=document.getElementById('alarm-text');
  if(txt) txt.textContent=text; if(modal) modal.style.display='flex';
  if(alarmInterval) clearInterval(alarmInterval);
  playBeepSound(); alarmInterval=setInterval(playBeepSound,600);
  if(navigator.vibrate) navigator.vibrate([500,200,500,200,500]);
}
function stopAlarm(){
  clearInterval(alarmInterval); alarmInterval=null;
  const modal=document.getElementById('alarm-modal'); if(modal) modal.style.display='none';
  if(navigator.vibrate) navigator.vibrate(0);
  if(audioCtx){ audioCtx.close().then(()=>{ audioCtx=null; }); }
}
function checkAlarms(){
  const now=new Date(); const currDate=now.toISOString().split('T')[0]; const currTime=now.toTimeString().slice(0,5);
  let changed=false;
  tasks.forEach(task=>{
    if(!task.completed &&!task.notified && task.time && task.date===currDate && task.time===currTime){
      playAlarm(task.text); task.notified=true; changed=true;
    }
  });
  if(changed){ saveTasks(); renderTasks(); }
}

// BUTTONS
document.addEventListener('DOMContentLoaded',()=>{
  document.getElementById('enable-sound')?.addEventListener('click',()=>{ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); audioCtx.resume().then(()=>{ playBeepSound(); }); });
  document.getElementById('stop-alarm-btn')?.addEventListener('click',stopAlarm);
  document.getElementById('alarm-modal')?.addEventListener('click',(e)=>{ if(e.target.id==='alarm-modal') stopAlarm(); });
});

setInterval(checkAlarms,30000);
renderTasks();

// Focus Lock Logic
let mediaRecorder;
document.getElementById('record-btn').addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);
    document.getElementById('record-btn').textContent = "🔴 Recording... 3s";

    mediaRecorder.start();
    setTimeout(() => {
      mediaRecorder.stop();
      document.getElementById('alarm-modal').classList.remove('show');
      if(alarmSound){ alarmSound.pause(); }
      tasks.forEach(t=> t.ringing=false);
      saveTasks();
      alert("Verified! Task Unlocked ✅");
      location.reload(); // lock khatam
    }, 3000);
  } catch(e){ alert("Mic allow karo"); }
});

// Alarm baje to Fullscreen Lock
function triggerFocusLock(taskText){
  document.getElementById('alarm-text').textContent = taskText;
  document.getElementById('alarm-modal').classList.add('show');
  document.documentElement.requestFullscreen(); // screen lock
  if(isSoundEnabled) alarmSound.play();
}

*/

//new js file

/*const taskInput = document.getElementById('task-input');
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const errorMsg = document.getElementById('error-msg');
const taskCount = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskTimeInput = document.getElementById('task-time');
const taskDateInput = document.getElementById('task-date');
const taskMoodInput = document.getElementById('task-mood');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let wallet = parseInt(localStorage.getItem('wallet') || '1000');
let currentFilter = 'all';
let editId = null;
let audioCtx = null;
let alarmInterval = null;

function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('wallet', wallet);
}
function validateInput(v) {
  if (!v.trim()) return "Task cannot be empty";
  if (v.trim().length < 3) return "Min 3 chars";
  return "";
}

function updateWalletUI() {
  const walletEl = document.getElementById('wallet-display');
  if (walletEl) walletEl.textContent = `💰 ${wallet} Rs`;
}

function renderTasks() {
  taskList.innerHTML = '';
  let filtered = tasks.filter(t => {
    if (currentFilter === 'active') return!t.completed;
    if (currentFilter === 'completed') return t.completed;
    return true;
  });

  filtered.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed? 'completed' : ''} ${task.notified? 'ringing' : ''}`;

    const leftDiv = document.createElement('div');
    leftDiv.style.display = 'flex'; leftDiv.style.alignItems = 'center'; leftDiv.style.gap = '10px'; leftDiv.style.flexWrap = 'wrap';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = task.completed;
    cb.addEventListener('change', () => toggleComplete(task.id));

    const span = document.createElement('span');
    span.className = 'task-text';
    span.textContent = task.text + " ";

    if (task.time) {
      const badge = document.createElement('span');
      badge.className = 'task-time-badge has-alarm';
      let [h, m] = task.time.split(':');
      let hour = parseInt(h);
      let suffix = hour >= 12? 'PM' : 'AM';
      let hour12 = hour % 12 || 12;
      badge.textContent = `🔔 ${task.date || ''} ${hour12}:${m} ${suffix} ${task.mood || ''}`;
      span.appendChild(badge);
    }

    leftDiv.append(cb, span);

    const act = document.createElement('div');
    act.className = 'task-actions';
    const eb = document.createElement('button'); eb.className = 'edit-btn'; eb.textContent = 'Edit'; eb.onclick = () => editTask(task.id);
    const db = document.createElement('button'); db.className = 'delete-btn'; db.textContent = 'Delete'; db.onclick = () => deleteTask(task.id);
    act.append(eb, db);
    li.append(leftDiv, act);
    taskList.appendChild(li);
  });

  taskCount.textContent = `${tasks.filter(t =>!t.completed).length} tasks left`;
  updateWalletUI();
}

// FORM SUBMIT WITH MOOD LOGIC - FEATURE 3
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const err = validateInput(taskInput.value);
  if (err) { errorMsg.textContent = err; return; }
  errorMsg.textContent = '';

  let text = taskInput.value.trim();
  let time = taskTimeInput.value;
  let date = taskDateInput.value;
  let mood = taskMoodInput? taskMoodInput.value : 'Energetic';

  if (!time ||!date) {
    errorMsg.textContent = "Please select date and time";
    return;
  }

  // Mood-Based Rescheduler
  if (mood.includes("Tired") && text.length > 15) {
    alert("You are tired, moving this heavy task to tomorrow 9 AM");
    let tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    date = tomorrow.toISOString().split('T')[0];
    time = "09:00";
  }
  if (mood.includes("Angry")) {
    text = "😠 " + text + " (Take a deep breath)";
  }

  if (editId!== null) {
    tasks = tasks.map(t => t.id === editId? {...t, text: text, time: time, date: date, mood: mood, notified: false } : t);
    editId = null;
  } else {
    tasks.push({ id: Date.now(), text: text, time: time, date: date, mood: mood, completed: false, notified: false });
  }

  saveTasks(); renderTasks();
  taskInput.value = ''; taskTimeInput.value = ''; taskDateInput.value = '';
});

window.editTask = (id) => { const t = tasks.find(x => x.id === id); taskInput.value = t.text; taskTimeInput.value = t.time || ""; taskDateInput.value = t.date || ""; editId = id; taskInput.focus(); }
window.deleteTask = (id) => { tasks = tasks.filter(t => t.id!== id); saveTasks(); renderTasks(); }

// TASK BIDDING - FEATURE 4
window.toggleComplete = (id) => {
  tasks = tasks.map(t => {
    if (t.id === id) {
      if (!t.completed) {
        // Completed on time
        wallet += 60;
      } else {
        // Unchecking
        wallet -= 60;
      }
      return {...t, completed:!t.completed };
    }
    return t;
  });
  saveTasks(); renderTasks();
}

filterBtns.forEach(b => b.addEventListener('click', () => { filterBtns.forEach(x => x.classList.remove('active')); b.classList.add('active'); currentFilter = b.dataset.filter; renderTasks(); }));

// ALARM LOGIC
/*
function playBeepSound() {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
    osc.frequency.value = 900; osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.8, audioCtx.currentTime); osc.start(); osc.stop(audioCtx.currentTime + 0.4);
  } catch (e) { }
}

function playAlarm(text) {
  const modal = document.getElementById('alarm-modal');
  const txt = document.getElementById('alarm-text');
  if (txt) txt.textContent = text;
  if (modal) modal.style.display = 'flex';
  // Focus Lock - Fullscreen
  try { document.documentElement.requestFullscreen(); } catch(e) {}
  if (alarmInterval) clearInterval(alarmInterval);
  playBeepSound();
  alarmInterval = setInterval(playBeepSound, 600);
  if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
}

function stopAlarm() {
  clearInterval(alarmInterval);
  alarmInterval = null;
  const modal = document.getElementById('alarm-modal');
  if (modal) modal.style.display = 'none';
  if (navigator.vibrate) navigator.vibrate(0);
  if (document.fullscreenElement) { document.exitFullscreen().catch(()=>{}); }
  tasks.forEach(t => t.ringing = false);
}

function checkAlarms() {
  const now = new Date();
  const currDate = now.toISOString().split('T')[0];
  const currTime = now.toTimeString().slice(0, 5);
  let changed = false;
  


  //new sound code

// ===== SOUND TOGGLE - FIXED =====
let soundEnabled = localStorage.getItem('soundEnabled') === 'true';
const soundBtn = document.getElementById('sound-toggle') || document.querySelector('.sound-btn');

function updateSoundUI() {
  if (!soundBtn) return;
  if (soundEnabled) {
    soundBtn.innerHTML = "✅ Sound Enabled";
    soundBtn.style.background = "#";
    soundBtn.style.color = "white";
  } else {
    soundBtn.innerHTML = "🔇 Sound Disabled";
    soundBtn.style.background = "#E2FFF1";
    soundBtn.style.color = "#0F3D3A";
    soundBtn.style.border = "2px dashed #14B8A6";
  }
}

// Page load pe check karega
updateSoundUI();

if (soundBtn) {
  soundBtn.addEventListener('click', function() {
    soundEnabled = !soundEnabled; // Yahi line wapas le jayegi
    localStorage.setItem('soundEnabled', soundEnabled);
    updateSoundUI();
    
    // 1 tick sound bajana hai to
    if (soundEnabled) {
       //new Audio('tick.mp3').play().catch(()=>{});
    }
  });
}



  // Time-Travel Punishment - FEATURE 1
  tasks.forEach(task => {
    if (!task.completed && task.date && task.date < currDate) {
      if (!task.text.includes("You Ignored Me")) {
        task.text = task.text.replace(" (You Ignored Me 😒)", "") + " (You Ignored Me 😒)";
        let tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        task.date = tomorrow.toISOString().split('T')[0];
        wallet -= 50; // penalty
        changed = true;
      }
    }
    // Normal alarm check
    if (!task.completed &&!task.notified && task.time && task.date === currDate && task.time === currTime) {
      playAlarm(task.text);
      task.notified = true;
      changed = true;
    }
  });

  if (changed) { saveTasks(); renderTasks(); }
}

// BUTTONS AND FOCUS LOCK - FEATURE 2
document.addEventListener('DOMContentLoaded', () => {
  updateWalletUI();

  document.getElementById('enable-sound')?.addEventListener('click', () => {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioCtx.resume().then(() => { playBeepSound();
      document.getElementById('enable-sound').innerHTML = '✅ Sound Enabled';
    });
  });

  document.getElementById('stop-alarm-btn')?.addEventListener('click', () => {
    stopAlarm();
    saveTasks(); renderTasks();
  });

  document.getElementById('alarm-modal')?.addEventListener('click', (e) => {
    if (e.target.id === 'alarm-modal') stopAlarm();
  });

  // Voice proof for Focus Lock
  const recordBtn = document.getElementById('record-btn');
  if (recordBtn) {
    recordBtn.addEventListener('click', async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        recordBtn.textContent = "🔴 Recording... 3s";
        mediaRecorder.start();
        setTimeout(() => {
          mediaRecorder.stop();
          stream.getTracks().forEach(track => track.stop());
          stopAlarm();
          alert("Verified! Task Unlocked ✅ +60 Rs");
          wallet += 60;
          saveTasks(); renderTasks();
        }, 3000);
      } catch (e) { alert("Please allow mic permission"); }
    });
  }
});

setInterval(checkAlarms, 30000);
checkAlarms(); // also check punishment on load
renderTasks();*/



const taskInput = document.getElementById('task-input');
const descInput = document.getElementById('description-input');
const taskForm = document.getElementById('task-form');
const taskList = document.getElementById('task-list');
const errorMsg = document.getElementById('error-msg');
const taskCount = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const taskTimeInput = document.getElementById('task-time');
const taskDateInput = document.getElementById('task-date');
const taskMoodInput = document.getElementById('task-mood');
const taskAmPmInput = document.getElementById('task-ampm');
const soundBtn = document.getElementById('enable-sound');

let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let rewardHistory = JSON.parse(localStorage.getItem('rewardHistory')) || [];
let wallet = parseInt(localStorage.getItem('wallet') || '0');
let currentFilter = 'all';
let editId = null;
let audioCtx = null;
let alarmInterval = null;
let soundEnabled = localStorage.getItem('soundEnabled') === 'true';

function saveTasks(){
  localStorage.setItem('tasks', JSON.stringify(tasks));
  localStorage.setItem('wallet', wallet);
  localStorage.setItem('rewardHistory', JSON.stringify(rewardHistory));
}

// SOUND TOGGLE - TUMHARA 1 TICK WALA MASLA FIX
function updateSoundUI(){
  if(!soundBtn) return;
  if(soundEnabled){
    soundBtn.innerHTML = "✅ Sound Enabled";
    soundBtn.style.background = "#2d6e2d";
    soundBtn.style.color = "white";
  } else {
    soundBtn.innerHTML = "🔊 Enable Alarm Sound";
    soundBtn.style.background = "";
    soundBtn.style.color = "black";
    soundBtn.style.border = "2px dashed #14B8A6";
  }
}
function playBeepSound(){
  if(!soundEnabled) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 900;
    osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
    osc.start(); osc.stop(audioCtx.currentTime+0.4);
  }catch(e){}
}

function renderTasks(){
  if(!taskList) return;
  taskList.innerHTML = '';
  let filtered = tasks.filter(t=>{
    if(currentFilter==='active') return!t.completed;
    if(currentFilter==='completed') return t.completed;
    return true;
  });
  filtered.forEach(task=>{
    const li = document.createElement('li');
    li.className = `task-item ${task.completed?'completed':''} ${task.notified?'ringing':''}`;
    const leftDiv = document.createElement('div');
    leftDiv.style.display='flex'; leftDiv.style.alignItems='center'; leftDiv.style.gap='10px'; leftDiv.style.flexWrap='wrap';
    const cb = document.createElement('input'); cb.type='checkbox'; cb.checked=task.completed;
    cb.addEventListener('change',()=>toggleComplete(task.id));
    const span = document.createElement('span'); span.className='task-text';
    span.textContent = task.text;
    if(task.desc) span.textContent += ` - ${task.desc}`;
    if(task.time){
      const badge = document.createElement('span'); badge.className='task-time-badge has-alarm';
      badge.textContent = ` 🔔 ${task.date||''} ${task.time} ${task.ampm||''} ${task.mood||''}`;
      span.appendChild(badge);
    }
    leftDiv.append(cb,span);
    const act = document.createElement('div'); act.className='task-actions';
    const eb = document.createElement('button'); eb.className='edit-btn'; eb.textContent='Edit'; eb.onclick=()=>editTask(task.id);
    const db = document.createElement('button'); db.className='delete-btn'; db.textContent='Delete'; db.onclick=()=>deleteTask(task.id);
    act.append(eb,db); li.append(leftDiv,act); taskList.appendChild(li);
  });
  if(taskCount) taskCount.textContent = `${tasks.filter(t=>!t.completed).length} tasks left`;
}

if(taskForm){
  taskForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    if(!taskInput.value.trim() || taskInput.value.trim().length<3){ errorMsg.textContent="Min 3 chars"; return; }
    errorMsg.textContent='';
    let text = taskInput.value.trim();
    let desc = descInput? descInput.value.trim() : '';
    let time = taskTimeInput.value; let date = taskDateInput.value;
    let mood = taskMoodInput? taskMoodInput.value : '';
    let ampm = taskAmPmInput? taskAmPmInput.value : 'AM';
    if(!time ||!date){ errorMsg.textContent="Please select date and time"; return; }
    if(mood.includes("Tired") && text.length>15){
      alert("You are tired, moving this to tomorrow 9 AM");
      let tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
      date=tomorrow.toISOString().split('T')[0]; time="09:00"; ampm="AM";
    }
    if(mood.includes("Angry")) text="😠 "+text+" (Take a deep breath)";
    if(editId!==null){
      tasks=tasks.map(t=>t.id===editId?{...t, text, desc, time, date, mood, ampm, notified:false}:t);
      editId=null;
    }else{
      tasks.push({id:Date.now(), text, desc, time, date, mood, ampm, completed:false, notified:false});
    }
    saveTasks(); renderTasks();
    taskInput.value=''; if(descInput) descInput.value=''; taskTimeInput.value=''; taskDateInput.value='';
    playBeepSound();
  });
}

window.editTask=(id)=>{ const t=tasks.find(x=>x.id===id); if(!t) return; taskInput.value=t.text; if(descInput) descInput.value=t.desc||""; taskTimeInput.value=t.time||""; taskDateInput.value=t.date||""; if(taskMoodInput) taskMoodInput.value=t.mood||""; if(taskAmPmInput) taskAmPmInput.value=t.ampm||"AM"; editId=id; taskInput.focus(); }
window.deleteTask=(id)=>{ tasks=tasks.filter(t=>t.id!==id); saveTasks(); renderTasks(); }
window.toggleComplete=(id)=>{
  tasks=tasks.map(t=>{
    if(t.id===id){
      if(!t.completed){ wallet+=60; rewardHistory.push({text:`${t.text} completed`, coins:60, date:new Date().toLocaleString()}); }
      else { wallet-=60; rewardHistory.pop(); }
      return {...t, completed:!t.completed};
    }
    return t;
  });
  saveTasks(); renderTasks(); playBeepSound();
}

if(filterBtns) filterBtns.forEach(b=>b.addEventListener('click',()=>{ filterBtns.forEach(x=>x.classList.remove('active')); b.classList.add('active'); currentFilter=b.dataset.filter; renderTasks(); }));

// ALARM
/*function playAlarm(text){
  const modal=document.getElementById('alarm-modal'); const txt=document.getElementById('alarm-text');
  if(txt) txt.textContent=text; if(modal) modal.style.display='flex';
  try{ document.documentElement.requestFullscreen(); }catch(e){}
  if(alarmInterval) clearInterval(alarmInterval);
  playBeepSound(); alarmInterval=setInterval(playBeepSound,600);
  if(navigator.vibrate) navigator.vibrate([500,200,500,200,500]);
}
//new sound

function playBeepSound(){
  if(!soundEnabled) return;
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    
    // Loud beep - 3 beeps ek saath
    for(let i=0; i<3; i++){
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = i===0 ? 900 : 1200;
      osc.connect(gain); 
      gain.connect(audioCtx.destination);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + i*0.3);
      gain.gain.linearRampToValueAtTime(1, audioCtx.currentTime + i*0.3 + 0.05);
      gain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + i*0.3 + 0.4);
      osc.start(audioCtx.currentTime + i*0.3);
      osc.stop(audioCtx.currentTime + i*0.3 + 0.4);
    }
  }catch(e){ console.log(e); }
}

function playAlarm(text){
  const modal=document.getElementById('alarm-modal'); 
  const txt=document.getElementById('alarm-text');
  if(txt) txt.textContent=text; 
  if(modal){ modal.style.display='flex'; modal.classList.add('show'); }
  
  // Force sound even if user didn't click - try resume
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume().then(()=>{
    playBeepSound();
    if(alarmInterval) clearInterval(alarmInterval);
    alarmInterval=setInterval(playBeepSound, 800); // har 0.8 sec pe beep
  });

  if(navigator.vibrate) navigator.vibrate([600,200,600,200,600]);
  
  try{ document.documentElement.requestFullscreen().catch(()=>{}); }catch(e){}
}*/

//... upar wala sab same rehne do, sirf neeche wale 3 functions replace karo...

function playBeepSound(){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.frequency.value = 1000;
    osc.connect(gain); gain.connect(audioCtx.destination);
    gain.gain.setValueAtTime(1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
    osc.start(); osc.stop(audioCtx.currentTime + 0.5);
  }catch(e){ console.log("Beep error", e); }
}

function playAlarm(text){
  console.log("ALARM TRIGGERED:", text); // debug ke liye
  const modal=document.getElementById('alarm-modal');
  const txt=document.getElementById('alarm-text');
  if(txt) txt.textContent = text;
  if(modal){ modal.style.display='flex'; modal.style.opacity='1'; }

  // Sound chahe disabled bhi ho, alarm pe zabardasti bajao
  if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  audioCtx.resume().then(()=>{
    playBeepSound();
    if(alarmInterval) clearInterval(alarmInterval);
    alarmInterval = setInterval(playBeepSound, 700);
  }).catch(()=>{
    // Agar resume fail bhi ho jaye to bhi modal dikhao
    playBeepSound();
  });

  if(navigator.vibrate) navigator.vibrate([500,200,500]);
}

function checkAlarms(){
  const now = new Date();
  const currDate = now.toISOString().split('T')[0];
  const currTime = now.toTimeString().slice(0,5); // 14:42 format
  // console.log("Checking...", currDate, currTime);

  let changed = false;
  tasks.forEach(task=>{
    if(!task.completed &&!task.notified && task.date && task.time){
      // AM/PM ko ignore karo, direct 24h time compare karo
      if(task.date === currDate && task.time === currTime){
        playAlarm(task.text);
        task.notified = true;
        changed = true;
      }
    }
  });
  if(changed){ saveTasks(); renderTasks(); }
}

// --- YEH LINE SAB SE IMPORTANT HAI ---
setInterval(checkAlarms, 1000); // Pehle 30 sec tha, ab 1 sec kar diya
checkAlarms();

function stopAlarm(){
  clearInterval(alarmInterval); alarmInterval=null;
  const modal=document.getElementById('alarm-modal'); if(modal) modal.style.display='none';
  if(navigator.vibrate) navigator.vibrate(0);
  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
}
/*function checkAlarms(){
  const now=new Date(); const currDate=now.toISOString().split('T')[0];
  let changed=false;
  tasks.forEach(task=>{
    if(!task.completed && task.date && task.date < currDate &&!task.text.includes("You Ignored Me")){
      task.text=task.text.replace(" (You Ignored Me 😒)","")+" (You Ignored Me 😒)";
      let tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1);
      task.date=tomorrow.toISOString().split('T')[0]; wallet-=50; changed=true;
    }
    if(!task.completed &&!task.notified && task.time && task.date===currDate){
      const currTime=now.toTimeString().slice(0,5);
      if(task.time===currTime){ playAlarm(task.text); task.notified=true; changed=true; }
    }
  });
  if(changed){ saveTasks(); renderTasks(); }
}*/

document.addEventListener('DOMContentLoaded',()=>{
  updateSoundUI(); renderTasks();
  if(soundBtn){
    soundBtn.addEventListener('click',()=>{
      soundEnabled=!soundEnabled;
      localStorage.setItem('soundEnabled', soundEnabled);
      if(soundEnabled){ if(!audioCtx) audioCtx=new (window.AudioContext||window.webkitAudioContext)(); audioCtx.resume().then(()=>playBeepSound()); }
      updateSoundUI();
    });
  }
  document.getElementById('stop-alarm-btn')?.addEventListener('click',stopAlarm);
  document.getElementById('alarm-modal')?.addEventListener('click',(e)=>{ if(e.target.id==='alarm-modal') stopAlarm(); });
  document.getElementById('record-btn')?.addEventListener('click', async ()=>{
    try{
      const stream=await navigator.mediaDevices.getUserMedia({audio:true});
      const mediaRecorder=new MediaRecorder(stream);
      const btn=document.getElementById('record-btn'); btn.textContent="🔴 Recording... 3s";
      mediaRecorder.start();
      setTimeout(()=>{ mediaRecorder.stop(); stream.getTracks().forEach(t=>t.stop()); stopAlarm(); alert("Verified! Task Unlocked ✅ +60 Rs"); wallet+=60; saveTasks(); renderTasks(); btn.textContent="🎤 I Did It - Record 3 Sec"; },3000);
    }catch(e){ alert("Please allow mic permission"); }
  });
});

setInterval(checkAlarms,1000); checkAlarms();