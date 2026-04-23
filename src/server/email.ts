import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT ?? 465),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
})

export async function sendSuggestionNotification({
  toEmail,
  toName,
  fromName,
  snippetTitle,
  snippetId,
  commentBody
}: {
  toEmail: string
  toName: string
  fromName: string
  snippetTitle: string
  snippetId: string
  commentBody: string
}) {
  const snippetUrl = `${process.env.APP_URL ?? 'http://localhost:3000'}/snippets/${snippetId}`
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: `New code suggestion on "${snippetTitle}"`,
    text: [
      `Hi ${toName},`,
      ``,
      `${fromName} left a code suggestion on your snippet "${snippetTitle}":`,
      ``,
      `"${commentBody}"`,
      ``,
      `View it here: ${snippetUrl}`,
      ``,
      `— CodeGarden`
    ].join('\n')
  })
}
