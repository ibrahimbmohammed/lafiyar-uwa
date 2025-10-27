/** @format */

import {prisma} from "../../../core/config/prisma.config";

export type EventType =
  | "user_registered"
  | "registration_started"
  | "registration_completed"
  | "risk_assessment_completed"
  | "emergency_alert_triggered"
  | "danger_sign_checked"
  | "ussd_session_started"
  | "ussd_session_ended";

export class EventLogService {
  async log(
    eventType: EventType,
    data: {
      userId?: string;
      phoneNumber?: string;
      sessionId?: string;
      eventData?: any;
    }
  ) {
    return await prisma.eventLog.create({
      data: {
        eventType,
        userId: data.userId,
        phoneNumber: data.phoneNumber,
        sessionId: data.sessionId,
        eventData: data.eventData || {},
      },
    });
  }

  async findByUserId(userId: string, limit: number = 50) {
    return await prisma.eventLog.findMany({
      where: { userId },
      orderBy: { timestamp: "desc" },
      take: limit,
    });
  }

  async countByEventType(
    eventType: EventType,
    startDate?: Date,
    endDate?: Date
  ) {
    return await prisma.eventLog.count({
      where: {
        eventType,
        ...(startDate && { timestamp: { gte: startDate } }),
        ...(endDate && { timestamp: { lte: endDate } }),
      },
    });
  }
}

// Export singleton
export const eventLogService = new EventLogService();
