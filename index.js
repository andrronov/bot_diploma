import 'dotenv/config'
import { Bot, InlineKeyboard, GrammyError, HttpError } from 'grammy'
import { hydrate } from '@grammyjs/hydrate'
import data from './data.js'

const bot = new Bot(process.env.BOT_API_KEY)
bot.use(hydrate())

bot.api.setMyCommands([
   { command: 'start', description: 'Начать' },
   { command: 'support', description: 'Обратиться в техподдержку' },
   { command: 'test', description: 'test' },
])

const menuKbrd = new InlineKeyboard().text('Каталог', 'catalog').text('Корзина', 'cart').text('Мои заказы', 'orders')
const backKeybrd = new InlineKeyboard().text('Назад', 'back')
const catalogKeybrd = new InlineKeyboard()

let catalogButtons = []
// for(let i = 0; i < Object.keys(data).length; i++){
   // for(let j = 0; Object.keys(data)[i]; j++){
      // catalogButtons[Object.keys(data)[i]] = ['a']
   // }
// }
catalogButtons.forEach(but => {
   catalogKeybrd.text(but.name, but.path).row()
})
console.log(catalogButtons);
// bot.command('start', async (ctx) => {
//    await ctx.reply('Добро пожаловать!', {
//       reply_markup: menuKbrd
//    })
//    ctx.react("❤")
// });

bot.command('test', async (ctx) => {
   await ctx.reply('test', {
      reply_markup: catalogKeybrd
   })
})

bot.callbackQuery('catalog', async (ctx) => {
   await ctx.callbackQuery.message.editText('Пизда', {
      reply_markup: menuKbrd
   })
   await ctx.answerCallbackQuery()
   // await ctx.reply('Вот наш каталог товаров:');
});

// bot.command('start', async(ctx) => {
//    await ctx.reply('Хули надо мудак')
// })

bot.on('msg', async(ctx) => {
   await ctx.reply('Пошел нахуй')
})

bot.catch((err) => {
   const ctx = err.ctx;
   console.error(`Error while handling update ${ctx.update.update_id}:`);
   const e = err.error;
   if (e instanceof GrammyError) {
     console.error("Error in request:", e.description);
   } else if (e instanceof HttpError) {
     console.error("Could not contact Telegram:", e);
   } else {
     console.error("Unknown error:", e);
   }
 });

bot.start()