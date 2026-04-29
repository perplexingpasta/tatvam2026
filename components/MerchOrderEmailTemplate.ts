import { MerchCartUnit } from "../types/merch";

interface MerchOrderEmailProps {
  buyerName: string;
  orderId: string;
  units: MerchCartUnit[];
  totalAmount: number;
  utrNumber: string;
  festName: string;
}

export const generateMerchOrderEmailHtml = ({
  buyerName,
  orderId,
  units,
  totalAmount,
  utrNumber,
  festName,
}: MerchOrderEmailProps): string => {
  const unitsHtml = units
    .map((unit) => {
      const attributesHtml = Object.entries(unit.attributes || {})
        .map(([key, value]) => `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}`)
        .join("<br>");
      
      return `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <strong>${unit.itemName}</strong><br>
            <span style="font-size: 14px; color: #555;">${attributesHtml}</span>
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">
            ₹${unit.price}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Order Confirmed — ${festName} Merch</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #f8f9fa; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { padding: 20px; border: 1px solid #eee; border-top: none; border-radius: 0 0 8px 8px; }
          .order-id { font-size: 24px; font-weight: bold; color: #0056b3; text-align: center; margin: 20px 0; padding: 15px; background: #e9ecef; border-radius: 4px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { text-align: left; padding: 10px; border-bottom: 2px solid #ddd; color: #666; }
          .total-row { font-size: 18px; font-weight: bold; background: #f8f9fa; }
          .footer { margin-top: 30px; font-size: 14px; color: #666; text-align: center; border-top: 1px solid #eee; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 style="margin: 0; color: #333;">Order Confirmed!</h1>
          <p style="margin: 10px 0 0 0; color: #666;">Thank you for your merch order, ${buyerName}.</p>
        </div>
        
        <div class="content">
          <p>Your order has been successfully placed. Here are the details:</p>
          
          <div class="order-id">
            Order ID: ${orderId}
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Item Details</th>
                <th style="text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${unitsHtml}
              <tr class="total-row">
                <td style="padding: 15px 10px;">Total Amount</td>
                <td style="padding: 15px 10px; text-align: right;">₹${totalAmount}</td>
              </tr>
            </tbody>
          </table>
          
          <p><strong>UTR Submitted:</strong> ${utrNumber}</p>
          
          <div style="background-color: #e8f4f8; padding: 15px; border-radius: 4px; margin-top: 20px;">
            <h3 style="margin-top: 0; color: #0056b3;">Pickup Instructions</h3>
            <p style="margin-bottom: 0;">
              All merch orders can be picked up from the registration desk at ${festName}. 
              Our team will contact you to confirm your order details before the event.
            </p>
          </div>
        </div>
        
        <div class="footer">
          <p>If you have any questions, please contact us at:</p>
          <p><strong>Merch Team: merch@example.com | Phone: 9876543210</strong></p>
          <p style="margin-top: 20px; font-size: 12px;">This is an automated email. Please do not reply directly to this address.</p>
        </div>
      </body>
    </html>
  `;
};
