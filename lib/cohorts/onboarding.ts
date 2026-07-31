export const WHATSAPP_INVITATION_URL = process.env.WEEKLY_COHORT_WHATSAPP_URL || "https://chat.whatsapp.com/CRgkRSFDYljKjn8ApALedk?s=cl&p=a&ilr=4";

export function isValidWhatsAppInvitationUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "chat.whatsapp.com";
  } catch {
    return false;
  }
}
