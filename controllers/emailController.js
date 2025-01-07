const nodemailer = require('nodemailer');

exports.sendEmail = async (req, res) => {
    const { name, email, message } = req.body;

    // Konfigurasi transporter Nodemailer untuk Gmail
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'propers2024@gmail.com', // Email pengirim
            pass: 'yvaq mvzo fbnc ylfq', // Password aplikasi Gmail
        },
    });

    // Konfigurasi email yang akan dikirim
    const mailOptions = {
        from: `"${name}" <${email}>`, // Nama pengirim adalah nama dari formulir dan email pengirim adalah email pengguna
        to: 'propers2024@gmail.com',  // Email tujuan (selalu ke email ini)
        subject: `Pesan Baru dari ${name}`,
        text: `
            Nama: ${name}
            Email: ${email}
            Pesan: ${message}
        `,
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).send('Email berhasil dikirim!');
    } catch (error) {
        console.error('Error saat mengirim email:', error);
        res.status(500).send('Gagal mengirim email.');
    }
};
