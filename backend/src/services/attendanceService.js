const STANDARD_WORK_HOURS = 8.0; // Configurable standard working hours per workday

/**
 * Returns canonical YYYY-MM-DD date string in server timezone.
 */
function getCanonicalDateString(dateObj = new Date()) {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Centralized calculation of work hours and extra overtime hours.
 * Modular logic for reuse by Attendance and future Payroll module.
 */
function calculateWorkHours(checkInDate, checkOutDate, standardHours = STANDARD_WORK_HOURS) {
  if (!checkInDate || !checkOutDate) {
    return {
      workHours: 0,
      extraHours: 0,
      workHoursFormatted: '0h 00m',
      extraHoursFormatted: '0h 00m',
    };
  }

  const inMs = new Date(checkInDate).getTime();
  const outMs = new Date(checkOutDate).getTime();
  const diffMs = Math.max(0, outMs - inMs);

  const workHoursDecimal = Number((diffMs / (1000 * 60 * 60)).toFixed(2));
  const extraHoursDecimal = Math.max(0, Number((workHoursDecimal - standardHours).toFixed(2)));

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  const workHoursFormatted = `${hours}h ${String(mins).padStart(2, '0')}m`;

  const extraMs = Math.max(0, diffMs - (standardHours * 60 * 60 * 1000));
  const eHours = Math.floor(extraMs / (1000 * 60 * 60));
  const eMins = Math.floor((extraMs % (1000 * 60 * 60)) / (1000 * 60));
  const extraHoursFormatted = `${eHours}h ${String(eMins).padStart(2, '0')}m`;

  return {
    workHours: workHoursDecimal,
    extraHours: extraHoursDecimal,
    workHoursFormatted,
    extraHoursFormatted,
  };
}

module.exports = {
  STANDARD_WORK_HOURS,
  getCanonicalDateString,
  calculateWorkHours,
};
