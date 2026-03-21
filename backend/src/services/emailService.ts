import nodemailer from 'nodemailer';

// Payment info constants
const BANK_ALIAS = 'FERVOR.ABEJA.PISO';
const BANK_HOLDER = 'Maria Cecilia Legaspe';

function formatPrice(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(n);
}

function getTransporter() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

// Branded HTML email template wrapper
function htmlWrapper(content: string): string {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Jengibre Cerámicas</title>
</head>
<body style="margin:0;padding:0;background:#faf8f5;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#faf8f5;padding:32px 16px;">
<tr><td align="center">
<table width="100%" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.06);">
  <!-- Header -->
  <tr>
    <td style="background:#7c5c45;padding:28px 32px;text-align:center;">
      <p style="margin:0;font-size:28px;font-weight:600;color:#faf8f5;letter-spacing:1px;">Jengibre</p>
      <p style="margin:4px 0 0;font-family:Arial,sans-serif;font-size:11px;color:#d4b8a8;letter-spacing:4px;text-transform:uppercase;">Cerámicas</p>
    </td>
  </tr>
  <!-- Body -->
  <tr>
    <td style="padding:32px;">
      ${content}
    </td>
  </tr>
  <!-- Footer -->
  <tr>
    <td style="background:#f5f0eb;padding:20px 32px;text-align:center;border-top:1px solid #e8ddd5;">
      <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;color:#9e8878;">Jengibre Cerámicas · Buenos Aires, Argentina</p>
      <p style="margin:6px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#9e8878;">
        <a href="https://jengibreaqua.com" style="color:#9e5c3c;text-decoration:none;">jengibreaqua.com</a>
      </p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

interface OrderForEmail {
  id: number;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  customerAddress?: string | null;
  notes?: string | null;
  paymentMethod: string;
  total: number;
  items: {
    productName: string;
    quantity: number;
    price: number;
    subtotal: number;
  }[];
}

function itemsTable(items: OrderForEmail['items']): string {
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8e0;font-size:14px;color:#3d2b1f;">${i.productName}</td>
      <td style="padding:10px 8px;border-bottom:1px solid #f0e8e0;text-align:center;font-family:Arial,sans-serif;font-size:14px;color:#7c5c45;">x${i.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #f0e8e0;text-align:right;font-family:Arial,sans-serif;font-size:14px;color:#3d2b1f;">${formatPrice(i.subtotal)}</td>
    </tr>`).join('');

  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;">
    <tr>
      <th style="text-align:left;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#9e8878;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #e8ddd5;">Producto</th>
      <th style="text-align:center;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#9e8878;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #e8ddd5;">Cant.</th>
      <th style="text-align:right;font-family:Arial,sans-serif;font-size:11px;font-weight:600;color:#9e8878;text-transform:uppercase;letter-spacing:1px;padding-bottom:8px;border-bottom:2px solid #e8ddd5;">Subtotal</th>
    </tr>
    ${rows}
    <tr>
      <td colspan="2" style="padding-top:12px;font-family:Arial,sans-serif;font-size:15px;font-weight:700;color:#3d2b1f;">Total</td>
      <td style="padding-top:12px;text-align:right;font-size:18px;font-weight:700;color:#9e5c3c;">${formatPrice(items.reduce((s, i) => s + i.subtotal, 0))}</td>
    </tr>
  </table>`;
}

function paymentBlock(paymentMethod: string): string {
  if (paymentMethod === 'transfer') {
    return `<div style="background:#fef9f0;border:1px solid #f0d9b5;border-radius:12px;padding:20px;margin:20px 0;">
      <p style="margin:0 0 12px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:1px;">💳 Datos para transferencia</p>
      <table cellpadding="0" cellspacing="0">
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#78350f;padding:3px 0;min-width:80px;">Alias:</td><td style="font-family:'Courier New',monospace;font-size:14px;font-weight:700;color:#92400e;padding:3px 0;">${BANK_ALIAS}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#78350f;padding:3px 0;">Titular:</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#92400e;padding:3px 0;">${BANK_HOLDER}</td></tr>
      </table>
      <p style="margin:12px 0 0;font-family:Arial,sans-serif;font-size:12px;color:#92400e;">Una vez realizada la transferencia, envianos el comprobante por WhatsApp.</p>
    </div>`;
  }
  return `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:20px;margin:20px 0;">
    <p style="margin:0 0 6px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#166534;text-transform:uppercase;letter-spacing:1px;">💵 Efectivo en mano</p>
    <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#166534;">Coordinamos el pago en el momento de la entrega o retiro.</p>
  </div>`;
}

export const emailService = {
  async sendOrderConfirmation(order: OrderForEmail): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !order.customerEmail) return;

    const content = `
      <h1 style="margin:0 0 4px;font-size:22px;color:#3d2b1f;">¡Gracias por tu pedido, ${order.customerName.split(' ')[0]}!</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#7c6a5e;">Tu pedido <strong>#${order.id}</strong> fue recibido correctamente. Te contactaremos pronto por WhatsApp para coordinar.</p>

      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#9e8878;text-transform:uppercase;letter-spacing:1px;">Resumen de tu pedido</p>
      ${itemsTable(order.items)}

      ${paymentBlock(order.paymentMethod)}

      ${order.customerAddress ? `<p style="margin:16px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;">📍 <strong>Dirección:</strong> ${order.customerAddress}</p>` : ''}
      ${order.notes ? `<p style="margin:8px 0 0;font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;">📝 <strong>Notas:</strong> ${order.notes}</p>` : ''}

      <div style="background:#faf8f5;border-radius:12px;padding:16px;margin:24px 0 0;border:1px solid #e8ddd5;">
        <p style="margin:0;font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;">¿Consultas? Escribinos por WhatsApp y te respondemos a la brevedad. 🏺</p>
      </div>`;

    await getTransporter().sendMail({
      from: `"Jengibre Cerámicas" <${process.env.SMTP_USER}>`,
      to: order.customerEmail,
      subject: `✅ Pedido #${order.id} confirmado — Jengibre Cerámicas`,
      html: htmlWrapper(content),
    });
  },

  async sendAdminNotification(order: OrderForEmail): Promise<void> {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.ADMIN_EMAIL) return;

    const paymentLabel = order.paymentMethod === 'transfer' ? '💳 Transferencia bancaria' : '💵 Efectivo en mano';

    const content = `
      <h1 style="margin:0 0 4px;font-size:22px;color:#3d2b1f;">🛍️ Nueva orden #${order.id}</h1>
      <p style="margin:0 0 24px;font-family:Arial,sans-serif;font-size:14px;color:#7c6a5e;">Recibiste un pedido nuevo en la tienda.</p>

      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#9e8878;text-transform:uppercase;letter-spacing:1px;">Datos del cliente</p>
      <table cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;padding:4px 16px 4px 0;min-width:100px;">Nombre:</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#3d2b1f;font-weight:600;">${order.customerName}</td></tr>
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;padding:4px 16px 4px 0;">Teléfono:</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#3d2b1f;">${order.customerPhone}</td></tr>
        ${order.customerEmail ? `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;padding:4px 16px 4px 0;">Email:</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#3d2b1f;">${order.customerEmail}</td></tr>` : ''}
        ${order.customerAddress ? `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;padding:4px 16px 4px 0;">Dirección:</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#3d2b1f;">${order.customerAddress}</td></tr>` : ''}
        <tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;padding:4px 16px 4px 0;">Pago:</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#3d2b1f;">${paymentLabel}</td></tr>
        ${order.notes ? `<tr><td style="font-family:Arial,sans-serif;font-size:13px;color:#7c6a5e;padding:4px 16px 4px 0;">Notas:</td><td style="font-family:Arial,sans-serif;font-size:13px;color:#3d2b1f;">${order.notes}</td></tr>` : ''}
      </table>

      <p style="margin:0 0 8px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;color:#9e8878;text-transform:uppercase;letter-spacing:1px;">Productos</p>
      ${itemsTable(order.items)}

      <div style="text-align:center;margin-top:24px;">
        <a href="https://jengibreaqua.com/admin" style="display:inline-block;background:#9e5c3c;color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;padding:12px 28px;border-radius:10px;text-decoration:none;">Ver en el panel admin</a>
      </div>`;

    await getTransporter().sendMail({
      from: `"Jengibre Cerámicas" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `🛍️ Nueva orden #${order.id} — ${order.customerName} — ${formatPrice(order.total)}`,
      html: htmlWrapper(content),
    });
  },
};
