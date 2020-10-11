require('dotenv').config()

const fs = require('fs')
const parse = require('csv-parse')
const nodemailer = require('nodemailer')
const dayjs = require('dayjs')
const isToday = require('dayjs/plugin/isToday')

const CronJob = require('cron').CronJob

dayjs.extend(isToday)

async function sendMail (name, email) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL_ID,
      pass: process.env.GMAIL_APP_PASSWORD
    }
  })

  console.log(process.env.GMAIL_EMAIL_ID, process.env.GMAIL_APP_PASSWORD)

  const mailOptions = {
    from: process.env.GMAIL_EMAIL_ID,
    to: email,
    subject: `Happy Birthday ${name}! 🍰🎉🎊🎈`,
    text: ''
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error)
    } else {
      console.log(`[${dayjs().toString()}] Email sent: ${info.response}`)
    }
  })
}

function readCsv () {
  fs.createReadStream('list.csv')
    .pipe(parse())
    .on('data', async ([name, email, bday]) => {
      const parsedBday = dayjs(bday).set('year', dayjs().year()).startOf('date')
      if (parsedBday.isToday()) {
        await sendMail(name, email)
      }
    })
    .on('end', () => {
      console.log(`[${dayjs().toString()}] Done for today!!`)
    })
}

readCsv()

var job = new CronJob('0 0 * * *', readCsv, null, true, 'Asia/Kolkata')

job.start()
