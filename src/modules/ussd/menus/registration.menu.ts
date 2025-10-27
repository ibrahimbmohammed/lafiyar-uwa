/** @format */

import UssdMenu from "ussd-builder";
import { userService } from "../../users/services/user.service";
import { riskScoringService } from "../../risk-assessment/services/riskScoring.service";
import { eventLogService } from "../../users/services/eventLog.service";
//import { sessionManager } from "../services/sessionManager.service";
import { KANO_LGAS } from "../types/ussd.types";
import logger from "../../../core/config/logger.config";

/**
 * Adds registration states to an existing USSD menu
 * Now with Redis session persistence for better data reliability
 */
export const registrationStates = (menu: UssdMenu) => {
  // Collect name
  menu.state("registration.name", {
    run: async function () {
      const exists = await userService.userExists(((this as any).args.phoneNumber));

      if (exists) {
        menu.end(
          "Ka riga ka yi rajista. Kira *347*1# don samun taimako.\n" +
            "You're already registered. Call *347*1# for help."
        );
        return;
      }

      await eventLogService.log("registration_started", {
        phoneNumber: (this as any).args.phoneNumber,
        sessionId: (this as any).args.sessionId,
      });

      const name = (this as any).val;

      // Persist to Redis
    //   await sessionManager.updateSession((this as any).args.sessionId, {
    //     name,
    //     currentState: "registration.name",
    //   });

      menu.con(
        `Sannu ${name}!\n\n` +
          "Zaɓi Local Government Area:\n" +
          KANO_LGAS.map((lga) => `${lga.id}. ${lga.name}`).join("\n")
      );
    },
    next: {
      "1": "registration.lga",
      "2": "registration.lga",
      "3": "registration.lga",
      "4": "registration.lga",
      "5": "registration.lga",
      "6": "registration.lga",
      "7": "registration.lga",
      "8": "registration.lga",
      "9": "registration.lga",
    },
  });

  // Collect LGA
  menu.state("registration.lga", {
    run: async function () {
      const lgaIndex = parseInt((this as any).val) - 1;
      const lga = KANO_LGAS[lgaIndex]?.name || "Unknown";

      // Persist to Redis
    //   await sessionManager.updateSession((this as any).args.sessionId, {
    //     lga,
    //     currentState: "registration.lga",
    //   });

      menu.con(
        "Shigar da shekarun ku:\n" +
          "Enter your age (in years):\n\n" +
          "Misali: 25"
      );
    },
    next: {
      "*\\d+": "registration.age",
    },
  });

  // Collect age
  menu.state("registration.age", {
    run: async function () {
      const age = parseInt((this as any).val);

      if (isNaN(age) || age < 10 || age > 60) {
        menu.con(
          "Shigar da ingantaccen shekaru (10-60):\n" +
            "Please enter a valid age (10-60):"
        );
        return;
      }

      // Persist to Redis
    //   await sessionManager.updateSession((this as any).args.sessionId, {
    //     age,
    //     currentState: "registration.age",
    //   });

      menu.con(
        "Ranar da ake tsammanin haihuwa:\n" +
          "Expected delivery date:\n\n" +
          "Format: DD-MM-YYYY\n" +
          "Misali: 15-12-2025"
      );
    },
    next: {
      "*\\d+": "registration.age",
      "*[0-9]{2}-[0-9]{2}-[0-9]{4}": "registration.edd",
    },
  });

  // Collect Expected Delivery Date
  menu.state("registration.edd", {
    run: async function () {
      const eddStr = (this as any).val;
      const [day, month, year] = eddStr.split("-").map(Number);

      const edd = new Date(year, month - 1, day);
      const today = new Date();

      if (isNaN(edd.getTime()) || edd < today) {
        menu.con(
          "Ranar ba daidai ba. Sake shigarwa:\n" +
            "Invalid date. Please re-enter:\n\n" +
            "Format: DD-MM-YYYY"
        );
        return;
      }

      // Persist to Redis
    //   await sessionManager.updateSession((this as any).args.sessionId, {
    //     edd,
    //     currentState: "registration.edd",
    //   });

      menu.con(
        "Shin kun taɓa samun matsala a cikin ciki a baya?\n" +
          "Have you had complications in previous pregnancies?\n\n" +
          "1. Eh (Yes)\n" +
          "2. A'a (No)\n" +
          "3. Ciki na farko (First pregnancy)"
      );
    },
    next: {
      "1": "registration.complications",
      "2": "registration.complications",
      "3": "registration.complications",
    },
  });

  // Collect Previous Complications
  menu.state("registration.complications", {
    run: async function () {
      const choice = (this as any).val;

      const previousComplications = choice === "1";
      const firstPregnancy = choice === "3";

      // Persist to Redis
    //   await sessionManager.updateSession((this as any).args.sessionId, {
    //     previousComplications,
    //     firstPregnancy,
    //     currentState: "registration.complications",
    //   });

      menu.con(
        "Shin kuna da ciwon sukari (diabetes)?\n" +
          "Do you have diabetes?\n\n" +
          "1. Eh (Yes)\n" +
          "2. A'a (No)"
      );
    },
    next: {
      "1": "registration.diabetes",
      "2": "registration.diabetes",
    },
  });

  // Collect Diabetes Info
  menu.state("registration.diabetes", {
    run: async function () {
      const gestationalDiabetes = (this as any).val === "1";

      // Persist to Redis
    //   await sessionManager.updateSession((this as any).args.sessionId, {
    //     gestationalDiabetes,
    //     currentState: "registration.diabetes",
    //   });

      menu.con(
        "Shin wannan ciki ɗin tagwaye ko uku ne?\n" +
          "Is (this as any) a twin or triplet pregnancy?\n\n" +
          "1. Eh (Yes)\n" +
          "2. A'a (No)\n" +
          "3. Ban sani ba (I don't know)"
      );
    },
    next: {
      "1": "registration.complete",
      "2": "registration.complete",
      "3": "registration.complete",
    },
  });

  // Complete Registration & Calculate Risk
//   menu.state("registration.complete", {
//     run: async function () {
//       try {
//         const multiplePregnancy = (this as any).val === "1";

//         // Retrieve all data from Redis session
//         // const session = await sessionManager.getSession((this as any).args.sessionId);

//         if (!session) {
//           menu.end("Session expired. Please start again by dialing *347*1#");
//           return;
//         }

//         // Use session data for registration
//         const user = await userService.createUser({
//           phoneNumber: (this as any).args.phoneNumber,
//           name: session.name!,
//           lga: session.lga!,
//           age: session.age!,
//           expectedDeliveryDate: session.edd!,
//           languagePreference: "hausa",
//         });

//         // Calculate risk assessment
//         const { riskResult } = await riskScoringService.createAssessment({
//           userId: user.id,
//           age: session.age!,
//           previousComplications: session.previousComplications || false,
//           gestationalDiabetes: session.gestationalDiabetes || false,
//           highParity: false,
//           firstPregnancy: session.firstPregnancy || false,
//           multiplePregnancy: multiplePregnancy,
//         });

//         // Log completion
//         await eventLogService.log("registration_completed", {
//           userId: user.id,
//           phoneNumber: (this as any).args.phoneNumber,
//           sessionId: (this as any).args.sessionId,
//           eventData: {
//             riskLevel: riskResult.level,
//             riskScore: riskResult.score,
//           },
//         });

//         // Generate response based on risk level
//         let riskMessage = "";
//         if (riskResult.level === "high") {
//           riskMessage =
//             "⚠️ MUHIMMI: Matsalar ku yana da haɗari.\n" +
//             "IMPORTANT: Your pregnancy is HIGH RISK.\n\n" +
//             "Za mu tuntuɓi likitan ku nan da nan.\n" +
//             "A health worker will contact you immediately.\n\n";
//         } else if (riskResult.level === "moderate") {
//           riskMessage =
//             "⚠️ Matsalar ku yana buƙatar kulawa ta musamman.\n" +
//             "Your pregnancy requires MODERATE care.\n\n" +
//             "Ka je asibiti cikin kwanaki 2.\n" +
//             "Please visit a health facility within 2 days.\n\n";
//         } else {
//           riskMessage =
//             "✅ Matsalar ku yana da kyau.\n" +
//             "Your pregnancy is LOW RISK.\n\n";
//         }

//         menu.end(
//           `${riskMessage}` +
//             `Rajista ta yi nasara!\n` +
//             `Registration successful!\n\n` +
//             `Sunan ku: ${session.name}\n` +
//             `Matsayin haɗari: ${riskResult.level.toUpperCase()}\n` +
//             `Risk Level: ${riskResult.level.toUpperCase()}\n\n` +
//             `Za ku karɓi kira kowane mako don ba da shawarwari kan lafiya.\n` +
//             `You'll receive weekly health tips via phone call.\n\n` +
//             `Don gaggawa, kira: *347*911#\n` +
//             `For emergencies, dial: *347*911#`
//         );

//         // Alert for high risk
//         if (riskResult.level === "high") {
//           logger.warn("HIGH RISK user registered - alert needed", {
//             userId: user.id,
//             phone: user.phoneNumber,
//             factors: riskResult.factors,
//           });
//         }

//         // Clean up session after successful registration
//         await sessionManager.deleteSession((this as any).args.sessionId);
//       } catch (error) {
//         logger.error("Registration failed:", error);
//         menu.end(
//           "Hakuri, an sami matsala. Don Allah sake gwadawa.\n" +
//             "Sorry, an error occurred. Please try again."
//         );

//         // Clean up on error
//         await sessionManager.deleteSession((this as any).args.sessionId);
//       }
//     },
//   });
// };

/**
 * Creates a standalone registration menu
 */

/**
 * Creates a standalone registration menu
 */
};
