import request from "./client";

export const getFixtures = (status) =>
  request(status ? `/fixtures?status=${status}` : "/fixtures");

export const createFixture = (payload, token) =>
  request("/fixtures", { method: "POST", body: payload, token });

export const updateFixture = (id, payload, token) =>
  request(`/fixtures/${id}`, { method: "PUT", body: payload, token });

export const deleteFixture = (id, token) =>
  request(`/fixtures/${id}`, { method: "DELETE", token });

export const recordResult = (fixtureId, payload, token) =>
  request(`/fixtures/${fixtureId}/result`, {
    method: "POST",
    body: payload,
    token,
  });
