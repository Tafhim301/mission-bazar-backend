export interface IRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface IVerifyEmailPayload {
  email: string;
  otp: string;
}

export interface ILoginPayload {
  email: string;
  password: string;
}

export interface IForgotPasswordPayload {
  email: string;
}

export interface IResetPasswordPayload {
  email: string;
  otp: string;
  newPassword: string;
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
