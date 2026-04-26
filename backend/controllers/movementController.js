const MaterialMovement = require('../models/MaterialMovement');
const Material = require('../models/Material');

// @desc    Transfer material between departments
// @route   POST /api/movements/transfer
// @access  Private
exports.transferMaterial = async (req, res) => {
  const { materialId, fromDepartment, toDepartment, quantity, remarks } = req.body;

  try {
    const material = await Material.findById(materialId);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.stock < quantity) {
      return res.status(400).json({ message: 'Insufficient stock for transfer' });
    }

    // Process movement (Stock subtraction happens when moving "Out" or "Transferring")
    // Note: In this system, "Transfer" just moves between departments logically.
    // However, if it's leaving the main storage, we track it.
    
    material.stock -= Number(quantity);
    await material.save();

    const movement = await MaterialMovement.create({
      material: materialId,
      fromDepartment,
      toDepartment,
      quantity,
      type: 'Transfer',
      movedBy: req.user._id,
      remarks,
    });

    res.status(201).json(movement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get movement history
// @route   GET /api/movements
// @access  Private
exports.getMovements = async (req, res) => {
  try {
    const movements = await MaterialMovement.find()
      .populate('material', 'name sku')
      .populate('movedBy', 'name role')
      .sort('-createdAt');
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
