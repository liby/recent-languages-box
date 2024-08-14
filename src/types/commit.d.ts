import type { Endpoints } from "@octokit/types";

export type GetCommitContentsResponse = Endpoints["GET /repos/{owner}/{repo}/commits/{ref}"]["response"]["data"];