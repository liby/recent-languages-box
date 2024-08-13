type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface GraphQLResponse<T = any> {
  data?: T;
  errors?: Array<{ message: string }>;
}

interface ErrorResponse {
  message: string;
}

export class GithubApiClient {
  private readonly baseUrl = 'https://api.github.com';
  private readonly headers: Record<string, string>;

  constructor(private readonly token: string) {
    this.headers = {
      'Authorization': `bearer ${this.token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json',
    };
  }

  async fetch<T = any>(path: string, method: HttpMethod = 'GET', body?: any): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const json = await response.json() as T | ErrorResponse;

    if (!response.ok) {
      throw new Error((json as ErrorResponse).message || 'API request failed');
    }

    return json as T;
  }

  async fetchGraphQL<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
    const response = await fetch(`${this.baseUrl}/graphql`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ query, variables }),
    });

    const json = await response.json() as GraphQLResponse<T>;

    if (!response.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || 'GraphQL request failed');
    }

    if (json.data === undefined) {
      throw new Error('GraphQL response data is undefined');
    }

    return json.data;
  }
}