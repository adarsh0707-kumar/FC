import request from "./client";

export const getPlayers = () => request("/players");
export const getPlayer = (id) => request(`/players/${id}`);

export const createPlayer = (formData, token) =>
  request("/players", { method: "POST", body: formData, token, isForm: true });

export const updatePlayer = (id, formData, token) =>
  request(`/players/${id}`, {
    method: "PUT",
    body: formData,
    token,
    isForm: true,
  });

export const deletePlayer = (id, token) =>
  request(`/players/${id}`, { method: "DELETE", token });
