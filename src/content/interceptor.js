(function () {
  'use strict';

  const originalFetch = window.fetch;

  window.fetch = async function (...args) {
    const response = await originalFetch.apply(this, args);

    try {
      const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;

      if (url && url.includes('/problems/') && url.includes('/submit/')) {
        const cloned = response.clone();
        cloned.json().then((data) => {
          if (data && data.submission_id) {
            window.dispatchEvent(
              new CustomEvent('leetcode-gh-submission', {
                detail: { submissionId: data.submission_id },
              })
            );
          }
        });
      }
    } catch (_) {
      // Never interfere with normal page behavior
    }

    return response;
  };
})();
