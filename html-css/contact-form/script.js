const form = document.getElementById('contact-form');
const status = document.getElementById('status');
const password = document.getElementById('password');
const confirm = document.getElementById('confirm');

function setError(input, message) {
  const field = input.closest('.field');
  const error = field.querySelector('.error');
  error.textContent = message;
  input.classList.toggle('invalid', Boolean(message));
}

function validate(input) {
  const value = input.value.trim();
  if (input.required && !value) {
    setError(input, 'This field is required');
    return false;
  }
  if (input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    setError(input, 'Enter a valid email address');
    return false;
  }
  if (input.id === 'password' && value && value.length < 8) {
    setError(input, 'Password must be at least 8 characters');
    return false;
  }
  if (input.id === 'confirm' && value !== password.value) {
    setError(input, 'Passwords do not match');
    return false;
  }
  setError(input, '');
  return true;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputs = [...form.querySelectorAll('input')];
  const valid = inputs.map(validate).every(Boolean);
  if (!valid) return;

  status.textContent = '✓ Account created successfully!';
  status.className = 'status success';
  form.reset();
});

form.querySelectorAll('input').forEach((input) => {
  input.addEventListener('blur', () => validate(input));
  input.addEventListener('input', () => {
    if (input.classList.contains('invalid')) validate(input);
    if (input === password && confirm.value) validate(confirm);
  });
});
