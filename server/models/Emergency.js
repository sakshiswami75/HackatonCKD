const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    emergencyType: {
      type: String,
      required: [true, 'Please specify emergency type'],
      enum: [
        'Medical Emergency',
        'Accident',
        'Flood',
        'Fire',
        'Building Collapse',
        'Elderly Assistance',
        'Other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    urgency: {
      type: String,
      required: true,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
      address: String,
    },
    contactNumber: {
      type: String,
    },
    status: {
      type: String,
      enum: ['pending', 'assigned', 'in-progress', 'resolved', 'cancelled'],
      default: 'pending',
    },
    assignedVolunteers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    aiClassification: {
      category: String,
      confidence: Number,
      suggestedResources: [String],
    },
    responseTime: {
      type: Number, // in minutes
    },
    resolvedAt: {
      type: Date,
    },
    notes: [
      {
        text: String,
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location-based queries
emergencySchema.index({ location: '2dsphere' });
emergencySchema.index({ status: 1 });
emergencySchema.index({ urgency: 1 });

module.exports = mongoose.model('Emergency', emergencySchema);