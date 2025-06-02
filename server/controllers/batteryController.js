import asyncHandler from 'express-async-handler';
import Battery from '../models/batteryModel.js';
import Shipment from '../models/shipmentModel.js';


const getBatteries = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;

  const keyword = req.query.keyword
    ? {
      $or: [
        { serialNumber: { $regex: req.query.keyword, $options: 'i' } },
        { model: { $regex: req.query.keyword, $options: 'i' } },
        { manufacturer: { $regex: req.query.keyword, $options: 'i' } },
      ],
    }
    : {};

  const statusFilter = req.query.status ? { status: req.query.status } : {};
  const healthFilter = req.query.minHealth ? { healthStatus: { $gte: Number(req.query.minHealth) } } : {};

  const count = await Battery.countDocuments({
    ...keyword,
    ...statusFilter,
    ...healthFilter,
  });

  const batteries = await Battery.find({
    ...keyword,
    ...statusFilter,
    ...healthFilter,
  })
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });

  res.json({
    batteries,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get battery by ID
// @route   GET /api/batteries/:id
// @access  Private
const getBatteryById = asyncHandler(async (req, res) => {
  const battery = await Battery.findById(req.params.id).populate('shipment', 'shipmentNumber status');

  if (battery) {
    res.json(battery);
  } else {
    res.status(404);
    throw new Error('Battery not found');
  }
});

// @desc    Create a battery
// @route   POST /api/batteries
// @access  Private/Manager
const createBattery = asyncHandler(async (req, res) => {
  const {
    serialNumber,
    model,
    manufacturer,
    capacity,
    capacityUnit,
    voltage,
    chemistry,
    manufactureDate,
    status,
    healthStatus,
    cycleCount,
    currentCharge,
    location,
    notes,
  } = req.body;

  // Check if battery with this serial number already exists
  const batteryExists = await Battery.findOne({ serialNumber });

  if (batteryExists) {
    res.status(400);
    throw new Error('Battery with this serial number already exists');
  }

  const battery = await Battery.create({
    serialNumber,
    model,
    manufacturer,
    capacity,
    capacityUnit,
    voltage,
    chemistry,
    manufactureDate: new Date(manufactureDate),
    status,
    healthStatus,
    cycleCount,
    currentCharge,
    location,
    notes,
  });

  if (battery) {
    res.status(201).json(battery);
  } else {
    res.status(400);
    throw new Error('Invalid battery data');
  }
});

// @desc    Update a battery
// @route   PUT /api/batteries/:id
// @access  Private/Manager
const updateBattery = asyncHandler(async (req, res) => {
  const battery = await Battery.findById(req.params.id);

  if (battery) {
    // If updating serial number, check if it already exists
    if (req.body.serialNumber && req.body.serialNumber !== battery.serialNumber) {
      const batteryExists = await Battery.findOne({ serialNumber: req.body.serialNumber });

      if (batteryExists) {
        res.status(400);
        throw new Error('Battery with this serial number already exists');
      }
    }

    battery.serialNumber = req.body.serialNumber || battery.serialNumber;
    battery.model = req.body.model || battery.model;
    battery.manufacturer = req.body.manufacturer || battery.manufacturer;
    battery.capacity = req.body.capacity || battery.capacity;
    battery.capacityUnit = req.body.capacityUnit || battery.capacityUnit;
    battery.voltage = req.body.voltage || battery.voltage;
    battery.chemistry = req.body.chemistry || battery.chemistry;
    battery.manufactureDate = req.body.manufactureDate ? new Date(req.body.manufactureDate) : battery.manufactureDate;
    battery.status = req.body.status || battery.status;
    battery.healthStatus = req.body.healthStatus !== undefined ? req.body.healthStatus : battery.healthStatus;
    battery.cycleCount = req.body.cycleCount !== undefined ? req.body.cycleCount : battery.cycleCount;
    battery.currentCharge = req.body.currentCharge !== undefined ? req.body.currentCharge : battery.currentCharge;
    battery.location = req.body.location || battery.location;
    battery.notes = req.body.notes || battery.notes;
    battery.lastCheckedDate = new Date();

    const updatedBattery = await battery.save();
    res.json(updatedBattery);
  } else {
    res.status(404);
    throw new Error('Battery not found');
  }
});

// @desc    Delete a battery
// @route   DELETE /api/batteries/:id
// @access  Private/Admin
const deleteBattery = asyncHandler(async (req, res) => {
  const battery = await Battery.findById(req.params.id);

  if (battery) {
    // Check if battery is part of a shipment
    if (battery.shipment) {
      // Remove battery from shipment
      await Shipment.updateOne(
        { _id: battery.shipment },
        { $pull: { batteries: battery._id } }
      );
    }

    await Battery.deleteOne({ _id: req.params.id });
    res.json({ message: 'Battery removed' });
  } else {
    res.status(404);
    throw new Error('Battery not found');
  }
});

// @desc    Get batteries with critical health
// @route   GET /api/batteries/critical
// @access  Private
const getCriticalBatteries = asyncHandler(async (req, res) => {
  const criticalThreshold = 30; // Battery health below 30% is considered critical

  const batteries = await Battery.find({ healthStatus: { $lt: criticalThreshold } })
    .sort({ healthStatus: 1 });

  res.json(batteries);
});

// @desc    Update battery charge level
// @route   PUT /api/batteries/:id/charge
// @access  Private
const updateBatteryCharge = asyncHandler(async (req, res) => {
  const { currentCharge } = req.body;

  if (currentCharge === undefined || currentCharge < 0 || currentCharge > 100) {
    res.status(400);
    throw new Error('Valid charge level (0-100) is required');
  }

  const battery = await Battery.findById(req.params.id);

  if (battery) {
    battery.currentCharge = currentCharge;
    battery.lastCheckedDate = new Date();

    const updatedBattery = await battery.save();
    res.json(updatedBattery);
  } else {
    res.status(404);
    throw new Error('Battery not found');
  }
});

export {
  getBatteries,
  getBatteryById,
  createBattery,
  updateBattery,
  deleteBattery,
  getCriticalBatteries,
  updateBatteryCharge,
};