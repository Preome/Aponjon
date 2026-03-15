const express = require('express');
const router = express.Router();
const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');
const Medication = require('../models/Medication');
const HelpRequest = require('../models/HelpRequest');
const PDFDocument = require('pdfkit');
const jwt = require('jsonwebtoken');
const moment = require('moment');

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

// ==================== HEALTH RECORDS ====================

// Add health record
router.post('/record', protect, async (req, res) => {
  try {
    const record = await HealthRecord.create({
      user: req.user._id,
      ...req.body
    });
    
    res.status(201).json(record);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get health records (with date range)
router.get('/records', protect, async (req, res) => {
  try {
    const { startDate, endDate, limit = 30 } = req.query;
    
    let query = { user: req.user._id };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    const records = await HealthRecord.find(query)
      .sort('-date')
      .limit(parseInt(limit));
    
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get latest health record
router.get('/latest', protect, async (req, res) => {
  try {
    const record = await HealthRecord.findOne({ user: req.user._id })
      .sort('-date');
    
    res.json(record || {});
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== REPORT GENERATION ====================

// Generate PDF Health Report
router.get('/report/pdf', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // Fetch all data
    const [user, healthRecords, medications, helpRequests] = await Promise.all([
      User.findById(req.user._id),
      HealthRecord.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort('date'),
      Medication.find({
        user: req.user._id,
        status: 'active'
      }),
      HelpRequest.find({
        elderly: req.user._id,
        createdAt: { $gte: startDate, $lte: endDate }
      }).populate('volunteer', 'name')
    ]);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=health-report-${moment().format('YYYY-MM-DD')}.pdf`);
    
    // Pipe PDF to response
    doc.pipe(res);

    // ========== COVER PAGE ==========
    doc.fontSize(25).font('Helvetica-Bold').text('Aponjon Health Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).font('Helvetica').text(`Generated for: ${user.name}`, { align: 'center' });
    doc.fontSize(12).text(`Email: ${user.email}`, { align: 'center' });
    doc.fontSize(10).text(`Report Period: ${moment(startDate).format('MMM D, YYYY')} - ${moment(endDate).format('MMM D, YYYY')}`, { align: 'center' });
    doc.moveDown(2);

    // ========== VITALS SUMMARY ==========
    doc.fontSize(16).font('Helvetica-Bold').text('Vitals Summary', { underline: true });
    doc.moveDown();

    if (healthRecords.length > 0) {
      // Calculate averages
      const avgBP = {
        systolic: Math.round(healthRecords.reduce((sum, r) => sum + (r.bloodPressure?.systolic || 0), 0) / healthRecords.length),
        diastolic: Math.round(healthRecords.reduce((sum, r) => sum + (r.bloodPressure?.diastolic || 0), 0) / healthRecords.length)
      };
      const avgHR = Math.round(healthRecords.reduce((sum, r) => sum + (r.heartRate?.value || 0), 0) / healthRecords.length);
      const avgTemp = (healthRecords.reduce((sum, r) => sum + (r.temperature?.value || 0), 0) / healthRecords.length).toFixed(1);
      const avgO2 = Math.round(healthRecords.reduce((sum, r) => sum + (r.oxygenLevel?.value || 0), 0) / healthRecords.length);
      
      doc.fontSize(12).font('Helvetica').text(`Average Blood Pressure: ${avgBP.systolic}/${avgBP.diastolic} mmHg`);
      doc.text(`Average Heart Rate: ${avgHR} bpm`);
      doc.text(`Average Temperature: ${avgTemp}°F`);
      doc.text(`Average Oxygen Level: ${avgO2}%`);
      
      if (healthRecords.some(r => r.weight?.value)) {
        const avgWeight = (healthRecords.reduce((sum, r) => sum + (r.weight?.value || 0), 0) / healthRecords.length).toFixed(1);
        doc.text(`Average Weight: ${avgWeight} kg`);
      }
      
      if (healthRecords.some(r => r.bloodSugar?.value)) {
        const avgSugar = Math.round(healthRecords.reduce((sum, r) => sum + (r.bloodSugar?.value || 0), 0) / healthRecords.length);
        doc.text(`Average Blood Sugar: ${avgSugar} mg/dL`);
      }
    } else {
      doc.text('No health records found for this period.');
    }
    
    doc.moveDown(2);

    // ========== MEDICATION ADHERENCE ==========
    doc.fontSize(16).font('Helvetica-Bold').text('Medication Adherence', { underline: true });
    doc.moveDown();

    let totalDoses = 0;
    let takenDoses = 0;

    medications.forEach(med => {
      const medTotal = med.times?.length || 0;
      const medTaken = med.times?.filter(t => t.taken).length || 0;
      totalDoses += medTotal;
      takenDoses += medTaken;
      
      doc.fontSize(12).font('Helvetica-Bold').text(med.name);
      doc.fontSize(10).font('Helvetica').text(`  Dosage: ${med.dosage} ${med.unit}`);
      doc.fontSize(10).text(`  Adherence: ${medTotal > 0 ? Math.round((medTaken / medTotal) * 100) : 0}% (${medTaken}/${medTotal} doses taken)`);
    });

    const overallAdherence = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    doc.moveDown();
    doc.fontSize(12).font('Helvetica-Bold').text(`Overall Adherence: ${overallAdherence}%`);
    doc.moveDown(2);

    // ========== EMERGENCY INCIDENTS ==========
    const emergencies = helpRequests.filter(r => r.isEmergency);
    
    doc.fontSize(16).font('Helvetica-Bold').text('Emergency Incidents', { underline: true });
    doc.moveDown();

    if (emergencies.length > 0) {
      emergencies.forEach((emergency, i) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`Emergency #${i + 1}: ${moment(emergency.createdAt).format('MMM D, YYYY h:mm A')}`);
        doc.fontSize(10).font('Helvetica').text(`  Status: ${emergency.status}`);
        if (emergency.volunteer) {
          doc.text(`  Responder: ${emergency.volunteer.name}`);
        }
        doc.text(`  Description: ${emergency.description}`);
        doc.moveDown();
      });
    } else {
      doc.text('No emergency incidents reported.');
    }
    
    doc.moveDown(2);

    // ========== HELP REQUESTS ==========
    const regularRequests = helpRequests.filter(r => !r.isEmergency);
    
    doc.fontSize(16).font('Helvetica-Bold').text('Help Requests', { underline: true });
    doc.moveDown();

    if (regularRequests.length > 0) {
      regularRequests.forEach((request, i) => {
        doc.fontSize(12).font('Helvetica-Bold').text(`Request #${i + 1}: ${request.taskType}`);
        doc.fontSize(10).font('Helvetica').text(`  Date: ${moment(request.createdAt).format('MMM D, YYYY')}`);
        doc.text(`  Status: ${request.status}`);
        if (request.volunteer) {
          doc.text(`  Volunteer: ${request.volunteer.name}`);
        }
        doc.moveDown();
      });
    } else {
      doc.text('No help requests in this period.');
    }

    // ========== FOOTER ==========
    doc.moveDown(4);
    doc.fontSize(8).font('Helvetica').text('This report is generated for informational purposes only. Always consult with your healthcare provider.', { align: 'center', color: 'gray' });
    doc.text(`Generated on ${moment().format('MMMM D, YYYY h:mm A')}`, { align: 'center', color: 'gray' });

    // Finalize PDF
    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get report summary data (for charts)
router.get('/report/summary', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [healthRecords, medications, helpRequests] = await Promise.all([
      HealthRecord.find({
        user: req.user._id,
        date: { $gte: startDate, $lte: endDate }
      }).sort('date'),
      Medication.find({ user: req.user._id, status: 'active' }),
      HelpRequest.find({
        elderly: req.user._id,
        createdAt: { $gte: startDate, $lte: endDate }
      })
    ]);

    // Format data for charts
    const dailyVitals = healthRecords.map(r => ({
      date: moment(r.date).format('MMM D'),
      systolic: r.bloodPressure?.systolic,
      diastolic: r.bloodPressure?.diastolic,
      heartRate: r.heartRate?.value,
      temperature: r.temperature?.value,
      oxygen: r.oxygenLevel?.value
    }));

    // Medication adherence
    let totalDoses = 0;
    let takenDoses = 0;
    medications.forEach(med => {
      totalDoses += med.times?.length || 0;
      takenDoses += med.times?.filter(t => t.taken).length || 0;
    });

    // Emergency stats
    const emergencies = helpRequests.filter(r => r.isEmergency);
    const completedRequests = helpRequests.filter(r => r.status === 'completed');
    const pendingRequests = helpRequests.filter(r => r.status === 'pending');

    res.json({
      dailyVitals,
      medicationAdherence: {
        total: totalDoses,
        taken: takenDoses,
        percentage: totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0
      },
      helpRequests: {
        total: helpRequests.length,
        emergencies: emergencies.length,
        completed: completedRequests.length,
        pending: pendingRequests.length
      },
      userInfo: {
        name: req.user.name,
        email: req.user.email,
        age: req.user.age
      },
      period: {
        start: startDate,
        end: endDate,
        days
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;