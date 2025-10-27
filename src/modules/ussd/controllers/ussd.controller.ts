/** @format */

import { Request, Response } from "express";
import { mainMenu } from "../menus/main.menu";
import { eventLogService } from "../../users/services/eventLog.service";
import logger from "../../../core/config/logger.config";
import { asyncHandler } from "../../../core/middleware/errorHandler.middleware";

/**
 * USSD Controller
 * Handles all USSD webhook requests from Africa's Talking
 */
export const ussdController = asyncHandler(
  async (req: Request, res: Response) => {
    const { sessionId, serviceCode, phoneNumber, text, networkCode } = req.body;

    // Log incoming request
    logger.info("USSD Request received", {
      sessionId,
      phoneNumber,
      text,
      serviceCode,
      networkCode,
    });

    // Log session start
    if (!text || text === "") {
      await eventLogService.log("ussd_session_started", {
        phoneNumber,
        sessionId,
        eventData: { serviceCode, networkCode },
      });
    }

    try {
      // Initialize main menu
      const menu = mainMenu();

      // Run the menu with request data
      const response = await menu.run({
        sessionId,
        serviceCode,
        phoneNumber,
        text
      });

      // Log session end if response starts with "END"
      if (response.startsWith("END")) {
        await eventLogService.log("ussd_session_ended", {
          phoneNumber,
          sessionId,
          eventData: { finalText: text },
        });
      }

      // Send response back to Africa's Talking
      res.set("Content-Type", "text/plain");
      res.send(response);

      logger.debug("USSD Response sent", {
        sessionId,
        responseLength: response.length,
      });
    } catch (error: any) {
      logger.error("USSD Controller error:", {
        error: error.message,
        stack: error.stack,
        sessionId,
        phoneNumber,
      });

      // Send user-friendly error message
      res.set("Content-Type", "text/plain");
      res.send(
        "END Hakuri, an sami matsala. Don Allah sake gwadawa.\n" +
          "Sorry, an error occurred. Please try again."
      );
    }
  }
);
