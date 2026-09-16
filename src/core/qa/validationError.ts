export type ValidationIssue = {
  source: string;
  path: string;
  message: string;
};

export class ValidationError extends Error {
  readonly issues: ValidationIssue[];

  constructor(issues: ValidationIssue[]) {
    super(issues.map((issue) => `${issue.source}:${issue.path} ${issue.message}`).join('\n'));
    this.name = 'ValidationError';
    this.issues = issues;
  }
}
