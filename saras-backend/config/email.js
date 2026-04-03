const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const customerBookingEmail = (reservation) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #1a1a1a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #c9a96e; border-radius: 8px; overflow: hidden; }
    .header { background: #1a1a1a; padding: 40px 30px; text-align: center; border-bottom: 2px solid #c9a96e; }
    .header h1 { color: #c9a96e; font-size: 32px; margin: 0; letter-spacing: 3px; }
    .body { padding: 35px 30px; }
    .greeting { color: #c9a96e; font-size: 22px; margin-bottom: 15px; }
    .text { color: #ccc; line-height: 1.8; font-size: 15px; }
    .details-box { background: #1a1a1a; border-left: 4px solid #c9a96e; padding: 25px; margin: 25px 0; }
    .details-box h3 { color: #c9a96e; margin: 0 0 18px; font-size: 16px; }
    .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #2a2a2a; }
    .detail-row:last-child { border-bottom: none; }
    .detail-label { color: #888; font-size: 13px; }
    .detail-value { color: #fff; font-size: 14px; font-weight: bold; }
    .footer { background: #0d0d0d; padding: 25px; text-align: center; border-top: 1px solid #222; }
    .footer p { color: #666; font-size: 12px; margin: 5px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>SARAS</h1></div>
    <div class="body">
      <p class="greeting">Dear ${reservation.name},</p>
      <p class="text">Thank you for choosing Saras! Your table reservation has been received and is <strong style="color:#c9a96e;">pending confirmation</strong>.</p>
      <div class="details-box">
        <h3>Booking Details</h3>
        <div class="detail-row"><span class="detail-label">Name</span><span class="detail-value">${reservation.name}</span></div>
        <div class="detail-row"><span class="detail-label">Phone</span><span class="detail-value">${reservation.phone}</span></div>
        <div class="detail-row"><span class="detail-label">Persons</span><span class="detail-value">${reservation.persons}</span></div>
        <div class="detail-row"><span class="detail-label">Date</span><span class="detail-value">${new Date(reservation.date).toDateString()}</span></div>
        <div class="detail-row"><span class="detail-label">Time</span><span class="detail-value">${reservation.time}</span></div>
      </div>
      <p class="text">For changes call us at <a href="tel:+8010476915" style="color:#c9a96e;">+8010476915</a></p>
    </div>
    <div class="footer">
      <p>Restaurant St, Delicious City, Solapur</p>
      <p>Open Daily: 8:00 AM – 10:00 PM</p>
    </div>
  </div>
</body>
</html>
`;

const ownerBookingEmail = (reservation) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; }
    .header { background: #c9a96e; padding: 25px; text-align: center; }
    .header h2 { color: #fff; margin: 0; }
    .body { padding: 30px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th { background: #f0f0f0; padding: 10px; text-align: left; font-size: 12px; color: #666; }
    .table td { padding: 12px 10px; border-bottom: 1px solid #eee; font-size: 14px; color: #333; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h2>🔔 New Table Reservation</h2></div>
    <div class="body">
      <table class="table">
        <tr><th>Field</th><th>Details</th></tr>
        <tr><td><strong>Name</strong></td><td>${reservation.name}</td></tr>
        <tr><td><strong>Phone</strong></td><td>${reservation.phone}</td></tr>
        <tr><td><strong>Persons</strong></td><td>${reservation.persons}</td></tr>
        <tr><td><strong>Date</strong></td><td>${new Date(reservation.date).toDateString()}</td></tr>
        <tr><td><strong>Time</strong></td><td>${reservation.time}</td></tr>
        <tr><td><strong>Message</strong></td><td>${reservation.message || '—'}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>
`;

const newsletterWelcomeEmail = () => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Georgia, serif; background: #1a1a1a; margin: 0; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: #111; border: 1px solid #c9a96e; border-radius: 8px; overflow: hidden; }
    .header { background: #1a1a1a; padding: 40px 30px; text-align: center; border-bottom: 2px solid #c9a96e; }
    .header h1 { color: #c9a96e; font-size: 32px; margin: 0; }
    .body { padding: 35px 30px; text-align: center; }
    .title { color: #c9a96e; font-size: 24px; margin-bottom: 15px; }
    .text { color: #ccc; line-height: 1.8; font-size: 15px; }
    .offer { background: #1a1a1a; border: 2px solid #c9a96e; border-radius: 8px; padding: 20px; margin: 25px 0; }
    .offer h3 { color: #c9a96e; font-size: 28px; margin: 0 0 5px; }
    .offer p { color: #999; margin: 0; }
    .footer { background: #0d0d0d; padding: 20px; text-align: center; border-top: 1px solid #222; }
    .footer p { color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>SARAS</h1></div>
    <div class="body">
      <h2 class="title">🎉 You're now subscribed!</h2>
      <p class="text">Welcome to the Saras family! You'll be the first to know about our latest dishes and exclusive offers.</p>
      <div class="offer">
        <h3>25% OFF</h3>
        <p>Your next visit — show this email to avail the discount</p>
      </div>
    </div>
    <div class="footer"><p>© ${new Date().getFullYear()} Saras Restaurant</p></div>
  </div>
</body>
</html>
`;

const sendReservationEmails = async (reservation) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.RESTAURANT_EMAIL,
    subject: `🔔 New Reservation: ${reservation.name}`,
    html: ownerBookingEmail(reservation),
  });
};

const sendNewsletterWelcome = async (email) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: '🎉 Welcome to Saras – Your 25% Discount Awaits!',
    html: newsletterWelcomeEmail(),
  });
};

module.exports = { sendReservationEmails, sendNewsletterWelcome };