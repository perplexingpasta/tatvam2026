export interface EventRegistrationEmailProps {
  leadName: string;
  festName: string;
  cartItems: {
    eventName: string;
    eventType: string;
    participantNames: string[];
    eventFee: number;
  }[];
  totalAmount: number;
  utrNumber: string;
}

export function generateEventRegistrationEmailHtml({
  leadName,
  festName,
  cartItems,
  totalAmount,
  utrNumber,
}: EventRegistrationEmailProps): string {
  const eventsHtml = cartItems
    .map(
      (item) => `
    <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e2e8f0;">
      <h3 style="margin-top: 0; margin-bottom: 10px; color: #0f172a; font-size: 16px;">
        ${item.eventName} <span style="font-size: 12px; font-weight: normal; color: #64748b; text-transform: uppercase;">(${item.eventType})</span>
      </h3>
      <ul style="list-style-type: none; padding: 0; margin: 0; font-size: 14px;">
        <li style="margin-bottom: 5px;"><strong>Participants:</strong> ${item.participantNames.join(", ")}</li>
        <li><strong>Fee:</strong> ₹${item.eventFee}</li>
      </ul>
    </div>
  `
    )
    .join("");

  return `
    <div style="font-family: sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 8px;">
      <h2 style="color: #2563eb; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Event Registration Confirmed! 🎉</h2>
      <p style="font-size: 16px;">Hi <strong>${leadName}</strong>,</p>
      <p style="font-size: 16px; line-height: 1.5;">Your payment for the following events at <strong>${festName}</strong> has been received and is pending verification. Here are your registration details:</p>
      
      <div style="margin: 20px 0;">
        ${eventsHtml}
      </div>

      <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <h3 style="margin-top: 0; font-size: 16px; color: #334155;">Payment Summary</h3>
        <p style="margin: 5px 0; font-size: 15px;"><strong>Total Amount Paid:</strong> ₹${totalAmount}</p>
        <p style="margin: 5px 0; font-size: 15px;"><strong>UTR Number:</strong> ${utrNumber}</p>
      </div>

      <p style="font-size: 15px; color: #475569;">You will be notified once your payment is successfully verified by our team.</p>
      <p style="font-size: 16px; margin-top: 30px;">Best regards,<br/>The <strong>${festName}</strong> Team</p>
    </div>
  `;
}
