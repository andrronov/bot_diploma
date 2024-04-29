import 'dotenv/config'
import { Bot } from 'grammy'

const bot = new Bot(process.env.BOT_API_KEY)

bot.command('start', async(ctx) => {
   await ctx.reply('Хули надо мудак')
})

bot.on('msg', async(ctx) => {
   await ctx.reply('Пошел нахуй')
})

bot.start()