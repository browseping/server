export interface SignupRequest {
  username: string;
  password: string;
  email: string;
  displayName?: string;
}

export interface LoginRequest {
  identifier: string;
  password: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}