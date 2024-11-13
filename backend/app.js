// app.js
const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid'); 

const app = express();
app.use(cors());
app.use(bodyParser.json());
const serviceAccount = require('./booking-system-e594d-firebase-adminsdk-obymp-8586f3e2d8.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.databasereal
});

const db = admin.database();



// Middleware
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Authentication Error:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};


// User Registration
app.post('/api/register', authenticate, async (req, res) => {
  const { email, password, name, role } = req.body;
  const uid = req.user.uid;

  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await admin.auth().updateUser(uid, {
      email: email,
      displayName: name,
    });

    await db.ref(`users/${uid}`).set({
      name,
      email,
      role, 
      timeZone: 'UTC', 
    });

    res.status(201).json({ message: 'User registered successfully', uid });
  } catch (error) {
    console.error('Error in /api/register:', error);
    res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
});

// User Login
app.get('/api/user', authenticate, async (req, res) => {
  const uid = req.user.uid;
  try {
    const snapshot = await db.ref(`users/${uid}`).once('value');
    if (snapshot.exists()) {
      const userData = snapshot.val();
      res.status(200).json({ uid, ...userData });
    } else {
      res.status(404).json({ error: 'User data not found' });
    }
  } catch (error) {
    console.error('Error in /api/user:', error);
    res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
});
// Instructor Sets Availability
app.post('/api/availability', authenticate, async (req, res) => {
  const { date, timeSlots, recurring } = req.body;
  const instructorId = req.user.uid;
  try {
    if (recurring) {

      await db.ref(`availability/${instructorId}/recurring`).push({
        dayOfWeek: recurring.dayOfWeek, 
        startTime: recurring.startTime, 
        endTime: recurring.endTime,     
      });
    } else {
      await db.ref(`availability/${instructorId}/dates/${date}`).set(timeSlots);
    }
    res.status(200).json({ message: 'Availability set successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Instructor Edits Availability
app.put('/api/availability', authenticate, async (req, res) => {
  const { date, timeSlots } = req.body;
  const instructorId = req.user.uid;
  try {
    await db.ref(`availability/${instructorId}/dates/${date}`).set(timeSlots);
    res.status(200).json({ message: 'Availability updated successfully.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Instructor Deletes Availability
app.delete('/api/availability', authenticate, async (req, res) => {
  const { date, timeSlot, recurringKey } = req.body;
  const instructorId = req.user.uid;
  try {
    if (recurringKey) {
      await db.ref(`availability/${instructorId}/recurring/${recurringKey}`).remove();
    } else if (timeSlot && date) {
      await db.ref(`availability/${instructorId}/dates/${date}/${timeSlot}`).remove();
    } else if (date) {
      await db.ref(`availability/${instructorId}/dates/${date}`).remove();
    } else {
      return res.status(400).json({ error: 'Invalid request parameters.' });
    }
    res.status(200).json({ message: 'Availability deleted successfully.' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ error: error.message });
  }
});

//  Instructor Views Bookings
app.get('/api/bookings', authenticate, async (req, res) => {
  const instructorId = req.user.uid;
  try {
    const snapshot = await db.ref(`bookings/${instructorId}`).once('value');
    const bookings = snapshot.val();
    res.status(200).json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Student Views Available Slots
app.get('/api/available-slots/:instructorId/:date', async (req, res) => {
  const { instructorId, date } = req.params;
  try {
    const availabilitySnapshot = await db.ref(`availability/${instructorId}/dates/${date}`).once('value');
    const recurringSnapshot = await db.ref(`availability/${instructorId}/recurring`).once('value');

    let availableSlots = availabilitySnapshot.val() || [];
    const recurring = recurringSnapshot.val();

    if (recurring) {
      const currentDay = new Date(date).getDay(); // 0-6
      recurring.forEach(recurringSlot => {
        if (recurringSlot.dayOfWeek === currentDay) {
          availableSlots = availableSlots.concat([`${recurringSlot.startTime}-${recurringSlot.endTime}`]);
        }
      });
    }

    const bookingsSnapshot = await db.ref(`bookings/${instructorId}/${date}`).once('value');
    const bookings = bookingsSnapshot.val() || {};

    const finalAvailableSlots = availableSlots.filter(slot => !bookings[slot]);

    res.status(200).json(finalAvailableSlots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//  Student Books a Slot
app.post('/api/bookings', authenticate, async (req, res) => {
  const { instructorId, date, timeSlot, purpose, prerequisites } = req.body;
  const studentId = req.user.uid;

  if (!instructorId || !date || !timeSlot || !purpose) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const instructorSnapshot = await db.ref(`users/${instructorId}`).once('value');
    if (!instructorSnapshot.exists() || instructorSnapshot.val().role !== 'instructor') {
      return res.status(404).json({ error: 'Instructor not found.' });
    }

    const availabilitySnapshot = await db.ref(`availability/${instructorId}`).once('value');
    const availabilityData = availabilitySnapshot.val() || {};

    let isAvailable = false;
    if (availabilityData.dates && availabilityData.dates[date]) {
      isAvailable = availabilityData.dates[date].includes(timeSlot);
    }

    if (!isAvailable && availabilityData.recurring) {
      const day = new Date(date).getDay(); // 0-6
      for (const key in availabilityData.recurring) {
        const slot = availabilityData.recurring[key];
        const timeRange = `${slot.startTime}-${slot.endTime}`;
        if (slot.dayOfWeek === day && timeRange === timeSlot) {
          isAvailable = true;
          break;
        }
      }
    }

    if (!isAvailable) {
      return res.status(400).json({ error: 'Selected time slot is not available.' });
    }

    const bookingRef = db.ref(`bookings/${instructorId}/${date}/${timeSlot}`);
    const bookingSnapshot = await bookingRef.once('value');
    if (bookingSnapshot.exists()) {
      return res.status(400).json({ error: 'Time slot already booked.' });
    }

    await bookingRef.set({
      studentId,
      purpose,
      prerequisites: prerequisites || '',
      status: 'confirmed',
      bookedAt: admin.database.ServerValue.TIMESTAMP,
    });

    res.status(200).json({ message: 'Booking confirmed.' });
  } catch (error) {
    console.error('Error booking slot:', error);
    res.status(500).json({ error: 'Internal Server Error: ' + error.message });
  }
});

// Student Views Their Bookings
app.get('/api/student-bookings', authenticate, async (req, res) => {
  const studentId = req.user.uid;
  try {
    const snapshot = await db.ref(`bookings`).once('value');
    const allBookings = snapshot.val() || {};
    const studentBookings = [];

    for (const instructorId in allBookings) {
      for (const date in allBookings[instructorId]) {
        for (const timeSlot in allBookings[instructorId][date]) {
          const booking = allBookings[instructorId][date][timeSlot];
          if (booking.studentId === studentId) {
            studentBookings.push({
              instructorId,
              date,
              timeSlot,
              ...booking,
            });
          }
        }
      }
    }

    res.status(200).json(studentBookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/instructors', authenticate, async (req, res) => {
    const userId = req.user.uid;
    try {
      const userSnapshot = await db.ref(`users/${userId}`).once('value');
      const user = userSnapshot.val();
      if (user.role !== 'student') {
        return res.status(403).json({ error: 'Forbidden: Only students can fetch instructors.' });
      }
  
      const instructorsSnapshot = await db.ref(`users`).orderByChild('role').equalTo('instructor').once('value');
      const instructorsData = instructorsSnapshot.val() || {};
  
      const instructors = Object.keys(instructorsData).map(uid => ({
        uid,
        name: instructorsData[uid].name,
        email: instructorsData[uid].email,
        timeZone: instructorsData[uid].timeZone,
      }));
  
      res.status(200).json(instructors);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

// Fetch User Role
app.get('/api/user-role', authenticate, async (req, res) => {
    const userId = req.user.uid;
    try {
      const userSnapshot = await db.ref(`users/${userId}`).once('value');
      const user = userSnapshot.val();
      if (user) {
        res.status(200).json({ role: user.role });
      } else {
        res.status(404).json({ error: 'User not found.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk Edit Availability
app.put('/api/bulk-edit-availability', authenticate, async (req, res) => {
    const { dayOfWeek, startTime, endTime, action } = req.body;
    const instructorId = req.user.uid;
    try {
      const recurringRef = db.ref(`availability/${instructorId}/recurring`);
  
      if (action === 'add') {
        await recurringRef.push({
          dayOfWeek,
          startTime,
          endTime,
        });
        res.status(200).json({ message: 'Bulk availability added successfully.' });
      } else if (action === 'remove') {
        const snapshot = await recurringRef.orderByChild('dayOfWeek').equalTo(dayOfWeek).once('value');
        const updates = {};
        snapshot.forEach(child => {
          const data = child.val();
          if (data.startTime === startTime && data.endTime === endTime) {
            updates[child.key] = null;
          }
        });
        await recurringRef.update(updates);
        res.status(200).json({ message: 'Bulk availability removed successfully.' });
      } else {
        res.status(400).json({ error: 'Invalid action.' });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
  // Instructor Fetches Availability
app.get('/api/availability', authenticate, async (req, res) => {
  const instructorId = req.user.uid;
  try {
    const snapshot = await db.ref(`availability/${instructorId}`).once('value');
    const availabilityData = snapshot.val() || {};
    res.status(200).json(availabilityData);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ error: error.message });
  }
});
//  Instructor's Availability for Students
app.get('/api/instructors/:id/availability', authenticate, async (req, res) => {
  const requesterId = req.user.uid;
  try {
    const requesterSnapshot = await db.ref(`users/${requesterId}`).once('value');
    const requester = requesterSnapshot.val();
    if (requester.role !== 'student') {
      return res.status(403).json({ error: 'Forbidden: Only students can view instructors\' availability.' });
    }

    const instructorId = req.params.id;
    
    const instructorSnapshot = await db.ref(`users/${instructorId}`).once('value');
    if (!instructorSnapshot.exists() || instructorSnapshot.val().role !== 'instructor') {
      return res.status(404).json({ error: 'Instructor not found.' });
    }

    const availabilitySnapshot = await db.ref(`availability/${instructorId}`).once('value');
    const availabilityData = availabilitySnapshot.val() || {};
    res.status(200).json(availabilityData);
  } catch (error) {
    console.error('Error fetching instructor availability:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});