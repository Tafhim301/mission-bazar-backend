import { Response } from "express";

interface TMeta {
  page: number;
  limit: number;
  total: number;
  totalPage: number;
}

interface TResponse<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
  meta?: TMeta;
}

export const sendResponse = <T>(res: Response, data: TResponse<T>): void => {
  res.status(data.statusCode).json({
    statusCode: data.statusCode,
    success: data.success,
    message: data.message,
    ...(data.meta ? { meta: data.meta } : {}),
    data: data.data,
  });
};
