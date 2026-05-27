import { SUPABASE_ANON_KEY, SUPABASE_URL } from "../config/supabase";

const authHeaders = (token) => ({
  apikey: SUPABASE_ANON_KEY,
  Authorization: token ? `Bearer ${token}` : `Bearer ${SUPABASE_ANON_KEY}`,
  "Content-Type": "application/json",
});

async function authRequest(path, { method = "POST", body, token } = {}) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1${path}`, {
    method,
    headers: authHeaders(token),
    body: body ? JSON.stringify(body) : undefined,
  });

  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.error_description || payload.msg || payload.message || "Authentication failed.");
  }

  return payload;
}

export function signInWithEmail(email, password) {
  return authRequest("/token?grant_type=password", {
    body: { email, password },
  });
}

export function signUpWithEmail({ email, password, fullName, role, institution }) {
  return authRequest("/signup", {
    body: {
      email,
      password,
      data: {
        full_name: fullName,
        role,
        institution,
      },
      email_redirect_to: window.location.origin,
    },
  });
}

export function sendPasswordReset(email) {
  return authRequest("/recover", {
    body: {
      email,
      redirect_to: window.location.origin,
    },
  });
}

export function resendVerification(email) {
  return authRequest("/resend", {
    body: {
      type: "signup",
      email,
      options: {
        email_redirect_to: window.location.origin,
      },
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

