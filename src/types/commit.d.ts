interface GitHubUser {
  login: string;
  id: number;
  node_id: string;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
  site_admin: boolean;
}

interface GitHubCommitAuthor {
  name: string;
  email: string;
  date: string;
}

interface GitHubCommit {
  url: string;
  author: GitHubCommitAuthor;
  committer: GitHubCommitAuthor;
  message: string;
  tree: {
    url: string;
    sha: string;
  };
  comment_count: number;
  verification: {
    verified: boolean;
    reason: string;
    signature: string | null;
    payload: string | null;
  };
}

interface GitHubCommitParent {
  url: string;
  sha: string;
}

interface GitHubCommitStats {
  additions: number;
  deletions: number;
  total: number;
}

interface GitHubCommitFile {
  filename: string;
  additions: number;
  deletions: number;
  changes: number;
  status: string;
  raw_url: string;
  blob_url: string;
  patch: string;
}

export interface GitHubCommit {
  url: string;
  sha: string;
  node_id: string;
  html_url: string;
  comments_url: string;
  commit: GitHubCommit;
  author: GitHubUser;
  committer: GitHubUser;
  parents: GitHubCommitParent[];
  stats?: GitHubCommitStats;
  files?: GitHubCommitFile[];
}
