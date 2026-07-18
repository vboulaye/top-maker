<script>
  // This page is the redirect target for the OneDrive OAuth flow. It will post the code and state
  // back to the opener window and close itself.
  (function () {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      if (window.opener && code) {
        window.opener.postMessage({ type: 'onedrive_code', code, state }, window.location.origin);
      }
    } catch (e) {}
    // close window after a short delay to allow message to be processed
    setTimeout(() => { try { window.close(); } catch (e) {} }, 500);
  })();
</script>

<main>
  <p>Completing authentication... you can close this window.</p>
</main>
