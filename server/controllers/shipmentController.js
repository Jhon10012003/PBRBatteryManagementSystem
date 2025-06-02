import asyncHandler from 'express-async-handler';
import Shipment from '../models/shipmentModel.js';
import Battery from '../models/batteryModel.js';

// @desc    Get all shipments
// @route   GET /api/shipments
// @access  Private
const getShipments = asyncHandler(async (req, res) => {
  const pageSize = 10;
  const page = Number(req.query.pageNumber) || 1;
  
  const keyword = req.query.keyword
    ? {
        $or: [
          { shipmentNumber: { $regex: req.query.keyword, $options: 'i' } },
          { origin: { $regex: req.query.keyword, $options: 'i' } },
          { destination: { $regex: req.query.keyword, $options: 'i' } },
          { carrier: { $regex: req.query.keyword, $options: 'i' } },
        ],
      }
    : {};
    
  const statusFilter = req.query.status ? { status: req.query.status } : {};
  
  const count = await Shipment.countDocuments({
    ...keyword,
    ...statusFilter,
  });
  
  const shipments = await Shipment.find({
    ...keyword,
    ...statusFilter,
  })
    .populate('assignedTo', 'name')
    .limit(pageSize)
    .skip(pageSize * (page - 1))
    .sort({ createdAt: -1 });
    
  res.json({
    shipments,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Get shipment by ID
// @route   GET /api/shipments/:id
// @access  Private
const getShipmentById = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id)
    .populate('batteries', 'serialNumber model manufacturer status healthStatus currentCharge')
    .populate('assignedTo', 'name email')
    .populate('statusUpdates.updatedBy', 'name');
  
  if (shipment) {
    res.json(shipment);
  } else {
    res.status(404);
    throw new Error('Shipment not found');
  }
});

// @desc    Create a shipment
// @route   POST /api/shipments
// @access  Private/Manager
const createShipment = asyncHandler(async (req, res) => {
  const {
    shipmentNumber,
    origin,
    destination,
    departureDate,
    estimatedArrival,
    carrier,
    trackingNumber,
    batteries,
    specialInstructions,
    hazardClass,
    customsInformation,
    assignedTo,
  } = req.body;
  
  // Check if shipment with this number already exists
  const shipmentExists = await Shipment.findOne({ shipmentNumber });
  
  if (shipmentExists) {
    res.status(400);
    throw new Error('Shipment with this number already exists');
  }
  
  // Create shipment
  const shipment = await Shipment.create({
    shipmentNumber,
    origin,
    destination,
    departureDate: new Date(departureDate),
    estimatedArrival: new Date(estimatedArrival),
    status: 'Preparing',
    carrier,
    trackingNumber,
    batteries: batteries || [],
    currentLocation: origin,
    specialInstructions,
    hazardClass,
    customsInformation,
    assignedTo,
    statusUpdates: [
      {
        status: 'Preparing',
        location: origin,
        notes: 'Shipment created',
        updatedBy: req.user._id,
      },
    ],
  });
  
  if (shipment) {
    // Update batteries to be in this shipment
    if (batteries && batteries.length > 0) {
      await Battery.updateMany(
        { _id: { $in: batteries } },
        { 
          shipment: shipment._id,
          status: 'In Transit',
          location: origin
        }
      );
    }
    
    res.status(201).json(shipment);
  } else {
    res.status(400);
    throw new Error('Invalid shipment data');
  }
});

// @desc    Update a shipment
// @route   PUT /api/shipments/:id
// @access  Private/Manager
const updateShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  
  if (shipment) {
    // If updating shipment number, check if it already exists
    if (req.body.shipmentNumber && req.body.shipmentNumber !== shipment.shipmentNumber) {
      const shipmentExists = await Shipment.findOne({ shipmentNumber: req.body.shipmentNumber });
      
      if (shipmentExists) {
        res.status(400);
        throw new Error('Shipment with this number already exists');
      }
    }
    
    // Update basic shipment info
    shipment.shipmentNumber = req.body.shipmentNumber || shipment.shipmentNumber;
    shipment.origin = req.body.origin || shipment.origin;
    shipment.destination = req.body.destination || shipment.destination;
    shipment.departureDate = req.body.departureDate ? new Date(req.body.departureDate) : shipment.departureDate;
    shipment.estimatedArrival = req.body.estimatedArrival ? new Date(req.body.estimatedArrival) : shipment.estimatedArrival;
    shipment.carrier = req.body.carrier || shipment.carrier;
    shipment.trackingNumber = req.body.trackingNumber || shipment.trackingNumber;
    shipment.specialInstructions = req.body.specialInstructions || shipment.specialInstructions;
    shipment.hazardClass = req.body.hazardClass || shipment.hazardClass;
    shipment.customsInformation = req.body.customsInformation || shipment.customsInformation;
    shipment.assignedTo = req.body.assignedTo || shipment.assignedTo;
    
    // If status is updated, add status update
    if (req.body.status && req.body.status !== shipment.status) {
      const newStatus = req.body.status;
      const location = req.body.currentLocation || shipment.currentLocation;
      const notes = req.body.statusNotes || `Status changed to ${newStatus}`;
      
      shipment.status = newStatus;
      shipment.currentLocation = location;
      
      if (newStatus === 'Delivered') {
        shipment.actualArrival = new Date();
      }
      
      shipment.statusUpdates.push({
        status: newStatus,
        location,
        notes,
        updatedBy: req.user._id,
      });
      
      // Update status of batteries in this shipment
      let batteryStatus = 'In Transit';
      if (newStatus === 'Delivered') {
        batteryStatus = 'Available';
      } else if (newStatus === 'Cancelled') {
        batteryStatus = 'Available';
      }
      
      await Battery.updateMany(
        { shipment: shipment._id },
        { 
          status: batteryStatus,
          location: location
        }
      );
    }
    
    // Update batteries in shipment if provided
    if (req.body.batteries) {
      // Remove shipment reference from batteries no longer in shipment
      await Battery.updateMany(
        { 
          shipment: shipment._id,
          _id: { $nin: req.body.batteries }
        },
        { 
          shipment: null,
          status: 'Available',
          location: shipment.currentLocation
        }
      );
      
      // Add shipment reference to new batteries
      await Battery.updateMany(
        { 
          _id: { $in: req.body.batteries },
          shipment: { $ne: shipment._id }
        },
        { 
          shipment: shipment._id,
          status: 'In Transit',
          location: shipment.currentLocation
        }
      );
      
      shipment.batteries = req.body.batteries;
    }
    
    const updatedShipment = await shipment.save();
    res.json(updatedShipment);
  } else {
    res.status(404);
    throw new Error('Shipment not found');
  }
});

// @desc    Delete a shipment
// @route   DELETE /api/shipments/:id
// @access  Private/Admin
const deleteShipment = asyncHandler(async (req, res) => {
  const shipment = await Shipment.findById(req.params.id);
  
  if (shipment) {
    // Update batteries to remove shipment reference
    await Battery.updateMany(
      { shipment: shipment._id },
      { 
        shipment: null,
        status: 'Available',
        location: shipment.currentLocation
      }
    );
    
    await Shipment.deleteOne({ _id: req.params.id });
    res.json({ message: 'Shipment removed' });
  } else {
    res.status(404);
    throw new Error('Shipment not found');
  }
});

// @desc    Add environmental log (temp, humidity, shock)
// @route   POST /api/shipments/:id/logs
// @access  Private
const addEnvironmentalLog = asyncHandler(async (req, res) => {
  const { type, value, timestamp } = req.body;
  
  if (!type || value === undefined) {
    res.status(400);
    throw new Error('Log type and value are required');
  }
  
  if (!['temperature', 'humidity', 'shock'].includes(type)) {
    res.status(400);
    throw new Error('Log type must be temperature, humidity, or shock');
  }
  
  const shipment = await Shipment.findById(req.params.id);
  
  if (shipment) {
    let isAlert = false;
    
    switch (type) {
      case 'temperature':
        isAlert = value < -10 || value > 45;
        shipment.temperatureLogs.push({
          value,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          isAlert,
        });
        break;
      case 'humidity':
        isAlert = value < 20 || value > 80;
        shipment.humidityLogs.push({
          value,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          isAlert,
        });
        break;
      case 'shock':
        isAlert = value > 5;
        shipment.shockEvents.push({
          magnitude: value,
          timestamp: timestamp ? new Date(timestamp) : new Date(),
          isAlert,
        });
        break;
    }
    
    const updatedShipment = await shipment.save();
    res.status(201).json({
      message: `${type} log added`,
      log: updatedShipment[`${type === 'shock' ? 'shockEvents' : type + 'Logs'}`].slice(-1)[0],
      isAlert,
    });
  } else {
    res.status(404);
    throw new Error('Shipment not found');
  }
});

// @desc    Get shipments with active alerts
// @route   GET /api/shipments/alerts
// @access  Private
const getShipmentsWithAlerts = asyncHandler(async (req, res) => {
  const shipments = await Shipment.find({
    status: { $in: ['Preparing', 'In Transit', 'Delayed'] },
    $or: [
      { 'temperatureLogs.isAlert': true },
      { 'humidityLogs.isAlert': true },
      { 'shockEvents.isAlert': true },
    ],
  })
    .select('shipmentNumber status currentLocation carrier')
    .sort({ updatedAt: -1 });
    
  res.json(shipments);
});

export {
  getShipments,
  getShipmentById,
  createShipment,
  updateShipment,
  deleteShipment,
  addEnvironmentalLog,
  getShipmentsWithAlerts,
};