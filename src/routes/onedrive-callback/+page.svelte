<script>
  // This page is the redirect target for the OneDrive OAuth flow. It will post the code and state
  // back to the opener window and close itself.
  (function () {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      // Log for debugging so we can inspect the popup's console if needed
      try { console.debug('[onedrive-callback] code=', code, 'state=', state, 'origin=', window.location.origin); } catch (e) {}
      if (window.opener && code) {
        // Use '*' temporarily so origin mismatches don't prevent delivery while debugging
        try { window.opener.postMessage({ type: 'onedrive_code', code, state }, '*'); } catch (e) { try { console.error('[onedrive-callback] postMessage failed', e); } catch (e) {} }
      }
      // Expose code/state in the DOM so the user can visually confirm what the popup received
      const container = document.getElementById('debug');
      if (container) {
        container.innerText = `code=${code || ''}\nstate=${state || ''}\norigin=${window.location.origin}`;
      }
    } catch (e) {
      try { console.error('[onedrive-callback] error reading params', e); } catch (e) {}
    }
    // NOTE: Do NOT auto-close while debugging so you can inspect the popup. Close manually when ready.
  })();
</script>

<main>
  <p>Completing authentication... you can close this window.</p>
</main>
