const SOS = require('../models/sosModel');
const User = require('../models/User');
const Admin = require('../models/Admin'); // ✅ Import Admin Model

class SOSController {
  constructor() {
    this.activeSOSMap = new Map();
    this.breadcrumbIntervals = new Map();
  }

  // ✅ TRIGGER SOS WITH SMS & EMAIL ALERTS
  triggerSOS = async (req, res) => {
    try {

      const {
        latitude,
        longitude,
        sosType = 'other',
        sosMessage = '',
        batteryLevel,
        deviceInfo,
        panicMethod = 'hold_button',
        autoCapture = true
      } = req.body;

      const userId = req.user.id;

      if (!latitude || !longitude) {
        return res.status(400).json({
          success: false,
          error: 'Latitude and longitude are required'
        });
      }

      // ✅ Check both collections
      let user = await User.findById(userId);
      if (!user) {
        user = await Admin.findById(userId);
      }

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const emergencyContacts = user.sosEmergencyContacts || [];

      if (emergencyContacts.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Emergency contacts not configured. Please add at least 1 emergency contact first.'
        });
      }

      const existingActiveSOS = await SOS.findOne({
        userId,
        status: 'active'
      });

      if (existingActiveSOS) {
        return res.status(409).json({
          success: false,
          error: 'SOS already active. Please wait for response or cancel previous SOS.'
        });
      }

      const sosRecord = new SOS({
        userId,
        liveLocation: {
          coordinates: [longitude, latitude]
        },
        emergencyContacts: emergencyContacts,
        startTime: new Date(),
        batteryLevel: batteryLevel,
        deviceInfo: deviceInfo,
        panicTriggerMethod: panicMethod,
        sosType,
        sosMessage,
        priority: 10,
        sosAutoCaptureEvidence: autoCapture,
        sosUserDetails: {
          name: user.name,
          phone: user.phone,
          email: user.email
        }
      });

      await sosRecord.save();

      // ✅ SEND EMERGENCY ALERTS (SMS + EMAIL)
      await this.sendEmergencyAlerts(sosRecord, user);

      res.status(201).json({
        success: true,
        message: 'SOS alert sent successfully',
        sosId: sosRecord._id,
        emergencyContactsNotified: emergencyContacts.length
      });

    } catch (error) {
      console.error('SOS trigger error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to trigger SOS alert'
      });
    }
  };

  // ✅ GET USER'S ACTIVE SOS
  getUserSOS = async (req, res) => {
    try {
      const userId = req.user.id;
      const activeSOS = await SOS.findOne({ userId, status: 'active' }).sort({ createdAt: -1 });

      if (!activeSOS) {
        return res.json({ success: true, activeSOS: null });
      }

      res.json({ success: true, activeSOS: activeSOS.toObject() });
    } catch (error) {
      console.error('Get user SOS error:', error);
      res.status(500).json({ success: false, error: 'Failed to get SOS status' });
    }
  };

  // ✅ CANCEL SOS
  cancelSOS = async (req, res) => {
    try {
      const { sosId } = req.params;
      const userId = req.user.id;

      const sosRecord = await SOS.findOne({ _id: sosId, userId, status: 'active' });
      if (!sosRecord) {
        return res.status(404).json({ success: false, error: 'Active SOS not found' });
      }

      sosRecord.status = 'resolved';
      sosRecord.endTime = new Date();
      sosRecord.resolvedReason = 'Cancelled by user';
      await sosRecord.save();

      res.json({ success: true, message: 'SOS cancelled successfully' });
    } catch (error) {
      console.error('Cancel SOS error:', error);
      res.status(500).json({ success: false, error: 'Failed to cancel SOS' });
    }
  };

  // ✅ GET ALL ACTIVE SOS (FOR ADMIN)
  getAllActiveSOS = async (req, res) => {
    try {
      const activeSOS = await SOS.find({ status: 'active' }).sort({ createdAt: -1 });
      res.json({ success: true, activeSOS });
    } catch (error) {
      console.error('Get all active SOS error:', error);
      res.status(500).json({ success: false, error: 'Failed to get active SOS' });
    }
  };

  // ✅ UPDATE LIVE LOCATION
  updateLiveLocation = async (req, res) => {
    try {
      const { sosId, latitude, longitude, batteryLevel } = req.body;
      const userId = req.user.id;

      const sosRecord = await SOS.findOne({ _id: sosId, userId, status: 'active' });
      if (!sosRecord) {
        return res.status(404).json({ success: false, error: 'Active SOS not found' });
      }

      // Get previous location
      const oldLat = sosRecord.liveLocation.coordinates[1];
      const oldLng = sosRecord.liveLocation.coordinates[0];

      // Update location
      sosRecord.liveLocation.coordinates = [longitude, latitude];
      if (batteryLevel !== undefined) {
        sosRecord.batteryLevel = batteryLevel;
      }

      // Initialize breadcrumbs array if it doesn't exist
      if (!sosRecord.breadcrumbs) {
        sosRecord.breadcrumbs = [];
      }

      sosRecord.breadcrumbs.push({
        coordinates: [longitude, latitude],
        timestamp: new Date()
      });

      await sosRecord.save();

      // ✅ SEND LOCATION UPDATE TO EMERGENCY CONTACTS
      // Calculate distance moved (simple approximation)
      const distanceMoved = this.calculateDistance(oldLat, oldLng, latitude, longitude);

      // Send update if moved more than 100 meters OR every 5th update
      const updateCount = sosRecord.breadcrumbs.length;
      if (distanceMoved > 0.1 || updateCount % 5 === 0) {
        await this.sendLocationUpdate(sosRecord, userId);
      }

      res.json({ success: true, message: 'Location updated' });

    } catch (error) {
      console.error('Location update error:', error);
      res.status(500).json({ success: false, error: 'Failed to update location' });
    }
  };

  // ✅ CALCULATE DISTANCE BETWEEN TWO COORDINATES (IN KM)
  calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // ✅ SEND LOCATION UPDATE TO EMERGENCY CONTACTS
  sendLocationUpdate = async (sosRecord, userId) => {
    try {
      let user = await User.findById(userId);
      if (!user) {
        user = await Admin.findById(userId);
      }

      if (!user) return;

      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

      const googleMapsLink = `https://maps.google.com/?q=${sosRecord.liveLocation.coordinates[1]},${sosRecord.liveLocation.coordinates[0]}`;
      const smsMessage = `🔄 LOCATION UPDATE\\n${user.name} is moving!\\n📍 NEW LOCATION: ${googleMapsLink}\\n🔋 Battery: ${sosRecord.batteryLevel || 'N/A'}%`;

      // Hardcoded Admin Contact
      const PERMANENT_CONTACT = {
        name: "Admin Emergency",
        phone: "+918630623982"
      };

      const allContacts = [...sosRecord.emergencyContacts, PERMANENT_CONTACT];

      if (accountSid && authToken && twilioNumber) {
        const client = require('twilio')(accountSid, authToken);

        for (const contact of allContacts) {
          try {
            if (contact.phone) {
              let formattedPhone = contact.phone.replace(/\s+/g, '');

              if (!formattedPhone.startsWith('+')) {
                if (formattedPhone.length === 10) {
                  formattedPhone = `+91${formattedPhone}`;
                } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
                  formattedPhone = `+${formattedPhone}`;
                }
              }

              if (contact.phone === PERMANENT_CONTACT.phone) {
                formattedPhone = PERMANENT_CONTACT.phone;
              }

              await client.messages.create({
                body: smsMessage,
                from: twilioNumber,
                to: formattedPhone
              });
              console.log(`📍 Location update sent to: ${formattedPhone}`);
            }
          } catch (error) {
            console.error(`Failed to send location update to ${contact.name}:`, error.message);
          }
        }
      }
    } catch (error) {
      console.error('Send location update error:', error);
    }
  };

  // ✅ GET SOS STATUS
  getSOSStatus = async (req, res) => {
    try {
      const userId = req.user.id;

      let user = await User.findById(userId).select('sosButtonActive sosEmergencyContacts');
      if (!user) {
        user = await Admin.findById(userId).select('sosButtonActive sosEmergencyContacts');
      }

      const emergencyContacts = user ? (user.sosEmergencyContacts || []) : [];
      const activeSOS = await SOS.findOne({ userId, status: 'active' });

      res.json({
        success: true,
        sosButtonActive: user ? user.sosButtonActive : false,
        hasEmergencyContacts: emergencyContacts.length >= 1,
        emergencyContactsCount: emergencyContacts.length,
        hasActiveSOS: !!activeSOS,
        sosId: activeSOS ? activeSOS._id : null
      });
    } catch (error) {
      console.error('Get SOS status error:', error);
      res.status(500).json({ success: false, error: 'Failed to get SOS status' });
    }
  };

  // ✅ UPLOAD EVIDENCE
  uploadEvidence = async (req, res) => {
    try {
      const { sosId, fileType } = req.body;
      const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

      if (!fileUrl) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      // Update SOS record with evidence URL
      await SOS.findByIdAndUpdate(sosId, {
        $push: {
          [fileType === 'photo' ? 'evidencePhotos' : 'evidenceAudio']: fileUrl
        }
      });

      res.json({ success: true, fileUrl });
    } catch (error) {
      console.error('Upload evidence error:', error);
      res.status(500).json({ success: false, error: 'Failed to upload evidence' });
    }
  };

  // ✅ FAST2SMS INTEGRATION (Alternative Provider)
  sendFast2SMS = async (numbers, message) => {
    try {
      const axios = require('axios');
      const apiKey = process.env.FAST2SMS_API_KEY;

      if (!apiKey) {
        console.log('⚠️ Fast2SMS API Key not found. Skipping.');
        return;
      }

      const response = await axios.get('https://www.fast2sms.com/dev/bulkV2', {
        params: {
          authorization: apiKey,
          message: message,
          language: 'english',
          route: 'q',
          numbers: numbers.join(',') // Comma separated numbers
        }
      });

      console.log('✅ Fast2SMS Response:', response.data);
    } catch (error) {
      console.error('❌ Fast2SMS Failed:', error.message);
    }
  };

  // ✅ ENHANCED EMERGENCY ALERTS (SMS + EMAIL)
  sendEmergencyAlerts = async (sosRecord, user) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const twilioNumber = process.env.TWILIO_PHONE_NUMBER;

      // Clean Google Maps link (remove extra spaces)
      const googleMapsLink = `https://maps.google.com/?q=${sosRecord.liveLocation.coordinates[1]},${sosRecord.liveLocation.coordinates[0]}`;
      const smsMessage = `🚨 URBANOS EMERGENCY!\n${user.name} needs help!\n📍 ${googleMapsLink}\n📞 CALL: ${user.phone}\n🔋 ${sosRecord.batteryLevel || 'N/A'}%`;

      // Try to load email service (optional)
      let emailService;
      try {
        emailService = require('../services/emailService');
      } catch (e) {
        console.log('Email service not available, SMS only mode');
      }

      // Hardcoded Admin/Emergency Contact (Permanent)
      const PERMANENT_CONTACT = {
        name: "Admin Emergency",
        phone: "+918630623982",
        email: "admin@urbanos.com"
      };

      // Combine user contacts with permanent contact
      const allContacts = [...sosRecord.emergencyContacts, PERMANENT_CONTACT];

      // Collect numbers for Fast2SMS fallback
      const fallbackNumbers = [];

      if (accountSid && authToken && twilioNumber) {
        const client = require('twilio')(accountSid, authToken);

        for (const contact of allContacts) {
          try {
            // ✅ Send SMS if phone exists (Handle +91 prefix correctly)
            if (contact.phone) {
              let formattedPhone = contact.phone.replace(/\s+/g, '');
              let rawNumber = formattedPhone; // Keep raw number for Fast2SMS

              // Ensure +91 prefix for Twilio
              if (!formattedPhone.startsWith('+')) {
                if (formattedPhone.length === 10) {
                  formattedPhone = `+91${formattedPhone}`;
                } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
                  formattedPhone = `+${formattedPhone}`;
                }
              }

              // Extract raw 10 digit for Fast2SMS
              if (formattedPhone.startsWith('+91')) {
                rawNumber = formattedPhone.substring(3);
              } else if (formattedPhone.startsWith('91') && formattedPhone.length === 12) {
                rawNumber = formattedPhone.substring(2);
              }
              fallbackNumbers.push(rawNumber);

              // Ensure we don't double add +91 for permanent contact which already has it
              if (contact.phone === PERMANENT_CONTACT.phone) {
                formattedPhone = PERMANENT_CONTACT.phone;
              }

              await client.messages.create({
                body: smsMessage,
                from: twilioNumber,
                to: formattedPhone
              });
              console.log(`📱 Twilio SMS sent to: ${formattedPhone}`);

              // ✅ Make a Voice Call to the Permanent Contact
              if (contact.phone === PERMANENT_CONTACT.phone) {
                try {
                  await client.calls.create({
                    twiml: `<Response><Say>Emergency Alert! ${user.name} has triggered an SOS. Please check your messages for location.</Say></Response>`,
                    to: formattedPhone,
                    from: twilioNumber
                  });
                  console.log(`📞 Voice Call initiated to: ${formattedPhone}`);
                } catch (callError) {
                  console.error(`Voice call failed: ${callError.message}`);
                }
              }
            }

            // ✅ Send Email if email exists and service is available
            if (contact.email && emailService) {
              await emailService.sendEmergencyEmail(contact.email, {
                userName: user.name,
                userPhone: user.phone,
                locationLink: googleMapsLink,
                batteryLevel: sosRecord.batteryLevel
              });
              console.log(`📧 Email sent to: ${contact.email}`);
            }

          } catch (contactError) {
            console.error(`Twilio/Email failed for ${contact.name}:`, contactError.message);
            // If Twilio fails, we will try Fast2SMS at the end
          }
        }
      } else {
        console.log('⚠️ Twilio not configured. Trying Fast2SMS fallback...');
        // If Twilio is not configured, prepare numbers for Fast2SMS
        for (const contact of allContacts) {
          if (contact.phone) {
            let rawNumber = contact.phone.replace(/\D/g, ''); // Remove non-digits
            if (rawNumber.length > 10) rawNumber = rawNumber.slice(-10); // Take last 10 digits
            fallbackNumbers.push(rawNumber);
          }
        }
      }

      // ✅ TRY FAST2SMS FALLBACK
      if (fallbackNumbers.length > 0) {
        // Deduplicate numbers
        const uniqueNumbers = [...new Set(fallbackNumbers)];
        await this.sendFast2SMS(uniqueNumbers, smsMessage);
      }

      console.log(`✅ Emergency alerts processing complete`);

    } catch (error) {
      console.error('Emergency alerts system error:', error);
    }
  };
}

module.exports = new SOSController();