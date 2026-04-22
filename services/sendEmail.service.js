import { Resend } from "resend";
import Order from "../models/Order.js";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResendMail = async ({ name, email, orderId }) => {
  const order = await Order.findById(orderId);

  if (!order) {
    throw new Error("Order not found");
  }

  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          <img src="${item.image}" width="50" style="border-radius:6px;" />
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          ${item.name}
          <div style="font-size:12px; color:#888;">
            ${item.variant?.color || ""} (${item.colorCode})
          </div>
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">
          ${item.quantity}
        </td>
      </tr>
    `,
    )
    .join("");

  await resend.emails.send({
    from: "The Fabric Company <onboarding@resend.dev>",
    to: [email],
    subject: `Hi ${name}, your order ${order.orderNumber} is confirmed!`,
    html: `
<div style="font-family: Arial, sans-serif; background:#f7f7f7; padding:40px 0;">
  <div style="max-width:600px; margin:auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 20px rgba(0,0,0,0.05);">
    
    <!-- Header -->
    <div style="background:#111; color:#fff; padding:20px 30px;">
      <h2 style="margin:0;">Order Confirmation</h2>
    </div>

    <!-- Body -->
    <div style="padding:30px;">
      <h3>Hi ${name},</h3>

      <p style="color:#555;">
        Your order has been confirmed. Here are the details:
      </p>

      <!-- Order Info -->
      <div style="background:#f9f9f9; padding:15px; border-radius:8px; margin:20px 0;">
        <strong>Order ID:</strong> ${order.orderNumber}<br/>
        <strong>Status:</strong> ${order.status}
      </div>

      <!-- Items Table -->
      <table width="100%" style="border-collapse:collapse;">
        <thead>
          <tr style="text-align:left; border-bottom:2px solid #eee;">
            <th style="padding:10px;">Image</th>
            <th style="padding:10px;">Product</th>
            <th style="padding:10px; text-align:center;">Qty</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>

      <p style="margin-top:20px; color:#555;">
        We will contact you shortly with pricing and further details.
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a href="#" style="background:#111; color:#fff; padding:12px 20px; text-decoration:none; border-radius:6px;">
          View Order
        </a>
      </div>

      <p style="font-size:12px; color:#999;">
        If you have questions, reply to this email.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#fafafa; padding:20px; text-align:center; font-size:12px; color:#888;">
      © ${new Date().getFullYear()} Your Fabric Company
    </div>

  </div>
</div>
`,
  });

  return {
    message : "Mail sent successfully"
  }
};
