import { GithubApiClient } from "./github-api-client.js";
import { createLanguageStats } from "./language-stats.js";
import { runLinguist, type FileData } from "./linguist-analyzer";
import type { GitHubCommit } from "./types/commit";
import type { GitHubEvent, PushEvent } from "./types/event";
import type { Gist } from "./types/gist";

const { GH_TOKEN, GIST_ID, USERNAME, DAYS } = process.env;

const validateEnv = (): void => {
  if (!GH_TOKEN) throw new Error("GH_TOKEN is not provided.");
  if (!GIST_ID) throw new Error("GIST_ID is not provided.");
  if (!USERNAME) throw new Error("USERNAME is not provided.");
};

const fetchCommits = async (
  api: GithubApiClient,
  username: string,
  fromDate: Date
): Promise<GitHubCommit[]> => {
  const maxEvents = 300;
  const perPage = 100;
  const pages = Math.ceil(maxEvents / perPage);
  const commits: GitHubCommit[] = [];

  for (let page = 0; page < pages; page++) {
    const events = await api.fetch<GitHubEvent[]>(
      `/users/${username}/events?per_page=${perPage}&page=${page}`
    );
    const pushEvents = events.filter(
      ({ type, actor }) => type === "PushEvent" && actor.login === username
    ) as PushEvent[];

    const recentPushEvents = pushEvents.filter(
      ({ created_at }) => new Date(created_at) > fromDate
    );
    console.log(`${recentPushEvents.length} events fetched.`);

    const newCommits = await Promise.allSettled(
      recentPushEvents.flatMap(({ repo, payload }) =>
        payload.commits
          .filter((commit) => commit.distinct === true)
          .map((commit) => api.fetch<GitHubCommit>(`/repos/${repo.name}/commits/${commit.sha}`))
      )
    );

    commits.push(
      ...newCommits
        .filter((result): result is PromiseFulfilledResult<GitHubCommit> => result.status === "fulfilled")
        .map((result) => result.value)
    );

    if (recentPushEvents.length < pushEvents.length) {
      break;
    }
  }

  return commits;
};

const processCommits = (commits: GitHubCommit[]): FileData[] => {

  const result = commits
    .filter((commit) => commit.parents.length <= 1)
    .flatMap((commit) =>
      commit.files?.map(({ filename, additions, deletions, changes, status, patch }) => ({
        path: filename,
        additions,
        deletions,
        changes,
        status,
        patch,
      }) as FileData)
    )
    .filter((fileData) => fileData !== undefined);

  return result;
};

const updateGist = async (api: GithubApiClient, gistId: string, content: string) => {
  const gist = await api.fetch<Gist>(`/gists/${gistId}`);
  const filename = Object.keys(gist.files)[0];
  await api.fetch<Gist>(`/gists/${gistId}`, "PATCH", {
    files: {
      [filename]: {
        filename: `Bryan’s Recent Coding Languages`,
        content,
      },
    },
  });
  console.log(`Update succeeded.`);
};

const main = async () => {
  try {
    validateEnv();

    const api = new GithubApiClient(GH_TOKEN!);
    const username = USERNAME!;
    const days = Math.max(1, Math.min(30, Number(DAYS || 14)));
    const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    console.log(`Username: ${username}`);
    console.log(`Fetching data for the last ${days} days`);

    const commits = await fetchCommits(api, username, fromDate);
    console.log(`${commits.length} commits fetched.`);
    console.log(`\n`);

    const files = processCommits(commits);
    const langs = await runLinguist(files);
    console.log("\nLanguage statistics:");
    langs.forEach((lang) =>
      console.log(`${lang.name}: ${lang.count} files, ${lang.additions + lang.deletions} changes`)
    );

    const content = createLanguageStats(langs);
    console.log("\nGenerated content:");
    console.log(content);
    console.log(`\n`);

    await updateGist(api, GIST_ID!, content);

  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  }
};

main();
