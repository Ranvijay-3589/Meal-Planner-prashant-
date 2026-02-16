const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateRegisterPayload(payload) {
  const username = String(payload.username || '').trim();
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');
  const confirmPassword = String(payload.confirmPassword || '');

  if (username.length < 4) {
    return { valid: false, message: 'Username must be at least 4 characters long.' };
  }

  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }

  if (!passwordRegex.test(password)) {
    return {
      valid: false,
      message: 'Password must be at least 8 characters and include 1 uppercase letter and 1 number.'
    };
  }

  if (password !== confirmPassword) {
    return { valid: false, message: 'Password and confirm password do not match.' };
  }

  return {
    valid: true,
    data: {
      username,
      email,
      password
    }
  };
}

function validateLoginPayload(payload) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || '');

  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please provide a valid email address.' };
  }

  if (!password) {
    return { valid: false, message: 'Password is required.' };
  }

  return {
    valid: true,
    data: {
      email,
      password
    }
  };
}

module.exports = {
  validateRegisterPayload,
  validateLoginPayload,
  normalizeEmail
};
