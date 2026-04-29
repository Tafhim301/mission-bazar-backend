export interface IRegisterPayload {
  name: string;
  phone: string;
  email?: string;
  password: string;
}

export interface ILoginPayload {
  phone: string;
  password: string;
}

export interface IChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface IAuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface IJwtPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}
