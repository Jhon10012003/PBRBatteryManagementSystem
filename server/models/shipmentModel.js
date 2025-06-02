import mongoose from 'mongoose';

// Temperature log schema
const temperatureLogSchema = mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isAlert: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Humidity log schema
const humidityLogSchema = mongoose.Schema(
  {
    value: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isAlert: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Shock event schema
const shockEventSchema = mongoose.Schema(
  {
    magnitude: {
      type: Number, // in g-force
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    isAlert: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

// Status update schema
const statusUpdateSchema = mongoose.Schema(
  {
    status: {
      type: String,
      enum: ['Preparing', 'In Transit', 'Delayed', 'Delivered', 'Cancelled'],
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
    },
    notes: {
      type: String,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { _id: true }
);

const shipmentSchema = mongoose.Schema(
  {
    shipmentNumber: {
      type: String,
      required: true,
      unique: true,
    },
    origin: {
      type: String,
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    departureDate: {
      type: Date,
      required: true,
    },
    estimatedArrival: {
      type: Date,
      required: true,
    },
    actualArrival: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['Preparing', 'In Transit', 'Delayed', 'Delivered', 'Cancelled'],
      default: 'Preparing',
    },
    carrier: {
      type: String,
      required: true,
    },
    trackingNumber: {
      type: String,
    },
    batteries: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Battery',
      },
    ],
    currentLocation: {
      type: String,
      default: function() {
        return this.origin;
      },
    },
    temperatureLogs: [temperatureLogSchema],
    humidityLogs: [humidityLogSchema],
    shockEvents: [shockEventSchema],
    statusUpdates: [statusUpdateSchema],
    specialInstructions: {
      type: String,
    },
    hazardClass: {
      type: String,
      default: 'Class 9',
    },
    customsInformation: {
      type: String,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for number of batteries
shipmentSchema.virtual('batteryCount').get(function () {
  return this.batteries.length;
});

// Virtual for shipment duration
shipmentSchema.virtual('duration').get(function () {
  return Math.floor((this.estimatedArrival - this.departureDate) / (1000 * 60 * 60 * 24));
});

// Method to add temperature log
shipmentSchema.methods.addTemperatureLog = function (value) {
  const isAlert = value < -10 || value > 45; // Alert if outside safe range
  this.temperatureLogs.push({ value, isAlert });
  return this.save();
};

// Method to add humidity log
shipmentSchema.methods.addHumidityLog = function (value) {
  const isAlert = value < 20 || value > 80; // Alert if outside safe range
  this.humidityLogs.push({ value, isAlert });
  return this.save();
};

// Method to add shock event
shipmentSchema.methods.addShockEvent = function (magnitude) {
  const isAlert = magnitude > 5; // Alert if shock is significant
  this.shockEvents.push({ magnitude, isAlert });
  return this.save();
};

// Method to update status
shipmentSchema.methods.updateStatus = function (status, location, notes, userId) {
  this.status = status;
  this.currentLocation = location || this.currentLocation;
  
  this.statusUpdates.push({
    status,
    location,
    notes,
    updatedBy: userId,
  });
  
  return this.save();
};

const Shipment = mongoose.model('Shipment', shipmentSchema);

export default Shipment;