const API_BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ||
  "http://localhost:8000/api";

export const apiEndpoints = {
  auth: {
    login: "/auth/signin/",
    register: "/auth/signup/",
    refresh: "/auth/refresh/",
    me: "/auth/profile/",
  },

  users: {
    profile: "/auth/profile/",
    updateProfile: "/auth/profile/",
  },

  tasks: {
    list: "/tasks/",
    create: "/tasks/",
    detail: (id: string) => `/tasks/${id}/`,
    update: (id: string) => `/tasks/${id}/`,
    delete: (id: string) => `/tasks/${id}/`,
    toggleStatus: (id: string) => `/tasks/${id}/toggle/`,
    share: (id: string) => `/tasks/${id}/shares/`,
    unshare: (id: string) => `/tasks/${id}/shares/`,
  },

  categories: {
    list: "/categories/",
    create: "/categories/",
    detail: (id: string) => `/categories/${id}/`,
    update: (id: string) => `/categories/${id}/`,
    delete: (id: string) => `/categories/${id}/`,
  },
};

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export { API_BASE_URL };
