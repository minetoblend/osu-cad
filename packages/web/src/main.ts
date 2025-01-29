import { APIProvider } from '@osucad/core';
import { WebGameHost } from '@osucad/framework';
import { OsucadWebGame } from './OsucadWebGame';

if (window.location.pathname === '/login-callback') {
  APIProvider.onLoginCompleted();

  const el = document.createElement('div');

  el.innerHTML = `
<h4>Successfully logged in</h4>
<p>You can close this page now.</p>
`;

  document.body.append(el);
  window.close();
}
else {
  const host = new WebGameHost('osucad', { friendlyGameName: 'osucad' });

  const game = new OsucadWebGame();

  addEventListener('DOMContentLoaded', () => host.run(game));
}
