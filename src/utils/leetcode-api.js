const LeetCodeAPI = {
  GRAPHQL_URL: 'https://leetcode.com/graphql/',

  async fetchSubmissionDetails(submissionId) {
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

    const response = await fetch(this.GRAPHQL_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        variables: { submissionId: Number(submissionId) },
      }),
    });

    if (!response.ok) {
      throw new Error(`LeetCode API error: ${response.status}`);
    }

    const data = await response.json();
    return data?.data?.submissionDetails || null;
  },
};
