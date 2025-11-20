// js/homepage.js
const API_URL = "http://54.146.227.9:3222/api";
const username = localStorage.getItem('username');

async function loadBookings() {
  if (!username) return;
  try {
    const res = await fetch(`${API_URL}/bookings?username=${encodeURIComponent(username)}`, {
      headers: { 'Content-Type': 'application/json' }
    });
    const bookings = await res.json();
    const list = document.getElementById('booking-list');
    list.innerHTML = '';
    bookings.forEach(b => {
      // prefer date+slot, fallback to startTime/endTime formatting
      const dateStr = b.date || (b.startTime ? new Date(b.startTime).toISOString().slice(0,10) : '');
      const slot = b.slot || (b.startTime && b.endTime ? 
        `${new Date(b.startTime).toTimeString().slice(0,5)}-${new Date(b.endTime).toTimeString().slice(0,5)}` : '');
      const item = document.createElement('li');
      item.innerHTML = `
        <span style="font-size:1.25rem;font-weight:bold;color:#ffe600;">${b.location || ''} - ${b.room}</span><br>
        <span style="color:#fff;">Date:</span> <span style="font-weight:bold;">${dateStr}</span><br>
        <span style="color:#fff;">Time:</span> <span style="font-weight:bold;">${slot}</span>
      `;
      const delBtn = document.createElement('button');
      delBtn.textContent = 'Delete';
      delBtn.style.marginLeft = '10px';
      delBtn.onclick = () => deleteBooking(b._id);
      item.appendChild(delBtn);
      list.appendChild(item);
    });
  } catch (e) {
    console.error('Error loading bookings:', e);
  }
}

async function refreshAvailability() {
  // enable all slots first
  document.querySelectorAll('#slotList .slot-item').forEach(el => {
    el.classList.remove('disabled', 'selected');
  });

  const date = document.getElementById('date').value;
  const room = document.getElementById('room').value;
  if (!date || !room) return;

  try {
    const res = await fetch(`${API_URL}/bookings?date=${encodeURIComponent(date)}&room=${encodeURIComponent(room)}`);
    if (!res.ok) {
      console.warn('No availability response');
      return;
    }

    const bookings = await res.json();
    const bookedSlots = new Set(bookings.map(b => b.slot).filter(Boolean));

    // disable slots already booked
    document.querySelectorAll('#slotList .slot-item').forEach(el => {
      if (bookedSlots.has(el.dataset.slot)) {
        el.classList.add('disabled');
      }
    });

    // --- disable past slots if selected date = today ---
    const today = new Date();
    const selectedDate = new Date(date);
    if (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    ) {
      const currentHour = today.getHours();

      document.querySelectorAll('#slotList .slot-item').forEach(el => {
        const [startHour] = el.dataset.slot.split('-')[0].split(':').map(Number);
        if (startHour <= currentHour) {
          el.classList.add('disabled');
        }
      });
    }

  } catch (e) {
    console.error('Error fetching availability:', e);
  }
}


async function createBooking() {
  const location = document.getElementById('location').value;
  const room = document.getElementById('room').value;
  const date = document.getElementById('date').value;
  const slotEl = document.querySelector('#slotList .selected');

  if (!location || !room || !date || !slotEl) {
    alert('Please select location, room, date and a 1-hour slot.');
    return;
  }

  const slot = slotEl.dataset.slot;

  try {
    const res = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, location, room, date, slot })
    });

    if (res.status === 409) {
      const data = await res.json();
      alert(data.message || 'Slot already booked');
      await refreshAvailability();
      return;
    }
    if (!res.ok) {
      const data = await res.json().catch(()=>({message:'Unknown error'}));
      alert(`Failed to create booking: ${data.message}`);
      return;
    }

    // Reset form
    document.getElementById('location').selectedIndex = 0;
    document.getElementById('room').selectedIndex = 0;
    document.getElementById('date').value = '';
    document.querySelectorAll('#slotList .selected').forEach(el => el.classList.remove('selected'));
    await loadBookings();
  } catch (e) {
    console.error('Error creating booking:', e);
    alert('Server error creating booking');
  }
}

async function deleteBooking(id) {
  try {
    await fetch(`${API_URL}/bookings/${id}`, { method: 'DELETE' });
    await loadBookings();
    // refresh availability if a date+room currently selected
    await refreshAvailability();
  } catch (e) {
    console.error('Error deleting booking:', e);
  }
}

window.onload = function() {
  loadBookings();
};