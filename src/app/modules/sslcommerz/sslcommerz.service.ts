import axios from "axios";
import { StatusCodes } from "http-status-codes";
import { envVars } from "../../config/env";
import AppError from "../../errorHandlers/appError";
import { ISSLCommerzPayload, ISSLCommerzResponse } from "./sslcommerz.interface";
import { Payment } from "../payment/payment.model";

// === Initiate payment ========================================================

const initPayment = async (
  payload: ISSLCommerzPayload
): Promise<ISSLCommerzResponse> => {
  try {
    const data = {
      store_id: envVars.SSL_STORE_ID,
      store_passwd: envVars.SSL_STORE_PASS,
      total_amount: payload.amount,
      currency: "BDT",
      tran_id: payload.transactionId,
      success_url: `${envVars.SSL_SUCCESS_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=success`,
      fail_url: `${envVars.SSL_FAIL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=fail`,
      cancel_url: `${envVars.SSL_CANCEL_BACKEND_URL}?transactionId=${payload.transactionId}&amount=${payload.amount}&status=cancel`,
      ipn_url: envVars.SSL_IPN_URL,

      // Product info
      product_name: "Mission Bazar Order",
      product_category: "E-commerce",
      product_profile: "general",

      // Customer info
      cus_name: payload.name,
      cus_email: payload.email,
      cus_add1: payload.address,
      cus_add2: "N/A",
      cus_city: "Dhaka",
      cus_state: "Dhaka",
      cus_postcode: "1000",
      cus_country: "Bangladesh",
      cus_phone: payload.phoneNumber,
      cus_fax: "N/A",

      // Shipping info (not applicable for digital receipt, set to N/A)
      ship_name: payload.name,
      ship_add1: payload.address,
      ship_add2: "N/A",
      ship_city: "Dhaka",
      ship_state: "Dhaka",
      ship_postcode: "1000",
      ship_country: "Bangladesh",
    };

    const response = await axios.post<ISSLCommerzResponse>(
      envVars.SSL_PAYMENT_API,
      data,
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    if (response.data.status !== "SUCCESS") {
      throw new AppError(
        StatusCodes.BAD_GATEWAY,
        `SSLCommerz error: ${response.data.failedreason ?? "Unknown error"}`
      );
    }

    return response.data;
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    const msg = error instanceof Error ? error.message : String(error);
    throw new AppError(StatusCodes.BAD_GATEWAY, `SSLCommerz init failed: ${msg}`);
  }
};

// === IPN validation ==========================================================
// Called by SSLCommerz IPN webhook — validates payment and stores raw gateway data

const validatePayment = async (body: Record<string, string>): Promise<void> => {
  try {
    if (!body.val_id || !body.tran_id) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Missing val_id or tran_id in IPN payload");
    }

    const response = await axios.get(
      `${envVars.SSL_VALIDATION_API}?val_id=${body.val_id}&store_id=${envVars.SSL_STORE_ID}&store_passwd=${envVars.SSL_STORE_PASS}&format=json`
    );

    await Payment.findOneAndUpdate(
      { transactionId: body.tran_id },
      { paymentGatewayData: response.data },
      { runValidators: true }
    );
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    const msg = error instanceof Error ? error.message : String(error);
    throw new AppError(StatusCodes.BAD_GATEWAY, `SSLCommerz validation failed: ${msg}`);
  }
};

export const SSLService = { initPayment, validatePayment };
