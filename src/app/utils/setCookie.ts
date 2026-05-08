import { Response } from "express";

export interface IAuthCookies {
  accessToken?: string;
  refreshToken?: string;
}

const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
} as const;

export const setAuthCookie = (res: Response, tokenInfo: IAuthCookies) => {
  if (tokenInfo.accessToken) {
    res.cookie("accessToken", tokenInfo.accessToken, {
      ...authCookieOptions,
      maxAge: 15 * 60 * 1000,
    });
  }

  if (tokenInfo.refreshToken) {
    res.cookie("refreshToken", tokenInfo.refreshToken, {
      ...authCookieOptions,
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }
};

export const clearAuthCookies = (res: Response) => {
  res.clearCookie("accessToken", authCookieOptions);
  res.clearCookie("refreshToken", authCookieOptions);
};
