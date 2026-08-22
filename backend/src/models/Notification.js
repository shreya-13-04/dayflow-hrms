const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: [
        'LEAVE_REQUEST',
        'LEAVE_APPROVED',
        'LEAVE_REJECTED',
        'PAYROLL_UPDATED',
        'PROFILE_UPDATED',
        'ATTENDANCE_ALERT',
        'EMPLOYEE_CREATED',
        'SYSTEM',
      ],
      default: 'SYSTEM',
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    relatedEntity: {
      type: String,
      default: '',
    },
    relatedEntityType: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Notification', NotificationSchema);
