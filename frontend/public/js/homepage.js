const API_URL = "http://localhost:3222/api";
const username = localStorage.getItem('username');

async function loadBookings() {
  const res = await fetch(`${API_URL}/bookings?username=${username}`, {
    headers: { 
      'Content-Type': 'application/json',
    },
  });
  const bookings = await res.json();

  const list = document.getElementById('booking-list');
  list.innerHTML = '';
  try{
    bookings.forEach(b => {
      const item = document.createElement('li');
      // Format date as DD/MM/YY
      const d = new Date(b.startTime);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = String(d.getFullYear()).slice(-2);
      const dateStr = `${day}/${month}/${year}`;
      const startTime = new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const endTime = new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      item.innerHTML = `
        <span style="font-size:2rem;font-weight:bold;color:#ffe600;">${b.location}</span><br>
        <span style="color:#fff;">Room:</span> <span style="font-weight:bold;">${b.room}</span><br>
        <span style="color:#fff;">Date:</span> <span style="font-weight:bold;">${dateStr}</span><br>
        <span style="color:#fff;">Time:</span> <span style="font-weight:bold;">${startTime} - ${endTime}</span>
      `;
      // Add delete button
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '10px';
      delBtn.onclick = () => deleteBooking(b._id);
      item.appendChild(delBtn);
      list.appendChild(item);
    });
  }catch(e){
    console.error('Error loading bookings:', e);}
}

async function createBooking() {
  const location = document.getElementById('location').value;
  const room = document.getElementById('room').value;
  const date = document.getElementById('date').value;
  const startTimeEl = document.querySelector('#startTimeList .selected');
  const endTimeEl = document.querySelector('#endTimeList .selected');
  if (!date || !startTimeEl || !endTimeEl) {
    alert('Please select date, start time, and end time.');
    return;
  }
  const startTime = date + 'T' + startTimeEl.textContent;
  const endTime = date + 'T' + endTimeEl.textContent;
  // Check that startTime is before endTime
  if (new Date(startTime) >= new Date(endTime)) {
    alert('Start time must be before end time.');
    return;
  }
  const res = await fetch(`${API_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, location, room, startTime, endTime })
  });
  if(res.status === 409){
    const data = await res.json();
    alert(data.message);
    return;
  }

  // Clear the form
  document.getElementById('location').selectedIndex = 0;
  document.getElementById('room').value = '';
  document.getElementById('date').value = '';
  document.querySelectorAll('#startTimeList .selected').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('#endTimeList .selected').forEach(el => el.classList.remove('selected'));

  loadBookings();
}

async function deleteBooking(id) {
  await fetch(`${API_URL}/bookings/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  loadBookings();
}

window.onload = loadBookings;
