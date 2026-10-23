// A small feature for remembering what someone liked on the products page.
// The form is still a demo, so nothing gets sent to the bakery.

const bakeryItems = [
  { id: 'signature', name: 'Signature Loaf' },
  { id: 'pastries', name: 'Pastry box' },
  { id: 'cake', name: 'Birthday cake' }
];

const fieldsToCheck = [
  { id: 'customer-name', error: 'customer-name-error' },
  { id: 'customer-email', error: 'customer-email-error' },
  { id: 'kind', error: 'kind-error' },
  { id: 'order-details', error: 'order-details-error' },
  { id: 'date', error: 'date-error' }
];

const savedKeys = {
  item: 'northStarBakeryItem',
  request: 'northStarRequestType'
};

function findItem(id) {
  return bakeryItems.find(item => item.id === id);
}

function updatePick() {
  const picked = localStorage.getItem(savedKeys.item);
  const item = findItem(picked);
  const message = document.getElementById('saved-pick');
  if (!message) return;

  message.textContent = item
    ? 'Saved for later: ' + item.name + '. You can mention it in the contact form.'
    : 'Nothing saved yet. Pick something below if you want to remember it.';

  document.querySelectorAll('[data-save-item]').forEach(button => {
    const selected = button.dataset.saveItem === picked;
    button.textContent = selected ? 'Saved!' : 'Save this item';
    button.setAttribute('aria-pressed', String(selected));
  });
}

function startProductPicker() {
  if (!document.getElementById('saved-pick')) return;

  document.querySelectorAll('[data-save-item]').forEach(button => {
    button.addEventListener('click', () => {
      localStorage.setItem(savedKeys.item, button.dataset.saveItem);
      localStorage.setItem(savedKeys.request, 'preorder');
      updatePick();
    });
  });

  document.getElementById('clear-pick').addEventListener('click', () => {
    localStorage.removeItem(savedKeys.item);
    updatePick();
  });
  updatePick();
}

function errorFor(fieldId) {
  const row = fieldsToCheck.find(row => row.id === fieldId);
  return document.getElementById(row.error);
}

function showError(fieldId, message) {
  const field = document.getElementById(fieldId);
  const note = errorFor(fieldId);
  if (!field || !note) return;
  note.textContent = message;
  field.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function checkField(fieldId) {
  const value = document.getElementById(fieldId).value.trim();
  let message = '';
  const kind = document.getElementById('kind').value;

  if (fieldId === 'customer-name' && value.length < 2) {
    message = 'Please enter your name (at least 2 letters).';
  }
  if (fieldId === 'customer-email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    message = 'Please enter an email like name@example.com.';
  }
  if (fieldId === 'kind' && !value) {
    message = 'Choose pre-order or general question.';
  }
  if (fieldId === 'order-details' && value.length < 10) {
    message = 'Please add at least 10 characters about what you need.';
  }
  if (fieldId === 'date' && kind === 'preorder') {
    if (!value) {
      message = 'Choose a pickup date for your pre-order.';
    } else {
      const now = new Date();
      const today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, '0'), String(now.getDate()).padStart(2, '0')].join('-');
      if (value < today) message = 'The pickup date cannot be in the past.';
    }
  }
  showError(fieldId, message);
  return message === '';
}

function useSavedPick() {
  const favorite = findItem(localStorage.getItem(savedKeys.item));
  const type = document.getElementById('kind');
  const details = document.getElementById('order-details');
  const savedMessage = document.getElementById('saved-on-form');

  if (favorite) {
    type.value = 'preorder';
    if (!details.value) details.value = 'I am interested in the ' + favorite.name + '. ';
    savedMessage.textContent = 'Remembered from Products: ' + favorite.name + '.';
  } else {
    type.value = localStorage.getItem(savedKeys.request) || '';
    savedMessage.textContent = '';
  }
}

function startContactForm() {
  const form = document.getElementById('request-form');
  if (!form) return;
  useSavedPick();

  const type = document.getElementById('kind');
  type.addEventListener('change', () => {
    localStorage.setItem(savedKeys.request, type.value);
    // Pickup dates are only needed for actual pre-order requests.
    document.getElementById('date').required = type.value === 'preorder';
    showError('date', '');
  });
  document.getElementById('date').required = type.value === 'preorder';

  fieldsToCheck.forEach(row => {
    const field = document.getElementById(row.id);
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') checkField(row.id);
    });
    field.addEventListener('change', () => {
      if (field.getAttribute('aria-invalid') === 'true') checkField(row.id);
    });
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    let good = true;
    fieldsToCheck.forEach(row => {
      if (!checkField(row.id)) good = false;
    });

    const result = document.getElementById('form-result');
    if (!good) {
      result.textContent = 'Please fix the fields marked below. Your other answers will stay here.';
      const firstBad = form.querySelector('[aria-invalid="true"]');
      if (firstBad) firstBad.focus();
      return;
    }
    result.textContent = 'Everything looks filled out. This is a class demo, so no message was actually sent.';
  });
}

startProductPicker();
startContactForm();
