const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

console.log('✅ Firebase Admin initialized');

// Get messaging instance
const messaging = admin.messaging();

// Send notification to specific user(s)
const sendNotification = async (tokens, notification, data = {}) => {
  try {
    // Ensure tokens is an array
    const tokenArray = Array.isArray(tokens) ? tokens : [tokens];
    
    // Filter out invalid tokens
    const validTokens = tokenArray.filter(token => token && token.length > 0);
    
    if (validTokens.length === 0) {
      console.log('⚠️ No valid FCM tokens to send notification');
      return { success: false, message: 'No valid tokens' };
    }

    console.log('==========================================');
    console.log('📤 Sending FCM notification');
    console.log('To tokens:', validTokens.length);
    console.log('Title:', notification.title);
    console.log('Body:', notification.body);
    console.log('Data:', data);
    console.log('==========================================');

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
        imageUrl: notification.imageUrl || undefined,
      },
      data: data,
      tokens: validTokens,
    };

    const response = await messaging.sendEachForMulticast(message);

    console.log('✅ Notification sent successfully');
    console.log('Success count:', response.successCount);
    console.log('Failure count:', response.failureCount);
    console.log('==========================================\n');

    return {
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses,
    };
  } catch (error) {
    console.error('❌ Error sending FCM notification:', error);
    return { success: false, error: error.message };
  }
};

// Send to topic (for broadcast to all volunteers/admins)
const sendToTopic = async (topic, notification, data = {}) => {
  try {
    console.log('==========================================');
    console.log('📤 Sending FCM notification to topic:', topic);
    console.log('Title:', notification.title);
    console.log('Body:', notification.body);
    console.log('==========================================');

    const message = {
      notification: {
        title: notification.title,
        body: notification.body,
      },
      data: data,
      topic: topic,
    };

    const response = await messaging.send(message);

    console.log('✅ Notification sent to topic successfully');
    console.log('Message ID:', response);
    console.log('==========================================\n');

    return { success: true, messageId: response };
  } catch (error) {
    console.error('❌ Error sending topic notification:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  admin,
  messaging,
  sendNotification,
  sendToTopic,
};