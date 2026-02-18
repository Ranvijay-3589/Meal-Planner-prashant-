const {
  validateRegisterPayload,
  validateLoginPayload
} = require('../utils/validation');

describe('validateRegisterPayload', () => {
  test('accepts a valid payload', () => {
    const payload = {
      username: 'plannerUser',
      email: 'test@example.com',
      password: 'Password1',
      confirmPassword: 'Password1'
    };

    const result = validateRegisterPayload(payload);
    expect(result.valid).toBe(true);
    expect(result.data.username).toBe('plannerUser');
  });

  test('rejects short username', () => {
    const result = validateRegisterPayload({
      username: 'abc',
      email: 'test@example.com',
      password: 'Password1',
      confirmPassword: 'Password1'
    });

    expect(result.valid).toBe(false);
  });

  test('rejects weak password', () => {
    const result = validateRegisterPayload({
      username: 'validUser',
      email: 'test@example.com',
      password: 'password',
      confirmPassword: 'password'
    });

    expect(result.valid).toBe(false);
  });

  test('rejects password mismatch', () => {
    const result = validateRegisterPayload({
      username: 'validUser',
      email: 'test@example.com',
      password: 'Password1',
      confirmPassword: 'Password2'
    });

    expect(result.valid).toBe(false);
  });
});

describe('validateLoginPayload', () => {
  test('accepts valid login payload', () => {
    const result = validateLoginPayload({
      email: 'test@example.com',
      password: 'Password1'
    });

    expect(result.valid).toBe(true);
    expect(result.data.email).toBe('test@example.com');
  });

  test('rejects missing password', () => {
    const result = validateLoginPayload({
      email: 'test@example.com'
    });

    expect(result.valid).toBe(false);
  });

  test('rejects invalid email', () => {
    const result = validateLoginPayload({
      email: 'invalid',
      password: 'Password1'
    });

    expect(result.valid).toBe(false);
  });
});
