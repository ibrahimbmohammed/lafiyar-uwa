/** @format */

import UssdMenu from "ussd-builder";
import { userService } from "../../users/services/user.service";
import { registrationStates } from "./registration.menu";

// Define interface for the context
interface UssdContext {
  args: {
    phoneNumber: string;
  };
  val: string;
  session: any;
}

export const mainMenu = () => {
  const menu = new UssdMenu();

  // Start state - Check if user exists
  menu.startState({
    run: async function () {
      const context = this as unknown as UssdContext;
      const user = await userService.findByPhone(context.args.phoneNumber);

      if (!user) {
        // New user - show registration option
        menu.con(
          "Barka da zuwa Lafiyar Uwa!\n" +
            "Welcome to Mother's Health!\n\n" +
            "1. Yi rajista (Register)\n" +
            "2. Game da mu (About us)"
        );
      } else {
        // Existing user - show main menu
        menu.con(
          `Sannu ${user.name}!\n` +
            "Main Menu:\n\n" +
            "1. Duba alamomin haɗari (Check danger signs)\n" +
            "2. Bayanan rigakafi (Vaccination info)\n" +
            "3. Nemi kira (Request callback)\n" +
            "4. Gaggawa (Emergency)\n" +
            "5. Bayanan ku (Your profile)\n" +
            "6. Sabunta bayanai (Update profile)"
        );
      }
    },
    next: {
      "1": "menu.option1",
      "2": "menu.option2",
      "3": "menu.option3",
      "4": "menu.option4",
      "5": "menu.option5",
      "6": "menu.option6",
    },
  });

  // Option 1: Register or Check Danger Signs
  menu.state("menu.option1", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const user = await userService.findByPhone(context.args.phoneNumber);

      if (!user) {
  // Start registration process - navigate to registration flow
        menu.con(
          "Shafin rajista:\n\n" +
            "Za mu fara rajista.\n" +
            "We will begin registration.\n\n" +
            "Shigar da sunan ku (Enter your full name):"
        );
      } else {
        // Existing user - show danger signs
        menu.end(
          "Alamomin haɗari na gaggawa:\n\n" +
            "🔴 Zubar jini mai yawa\n" +
            "🔴 Ciwon kai mai ƙarfi\n" +
            "🔴 Huhu na ruwa\n" +
            "🔴 Jini mai yawa\n" +
            "🔴 Tashin zuciya da amai\n\n" +
            "Idan kuna da ɗayan waɗannan, kira nan da nan: *347*911#\n" +
            "Ko nemo asibiti mafi kusa!"
        );
      }
    },
    next: {
      "*": "registration.name",
    },
  });

  // Option 2: About us or Vaccination Info
  menu.state("menu.option2", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const user = await userService.findByPhone(context.args.phoneNumber);

      if (!user) {
        menu.end(
          "Lafiyar Uwa - Game da mu:\n\n" +
            "Muna taimaka wa mata masu juna biyu da yara su sami kiwon lafiya mai inganci.\n\n" +
            "Sabis ɗin kyauta ne!\n" +
            "Ana ba da shawarwari akan:\n" +
            "• Alamomin haɗari\n" +
            "• Lokutan rigakafi\n" +
            "• Abinci mai gina jiki\n" +
            "• Kula da juna biyu\n\n" +
            "Kira *347*1# don yi rajista."
        );
      } else {
        // Show vaccination schedule based on pregnancy week
        let vaccineInfo = "";

        if (user.currentWeek <= 12) {
          vaccineInfo =
            "Rigakafi na farko: 6-12 makonni\n" +
            "- Tetanus Toxoid\n" +
            "- Influenza\n" +
            "- COVID-19 (idan an ba da shawara)";
        } else if (user.currentWeek <= 24) {
          vaccineInfo =
            "Rigakafi na biyu: 13-24 makonni\n" +
            "- Tetanus Toxoid (na biyu)\n" +
            "- Diphtheria Tetanus Pertussis";
        } else {
          vaccineInfo =
            "Rigakafi na uku: 25+ makonni\n" +
            "- Tetanus Toxoid (na uku)\n" +
            "- Shaye-shaye na waɗanda suka riga sun sha";
        }

        menu.end(
          "Bayanan Rigakafi:\n\n" +
            vaccineInfo +
            "\n\nZa mu tuna muku lokacin da ya zo lokacin rigakafinku.\n\n" +
            "Ku ci gaba da ziyartar asibiti don rigakafin ku na yau da kullun."
        );
      }
    },
  });

  // Option 3: Request Callback
  menu.state("menu.option3", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const user = await userService.findByPhone(context.args.phoneNumber);

      if (user) {
        // TODO: Implement callback request service
        menu.end(
          "✅ Roƙon kira an karɓa!\n\n" +
            "Ma'aikacin kiwon lafiya zai kira ku cikin sa'o'i 24.\n\n" +
            "Za mu kira zuwa: " +
            context.args.phoneNumber +
            "\n\n" +
            "Idan ba a kira ku ba, don Allah ku tuntuɓi asibiti kai tsaye."
        );
      } else {
        menu.end(
          "Don Allah yi rajista da farko don amfani da wannan sabis.\n\n" +
            "Danna 1 don fara rajista."
        );
      }
    },
  });

  // Option 4: Emergency
  menu.state("menu.option4", {
    run: function () {
      menu.end(
        "🚨 GAGGAMA TAIMAKO:\n\n" +
          "Idan kana da ɗayan waɗannan alamomin:\n" +
          "• Zubar jini mai yawa\n" +
          "• Ciwon kai mai ƙarfi\n" +
          "• Huhu na ruwa\n" +
          "• Jini mai yawa\n" +
          "• Tashin zuciya da amai\n\n" +
          "KIRA NAN DA NAN:\n" +
          "Lambar Gaggawa: *347*911#\n\n" +
          "Asibitoci a Kano:\n" +
          "• Murtala Muhammad Hospital: 064-320000\n" +
          "• Aminu Kano Hospital: 064-662300\n" +
          "• Nassarawa Hospital: 064-631491\n\n" +
          "JE ASIBITI NAN DA NAN!"
      );
    },
  });

  // Option 5: Profile
  menu.state("menu.option5", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const user = await userService.findByPhone(context.args.phoneNumber);

      if (!user) {
        menu.end("Don Allah yi rajista da farko. Danna 1 don fara rajista.");
        return;
      }

      const weekText = user.currentWeek
        ? `Mako ${user.currentWeek}`
        : "Ba a sani ba";
      const riskText =
        user.riskProfile === "high"
          ? "🔴 BABBA (High)"
          : user.riskProfile === "moderate"
            ? "🟡 MATSAKAICI (Moderate)"
            : "🟢 KARAMI (Low)";

      menu.end(
        `Bayanan mai amfani:\n\n` +
          `📞 Lambar waya: ${user.phoneNumber}\n` +
          `👤 Suna: ${user.name}\n` +
          `🏙 LGA: ${user.lga}\n` +
          `📅 Mako na ciki: ${weekText}\n` +
          `⚠️ Matsayin haɗari: ${riskText}\n\n` +
          `Danna 6 don sabunta bayananka.`
      );
    },
  });

  // Option 6: Update Profile
  menu.state("menu.option6", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const user = await userService.findByPhone(context.args.phoneNumber);

      if (!user) {
        menu.end("Don Allah yi rajista da farko. Danna 1 don fara rajista.");
        return;
      }

      menu.con(
        "Sabunta bayanai:\n\n" +
          "1. Sabunta suna\n" +
          "2. Sabunta LGA\n" +
          "3. Sabunta makon ciki\n" +
          "4. Komawa menu"
      );
    },
    next: {
      "1": "update.name",
      "2": "update.lga",
      "3": "update.week",
      "4": "start",
    },
  });

  // Update Name
  menu.state("update.name", {
    run: function () {
      menu.con("Shigar da sabon suna:");
    },
    next: {
      "*": "update.name.confirm",
    },
  });

  menu.state("update.name.confirm", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const newName = context.val;

      try {
        await userService.updateUser(context.args.phoneNumber, {
          name: newName,
        });
        menu.end(
          `✅ Suna an sabunta zuwa: ${newName}\n\nDanna *347*1# don komawa menu.`
        );
      } catch (error) {
        menu.end(
          "❌ An sami matsala tare da sabunta suna. Don Allah sake kokawa."
        );
      }
    },
  });

  // Update LGA
  menu.state("update.lga", {
    run: function () {
      menu.con("Shigar da sabon LGA:");
    },
    next: {
      "*": "update.lga.confirm",
    },
  });

  menu.state("update.lga.confirm", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const newLga = context.val;

      try {
        await userService.updateUser(context.args.phoneNumber, { lga: newLga });
        menu.end(
          `✅ LGA an sabunta zuwa: ${newLga}\n\nDanna *347*1# don komawa menu.`
        );
      } catch (error) {
        menu.end(
          "❌ An sami matsala tare da sabunta LGA. Don Allah sake kokawa."
        );
      }
    },
  });

  // Update Pregnancy Week
  menu.state("update.week", {
    run: function () {
      menu.con("Shigar da sabon makon ciki:");
    },
    next: {
      "*": "update.week.confirm",
    },
  });

  menu.state("update.week.confirm", {
    run: async function () {
      const context = this as unknown as UssdContext;
      const newWeek = parseInt(context.val);

      if (isNaN(newWeek)) {
        menu.end("❌ Don Allah shigar da lamba. Misali: 12 don makon 12.");
        return;
      }

      try {
        await userService.updateUser(context.args.phoneNumber, {
          currentWeek: newWeek,
        });
        menu.end(
          `✅ Makon ciki an sabunta zuwa: ${newWeek}\n\nDanna *347*1# don komawa menu.`
        );
      } catch (error) {
        menu.end(
          "❌ An sami matsala tare da sabunta makon ciki. Don Allah sake kokawa."
        );
      }
    },
  });

  // Add registration states to this menu
  registrationStates(menu);

  return menu;
};



