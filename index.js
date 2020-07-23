const fs = require('fs')
const Discord = require('discord.js')
const client = new Discord.Client()
const { token } = require('./config.json')

let last = undefined

client.on('ready', () => {

  console.log(`Logged in as ${client.user.tag}!`);

})

client.on('message', msg => {

  switch (msg.content) {

    case 'perillafact+usage': {

      msg.channel.send(`
\`perillafact+usage\` -- this help
**\`perillafact\` -- print a random perillafact**
\`perillafact+count\` -- print the total count of verified perillafacts
\`perillafact+last\` -- you can show the index (0-based) of recent random perillafact printed
\`perillafact+exact <idx>\` -- print the perillafact of specified index
\`perillafact+leave\` -- do not use if you exactly know what are you doing
      `)
      break
    }

    case 'perillafact': {

      const dbdirents = fs.readdirSync('./db').sort()
      const dbfiles = dbdirents.map(e => `./db/${e}`)
      let next = Math.floor(Math.random() * dbfiles.length)
      if (dbfiles.length > 1 && last === next) {
        next = 1 + next
        if (next === dbfiles.length) next = 0
      }
      const dbrandfile = dbfiles[next]
      const dbrandcontent = fs.readFileSync(dbrandfile)
      msg.channel.send(dbrandcontent.toString())
      last = next
      break
    }

    case 'perillafact+count': {

      const dbdirents = fs.readdirSync('./db').sort()
      const dbfiles = dbdirents.map(e => `./db/${e}`)
      msg.channel.send(`Fact: ${dbfiles.length} perillafacts about mint verified.`)
      break
    }

    case 'perillafact+last': {

      if (last === undefined)
        msg.channel.send('No perillafact has been called upon.')
      else
        msg.channel.send(`Last perillafact (index not specified) was: # ${last}.`)
      break
    }

    case 'perillafact+leave': {

      msg.channel.send('bye').then(client.destroy)
      break
    }
  }

  const match = (/^perillafact\+exact\ ([0-9]+)$/).exec(msg.content)
  while (match !== null) {

    const idx = 1 * match[1]
    const dbdirents = fs.readdirSync('./db').sort()
    const dbfiles = dbdirents.map(e => `./db/${e}`)

    if (idx >= dbfiles.length) {
      msg.channel.send(`Error: only ${dbfiles.length} perillafacts are found yet, while requested perillafact # ${idx}`)
      break
    }

    const dbselfile = dbfiles[idx]
    const dbselcontent = fs.readFileSync(dbselfile)
    msg.channel.send(dbselcontent.toString())
    break
  }

})

client.login(token)

process.on('SIGINT', () => {

  console.log("\rCaught SIGINT. Exiting.")
  client.destroy()
  process.exit()

})
