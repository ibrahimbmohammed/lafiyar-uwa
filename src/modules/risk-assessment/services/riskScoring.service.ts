/** @format */

import {prisma} from "../../../core/config/prisma.config";
import logger from "../../../core/config/logger.config";
import { RiskLevel } from "@prisma/client";

export interface RiskFactors {
  userId: string;
  age?: number;
  bpSystolic?: number;
  bpDiastolic?: number;
  previousComplications: boolean;
  gestationalDiabetes: boolean;
  highParity: boolean;
  firstPregnancy: boolean;
  multiplePregnancy: boolean;
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  factors: string[];
}

export class RiskScoringService {
  /**
   * Calculate risk score based on WHO criteria
   */
  calculateRiskScore(factors: RiskFactors): RiskResult {
    let score = 0;
    const riskFactors: string[] = [];

    // Age risk (WHO criteria: <17 or ≥35)
    if (factors.age) {
      if (factors.age < 17) {
        score += 10;
        riskFactors.push("Teenage pregnancy (<17 years)");
      } else if (factors.age >= 35) {
        score += 10;
        riskFactors.push("Advanced maternal age (≥35 years)");
      }
    }

    // Hypertension (CRITICAL INDICATOR)
    if (factors.bpSystolic && factors.bpDiastolic) {
      if (factors.bpSystolic >= 160 || factors.bpDiastolic >= 110) {
        score += 25;
        riskFactors.push("Severe hypertension (BP ≥160/110)");
      } else if (factors.bpSystolic >= 140 || factors.bpDiastolic >= 90) {
        score += 15;
        riskFactors.push("Moderate hypertension (BP 140-159/90-109)");
      }
    }

    // Previous complications
    if (factors.previousComplications) {
      score += 20;
      riskFactors.push("History of pregnancy complications");
    }

    // Gestational diabetes
    if (factors.gestationalDiabetes) {
      score += 15;
      riskFactors.push("Gestational diabetes");
    }

    // High parity (≥6 pregnancies)
    if (factors.highParity) {
      score += 10;
      riskFactors.push("High parity (≥6 pregnancies)");
    }

    // First pregnancy (mild risk)
    if (factors.firstPregnancy) {
      score += 5;
      riskFactors.push("First pregnancy (primigravida)");
    }

    // Multiple pregnancy (twins, triplets)
    if (factors.multiplePregnancy) {
      score += 15;
      riskFactors.push("Multiple pregnancy (twins/triplets)");
    }

    // Determine risk level
    let level: RiskLevel;
    if (score >= 40) {
      level = "high"; // RED FLAG - Immediate attention needed
    } else if (score >= 20) {
      level = "moderate"; // YELLOW - Specialist referral within 48 hours
    } else {
      level = "low"; // GREEN - Standard antenatal care
    }

    return { score, level, factors: riskFactors };
  }

  /**
   * Create risk assessment record
   */
  async createAssessment(factors: RiskFactors): Promise<any> {
    const riskResult = this.calculateRiskScore(factors);

    const assessment = await prisma.riskAssessment.create({
      data: {
        userId: factors.userId,
        ageRisk: factors.age ? factors.age < 17 || factors.age >= 35 : false,
        bpSystolic: factors.bpSystolic,
        bpDiastolic: factors.bpDiastolic,
        previousComplications: factors.previousComplications,
        gestationalDiabetes: factors.gestationalDiabetes,
        highParity: factors.highParity,
        firstPregnancy: factors.firstPregnancy,
        multiplePregnancy: factors.multiplePregnancy,
        calculatedRiskLevel: riskResult.level,
        totalRiskScore: riskResult.score,
        assessedBy: "system",
      },
    });

    // Update user's risk profile
    await prisma.user.update({
      where: { id: factors.userId },
      data: {
        riskProfile: riskResult.level,
        riskScore: riskResult.score,
      },
    });

    logger.info("Risk assessment completed", {
      userId: factors.userId,
      level: riskResult.level,
      score: riskResult.score,
    });

    return { assessment, riskResult };
  }
}

// Export singleton
export const riskScoringService = new RiskScoringService();





// src/modules/risk-assessment/services/riskScoring.service.ts

// import prisma from '@/core/services/prisma.service';
// import { RiskCategory } from '@prisma/client';
// import logger from '@/core/utils/logger';

// interface RiskFactors {
//   userId: string;
//   gestationalAgeWeeks: number;
//   maternalAge: number;
//   parity?: number;
//   previousCesarean?: boolean;
//   previousStillbirth?: boolean;
//   previousPretermBirth?: boolean;
//   previousPostpartumHemorrhage?: boolean;
//   chronicHypertension?: boolean;
//   gestationalHypertension?: boolean;
//   preeclampsia?: boolean;
//   diabetes?: boolean;
//   gestationalDiabetes?: boolean;
//   anemia?: boolean;
//   multiplePregnancy?: boolean;
//   malpresentation?: boolean;
//   knownFetalAnomaly?: boolean;
// }

// interface RiskResult {
//   totalRiskScore: number;
//   riskCategory: RiskCategory;
//   riskFactorsIdentified: string[];
//   recommendations: string[];
// }

// class RiskScoringService {
//   /**
//    * Calculate risk score based on WHO criteria
//    */
//   calculate(factors: RiskFactors): RiskResult {
//     let score = 0;
//     const identified: string[] = [];
//     const recommendations: string[] = [];

//     // AGE-BASED RISK
//     if (factors.maternalAge < 17) {
//       score += 3;
//       identified.push('Maternal age < 17 years (adolescent pregnancy)');
//       recommendations.push('Close monitoring, nutritional support, facility-based delivery mandatory');
//     } else if (factors.maternalAge >= 35) {
//       score += 2;
//       identified.push('Advanced maternal age (≥35 years)');
//       recommendations.push('Increased monitoring, consider early antenatal care');
//     }

//     // PARITY RISK
//     if (factors.parity && factors.parity >= 5) {
//       score += 2;
//       identified.push('Grand multiparity (≥5 previous births)');
//       recommendations.push('Monitor for uterine rupture risk, postpartum hemorrhage');
//     }

//     // PREVIOUS COMPLICATIONS (HIGH RISK)
//     if (factors.previousCesarean) {
//       score += 3;
//       identified.push('Previous cesarean section');
//       recommendations.push('MANDATORY facility-based delivery, monitor for uterine rupture');
//     }

//     if (factors.previousStillbirth) {
//       score += 3;
//       identified.push('Previous stillbirth');
//       recommendations.push('Close fetal monitoring, early ultrasound, facility delivery');
//     }

//     if (factors.previousPretermBirth) {
//       score += 2;
//       identified.push('Previous preterm birth');
//       recommendations.push('Monitor cervical length, progesterone supplementation may be needed');
//     }

//     if (factors.previousPostpartumHemorrhage) {
//       score += 3;
//       identified.push('Previous postpartum hemorrhage');
//       recommendations.push('MANDATORY facility delivery, blood typing, active management of third stage');
//     }

//     // HYPERTENSIVE DISORDERS (HIGH RISK)
//     if (factors.preeclampsia) {
//       score += 4;
//       identified.push('Preeclampsia');
//       recommendations.push('EMERGENCY - Immediate facility referral, blood pressure monitoring');
//     }

//     if (factors.chronicHypertension) {
//       score += 3;
//       identified.push('Chronic hypertension');
//       recommendations.push('Regular BP monitoring, facility-based delivery, watch for superimposed preeclampsia');
//     }

//     if (factors.gestationalHypertension) {
//       score += 2;
//       identified.push('Gestational hypertension');
//       recommendations.push('Weekly BP checks, urine protein monitoring');
//     }

//     // DIABETES
//     if (factors.diabetes) {
//       score += 3;
//       identified.push('Pre-existing diabetes');
//       recommendations.push('Blood sugar monitoring, facility delivery, macrosomia screening');
//     }

//     if (factors.gestationalDiabetes) {
//       score += 2;
//       identified.push('Gestational diabetes');
//       recommendations.push('Dietary management, blood sugar monitoring');
//     }

//     // ANEMIA
//     if (factors.anemia) {
//       score += 2;
//       identified.push('Anemia');
//       recommendations.push('Iron and folic acid supplementation, dietary counseling');
//     }

//     // MULTIPLE PREGNANCY
//     if (factors.multiplePregnancy) {
//       score += 3;
//       identified.push('Multiple pregnancy (twins/triplets)');
//       recommendations.push('MANDATORY facility delivery, frequent monitoring, high-risk clinic');
//     }

//     // MALPRESENTATION
//     if (factors.malpresentation) {
//       score += 2;
//       identified.push('Fetal malpresentation');
//       recommendations.push('External cephalic version may be attempted, facility delivery');
//     }

//     // FETAL ANOMALY
//     if (factors.knownFetalAnomaly) {
//       score += 3;
//       identified.push('Known fetal anomaly');
//       recommendations.push('Specialist consultation, facility delivery with pediatric support');
//     }

//     // DETERMINE CATEGORY
//     let category: RiskCategory;
//     if (score >= 6) {
//       category = 'red'; // HIGH RISK
//       recommendations.unshift('🔴 HIGH RISK: Mandatory facility-based delivery with skilled attendant');
//     } else if (score >= 3) {
//       category = 'yellow'; // MODERATE RISK
//       recommendations.unshift('🟡 MODERATE RISK: Facility delivery strongly recommended');
//     } else {
//       category = 'green'; // LOW RISK
//       recommendations.unshift('🟢 LOW RISK: Continue routine antenatal care, facility delivery advised');
//     }

//     // Add no risk factors message if score is 0
//     if (identified.length === 0) {
//       identified.push('No major risk factors identified');
//     }

//     return {
//       totalRiskScore: score,
//       riskCategory: category,
//       riskFactorsIdentified: identified,
//       recommendations,
//     };
//   }

//   /**
//    * Calculate and save risk assessment
//    */
//   async calculateAndSave(factors: RiskFactors) {
//     try {
//       const result = this.calculate(factors);

//       const assessment = await prisma.riskAssessment.create({
//         data: {
//           userId: factors.userId,
//           gestationalAgeWeeks: factors.gestationalAgeWeeks,
//           maternalAge: factors.maternalAge,
//           parity: factors.parity || 0,
//           previousCesarean: factors.previousCesarean || false,
//           previousStillbirth: factors.previousStillbirth || false,
//           previousPretermBirth: factors.previousPretermBirth || false,
//           previousPostpartumHemorrhage: factors.previousPostpartumHemorrhage || false,
//           chronicHypertension: factors.chronicHypertension || false,
//           gestationalHypertension: factors.gestationalHypertension || false,
//           preeclampsia: factors.preeclampsia || false,
//           diabetes: factors.diabetes || false,
//           gestationalDiabetes: factors.gestationalDiabetes || false,
//           anemia: factors.anemia || false,
//           multiplePregnancy: factors.multiplePregnancy || false,
//           malpresentation: factors.malpresentation || false,
//           knownFetalAnomaly: factors.knownFetalAnomaly || false,
//           totalRiskScore: result.totalRiskScore,
//           riskCategory: result.riskCategory,
//           riskFactorsIdentified: result.riskFactorsIdentified,
//           recommendations: result.recommendations,
//         },
//       });

//       logger.info(`Risk assessment created: ${assessment.id} - ${result.riskCategory} (${result.totalRiskScore})`);

//       return assessment;
//     } catch (error) {
//       logger.error('Error calculating/saving risk assessment:', error);
//       throw error;
//     }
//   }

//   /**
//    * Get latest assessment for user
//    */
//   async getLatestAssessment(userId: string) {
//     try {
//       return await prisma.riskAssessment.findFirst({
//         where: { userId },
//         orderBy: { assessmentDate: 'desc' },
//       });
//     } catch (error) {
//       logger.error('Error fetching latest assessment:', error);
//       return null;
//     }
//   }

//   /**
//    * Get all high-risk users
//    */
//   async getHighRiskUsers() {
//     try {
//       return await prisma.user.findMany({
//         where: {
//           riskCategory: 'red',
//           isActive: true,
//         },
//         include: {
//           riskAssessments: {
//             orderBy: { assessmentDate: 'desc' },
//             take: 1,
//           },
//         },
//         orderBy: [
//           { riskScore: 'desc' },
//           { expectedDeliveryDate: 'asc' },
//         ],
//       });
//     } catch (error) {
//       logger.error('Error fetching high-risk users:', error);
//       return [];
//     }
//   }
// }

// export default new RiskScoringService();