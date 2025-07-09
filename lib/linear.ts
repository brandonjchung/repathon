interface LinearIssue {
  id: string;
  title: string;
  description?: string;
  state: {
    name: string;
    color: string;
  };
  priority: number;
  team: {
    name: string;
  };
  assignee?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
  url: string;
}

interface LinearTeam {
  id: string;
  name: string;
  key: string;
}

interface LinearUser {
  id: string;
  name: string;
  email: string;
}

class LinearAPI {
  private apiKey: string;
  private baseUrl = 'https://api.linear.app/graphql';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async makeRequest(query: string, variables?: any): Promise<any> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`Linear API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.errors) {
      throw new Error(`Linear GraphQL error: ${data.errors[0].message}`);
    }

    return data.data;
  }

  async getTeams(): Promise<LinearTeam[]> {
    const query = `
      query {
        teams {
          nodes {
            id
            name
            key
          }
        }
      }
    `;

    const data = await this.makeRequest(query);
    return data.teams.nodes;
  }

  async getIssues(teamId?: string, limit: number = 50): Promise<LinearIssue[]> {
    const query = `
      query($teamId: ID, $first: Int) {
        issues(filter: { team: { id: { eq: $teamId } } }, first: $first) {
          nodes {
            id
            title
            description
            state {
              name
              color
            }
            priority
            team {
              name
            }
            assignee {
              name
              email
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const variables = {
      teamId,
      first: limit,
    };

    const data = await this.makeRequest(query, variables);
    return data.issues.nodes;
  }

  async createIssue(title: string, description?: string, teamId?: string): Promise<LinearIssue> {
    const query = `
      mutation IssueCreate($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          success
          issue {
            id
            title
            description
            state {
              name
              color
            }
            priority
            team {
              name
            }
            assignee {
              name
              email
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const input: any = { title };
    if (description) input.description = description;
    if (teamId) input.teamId = teamId;

    const variables = { input };

    const data = await this.makeRequest(query, variables);
    
    if (!data.issueCreate.success) {
      throw new Error('Failed to create issue');
    }

    return data.issueCreate.issue;
  }

  async updateIssue(issueId: string, title?: string, description?: string): Promise<LinearIssue> {
    const query = `
      mutation($issueId: ID!, $title: String, $description: String) {
        issueUpdate(id: $issueId, input: { title: $title, description: $description }) {
          success
          issue {
            id
            title
            description
            state {
              name
              color
            }
            priority
            team {
              name
            }
            assignee {
              name
              email
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const variables = {
      issueId,
      title,
      description,
    };

    const data = await this.makeRequest(query, variables);
    
    if (!data.issueUpdate.success) {
      throw new Error('Failed to update issue');
    }

    return data.issueUpdate.issue;
  }

  async getCurrentUser(): Promise<LinearUser> {
    const query = `
      query {
        viewer {
          id
          name
          email
        }
      }
    `;

    const data = await this.makeRequest(query);
    return data.viewer;
  }

  async deleteIssue(issueId: string): Promise<boolean> {
    const query = `
      mutation IssueDelete($id: ID!) {
        issueDelete(id: $id) {
          success
        }
      }
    `;

    const variables = { id: issueId };
    const data = await this.makeRequest(query, variables);
    return data.issueDelete.success;
  }

  async getAllIssues(): Promise<LinearIssue[]> {
    const query = `
      query {
        issues(first: 250) {
          nodes {
            id
            title
            description
            state {
              name
              color
            }
            priority
            team {
              name
            }
            assignee {
              name
              email
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const data = await this.makeRequest(query);
    return data.issues.nodes;
  }

  async updateIssueState(issueId: string, stateId: string): Promise<LinearIssue> {
    const query = `
      mutation IssueUpdate($id: ID!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          success
          issue {
            id
            title
            description
            state {
              name
              color
            }
            priority
            team {
              name
            }
            assignee {
              name
              email
            }
            createdAt
            updatedAt
            url
          }
        }
      }
    `;

    const variables = {
      id: issueId,
      input: {
        stateId: stateId
      }
    };

    const data = await this.makeRequest(query, variables);
    
    if (!data.issueUpdate.success) {
      throw new Error('Failed to update issue state');
    }

    return data.issueUpdate.issue;
  }

  async getWorkflowStates(teamId: string): Promise<any[]> {
    const query = `
      query($teamId: ID!) {
        team(id: $teamId) {
          states {
            nodes {
              id
              name
              color
              type
            }
          }
        }
      }
    `;

    const variables = { teamId };
    const data = await this.makeRequest(query, variables);
    return data.team.states.nodes;
  }

  async createProject(name: string, description: string, teamIds: string[]): Promise<any> {
    const query = `
      mutation ProjectCreate($input: ProjectCreateInput!) {
        projectCreate(input: $input) {
          success
          project {
            id
            name
            description
            url
            state
            progress
          }
        }
      }
    `;

    const variables = {
      input: {
        name,
        description,
        teamIds
      }
    };

    const data = await this.makeRequest(query, variables);
    
    if (!data.projectCreate.success) {
      throw new Error('Failed to create project');
    }

    return data.projectCreate.project;
  }

  async addIssueToProject(issueId: string, projectId: string): Promise<any> {
    const query = `
      mutation ProjectLinkCreate($input: ProjectLinkCreateInput!) {
        projectLinkCreate(input: $input) {
          success
          projectLink {
            id
          }
        }
      }
    `;

    const variables = {
      input: {
        issueId,
        projectId
      }
    };

    const data = await this.makeRequest(query, variables);
    
    if (!data.projectLinkCreate.success) {
      throw new Error('Failed to add issue to project');
    }

    return data.projectLinkCreate.projectLink;
  }
}

export const linearAPI = new LinearAPI(process.env.LINEAR_API_TOKEN!);
export type { LinearIssue, LinearTeam, LinearUser };