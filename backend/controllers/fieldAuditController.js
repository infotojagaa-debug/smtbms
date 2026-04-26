const FieldAudit = require('../models/FieldAudit');
const Task = require('../models/Task');
const { createNotification } = require('./notificationController');

// @desc    Start/Create an ad-hoc or assigned field audit
// @route   POST /api/field-audit/start
exports.startAudit = async (req, res) => {
  try {
    const { storeName, targetLocation, checkIn, offlineSyncId } = req.body;
    
    // GPS validation check
    let verified = false;
    if (checkIn && targetLocation && checkIn.location) {
      // Very basic distance calculation (Haversine formula approximation) could go here
      // For now, we trust the client's verified flag or assume 500m radius
      verified = checkIn.verified; 
    }

    const audit = await FieldAudit.create({
      employee: req.user._id,
      storeName,
      targetLocation,
      checkIn: {
        time: checkIn?.time || Date.now(),
        location: checkIn?.location,
        verified
      },
      status: 'In Progress',
      offlineSyncId
    });

    res.status(201).json(audit);
  } catch (error) {
    res.status(400).json({ message: 'Error starting audit', error: error.message });
  }
};

// @desc    Submit a completed field audit
// @route   POST /api/field-audit/submit
exports.submitAudit = async (req, res) => {
  try {
    const { auditId, checklist, evidence, issues, timeSpentMinutes, offlineSyncId } = req.body;
    
    let audit;
    if (auditId) {
      audit = await FieldAudit.findById(auditId);
    } else if (offlineSyncId) {
      audit = await FieldAudit.findOne({ offlineSyncId, employee: req.user._id });
    }

    if (!audit) {
       // If no audit found (e.g. offline created but start sync failed), create it
       audit = new FieldAudit({
         employee: req.user._id,
         storeName: req.body.storeName || 'Unknown Site',
         checkIn: req.body.checkIn,
         offlineSyncId
       });
    }

    audit.checklist = checklist;
    audit.evidence = evidence;
    audit.issues = issues;
    audit.timeSpentMinutes = timeSpentMinutes;
    audit.status = 'Submitted';

    await audit.save();

    // If issues are flagged, generate Tasks for the manager
    if (issues && issues.length > 0) {
      for (const issue of issues) {
        // Find a manager to assign the issue to (simplification: assign to the creator's manager or an admin)
        // For this system, we'll assign to the first Admin if no assignedBy exists
        const User = require('../models/User');
        const admin = await User.findOne({ role: 'Admin' });
        
        if (admin) {
           const newTask = await Task.create({
             user: admin._id,
             assignedBy: req.user._id,
             assignedTo: [{ user: admin._id, status: 'Pending' }],
             title: `AUDIT ISSUE: ${issue.title} at ${audit.storeName}`,
             description: `Severity: ${issue.severity}. \n\nDetails: ${issue.description}`,
             priority: issue.severity === 'High' ? 'High' : 'Medium',
             date: new Date().toISOString().split('T')[0],
             category: 'Audit Issue',
             attachment: issue.photoUrl
           });
           
           // Notify Admin
           await createNotification({
             userId: admin._id,
             title: 'Critical Audit Issue Flagged',
             message: `${req.user.name} reported a ${issue.severity} issue at ${audit.storeName}`,
             type: 'danger',
             priority: issue.severity === 'High' ? 'high' : 'medium',
             module: 'hrms',
             link: '/manager/task-assign'
           });
        }
      }
    }

    // Notify Manager/Admin of submission
    const User = require('../models/User');
    const managers = await User.find({ role: { $in: ['Admin', 'Manager'] } });
    for (const m of managers) {
        await createNotification({
            userId: m._id,
            title: 'Field Audit Submitted',
            message: `${req.user.name} completed the audit for ${audit.storeName}`,
            type: 'success',
            priority: 'low',
            module: 'hrms',
            link: '/admin/reports' // or specific field audit review page
        });
    }

    res.json(audit);
  } catch (error) {
    console.error('Audit Submit Error:', error);
    res.status(400).json({ message: 'Error submitting audit', error: error.message });
  }
};

// @desc    Offline Sync (Bulk upload of audits)
// @route   POST /api/field-audit/sync
exports.syncAudits = async (req, res) => {
  try {
    const { audits } = req.body; // Array of completed audits
    let syncedCount = 0;

    for (const data of audits) {
       // Only process if not already synced
       const existing = await FieldAudit.findOne({ offlineSyncId: data.offlineSyncId });
       if (!existing) {
          const audit = await FieldAudit.create({
             employee: req.user._id,
             storeName: data.storeName,
             targetLocation: data.targetLocation,
             checkIn: data.checkIn,
             status: 'Submitted',
             checklist: data.checklist,
             evidence: data.evidence,
             issues: data.issues,
             timeSpentMinutes: data.timeSpentMinutes,
             offlineSyncId: data.offlineSyncId
          });
          syncedCount++;
          
          // Generate tasks for issues if needed (could extract logic to a helper)
       }
    }

    res.json({ message: `${syncedCount} offline audits synced successfully` });
  } catch (error) {
    res.status(500).json({ message: 'Sync failed', error: error.message });
  }
};

// @desc    Get employee's own audits
// @route   GET /api/field-audit/my
exports.getMyAudits = async (req, res) => {
  try {
    const audits = await FieldAudit.find({ employee: req.user._id }).sort('-createdAt');
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all audits (Manager)
// @route   GET /api/field-audit/all
exports.getAllAudits = async (req, res) => {
  try {
    const audits = await FieldAudit.find()
      .populate('employee', 'name department avatar')
      .sort('-createdAt');
    res.json(audits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Review a field audit (Approve/Reject)
// @route   PUT /api/field-audit/:id/review
exports.reviewAudit = async (req, res) => {
  try {
    const { status, managerNotes } = req.body;
    const audit = await FieldAudit.findById(req.params.id);
    
    if (!audit) return res.status(404).json({ message: 'Audit not found' });

    audit.status = status;
    if (managerNotes) audit.managerNotes = managerNotes;
    
    await audit.save();

    // Notify the employee
    await createNotification({
       userId: audit.employee,
       title: `Audit ${status}`,
       message: `Your field audit for ${audit.storeName} was ${status.toLowerCase()} by ${req.user.name}.`,
       type: status === 'Reviewed' ? 'success' : 'danger',
       priority: 'high',
       module: 'hrms',
       link: '/field-audit'
    });

    res.json(audit);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
