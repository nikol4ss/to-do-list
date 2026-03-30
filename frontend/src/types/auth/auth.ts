export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  date_joined?: string;
  notifications_enabled: boolean;
  notify_on_task_shared: boolean;
  notify_on_task_completed: boolean;
}

export interface AuthCredentials {
  username?: string;
  email?: string;
  password: string;
}

export interface SignupData extends AuthCredentials {
  first_name?: string;
  last_name?: string;
}

export interface AuthResponse {
  user?: User;
  access: string;
  refresh?: string;
  token?: string;
}
