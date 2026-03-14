const express = require('express');
const router = express.Router();
const Medication = require('../models/Medication');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify token
const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized' });
    }
  } else {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Helper function to calculate time difference
function getTimeDifference(time1, time2) {
  const [h1, m1] = time1.split(':').map(Number);
  const [h2, m2] = time2.split(':').map(Number);
  
  const minutes1 = h1 * 60 + m1;
  const minutes2 = h2 * 60 + m2;
  
  return minutes1 - minutes2;
}

// Helper to generate time slots
function generateTimeSlots(frequency, customTimes = []) {
  if (customTimes && customTimes.length > 0) {
    // Convert string times to objects with taken: false
    return customTimes.map(t => ({ 
      time: typeof t === 'string' ? t : t.time, 
      taken: false 
    }));
  }
  
  const defaultTimes = {
    once: ['09:00'],
    twice: ['09:00', '21:00'],
    thrice: ['08:00', '14:00', '20:00'],
    'four-times': ['08:00', '12:00', '16:00', '20:00'],
    'every-4-hours': ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
    'every-6-hours': ['00:00', '06:00', '12:00', '18:00'],
    'every-8-hours': ['00:00', '08:00', '16:00']
  };
  
  return (defaultTimes[frequency] || ['09:00']).map(t => ({ 
    time: t, 
    taken: false 
  }));
}

// Get all medications for user
router.get('/', protect, async (req, res) => {
  try {
    const medications = await Medication.find({ 
      user: req.user._id,
      status: { $ne: 'discontinued' }
    }).sort('-createdAt');
    
    res.json(medications);
  } catch (error) {
    console.error('Error fetching medications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get active medications (for dashboard alerts)
router.get('/active', protect, async (req, res) => {
  try {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
    
    const medications = await Medication.find({ 
      user: req.user._id,
      status: 'active'
    });
    
    // Find due medications for current time window
    const dueMeds = [];
    const upcomingMeds = [];
    
    medications.forEach(med => {
      med.times.forEach((timeSlot, index) => {
        if (!timeSlot.taken) {
          const timeDiff = getTimeDifference(timeSlot.time, currentTime);
          
          if (timeDiff <= 0 && timeDiff > -60) {
            // Due now (within last hour)
            dueMeds.push({
              ...med.toObject(),
              timeIndex: index,
              timeSlot: timeSlot.time,
              minutesLate: Math.abs(timeDiff)
            });
          } else if (timeDiff > 0 && timeDiff <= 30) {
            // Upcoming within 30 minutes
            upcomingMeds.push({
              ...med.toObject(),
              timeIndex: index,
              timeSlot: timeSlot.time,
              minutesUntil: timeDiff
            });
          }
        }
      });
    });
    
    res.json({ due: dueMeds, upcoming: upcomingMeds });
  } catch (error) {
    console.error('Error fetching active medications:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new medication - FIXED VERSION
router.post('/', protect, async (req, res) => {
  try {
    console.log('Creating medication for user:', req.user._id);
    console.log('Request body:', req.body);
    
    // Process times array - convert strings to objects if needed
    let processedTimes = req.body.times;
    if (processedTimes && processedTimes.length > 0) {
      // Check if times are strings or objects
      if (typeof processedTimes[0] === 'string') {
        processedTimes = processedTimes.map(t => ({ time: t, taken: false }));
      }
    } else {
      processedTimes = generateTimeSlots(req.body.frequency, []);
    }
    
    const medicationData = {
      user: req.user._id,
      name: req.body.name,
      dosage: req.body.dosage,
      unit: req.body.unit || 'tablet',
      frequency: req.body.frequency,
      times: processedTimes,
      instructions: req.body.instructions || '',
      prescribedBy: req.body.prescribedBy || '',
      startDate: req.body.startDate || new Date(),
      notifications: req.body.notifications || { enabled: true, reminderTime: 5 },
      status: 'active'
    };
    
    const medication = await Medication.create(medicationData);
    console.log('✅ Medication created:', medication._id);
    res.status(201).json(medication);
  } catch (error) {
    console.error('❌ Error creating medication:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update medication
router.put('/:id', protect, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Check ownership
    if (medication.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    // Process times if they're being updated
    if (req.body.times) {
      if (req.body.times.length > 0 && typeof req.body.times[0] === 'string') {
        req.body.times = req.body.times.map(t => ({ time: t, taken: false }));
      }
    }
    
    Object.assign(medication, req.body);
    await medication.save();
    
    res.json(medication);
  } catch (error) {
    console.error('Error updating medication:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark medication as taken
router.put('/:id/take/:timeIndex', protect, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    const timeIndex = parseInt(req.params.timeIndex);
    
    if (timeIndex >= 0 && timeIndex < medication.times.length) {
      medication.times[timeIndex].taken = true;
      medication.times[timeIndex].takenAt = new Date();
      
      // Add to history
      medication.history.push({
        date: new Date(),
        time: medication.times[timeIndex].time,
        status: 'taken'
      });
      
      await medication.save();
    }
    
    res.json(medication);
  } catch (error) {
    console.error('Error marking medication as taken:', error);
    res.status(500).json({ message: error.message });
  }
});

// Mark medication as skipped
router.put('/:id/skip/:timeIndex', protect, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    const timeIndex = parseInt(req.params.timeIndex);
    
    if (timeIndex >= 0 && timeIndex < medication.times.length) {
      medication.times[timeIndex].skipped = true;
      
      medication.history.push({
        date: new Date(),
        time: medication.times[timeIndex].time,
        status: 'skipped',
        notes: req.body.reason || ''
      });
      
      await medication.save();
    }
    
    res.json(medication);
  } catch (error) {
    console.error('Error skipping medication:', error);
    res.status(500).json({ message: error.message });
  }
});

// Delete medication (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const medication = await Medication.findById(req.params.id);
    
    if (!medication) {
      return res.status(404).json({ message: 'Medication not found' });
    }
    
    // Soft delete - mark as discontinued
    medication.status = 'discontinued';
    await medication.save();
    
    res.json({ message: 'Medication removed' });
  } catch (error) {
    console.error('Error deleting medication:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get today's adherence summary
router.get('/summary/today', protect, async (req, res) => {
  try {
    const medications = await Medication.find({ 
      user: req.user._id,
      status: 'active'
    });
    
    let totalDoses = 0;
    let takenDoses = 0;
    let skippedDoses = 0;
    let pendingDoses = 0;
    
    medications.forEach(med => {
      med.times.forEach(time => {
        totalDoses++;
        if (time.taken) takenDoses++;
        if (time.skipped) skippedDoses++;
        
        if (!time.taken && !time.skipped) {
          // Check if time has passed
          const [hours, minutes] = time.time.split(':').map(Number);
          const doseTime = new Date();
          doseTime.setHours(hours, minutes, 0);
          
          if (doseTime < new Date()) {
            pendingDoses++;
          }
        }
      });
    });
    
    res.json({
      totalDoses,
      takenDoses,
      skippedDoses,
      pendingDoses,
      adherenceRate: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;