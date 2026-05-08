export function getBackendError(err, fallback = "Something went wrong.") {
  const status = err?.response?.status || 500;
  const data = err?.response?.data || {};

  const message =
    data?.message ||
    data?.error ||
    data?.details ||
    err?.message ||
    fallback;

  return {
    status,
    message,
  };
}

