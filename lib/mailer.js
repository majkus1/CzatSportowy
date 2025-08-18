// /lib/mailer.js
import nodemailer from 'nodemailer'

export function getTransporter() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER, // np. twojmail@gmail.com
      pass: process.env.EMAIL_PASS, // hasło aplikacji (App Password), nie zwykłe hasło do Gmaila!
    },
  })
  return transporter
}
