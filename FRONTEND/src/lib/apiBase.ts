// Dev: defaults to your local Express server on a different port.
// Prod: defaults to "" (relative paths) because the production setup serves
// the frontend and API from the SAME origin - see server.js. Override with
// VITE_API_BASE_URL only if you ever deploy them separately.
export const API_BASE =
  import.meta.env.VITE_API_BASE_URL || (import.meta.env.DEV ? "http://localhost:5000" : "");
