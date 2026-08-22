const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: true,
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    date: {
      type: String, // Canonical YYYY-MM-DD server date string
      required: true,
      index: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      default: null,
    },
    workHours: {
      type: Number, // Decimal hours (e.g. 8.75)
      default: 0,
    },
    extraHours: {
      type: Number, // Overtime hours (e.g. 0.75)
      default: 0,
    },
    workHoursFormatted: {
      type: String,
      default: '0h 00m',
    },
    extraHoursFormatted: {
      type: String,
      default: '0h 00m',
    },
    status: {
      type: String,
      enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE'],
      default: 'PRESENT',
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index preventing multiple records for same employee on same date
AttendanceSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
