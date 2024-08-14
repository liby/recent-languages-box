import { request } from '@octokit/request';

const { GH_TOKEN } = process.env;

export const githubRequest = request.defaults({
  baseUrl: 'https://api.github.com',
  headers: {
    'content-type': 'application/json',
    'user-agent': 'octokit-request.js/9.1.3 bun/1.1.6',
    accept: 'application/vnd.github.v3+json',
    authorization: `bearer ${GH_TOKEN}`,
  },
  per_page: 100,
});
