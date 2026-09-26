// reward.js - Final for reward.html
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let rewardHistory = JSON.parse(localStorage.getItem('rewardHistory')) || [];
let wallet = parseInt(localStorage.getItem('wallet') || '0');

const walletEl = document.getElementById('wallet-display');
const totalCompletedEl = document.getElementById('total-completed');
const totalEarnedEl = document.getElementById('total-earned');
const historyDiv = document.getElementById('reward-history');

if(walletEl) walletEl.textContent = `💰 ${wallet} Rs`;
if(totalCompletedEl) totalCompletedEl.textContent = tasks.filter(t=>t.completed).length;
if(totalEarnedEl) totalEarnedEl.textContent = wallet + " Rs";

if(historyDiv){
  if(rewardHistory.length===0){
    historyDiv.innerHTML = `<p class="empty-text">No rewards yet. Complete a task!</p>`;
  } else {
    historyDiv.innerHTML = rewardHistory.map(h=>`
      <div style="background:white; padding:14px; border-radius:12px; margin-bottom:10px; border-left:4px solid #14B8A6; text-align:left;">
        <strong>✅ ${h.text}</strong><br>
        <small style="color:#6b9e8f;">${h.date} - +${h.coins} Rs</small>
      </div>
    `).join('');
  }
}