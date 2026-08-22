const Notification = require('../models/Notification');
const User = require('../models/User');

/**
 * Creates and saves an in-app notification record.
 */
async function sendNotification({ recipientId, type, title, message, relatedEntity = '', relatedEntityType = '' }) {
  try {
    if (!recipientId) return null;
    return await Notification.create({
      recipient: recipientId,
      type,
      title,
      message,
      relatedEntity,
      relatedEntityType,
      read: false,
    });
  } catch (err) {
    console.error('Error sending notification:', err);
    return null;
  }
}

/**
 * Broadcasts notification to all Admin & HR users.
 */
async function notifyAdminsAndHR({ type, title, message, relatedEntity = '', relatedEntityType = '' }) {
  try {
    const adminUsers = await User.find({ role: { $in: ['ADMIN', 'HR'] } }).select('_id');
    const promises = adminUsers.map((u) =>
      sendNotification({
        recipientId: u._id,
        type,
        title,
        message,
        relatedEntity,
        relatedEntityType,
      })
    );
    return await Promise.all(promises);
  } catch (err) {
    console.error('Error broadcasting notification to admins:', err);
    return [];
  }
}

module.exports = {
  sendNotification,
  notifyAdminsAndHR,
};
