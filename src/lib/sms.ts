import { prisma } from "./prisma";
import { getOrganizationSecure } from "./actions/organization";

/**
 * Sends an SMS using SMSEthiopia.et API
 * @param to Recipient phone number (e.g. 251911234567)
 * @param text Message content (max 160 chars)
 */
export async function sendSMS(to: string, text: string) {
  const org = await getOrganizationSecure();
  
  if (!org?.isSmsEnabled || !org.smsApiKey) {
    console.log("SMS skipped: Not enabled or missing API key");
    return { status: "skipped", message: "SMS not enabled" };
  }

  // Clean phone number: remove + and ensure it starts with 251
  let msisdn = to.replace(/\+/g, "");
  if (msisdn.startsWith("0")) {
    msisdn = "251" + msisdn.substring(1);
  } else if (!msisdn.startsWith("251")) {
    msisdn = "251" + msisdn;
  }

  try {
    const response = await fetch("https://smsethiopia.et/api/sms/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "KEY": org.smsApiKey,
      },
      body: JSON.stringify({
        msisdn,
        text,
      }),
    });

    let data: any = {};
    const textResponse = await response.text();
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      data = { raw: textResponse };
    }
    
    // Log the SMS in our database
    // Robust status check: some providers use "success", some "sent", or just 200 OK
    const statusStr = (data.status || "").toLowerCase();
    const isSuccess = 
      statusStr === "success" || 
      statusStr === "sent" || 
      (response.ok && statusStr !== "error" && statusStr !== "failed");

    await prisma.smsLog.create({
      data: {
        to: msisdn,
        message: text,
        status: isSuccess ? "success" : "error",
        providerResponse: textResponse.substring(0, 500), // Store raw text safely
      },
    });

    return data;
  } catch (error) {
    console.error("SMS Ethiopia Error:", error);
    
    await prisma.smsLog.create({
      data: {
        to: msisdn,
        message: text,
        status: "error",
        providerResponse: error instanceof Error ? error.message : "Unknown fetch error",
      },
    });

    throw error;
  }
}

/**
 * Replaces placeholders in SMS templates with actual data
 */
export function replaceSmsVariables(template: string, variables: Record<string, string>) {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    // Replace both [Key] and [key] formats
    result = result.replace(new RegExp(`\\[${key}\\]`, 'gi'), value || "");
  }
  return result;
}
