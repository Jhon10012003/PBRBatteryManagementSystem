import express from 'express';
import {
  getBatteries,
  getBatteryById,
  createBattery,
  updateBattery,
  deleteBattery,
  getCriticalBatteries,
  updateBatteryCharge,
} from '../controllers/batteryController.js';
import { protect, admin, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getBatteries)
  .post(protect, manager, createBattery);

router.route('/critical')
  .get(protect, getCriticalBatteries);

router.route('/:id')
  .get(protect, getBatteryById)
  .put(protect, manager, updateBattery)
  .delete(protect, admin, deleteBattery);

router.route('/:id/charge')
  .put(protect, updateBatteryCharge);

export default router;