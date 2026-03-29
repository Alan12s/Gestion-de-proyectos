export interface JiraAuthResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
}

export interface JiraCloudResource {
  id: string;
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}

export interface JiraBoard {
  id: number;
  name: string;
  type: string;
  self: string;
  location?: {
    projectKey: string;
    projectName: string;
  };
}

export interface JiraSprint {
  id: number;
  name: string;
  state: 'active' | 'future' | 'closed';
  startDate?: string;
  endDate?: string;
  completeDate?: string;
  goal?: string;
}

export interface JiraIssue {
  id: string;
  key: string;
  fields: {
    summary: string;
    description?: any;
    issuetype: {
      name: string;
      iconUrl: string;
    };
    status: {
      name: string;
      statusCategory: {
        key: string;
      };
    };
    priority?: {
      name: string;
    };
    assignee?: {
      accountId: string;
      displayName: string;
      emailAddress: string;
      avatarUrls: any;
    };
    reporter?: {
      accountId: string;
      displayName: string;
    };
    labels: string[];
    created: string;
    updated: string;
    resolutiondate?: string;
    duedate?: string;
    customfield_10016?: number;
  };
}
