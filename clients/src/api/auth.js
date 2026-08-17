import request from "./client";

export const login = (email, password) =>
  request("/auth/login", { method: "POST", body: { email, password } });

export const forgotPassword = (email) =>
  request("/auth/forgot-password", { method: "POST", body: { email } });

export const resetPassword = (token, newPassword) =>
  request("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
  });

export const changePassword = (currentPassword, newPassword, token) =>
  request("/auth/change-password", {
    method: "POST",
    body: { currentPassword, newPassword },
    token,
  });
