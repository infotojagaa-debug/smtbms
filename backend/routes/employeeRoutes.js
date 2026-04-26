const express = require('express');
const router = express.Router();
const { 
  getAllEmployees, 
  createEmployee, 
  getEmployeeById 
} = require('../controllers/employeeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, authorize('Admin', 'HR', 'Manager'), getAllEmployees)
  .post(protect, authorize('Admin', 'HR'), createEmployee);

router.route('/:id')
  .get(protect, getEmployeeById);

module.exports = router;
