/**
 * Calculate current pregnancy week from Expected Delivery Date
 *
 * @format
 */

export const calculatePregnancyWeek = (edd: Date): number => {
  const today = new Date();
  const daysUntilDelivery = Math.floor(
    (edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Pregnancy is typically 280 days (40 weeks)
  const daysPregnant = 280 - daysUntilDelivery;
  const weeksPregnant = Math.floor(daysPregnant / 7);

  // Ensure it's between 1 and 40
  return Math.max(1, Math.min(40, weeksPregnant));
};

/**
 * Calculate Expected Delivery Date from Last Menstrual Period
 */
export const calculateEDD = (lmp: Date): Date => {
  const edd = new Date(lmp);
  edd.setDate(edd.getDate() + 280); // Add 280 days (40 weeks)
  return edd;
};

/**
 * Check if delivery is imminent (within 2 weeks)
 */
export const isDeliveryImminent = (edd: Date): boolean => {
  const today = new Date();
  const daysUntilDelivery = Math.floor(
    (edd.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilDelivery <= 14 && daysUntilDelivery >= 0;
};
