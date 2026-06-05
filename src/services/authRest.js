import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config/supabase";

const authHeaders = (token) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

function authRedirectUrl() {
  return window.location.origin;
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function withRedirect(path, redirectTo) {
  if (!redirectTo) return path;
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}redirect_to=${encodeURIComponent(redirectTo)}`;
}

async function authRequest(path, { method = "POST", body, token, redirectTo } = {}) {
  const requestPath = withRedirect(path, redirectTo);
  const response = await fetch(`${SUPABASE_URL}/auth/v1${requestPath}`, {
    method,
    headers: authHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { message: text };
  }

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || payload.message || "Authentication failed.");
  }

  return payload;
}

export function signInWithEmail(email, password) {
  return authRequest("/token?grant_type=password", {
    body: { email: normalizeEmail(email), password },
  });
}

export function signUpWithEmail({ email, password, fullName, role, institution }) {
  return authRequest("/signup", {
    redirectTo: authRedirectUrl(),
    body: {
      email: normalizeEmail(email),
      password,
      data: {
        full_name: fullName,
        role,
        institution,
      },
    },
  });
}

export function sendPasswordReset(email) {
  return authRequest("/recover", {
    redirectTo: authRedirectUrl(),
    body: {
      email: normalizeEmail(email),
    },
  });
}

export function resendVerification(email) {
  return authRequest("/resend", {
    redirectTo: authRedirectUrl(),
    body: {
      type: "signup",
      email: normalizeEmail(email),
    },
  });
}

export function getCurrentUser(accessToken) {
  return authRequest("/user", {
    method: "GET",
    token: accessToken,
  });
}

export function updateCurrentUser(accessToken, metadata) {
  return authRequest("/user", {
    method: "PUT",
    token: accessToken,
    body: { data: metadata },
  });
}

export function logout(accessToken) {
  return authRequest("/logout", {
    method: "POST",
    token: accessToken,
  });
}
