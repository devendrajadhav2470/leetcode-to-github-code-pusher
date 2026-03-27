(function () {
  'use strict';

  const GRAPHQL_URL = 'https://leetcode.com/graphql/';
  const MAX_POLL_ATTEMPTS = 10;
  const POLL_INTERVAL_MS = 1000;
  const ACCEPTED_STATUS = 10;

  let isProcessing = false;

  async function fetchSubmissionDetails(submissionId) {
    const query = `
      query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
          runtime
          runtimeDisplay
          runtimePercentile
          memory
          memoryDisplay
          memoryPercentile
          code
          timestamp
          statusCode
          lang {
            name
            verboseName
          }
          question {
            questionId
            questionFrontendId
            title
            titleSlug
            content
            difficulty
          }
          topicTags {
            tagId
            slug
            name
          }
        }
      }
    `;

    const response = await fetch(GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { submissionId: Number(submissionId) },
      }),
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data?.data?.submissionDetails || null;
  }

  function pollForAcceptedResult() {
    return new Promise((resolve) => {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;

        const resultEl = document.querySelector(
          '[data-e2e-locator="submission-result"]'
        );

        if (resultEl) {
          const text = resultEl.textContent.trim().toLowerCase();
          clearInterval(interval);
          resolve(text === 'accepted');
          return;
        }

        if (attempts >= MAX_POLL_ATTEMPTS) {
          clearInterval(interval);
          resolve(false);
        }
      }, POLL_INTERVAL_MS);
    });
  }

  async function handleSubmission(submissionId) {
    if (isProcessing) return;
    isProcessing = true;

    try {
      const accepted = await pollForAcceptedResult();
      if (!accepted) {
        return;
      }

      const details = await fetchSubmissionDetails(submissionId);
      if (!details || details.statusCode !== ACCEPTED_STATUS) {
        return;
      }

      chrome.runtime.sendMessage({
        action: 'pushToGitHub',
        data: {
          code: details.code,
          language: details.lang?.verboseName || details.lang?.name || 'Unknown',
          runtime: details.runtimeDisplay,
          runtimePercentile: details.runtimePercentile,
          memory: details.memoryDisplay,
          memoryPercentile: details.memoryPercentile,
          timestamp: details.timestamp,
          question: {
            id: details.question.questionFrontendId,
            title: details.question.title,
            titleSlug: details.question.titleSlug,
            difficulty: details.question.difficulty,
            content: details.question.content,
          },
          topicTags: (details.topicTags || []).map((t) => t.name),
        },
      });
    } catch (err) {
      console.error('[LeetCode-GH] Error processing submission:', err);
    } finally {
      isProcessing = false;
    }
  }

  window.addEventListener('leetcode-gh-submission', (event) => {
    const { submissionId } = event.detail || {};
    if (submissionId) {
      handleSubmission(submissionId);
    }
  });
})();
