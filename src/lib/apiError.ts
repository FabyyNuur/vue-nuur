export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === "string" && error.trim()) return error;
  if (error && typeof error === "object") {
    const r = error as {
      response?: { data?: { message?: string; error?: string } };
      message?: string;
    };
    const fromBody = r.response?.data?.message || r.response?.data?.error;
    if (typeof fromBody === "string" && fromBody.trim()) return fromBody;
    if (typeof r.message === "string" && r.message.trim()) return r.message;
  }
  return fallback;
}
