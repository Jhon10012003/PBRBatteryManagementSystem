import express from 'express';
import {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  addEnvironmentalLog,
  getShipmentsWithAlerts,
} from '../controllers/shipmentController.js';
import { protect, admin, manager } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(protect, getShipments)
  .post(protect, manager, createShipment);

router.route('/alerts')
  .get(protect, getShipmentsWithAlerts);

router.route('/:id')
  .get(protect, getShipmentById)
  .put(protect, manager, updateShipment)
  .delete(protect, admin, deleteShipment);

router.route('/:id/logs')
  .post(protect, addEnvironmentalLog);

export default router;