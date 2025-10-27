/**
 * Africa's Talking USSD Request
 *
 * @format
 */

export interface USSDRequest {
  sessionId: string;
  serviceCode: string;
  phoneNumber: string;
  text: string;
  networkCode?: string;
}

/**
 * Kano LGAs
 */
export const KANO_LGAS = [
  { id: "1", name: "Kano Municipal" },
  { id: "2", name: "Dala" },
  { id: "3", name: "Gwale" },
  { id: "4", name: "Fagge" },
  { id: "5", name: "Tarauni" },
  { id: "6", name: "Nassarawa" },
  { id: "7", name: "Kumbotso" },
  { id: "8", name: "Ungogo" },
  { id: "9", name: "Other" },
] as const;
