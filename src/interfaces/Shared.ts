export type Status =
  | "TODO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "DONE"
  | "ARCHIVED"
  | "DELETED";

export interface ServiceResponse {
  result: "OK" | "ERROR";
  message?: unknown;
  errorMessage?: string;
}

export interface AutocompleteField {
  key: string | undefined;
  label: string;
}
