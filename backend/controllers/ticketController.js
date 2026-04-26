const Ticket = require('../models/Ticket');
const TicketComment = require('../models/TicketComment');

// Helper: Auto-generate Ticket ID
const generateTicketId = async () => {
  const lastTicket = await Ticket.findOne().sort({ createdAt: -1 });
  if (!lastTicket) return 'TKT001';
  const lastIdNum = parseInt(lastTicket.ticketId.replace('TKT', ''));
  return `TKT${(lastIdNum + 1).toString().padStart(3, '0')}`;
};

// @desc    Create new ticket
// @route   POST /api/crm/tickets
exports.createTicket = async (req, res) => {
  try {
    const ticketId = await generateTicketId();
    const ticket = await Ticket.create({
      ...req.body,
      ticketId,
      createdBy: req.user._id
    });
    res.status(201).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to ticket
// @route   POST /api/crm/tickets/:id/comment
exports.addComment = async (req, res) => {
  try {
    const comment = await TicketComment.create({
      ...req.body,
      ticketId: req.params.id,
      createdBy: req.user._id
    });
    
    // Update Ticket "First Response" time if applicable
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket.firstResponseAt && !comment.isInternal) {
       ticket.firstResponseAt = new Date();
       await ticket.save();
    }

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resolve Ticket
// @route   PUT /api/crm/tickets/:id/resolve
exports.resolveTicket = async (req, res) => {
  try {
    const { resolution } = req.body;
    const ticket = await Ticket.findByIdAndUpdate(req.params.id, {
      status: 'resolved',
      resolution,
      resolvedAt: new Date()
    }, { new: true });
    
    // Logic for Satisfaction Rating email would go here
    
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Ticket Stats
// @route   GET /api/crm/tickets/stats
exports.getTicketStats = async (req, res) => {
  try {
    const stats = await Ticket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all tickets
// @route   GET /api/crm/tickets
exports.getAllTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find(req.query)
      .populate('customerId', 'name company')
      .populate('assignedTo', 'name email')
      .sort('-createdAt');
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Ticket By ID with Comments
// @route   GET /api/crm/tickets/:id
exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate('customerId', 'name company photo phone email');
    if (!ticket) return res.status(404).json({ message: 'Ticket not found' });
    
    const comments = await TicketComment.find({ ticketId: ticket._id }).populate('createdBy', 'name photo');
    res.json({ ticket, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
