interface GitHubEventActor {
  id: number;
  login: string;
  display_login: string;
  gravatar_id: string;
  url: string;
  avatar_url: string;
}

interface GitHubEventRepo {
  id: number;
  name: string;
  url: string;
}

interface GitHubEventOrg {
  id: number;
  login: string;
  gravatar_id: string;
  url: string;
  avatar_url: string;
}

interface GitHubEventCommon {
  id: string;
  type: GitHubEventType;
  actor: GitHubEventActor;
  repo: GitHubEventRepo;
  org?: GitHubEventOrg;
  public: boolean;
  created_at: string;
}

const enum GitHubEventType {
  WatchEvent = "WatchEvent",
  PushEvent = "PushEvent",
  CreateEvent = "CreateEvent",
  DeleteEvent = "DeleteEvent",
  ForkEvent = "ForkEvent",
  GollumEvent = "GollumEvent",
  IssueCommentEvent = "IssueCommentEvent",
  IssuesEvent = "IssuesEvent",
  MemberEvent = "MemberEvent",
  PublicEvent = "PublicEvent",
  PullRequestEvent = "PullRequestEvent",
  PullRequestReviewEvent = "PullRequestReviewEvent",
  PullRequestReviewCommentEvent = "PullRequestReviewCommentEvent",
  PullRequestReviewThreadEvent = "PullRequestReviewThreadEvent",
  ReleaseEvent = "ReleaseEvent",
  SponsorshipEvent = "SponsorshipEvent",
  CommitCommentEvent = "CommitCommentEvent"
}

interface WatchEventPayload {
  action: "started";
}

interface PushEventPayload {
  push_id: number;
  size: number;
  distinct_size: number;
  ref: string;
  head: string;
  before: string;
  commits: {
    sha: string;
    author: {
      email: string;
      name: string;
    };
    message: string;
    distinct: boolean;
    url: string;
  }[];
}

interface CreateEventPayload {
  ref: string;
  ref_type: "branch" | "tag" | "repository";
  master_branch: string;
  description: string;
  pusher_type: "user" | "deploy_key";
}

interface DeleteEventPayload {
  ref: string;
  ref_type: "branch" | "tag";
}

interface ForkEventPayload {
  forkee: object; // 可以根据实际情况进一步定义 `forkee` 对象的结构
}

interface GollumEventPayload {
  pages: {
    page_name: string;
    title: string;
    action: "created" | "edited";
    sha: string;
    html_url: string;
  }[];
}

interface IssueCommentEventPayload {
  action: "created" | "edited" | "deleted";
  issue: object; // 可以根据实际情况进一步定义 `issue` 对象的结构
  comment: object; // 可以根据实际情况进一步定义 `comment` 对象的结构
  changes?: {
    body?: {
      from: string;
    };
  };
}

interface IssuesEventPayload {
  action: "opened" | "edited" | "closed" | "reopened" | "assigned" | "unassigned" | "labeled" | "unlabeled";
  issue: object;
  changes?: {
    title?: {
      from: string;
    };
    body?: {
      from: string;
    };
  };
  assignee?: object;
  label?: object;
}

interface MemberEventPayload {
  action: "added";
  member: object;
  changes?: {
    old_permission?: {
      from: string;
    };
  };
}

interface PublicEventPayload { }

interface PullRequestEventPayload {
  action: "opened" | "edited" | "closed" | "reopened" | "assigned" | "unassigned" | "review_requested" | "review_request_removed" | "labeled" | "unlabeled" | "synchronize";
  number: number;
  pull_request: object;
  changes?: {
    title?: {
      from: string;
    };
    body?: {
      from: string;
    };
  };
  reason?: string;
}

interface PullRequestReviewEventPayload {
  action: "created";
  pull_request: object;
  review: object;
}

interface PullRequestReviewCommentEventPayload {
  action: "created";
  pull_request: object;
  comment: object;
  changes?: {
    body?: {
      from: string;
    };
  };
}

interface PullRequestReviewThreadEventPayload {
  action: "resolved" | "unresolved";
  pull_request: object;
  thread: object;
}

interface ReleaseEventPayload {
  action: "published";
  release: object;
  changes?: {
    body?: {
      from: string;
    };
    name?: {
      from: string;
    };
  };
}

interface SponsorshipEventPayload {
  action: "created";
  effective_date?: string;
  changes?: {
    tier?: {
      from: object;
    };
    privacy_level?: {
      from: string;
    };
  };
}

interface CommitCommentEventPayload {
  action: "created";
  comment: object;
}

interface WatchEvent extends GitHubEventCommon {
  type: GitHubEventType.WatchEvent;
  payload: WatchEventPayload;
}

export interface PushEvent extends GitHubEventCommon {
  type: GitHubEventType.PushEvent;
  payload: PushEventPayload;
}

interface CreateEvent extends GitHubEventCommon {
  type: GitHubEventType.CreateEvent;
  payload: CreateEventPayload;
}

interface DeleteEvent extends GitHubEventCommon {
  type: GitHubEventType.DeleteEvent;
  payload: DeleteEventPayload;
}

interface ForkEvent extends GitHubEventCommon {
  type: GitHubEventType.ForkEvent;
  payload: ForkEventPayload;
}

interface GollumEvent extends GitHubEventCommon {
  type: GitHubEventType.GollumEvent;
  payload: GollumEventPayload;
}

interface IssueCommentEvent extends GitHubEventCommon {
  type: GitHubEventType.IssueCommentEvent;
  payload: IssueCommentEventPayload;
}

interface IssuesEvent extends GitHubEventCommon {
  type: GitHubEventType.IssuesEvent;
  payload: IssuesEventPayload;
}

interface MemberEvent extends GitHubEventCommon {
  type: GitHubEventType.MemberEvent;
  payload: MemberEventPayload;
}

interface PublicEvent extends GitHubEventCommon {
  type: GitHubEventType.PublicEvent;
  payload: PublicEventPayload;
}

interface PullRequestEvent extends GitHubEventCommon {
  type: GitHubEventType.PullRequestEvent;
  payload: PullRequestEventPayload;
}

interface PullRequestReviewEvent extends GitHubEventCommon {
  type: GitHubEventType.PullRequestReviewEvent;
  payload: PullRequestReviewEventPayload;
}

interface PullRequestReviewCommentEvent extends GitHubEventCommon {
  type: GitHubEventType.PullRequestReviewCommentEvent;
  payload: PullRequestReviewCommentEventPayload;
}

interface PullRequestReviewThreadEvent extends GitHubEventCommon {
  type: GitHubEventType.PullRequestReviewThreadEvent;
  payload: PullRequestReviewThreadEventPayload;
}

interface ReleaseEvent extends GitHubEventCommon {
  type: GitHubEventType.ReleaseEvent;
  payload: ReleaseEventPayload;
}

interface SponsorshipEvent extends GitHubEventCommon {
  type: GitHubEventType.SponsorshipEvent;
  payload: SponsorshipEventPayload;
}

interface CommitCommentEvent extends GitHubEventCommon {
  type: GitHubEventType.CommitCommentEvent;
  payload: CommitCommentEventPayload;
}

export type GitHubEvent =
  | WatchEvent
  | PushEvent
  | CreateEvent
  | DeleteEvent
  | ForkEvent
  | GollumEvent
  | IssueCommentEvent
  | IssuesEvent
  | MemberEvent
  | PublicEvent
  | PullRequestEvent
  | PullRequestReviewEvent
  | PullRequestReviewCommentEvent
  | PullRequestReviewThreadEvent
  | ReleaseEvent
  | SponsorshipEvent
  | CommitCommentEvent;
