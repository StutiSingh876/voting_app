const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

async function handleResponse(response, defaultErrorMessage) {
  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem("access_token");
      window.dispatchEvent(new Event("auth-logout"));
      throw new Error("Session expired or invalid token. Please log in again.");
    }
    throw new Error(data.detail || defaultErrorMessage);
  }

  return data;
}

export async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  return handleResponse(response, "Registration failed");
}

export async function loginUser(credentials) {
  const formData = new URLSearchParams();
  formData.append("username", credentials.email);
  formData.append("password", credentials.password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });

  return handleResponse(response, "Login failed");
}

export async function getCurrentUser() {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/users/me`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response, "Failed to fetch user");
}

export async function createPoll(pollData) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/polls`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(pollData),
  });
  return handleResponse(response, "Failed to create poll");
}

export async function getPolls() {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/polls`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response, "Failed to fetch polls");
}

export async function getPollById(pollId) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/polls/${pollId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response, "Failed to fetch poll");
}

export async function voteOnPoll(pollId, option) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/polls/${pollId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      option: option,
    }),
  });
  return handleResponse(response, "Failed to vote");
}

export async function getPollOptions(pollId) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/polls/${pollId}/options`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response, "Failed to fetch poll options");
}

export async function getPollResults(pollId) {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/polls/${pollId}/results`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return handleResponse(response, "Failed to fetch results");
}