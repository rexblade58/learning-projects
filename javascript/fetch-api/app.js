const form = document.getElementById('search-form');
const username = document.getElementById('username');
const result = document.getElementById('result');

async function fetchUser(name) {
  result.innerHTML = `
    <div class="loading-card">
      <span class="spinner" aria-hidden="true"></span>
      <p class="loading">Loading user profile...</p>
    </div>
  `;
  try {
    const response = await fetch(`https://api.github.com/users/${name}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error(`User "${name}" was not found`);
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    renderUser(data);
  } catch (error) {
    renderError(error.message);
  }
}

function renderUser(user) {
  result.innerHTML = `
    <div class="user-card">
      <img src="${user.avatar_url}" alt="${user.login}" class="avatar">
      <h2>${escapeHtml(user.name || user.login)}</h2>
      <p class="login">@${user.login}</p>
      <p class="bio">${escapeHtml(user.bio || 'No bio available')}</p>
      <div class="stats">
        <span>📦 ${user.public_repos} repos</span>
        <span>👥 ${user.followers} followers</span>
        <span>👣 ${user.following} following</span>
      </div>
    </div>
  `;
}

function renderError(message) {
  result.innerHTML = `
    <div class="error-card" role="alert">
      <span class="error-icon" aria-hidden="true">⚠️</span>
      <p class="error-title">Something went wrong</p>
      <p class="error-message">${escapeHtml(message)}</p>
      <p class="error-hint">Double-check the username and try again.</p>
    </div>
  `;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = username.value.trim();
  if (name) fetchUser(name);
});

fetchUser(username.value);
