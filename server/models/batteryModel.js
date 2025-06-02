import mongoose from 'mongoose';

const batterySchema = mongoose.Schema(
  {
    serialNumber: {
      type: String,
      required: true,
      unique: true,
    },
    model: {
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number, // in mAh or Wh
      required: true,
    },
    capacityUnit: {
      type: String,
      enum: ['mAh', 'Wh'],
      default: 'Wh',
    },
    voltage: {
      type: Number,
      required: true,
    },
    chemistry: {
      type: String,
      enum: ['Li-ion', 'LiFePO4', 'Lead-Acid', 'NiMH', 'NiCd', 'Other'],
      required: true,
    },
    manufactureDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['Available', 'In Transit', 'Installed', 'Maintenance', 'Defective'],
      default: 'Available',
    },
    healthStatus: {
      type: Number, // Percentage (0-100)
      default: 100,
      min: 0,
      max: 100,
    },
    cycleCount: {
      type: Number,
      default: 0,
    },
    lastCheckedDate: {
      type: Date,
      default: Date.now,
    },
    currentCharge: {
      type: Number, // Percentage (0-100)
      default: 100,
      min: 0,
      max: 100,
    },
    location: {
      type: String,
      default: 'Warehouse',
    },
    notes: {
      type: String,
    },
    shipment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Shipment',
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for age
batterySchema.virtual('age').get(function () {
  return Math.floor((new Date() - this.manufactureDate) / (1000 * 60 * 60 * 24 * 365));
});

const Battery = mongoose.model('Battery', batterySchema);

export default Battery;