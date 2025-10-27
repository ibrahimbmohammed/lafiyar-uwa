/** @format */

import { smsService, voiceService } from "../config/africastalking.config";
import { config } from "../config";
import logger from "../config/logger.config";
import { ServiceUnavailableError } from "../utils/AppError";

export interface SMSOptions {
  to: string | string[];
  message: string;
  from?: string;
}

export class AfricasTalkingService {
  /**
   * Send SMS
   */
  async sendSMS(options: SMSOptions): Promise<any> {
    try {
      const recipients = Array.isArray(options.to) ? options.to : [options.to];

      const result = await smsService.send({
        to: recipients,
        message: options.message,
        from: options.from || config.africastalking.phoneNumber,
      });

      logger.info("SMS sent successfully", {
        recipients: recipients.length,
        result: result.Message,
      });

      return result;
    } catch (error: any) {
      logger.error("SMS send error:", error);
      throw new ServiceUnavailableError(
        `SMS delivery failed: ${error.message}`
      );
    }
  }

  /**
   * Make outbound voice call
   */
  async makeCall(to: string, from: string): Promise<any> {
    try {
      const result = await voiceService.call({ to, from });
      logger.info("Voice call initiated", { to, result });
      return result;
    } catch (error: any) {
      logger.error("Voice call error:", error);
      throw new ServiceUnavailableError(`Voice call failed: ${error.message}`);
    }
  }

  /**
   * Send bulk SMS
   */
  async sendBulkSMS(recipients: string[], message: string): Promise<any> {
    const batchSize = 100;
    const results = [];

    for (let i = 0; i < recipients.length; i += batchSize) {
      const batch = recipients.slice(i, i + batchSize);

      try {
        const result = await this.sendSMS({ to: batch, message });
        results.push(result);

        // Rate limiting
        if (i + batchSize < recipients.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      } catch (error) {
        logger.error(`Bulk SMS batch ${i / batchSize + 1} failed:`, error);
      }
    }

    return results;
  }
}

// Export singleton
export const africasTalkingService = new AfricasTalkingService();
