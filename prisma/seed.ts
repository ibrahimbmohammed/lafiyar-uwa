/** @format */

import dotenv from "dotenv";
// 👇 Load .env BEFORE importing or using PrismaClient
dotenv.config();

// ✅ Correct import path based on your `output` in schema.prisma
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Community Health Workers
  const chws = await prisma.communityHealthWorker.createMany({
    data: [
      {
        name: "Fatima Ibrahim",
        phoneNumber: "+2348012345601",
        lga: "Kano Municipal",
        villages: ["Fagge", "Dala", "Gwale"],
        status: "active",
      },
      {
        name: "Hauwa Suleiman",
        phoneNumber: "+2348012345602",
        lga: "Dala",
        villages: ["Goron Dutse", "Kurna"],
        status: "active",
      },
      {
        name: "Aisha Muhammad",
        phoneNumber: "+2348012345603",
        lga: "Gwale",
        villages: ["Gwale", "Mandawari"],
        status: "active",
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${chws.count} CHWs`);

  // Seed Health Facilities
  const facilities = await prisma.healthFacility.createMany({
    data: [
      {
        name: "Murtala Muhammad Specialist Hospital",
        facilityType: "Hospital",
        lga: "Kano Municipal",
        address: "Kofar Mata, Kano",
        phoneNumber: "+2348012345701",
        operationalStatus: "active",
      },
      {
        name: "Aminu Kano Teaching Hospital",
        facilityType: "Hospital",
        lga: "Tarauni",
        address: "Zaria Road, Kano",
        phoneNumber: "+2348012345702",
        operationalStatus: "active",
      },
      {
        name: "Dala Primary Health Centre",
        facilityType: "PHC",
        lga: "Dala",
        address: "Dala LGA, Kano",
        phoneNumber: "+2348012345703",
        operationalStatus: "active",
      },
      {
        name: "Gwale Primary Health Centre",
        facilityType: "PHC",
        lga: "Gwale",
        address: "Gwale LGA, Kano",
        phoneNumber: "+2348012345704",
        operationalStatus: "active",
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${facilities.count} health facilities`);

  // Seed Transport Providers
  const transports = await prisma.transportProvider.createMany({
    data: [
      {
        name: "Musa Garba",
        phoneNumber: "+2348012345801",
        vehicleType: "motorcycle",
        lga: "Kano Municipal",
        areasServed: ["Fagge", "Dala", "Gwale", "Kano Municipal"],
        status: "active",
      },
      {
        name: "Kabir Sani",
        phoneNumber: "+2348012345802",
        vehicleType: "tricycle",
        lga: "Dala",
        areasServed: ["Dala", "Gwale"],
        status: "active",
      },
      {
        name: "Yusuf Ahmed",
        phoneNumber: "+2348012345803",
        vehicleType: "car",
        lga: "Tarauni",
        areasServed: ["Tarauni", "Nassarawa", "Kano Municipal"],
        status: "active",
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${transports.count} transport providers`);

  // Seed Content Library (first 4 weeks)
  const content = await prisma.contentLibrary.createMany({
    data: [
      {
        weekNumber: 1,
        contentType: "pregnancy",
        titleHausa: "Mako na Farko - Farkon Ciki",
        titleEnglish: "Week 1 - Early Pregnancy",
        smsSummaryHausa:
          "Sannu! Mako na farko na ciki. Ci abinci mai gina jiki, sha ruwa mai yawa.",
        smsSummaryEnglish:
          "Hello! Week 1 of pregnancy. Eat nutritious food, drink plenty of water.",
      },
      {
        weekNumber: 2,
        contentType: "pregnancy",
        titleHausa: "Mako na Biyu - Kula da Lafiyar Jiki",
        titleEnglish: "Week 2 - Taking Care of Your Health",
        smsSummaryHausa:
          "Mako na 2. Je asibi don gwajin farko. Nisanci shan taba da barasa.",
        smsSummaryEnglish:
          "Week 2. Visit clinic for first check-up. Avoid smoking and alcohol.",
      },
      {
        weekNumber: 3,
        contentType: "pregnancy",
        titleHausa: "Mako na Uku - Alamomin Ciki",
        titleEnglish: "Week 3 - Pregnancy Symptoms",
        smsSummaryHausa:
          "Mako na 3. Kana iya jin gajiya. Huta sosai kuma ci folic acid.",
        smsSummaryEnglish:
          "Week 3. You may feel tired. Rest well and take folic acid.",
      },
      {
        weekNumber: 4,
        contentType: "pregnancy",
        titleHausa: "Mako na Hudu - Gwajin Farko",
        titleEnglish: "Week 4 - First Tests",
        smsSummaryHausa:
          "Mako na 4. Lokaci ne don gwajin jini da fitsari. Je asibi yanzu.",
        smsSummaryEnglish:
          "Week 4. Time for blood and urine tests. Visit the clinic now.",
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Created ${content.count} content items`);

  console.log("🎉 Database seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
