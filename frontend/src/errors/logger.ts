import { ApiError } from "./api-error.ts";

type ErrorReport = {
  scope: string;
  status?: number;
  code?: string;
  message: string;
};

type ErrorReporter = (report: ErrorReport) => void;

const reporters: ErrorReporter[] = [
  (report) => {
    console.error(`[${report.scope}]`, {
      status: report.status,
      code: report.code,
      message: report.message,
    });
  },
];

export function addErrorReporter(reporter: ErrorReporter): void {
  reporters.push(reporter);
}

export function reportError(scope: string, error: unknown): void {
  const report: ErrorReport = {
    scope,
    message: error instanceof Error ? error.message : "Unknown error",
    status: error instanceof ApiError ? error.status : undefined,
    code: error instanceof ApiError ? error.code : undefined,
  };

  for (const reporter of reporters) {
    reporter(report);
  }
}
