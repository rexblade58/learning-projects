const form = document.getElementById('contact-form');
const status = document.getElementById('status');

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
  setError(input, '');
  return true;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const inputs = [...form.querySelectorAll('input, textarea')];
  const valid = inputs.map(validate).every(Boolean);
  if (!valid) return;

  status.textContent = '✓ Message sent successfully!';
  status.className = 'status success';
  form.reset();
});

form.querySelectorAll('input, textarea').forEach((input) => {
  input.addEventListener('blur', () => validate(input));
  input.addEventListener('input', () => {
    if (input.classList.contains('invalid')) validate(input);
  });
});
