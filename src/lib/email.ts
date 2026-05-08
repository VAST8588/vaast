import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderItem {
  name: string;
  size: string;
  quantity: number;
  price: number;
}

interface SendOrderConfirmationParams {
  to: string;
  userName: string;
  orderId: string;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
}

export async function sendOrderConfirmation({
  to,
  userName,
  orderId,
  items,
  totalAmount,
  paymentMethod,
}: SendOrderConfirmationParams) {
  const orderNum = orderId.slice(-8).toUpperCase();
  const isQpay = paymentMethod === "qpay";

  const itemRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc">${item.name}</td>
        <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc;text-align:center">${item.size}</td>
        <td style="padding:8px 0;border-bottom:1px solid #222;color:#ccc;text-align:center">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #222;color:#fff;text-align:right">₮${(item.price * item.quantity).toLocaleString()}</td>
      </tr>`
    )
    .join("");

  const paymentNote = isQpay
    ? `<p style="color:#aaa;font-size:14px">QPay-р төлбөр хийгдэнэ. Манай баг баталгаажуулах болно.</p>`
    : `<div style="background:#111;border:1px solid #333;padding:16px;margin:16px 0">
        <p style="color:#fff;font-weight:bold;margin:0 0 8px">Банкны шилжүүлэг:</p>
        <p style="color:#aaa;margin:4px 0">Банк: Хаан Банк</p>
        <p style="color:#aaa;margin:4px 0">Дансны дугаар: 5000XXXXXX</p>
        <p style="color:#aaa;margin:4px 0">Хүлээн авагч: VAST LLC</p>
        <p style="color:#aaa;margin:4px 0">Гүйлгээний утга: <strong style="color:#fff">#${orderNum}</strong></p>
      </div>`;

  await resend.emails.send({
    from: "VAST <onboarding@resend.dev>",
    to,
    subject: `VAST захиалга баталгаажлаа #${orderNum}`,
    html: `
    <div style="background:#0a0a0a;min-height:100vh;padding:40px 20px;font-family:sans-serif">
      <div style="max-width:560px;margin:0 auto">
        <h1 style="color:#fff;letter-spacing:0.2em;font-size:24px;margin:0 0 4px">VAST</h1>
        <p style="color:#555;font-size:12px;letter-spacing:0.2em;margin:0 0 32px">STREETWEAR</p>

        <h2 style="color:#fff;font-size:18px;font-weight:600;margin:0 0 8px">Захиалга баталгаажлаа</h2>
        <p style="color:#aaa;margin:0 0 24px">Сайн байна уу, ${userName}! Таны захиалгыг хүлээн авлаа.</p>

        <div style="background:#111;border:1px solid #222;padding:16px;margin:0 0 24px">
          <p style="color:#555;font-size:12px;letter-spacing:0.15em;margin:0 0 4px">ЗАХИАЛГЫН ДУГААР</p>
          <p style="color:#fff;font-size:20px;font-weight:bold;margin:0">#${orderNum}</p>
        </div>

        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th style="color:#555;font-size:11px;letter-spacing:0.1em;text-align:left;padding-bottom:8px;border-bottom:1px solid #333">БАРАА</th>
              <th style="color:#555;font-size:11px;letter-spacing:0.1em;text-align:center;padding-bottom:8px;border-bottom:1px solid #333">ХЭМЖЭЭ</th>
              <th style="color:#555;font-size:11px;letter-spacing:0.1em;text-align:center;padding-bottom:8px;border-bottom:1px solid #333">ТОО</th>
              <th style="color:#555;font-size:11px;letter-spacing:0.1em;text-align:right;padding-bottom:8px;border-bottom:1px solid #333">ҮНЭ</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>

        <div style="text-align:right;margin:16px 0 24px;padding-top:12px;border-top:1px solid #333">
          <span style="color:#555;font-size:12px">НИЙТ: </span>
          <span style="color:#fff;font-size:20px;font-weight:bold">₮${totalAmount.toLocaleString()}</span>
        </div>

        ${paymentNote}

        <p style="color:#555;font-size:12px;margin:24px 0 0">Асуулт байвал манай Instagram-д холбогдоно уу.</p>
      </div>
    </div>`,
  });
}
