import adapter from '@sveltejs/adapter-static';

export default {
  kit: {
    adapter: adapter({
      fallback: 'fallback.html' // may differ from host to host
    })
  }
};
