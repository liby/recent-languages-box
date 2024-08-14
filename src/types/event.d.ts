import type { Endpoints } from "@octokit/types";

type ListUserEventsResponse = Endpoints["GET /users/{username}/events"]["response"]["data"];
export type CommonEvent = ListUserEventsResponse[number];

interface PushEventCommit {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
  distinct: boolean;
}

interface PushEventPayload {
  push_id: number;
  size: number;
  distinct_size: number;
  ref: string;
  head: string;
  before: string;
  commits: PushEventCommit[];
}

export interface PushEvent extends CommonEvent {
  type: "PushEvent";
  created_at: string;
  payload: PushEventPayload & CommonEvent["payload"];
}
