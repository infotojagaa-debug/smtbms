const Performance = require('../models/Performance');

// @desc    Add Performance Review
// @route   POST /api/hr/performance
exports.addReview = async (req, res) => {
  try {
    const { productivity, quality, teamwork, punctuality } = req.body.categories;
    const avgRating = (productivity + quality + teamwork + punctuality) / 4;

    const review = await Performance.create({
      ...req.body,
      rating: avgRating.toFixed(1),
      reviewedBy: req.user._id
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for an employee
// @route   GET /api/hr/performance/:id
exports.getReviewsByEmployee = async (req, res) => {
  try {
    const reviews = await Performance.find({ employeeId: req.params.id })
      .populate('reviewedBy', 'name')
      .sort('-reviewDate');
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Performance Analytics for Chart
// @route   GET /api/hr/performance/summary
exports.getPerformanceSummary = async (req, res) => {
  try {
    const summary = await Performance.aggregate([
      { $group: { _id: '$reviewPeriod', avgRating: { $avg: '$rating' } } }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
