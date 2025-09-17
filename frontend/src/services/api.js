import axios from "axios";

const API_BASE_URL = "https://localhost/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    if (error.response?.data?.violations) {
      const violations = error.response.data.violations;
      const messages = violations.map((v) => v.message).join(", ");
      throw new Error(messages);
    }
    throw error;
  },
);

export const taskService = {
  async getTasks() {
    const response = await api.get("/tasks");

    return response.data || [];
  },

  async createTask(taskData) {
    const response = await api.post("/tasks", taskData);
    return response.data;
  },

  async updateTask(id, taskData) {
    const response = await api.patch(`/tasks/${id}`, taskData, {
      headers: {
        "Content-Type": "application/merge-patch+json",
      },
    });
    return response.data;
  },

  async deleteTask(id) {
    await api.delete(`/tasks/${id}`);
  },
};

export default api;
