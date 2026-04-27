// components/RegistrationEmailTemplate.ts
export interface RegistrationEmailProps {
  name: string;
  festName: string;
  delegateId: string;
  tier: string;
  teamId?: string | null;
}

export function generateRegistrationEmailHtml({
  name,
  festName,
  delegateId,
  tier,
  teamId,
}: RegistrationEmailProps): string {
  const getTierName = (t: string) => {
    switch (t) {
      case "tier1":
        return process.env.NEXT_PUBLIC_TIER_1_NAME || "Gold";
      case "tier2":
        return process.env.NEXT_PUBLIC_TIER_2_NAME || "Platinum";
      case "tier3":
        return process.env.NEXT_PUBLIC_TIER_3_NAME || "Diamond";
      default:
        return t;
    }
  };

  const tierName = getTierName(tier);

  return `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Registration Confirmed! 🎉</h2>
      <p style="font-size: 16px;">Hi <strong>${name}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.5;">Thank you for registering for <strong>${festName}</strong>. Your delegate information has been verified and processed. Here are your details:</p>
      
      <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <ul style="list-style-type: none; padding: 0; margin: 0;">
          <li style="margin-bottom: 10px; font-size: 15px;"><strong>Delegate ID:</strong> <span style="color: #0369a1; font-weight: bold;">${delegateId}</span></li>
          <li style="margin-bottom: 10px; font-size: 15px;"><strong>Tier:</strong> ${tierName}</li>
          ${teamId ? `<li style="font-size: 15px;"><strong>Team ID:</strong> <span style="color: #0369a1; font-weight: bold;">${teamId}</span></li>` : ""}
        </ul>
      </div>

      <p style="font-size: 15px; color: #b91c1c; font-weight: 500;">Please keep your Delegate ID safe, as you will need it to register for individual events during the fest.</p>
      <p style="font-size: 16px; margin-top: 30px;">Best regards,<br/>The <strong>${festName}</strong> Team</p>
    </div>
  `;
}
