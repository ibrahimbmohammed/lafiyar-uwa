/** @format */

import AfricasTalking from "africastalking";
import { config } from "./index";

const credentials = {
  apiKey: config.africastalking.apiKey,
  username: config.africastalking.username,
};

const africasTalking = AfricasTalking(credentials);

// Export individual services
export const smsService = africasTalking.SMS;
export const voiceService = (africasTalking as any).VOICE;

export default africasTalking;
