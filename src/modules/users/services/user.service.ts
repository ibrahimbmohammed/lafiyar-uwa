/** @format */

import {prisma} from "../../../core/config/prisma.config";
import { formatPhoneNumber } from "../../../core/utils/phoneFormatter";
import { calculatePregnancyWeek } from "../../../core/utils/dateHelpers";
import logger from "../../../core/config/logger.config";
import { RiskLevel, UserStatus } from "@prisma/client";

export interface CreateUserData {
  phoneNumber: string;
  name?: string;
  lga?: string;
  village?: string;
  expectedDeliveryDate?: Date;
  age?: number;
  riskProfile?: RiskLevel;
  riskScore?: number;
  languagePreference?: string;
  currentWeek?: number;
}

export class UserService {
  /**
   * Create new user
   */
  async createUser(data: CreateUserData) {
    const formattedPhone = formatPhoneNumber(data.phoneNumber);

    const user = await prisma.user.create({
      data: {
        phoneNumber: formattedPhone,
        name: data.name,
        lga: data.lga,
        village: data.village,
        expectedDeliveryDate: data.expectedDeliveryDate,
        age: data.age,
        riskProfile: data.riskProfile || "low",
        riskScore: data.riskScore || 0,
        languagePreference: data.languagePreference || "hausa",
        currentWeek: data.expectedDeliveryDate
          ? calculatePregnancyWeek(data.expectedDeliveryDate)
          : 1,
      },
    });

    logger.info("User created", { userId: user.id, phone: formattedPhone });
    return user;
  }

  /**
   * Find user by phone number
   */
  async findByPhone(phoneNumber: string) {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    return await prisma.user.findUnique({
      where: { phoneNumber: formattedPhone },
      include: {
        riskAssessments: {
          orderBy: { assessmentDate: "desc" },
          take: 1,
        },
      },
    });
  }

  /**
   * Find user by ID
   */
  async findById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        riskAssessments: {
          orderBy: { assessmentDate: "desc" },
          take: 1,
        },
      },
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Partial<CreateUserData>) {
    return await prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        lga: data.lga,
        village: data.village,
        expectedDeliveryDate: data.expectedDeliveryDate,
        age: data.age,
        riskProfile: data.riskProfile,
        riskScore: data.riskScore,
      },
    });
  }

  /**
   * Check if user exists
   */
  async userExists(phoneNumber: string): Promise<boolean> {
    const formattedPhone = formatPhoneNumber(phoneNumber);
    const count = await prisma.user.count({
      where: { phoneNumber: formattedPhone },
    });
    return count > 0;
  }

  /**
   * Update pregnancy week for all active users
   */
  async updateAllPregnancyWeeks() {
    const activeUsers = await prisma.user.findMany({
      where: {
        status: "active",
        expectedDeliveryDate: { not: null },
      },
    });

    for (const user of activeUsers) {
      if (!user.expectedDeliveryDate) continue;

      const currentWeek = calculatePregnancyWeek(user.expectedDeliveryDate);

      await prisma.user.update({
        where: { id: user.id },
        data: { currentWeek },
      });
    }

    logger.info(`Updated pregnancy weeks for ${activeUsers.length} users`);
  }
}

// Export singleton
export const userService = new UserService();
