const $ = id => document.getElementById(id);
let gameUrl;
try {
  const response = await fetch('./config.json', {cache: 'no-store'});
  if (!response.ok) throw new Error('Settings unavailable. Reload to try again.');
  const config = await response.json();
  if (!config.gamePath) throw new Error('The game has not been uploaded yet.');
  gameUrl = new URL(config.gamePath, location.href);
  if (gameUrl.origin !== location.origin) throw new Error('The game must be hosted on this site.');
  $('play-label').textContent = 'Play';
  $('play').disabled = false;
  $('availability').textContent = 'Desktop keyboard required.';
} catch (error) {
  $('play-label').textContent = 'Unavailable';
  $('availability').textContent = error.message;
}
$('play').addEventListener('click', () => {
  $('play').disabled = true;
  const frame = document.createElement('iframe');
  frame.id = 'game-frame';
  frame.title = 'DFW Adventure game';
  frame.allow = 'autoplay; fullscreen';
  frame.allowFullscreen = true;
  frame.src = gameUrl.href;
  frame.addEventListener('load', () => frame.focus(), {once:true});
  $('game-screen').classList.add('running');
  $('game-screen').append(frame);
  $('start-panel').hidden = true;
  $('fullscreen').hidden = false;
  $('launch-status').textContent = 'Loading the game. Click inside the game if the keyboard is not responding.';
});
$('fullscreen').addEventListener('click', () => {
  const expanded = document.querySelector('.game-shell').classList.toggle('expanded');
  document.body.classList.toggle('game-expanded', expanded);
  $('fullscreen').textContent = expanded ? 'Back to page' : 'Expand game';
  $('game-frame').focus();
});
window.addEventListener('message', event => {
  if (event.origin !== location.origin || event.source !== $('game-frame')?.contentWindow) return;
  if (event.data?.type === 'dfw-game-started') $('launch-status').textContent = 'Game running. Click inside the game to use the keyboard.';
  if (event.data?.type === 'dfw-game-error') $('launch-status').textContent = 'The game could not start. Check the message in the play screen, then reload to try again.';
});
