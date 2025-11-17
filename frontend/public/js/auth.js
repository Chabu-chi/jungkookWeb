import dotenv from 'dotenv';

const API_URL = process.env.BACKEND_URL+"/api";

async function registerUser() {
  const username = document.getElementById('username').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem('username', data.username);
    window.location.href = 'homepage.html';
  } else {
    alert(data.message);
  }
}

async function loginUser() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  

  const data = await res.json();
  
  if (res.ok) {
    localStorage.setItem('username', data.username);
    window.location.href = 'homepage.html';
  } else {
    alert(data.message);
  }
}
