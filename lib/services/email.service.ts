import { Order } from '@/types';
import { env } from '@/lib/config/env';

export interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(payload: EmailPayload): Promise<{ success: boolean; id?: string }> {
  // If email API key is not configured, safely log to console in development
  if (!env.EMAIL_PROVIDER_API_KEY) {
    console.log(`[EMAIL DISPATCH - DEV LOG] To: ${payload.to} | Subject: "${payload.subject}"`);
    return { success: true, id: `dev_email_${Date.now()}` };
  }

  // In production, integrate with SendGrid, Resend, or AWS SES
  try {
    console.log(`Sending email to ${payload.to}: ${payload.subject}`);
    return { success: true, id: `prod_email_${Date.now()}` };
  } catch (error) {
    console.error('Failed to dispatch email:', error);
    return { success: false };
  }
}

export function generateOrderConfirmationHtml(order: Order): string {
  const itemsHtml = order.items
    .map(
      item => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #E4E4E7;">
          <strong style="color: #09090B; font-size: 14px;">${item.name}</strong><br/>
          <span style="color: #71717A; font-size: 12px;">${item.selectedSize ? `Size: ${item.selectedSize}` : ''} ${item.selectedColor ? `• Color: ${item.selectedColor}` : ''} ${item.sku ? `• SKU: ${item.sku}` : ''}</span>
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #E4E4E7; text-align: center; color: #71717A; font-size: 13px;">
          Qty: ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #E4E4E7; text-align: right; color: #09090B; font-size: 14px; font-weight: 600;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `
    )
    .join('');

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 620px; margin: 0 auto; background: #0A0A0A; padding: 40px 20px; color: #F4F4F5;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: inline-block; padding: 6px 14px; background: rgba(255, 45, 45, 0.15); border: 1px solid rgba(255, 45, 45, 0.3); border-radius: 9999px; font-size: 11px; font-weight: 700; color: #FF2D2D; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 12px;">
          MST BLOCKCHAIN
        </div>
        <h1 style="font-size: 26px; letter-spacing: 1px; font-weight: 800; text-transform: uppercase; margin: 0; color: #FFFFFF;">MST STORE</h1>
        <p style="font-size: 13px; color: #A1A1AA; margin-top: 6px;">Official Merchandise & Builder Goodies</p>
      </div>

      <div style="background: #18181B; border: 1px solid #27272A; padding: 32px; border-radius: 8px;">
        <div style="border-left: 3px solid #FF2D2D; padding-left: 14px; margin-bottom: 20px;">
          <h2 style="font-size: 20px; margin: 0; color: #FFFFFF; font-weight: 700;">Order Confirmed: #${order.orderNumber}</h2>
          <p style="font-size: 13px; color: #A1A1AA; margin: 4px 0 0 0;">
            Thank you for building with MST, <strong>${order.customer.name}</strong>. Your merchandise is being prepared for fulfillment.
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <thead>
            <tr style="border-bottom: 1px solid #27272A; text-align: left; font-size: 11px; text-transform: uppercase; color: #71717A; letter-spacing: 1px;">
              <th style="padding-bottom: 8px;">Item</th>
              <th style="padding-bottom: 8px; text-align: center;">Qty</th>
              <th style="padding-bottom: 8px; text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="padding-top: 16px; border-top: 1px solid #27272A; font-size: 14px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #A1A1AA;">
            <span>Subtotal:</span>
            <span style="color: #FFFFFF;">₹${order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          ${
            order.discountAmount > 0
              ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #FF2D2D;">
            <span>Discount (${order.discountCode || 'Promo'}):</span>
            <span>-₹${order.discountAmount.toLocaleString('en-IN')}</span>
          </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between; margin-bottom: 6px; color: #A1A1AA;">
            <span>Shipping:</span>
            <span style="color: #FFFFFF;">${order.shippingFee === 0 ? 'Complimentary Express' : `₹${order.shippingFee.toLocaleString('en-IN')}`}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 12px; font-weight: bold; font-size: 16px; border-top: 1px solid #27272A; padding-top: 12px; color: #FFFFFF;">
            <span>Total:</span>
            <span style="color: #FF2D2D;">₹${order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div style="margin-top: 24px; padding: 16px; background: #27272A; border-radius: 6px; font-size: 13px; color: #D4D4D8;">
          <strong style="color: #FFFFFF;">Delivery Destination:</strong><br/>
          ${order.shippingAddress.fullName}<br/>
          ${order.shippingAddress.street}${order.shippingAddress.apartment ? `, ${order.shippingAddress.apartment}` : ''}<br/>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} — ${order.shippingAddress.postalCode}<br/>
          ${order.shippingAddress.country}
        </div>
      </div>

      <div style="text-align: center; margin-top: 30px; font-size: 12px; color: #71717A;">
        Need assistance with your order? Reach out to <a href="mailto:support@mstblockchain.com" style="color: #FF2D2D; text-decoration: none;">support@mstblockchain.com</a><br/>
        Visit <a href="https://www.mstblockchain.com/" style="color: #A1A1AA; text-decoration: underline;">mstblockchain.com</a> to explore the ecosystem.
      </div>
    </div>
  `;
}

export function sendOrderConfirmationAsync(order: Order): void {
  // Dispatches asynchronously without blocking the user response
  setTimeout(async () => {
    try {
      await sendEmail({
        to: order.customer.email,
        subject: `Your MST Store Order #${order.orderNumber} is Confirmed`,
        html: generateOrderConfirmationHtml(order),
      });
    } catch (err) {
      console.error('Async order email error:', err);
    }
  }, 100);
}
