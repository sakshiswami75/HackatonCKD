const Emergency = require('../models/Emergency');
const User = require('../models/User');
const Notification = require('../models/Notification'); // ← ADD THIS
const { sendNotification } = require('../config/firebase');

// Helper function for AI classification
const getSuggestedResources = (emergencyType) => {
  const resourceMap = {
    'Medical Emergency': ['Ambulance', 'Paramedics', 'Nearby Hospital'],
    'Accident': ['Police', 'Ambulance', 'Fire Department'],
    'Flood': ['Rescue Team', 'Boats', 'Shelter'],
    'Fire': ['Fire Department', 'Ambulance', 'Police'],
    'Building Collapse': ['Heavy Equipment', 'Rescue Team', 'Medical Team'],
    'Elderly Assistance': ['Medical Support', 'Social Workers'],
    'Other': ['General Support'],
  };
  return resourceMap[emergencyType] || ['General Support'];
};

// @desc    Create emergency request
// @route   POST /api/emergencies
// @access  Private
const createEmergency = async (req, res) => {
  try {
    const {
      emergencyType,
      description,
      urgency,
      location,
      contactNumber,
    } = req.body;

    console.log('==========================================');
    console.log('🚨 Creating Emergency Request');
    console.log('User:', req.user._id);
    console.log('Emergency Type:', emergencyType);
    console.log('Location received:', location);
    console.log('==========================================');

    if (!emergencyType || !description || !location) {
      return res.status(400).json({ 
        message: 'Please provide emergency type, description, and location' 
      });
    }

    let coordinates;
    if (typeof location === 'string') {
      const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()));
      coordinates = [lng, lat]; // MongoDB uses [longitude, latitude]
      console.log('📍 Parsed coordinates:', coordinates);
    } else if (location.coordinates) {
      coordinates = location.coordinates;
    }

    const aiClassification = {
      category: emergencyType,
      confidence: 0.85,
      suggestedResources: getSuggestedResources(emergencyType),
    };

    const emergency = await Emergency.create({
      user: req.user._id,
      emergencyType,
      description,
      urgency: urgency || 'medium',
      location: {
        type: 'Point',
        coordinates,
        address: location.address || location,
      },
      contactNumber: contactNumber || req.user.contactNumber,
      aiClassification,
    });

    const populatedEmergency = await Emergency.findById(emergency._id).populate(
      'user',
      'name email contactNumber'
    );

    console.log('✅ Emergency created successfully:', emergency._id);

    // Send notifications to volunteers and admins
    try {
      console.log('📤 Sending notifications to volunteers and admins...');
      
      const notificationRecipients = await User.find({
        userType: { $in: ['volunteer', 'admin'] },
        fcmToken: { $exists: true, $ne: null },
      }).select('_id fcmToken name userType'); // ← ADD _id to selection

      console.log(`📋 Found ${notificationRecipients.length} recipients with FCM tokens`);

      const fcmTokens = notificationRecipients.map(user => user.fcmToken);

      if (fcmTokens.length > 0) {
        const notificationData = {
          title: `🚨 New ${urgency.toUpperCase()} Emergency!`,
          body: `${emergencyType} - ${description.substring(0, 100)}${description.length > 100 ? '...' : ''}`,
        };

        // Send FCM notification
        const notificationResult = await sendNotification(
          fcmTokens,
          notificationData,
          {
            emergencyId: emergency._id.toString(),
            type: 'new_emergency',
            urgency: urgency,
            emergencyType: emergencyType,
            url: '/map',
          }
        );

        console.log(`✅ FCM notifications sent to ${fcmTokens.length} volunteers/admins`);
        console.log('Notification result:', notificationResult);

        // ← NEW: Save notification to database for each recipient
        try {
          const notificationDocs = notificationRecipients.map(recipient => ({
            user: recipient._id,
            type: 'new_emergency',
            title: notificationData.title,
            message: notificationData.body,
            emergencyId: emergency._id,
            data: {
              urgency,
              emergencyType,
              location: emergency.location.address || `${coordinates[1]}, ${coordinates[0]}`,
            },
          }));

          await Notification.insertMany(notificationDocs);
          console.log(`💾 Saved ${notificationDocs.length} notifications to database`);
        } catch (dbError) {
          console.error('⚠️ Error saving notifications to database:', dbError);
          // Continue even if database save fails
        }
      } else {
        console.log('⚠️ No volunteers/admins with FCM tokens found');
      }
    } catch (notificationError) {
      console.error('⚠️ Error sending notifications:', notificationError);
      // Don't fail the request if notification fails
    }

    console.log('==========================================\n');

    res.status(201).json(populatedEmergency);
  } catch (error) {
    console.error('❌ Error creating emergency:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all emergencies
// @route   GET /api/emergencies
// @access  Private
const getEmergencies = async (req, res) => {
  try {
    const { status, urgency, limit = 50 } = req.query;

    console.log('==========================================');
    console.log('📥 GET /api/emergencies called');
    console.log('Query params:', req.query);
    console.log('User:', req.user._id);
    console.log('==========================================');

    let query = {};

    if (status) {
      const statuses = status.split(',').map(s => s.trim());
      console.log('📊 Filtering by statuses:', statuses);
      query.status = { $in: statuses };
    } else {
      query.status = { $in: ['pending', 'assigned', 'in-progress'] };
    }

    if (urgency) {
      query.urgency = urgency;
    }

    console.log('🔍 MongoDB Query:', JSON.stringify(query));

    const emergencies = await Emergency.find(query)
      .populate('user', 'name email contactNumber')
      .populate('assignedVolunteers', 'name email contactNumber')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    console.log('✅ Found emergencies:', emergencies.length);
    
    emergencies.forEach((e, i) => {
      console.log(`Emergency ${i + 1}:`, {
        id: e._id,
        type: e.emergencyType,
        status: e.status,
        urgency: e.urgency,
        hasLocation: !!e.location,
        coordinates: e.location?.coordinates
      });
    });
    
    console.log('==========================================\n');

    res.json(emergencies);
  } catch (error) {
    console.error('❌ Error in getEmergencies:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single emergency
// @route   GET /api/emergencies/:id
// @access  Private
const getEmergencyById = async (req, res) => {
  try {
    const emergency = await Emergency.findById(req.params.id)
      .populate('user', 'name email contactNumber')
      .populate('assignedVolunteers', 'name email contactNumber location');

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    res.json(emergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get nearby emergencies (for volunteers)
// @route   GET /api/emergencies/nearby
// @access  Private (Volunteer/Admin)
const getNearbyEmergencies = async (req, res) => {
  try {
    const { longitude, latitude, maxDistance = 5000 } = req.query;

    if (!longitude || !latitude) {
      return res.status(400).json({ 
        message: 'Please provide longitude and latitude' 
      });
    }

    const emergencies = await Emergency.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
      status: { $in: ['pending', 'assigned'] },
    })
      .populate('user', 'name email contactNumber')
      .limit(20);

    res.json(emergencies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Respond to emergency (volunteer assigns themselves)
// @route   PUT /api/emergencies/:id/respond
// @access  Private (Volunteer/Admin)
const respondToEmergency = async (req, res) => {
  try {
    console.log('==========================================');
    console.log('🚑 Volunteer responding to emergency');
    console.log('Emergency ID:', req.params.id);
    console.log('Volunteer ID:', req.user._id);
    console.log('==========================================');

    const emergency = await Emergency.findById(req.params.id).populate('user', 'name email fcmToken');

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    if (emergency.assignedVolunteers.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already assigned to this emergency' });
    }

    emergency.assignedVolunteers.push(req.user._id);
    
    if (emergency.status === 'pending') {
      emergency.status = 'assigned';
    }

    await emergency.save();

    const updatedEmergency = await Emergency.findById(emergency._id)
      .populate('user', 'name email contactNumber')
      .populate('assignedVolunteers', 'name email contactNumber');

    console.log('✅ Volunteer assigned successfully');

    // Notify the user that volunteer is coming
    try {
      if (emergency.user && emergency.user.fcmToken) {
        console.log('📤 Sending notification to emergency requester...');
        
        const notificationData = {
          title: '✅ Help is on the way!',
          body: `${req.user.name} is responding to your ${emergency.emergencyType} request.`,
        };

        await sendNotification(
          emergency.user.fcmToken,
          notificationData,
          {
            emergencyId: emergency._id.toString(),
            type: 'volunteer_assigned',
            volunteerName: req.user.name,
            url: '/dashboard',
          }
        );
        
        console.log('✅ FCM notification sent to emergency requester');

        // ← NEW: Save notification to database
        await Notification.create({
          user: emergency.user._id,
          type: 'volunteer_assigned',
          title: notificationData.title,
          message: notificationData.body,
          emergencyId: emergency._id,
          data: {
            volunteerName: req.user.name,
            emergencyType: emergency.emergencyType,
          },
        });
        console.log('💾 Notification saved to database');
      } else {
        console.log('⚠️ User has no FCM token, notification not sent');
      }
    } catch (notificationError) {
      console.error('⚠️ Error sending notification:', notificationError);
    }

    console.log('==========================================\n');

    res.json(updatedEmergency);
  } catch (error) {
    console.error('❌ Error in respondToEmergency:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update emergency status
// @route   PUT /api/emergencies/:id/status
// @access  Private (Volunteer/Admin)
const updateEmergencyStatus = async (req, res) => {
  try {
    const { status } = req.body;

    console.log('==========================================');
    console.log('🔄 Updating emergency status');
    console.log('Emergency ID:', req.params.id);
    console.log('New Status:', status);
    console.log('==========================================');

    const emergency = await Emergency.findById(req.params.id).populate('user', 'name email fcmToken');

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    const oldStatus = emergency.status;
    emergency.status = status;

    if (status === 'resolved') {
      emergency.resolvedAt = Date.now();
      emergency.responseTime = Math.floor(
        (emergency.resolvedAt - emergency.createdAt) / 60000
      );

      // Notify user that emergency is resolved
      try {
        if (emergency.user && emergency.user.fcmToken) {
          console.log('📤 Sending resolution notification to user...');
          
          const notificationData = {
            title: '✅ Emergency Resolved',
            body: `Your ${emergency.emergencyType} emergency has been successfully resolved. Thank you for using our service.`,
          };

          await sendNotification(
            emergency.user.fcmToken,
            notificationData,
            {
              emergencyId: emergency._id.toString(),
              type: 'emergency_resolved',
              responseTime: emergency.responseTime,
              url: '/dashboard',
            }
          );
          
          console.log('✅ FCM resolution notification sent to user');

          // ← NEW: Save notification to database
          await Notification.create({
            user: emergency.user._id,
            type: 'emergency_resolved',
            title: notificationData.title,
            message: notificationData.body,
            emergencyId: emergency._id,
            data: {
              responseTime: emergency.responseTime,
              emergencyType: emergency.emergencyType,
            },
          });
          console.log('💾 Resolution notification saved to database');
        }
      } catch (notificationError) {
        console.error('⚠️ Error sending resolution notification:', notificationError);
      }
    } else if (status === 'in-progress' && oldStatus === 'assigned') {
      // Notify user that help is arriving
      try {
        if (emergency.user && emergency.user.fcmToken) {
          console.log('📤 Sending in-progress notification to user...');
          
          const notificationData = {
            title: '🚑 Help is Arriving!',
            body: `Volunteer is now on the way to your location.`,
          };

          await sendNotification(
            emergency.user.fcmToken,
            notificationData,
            {
              emergencyId: emergency._id.toString(),
              type: 'emergency_in_progress',
              url: '/map',
            }
          );
          
          console.log('✅ FCM in-progress notification sent to user');

          // ← NEW: Save notification to database
          await Notification.create({
            user: emergency.user._id,
            type: 'status_update',
            title: notificationData.title,
            message: notificationData.body,
            emergencyId: emergency._id,
            data: {
              newStatus: status,
              emergencyType: emergency.emergencyType,
            },
          });
          console.log('💾 In-progress notification saved to database');
        }
      } catch (notificationError) {
        console.error('⚠️ Error sending in-progress notification:', notificationError);
      }
    }

    await emergency.save();

    const updatedEmergency = await Emergency.findById(emergency._id)
      .populate('user', 'name email contactNumber')
      .populate('assignedVolunteers', 'name email contactNumber');

    console.log('✅ Emergency status updated:', oldStatus, '→', status);
    console.log('==========================================\n');

    res.json(updatedEmergency);
  } catch (error) {
    console.error('❌ Error in updateEmergencyStatus:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add note to emergency
// @route   POST /api/emergencies/:id/notes
// @access  Private
const addNote = async (req, res) => {
  try {
    const { text } = req.body;

    const emergency = await Emergency.findById(req.params.id);

    if (!emergency) {
      return res.status(404).json({ message: 'Emergency not found' });
    }

    emergency.notes.push({
      text,
      addedBy: req.user._id,
    });

    await emergency.save();

    const updatedEmergency = await Emergency.findById(emergency._id).populate(
      'notes.addedBy',
      'name email'
    );

    res.json(updatedEmergency);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createEmergency,
  getEmergencies,
  getEmergencyById,
  getNearbyEmergencies,
  respondToEmergency,
  updateEmergencyStatus,
  addNote,
};