const form = document.getElementById('search-form');
const username = document.getElementById('username');
const result = document.getElementById('result');

async function fetchUser(name) {
  result.innerHTML = '<p class="loading">Loading...</p>';
  try {
    const response = await fetch(`https://api.github.com/users/${name}`);
    if (!response.ok) {
      if (response.status === 404) throw new Error('User not found');
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    renderUser(data);
  } catch (error) {
    result.innerHTML = `<p class="error">${escapeHtml(error.message)}</p>`;
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
