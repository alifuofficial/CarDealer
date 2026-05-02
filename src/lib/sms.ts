import { prisma } from "@/lib/prisma";

export function replaceSmsVariables(content: string, variables: Record<string, string>) {
  let result = content;
  for (const [key, value] of Object.entries(variables)) {
    // Escape square brackets for regex
    const regex = new RegExp(`\\[${key}\\]`, "g");
    result = result.replace(regex, value);
  }
  return result;
}

export async function sendSMS(msisdn: string, text: string) {
  const org = await prisma.organization.findUnique({
    where: { id: "singleton" },
  });

  if (!org || !org.isSmsEnabled || !org.smsApiKey) {
    console.log("SMS skipped: Service disabled or no API key.");
    return null;
  }

  // Ensure phone number starts with 251
  let formattedNumber = msisdn.replace(/\D/g, "");
  if (formattedNumber.startsWith("0")) {
    formattedNumber = "251" + formattedNumber.substring(1);
  } else if (!formattedNumber.startsWith("251")) {
    formattedNumber = "251" + formattedNumber;
  }

  try {
    const response = await fetch("https://smsethiopia.et/api/sms/send", {
      method: "POST",
      headers: {
        "KEY": org.smsApiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        msisdn: formattedNumber,
        text: text,
      }),
    });

    const result = await response.json();
    console.log("SMS Ethiopia Response:", result);

    // Log to DB
    await prisma.smsLog.create({
      data: {
        to: formattedNumber,
        message: text,
        status: result.status === "success" ? "success" : "error",
        providerResponse: JSON.stringify(result),
      },
    });

    return result;
  } catch (error) {
    console.error("SMS Ethiopia Error:", error);
    
    // Log failure
    await prisma.smsLog.create({
      data: {
        to: msisdn,
        message: text,
        status: "error",
        providerResponse: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return { status: "error", message: "Failed to connect to SMS service" };
  }
}
