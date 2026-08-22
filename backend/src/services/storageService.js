const path = require('path');
const fs = require('fs');

/**
 * Storage service abstraction for profile pictures.
 * Converts input image string (base64 data URL, HTTP URL, or filename)
 * into a safe, web-accessible avatar URL without exposing local OS paths.
 */
function processAvatarStorage(inputAvatar) {
  if (!inputAvatar || typeof inputAvatar !== 'string') {
    return '';
  }

  const trimmed = inputAvatar.trim();

  // If already a valid web URL or Data URI, return sanitized
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return trimmed;
  }

  // If relative path or filename, sanitize
  const safeFilename = path.basename(trimmed);
  return `/uploads/avatars/${safeFilename}`;
}

module.exports = {
  processAvatarStorage,
};
