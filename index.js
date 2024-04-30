import 'dotenv/config'
import { Bot, InlineKeyboard, GrammyError, HttpError } from 'grammy'
import { hydrate } from '@grammyjs/hydrate'
import data from './data.js'

const bot = new Bot(process.env.BOT_API_KEY)
bot.use(hydrate())

// КОМАНДЫ
bot.api.setMyCommands([
   { command: 'start', description: 'Начать' },
   { command: 'support', description: 'Обратиться в техподдержку' },
])

// КЛАВИАТУРЫ
const menuKbrd = new InlineKeyboard().text('Каталог', 'catalog').text('Корзина', 'cart').text('Мои заказы', 'orders')
const catalogKeybrd = new InlineKeyboard().text('По фактуре', 'texture').row().text('Эксклюзивные', 'exclusive').row().text('С подсветкой', 'lightning').row().text('<< Назад', 'start')
const textureKeybrd = new InlineKeyboard()
const exclusiveKeybrd = new InlineKeyboard()
const lightningKeybrd = new InlineKeyboard()

// НАПОЛНЕНИЕ КНОПКАМИ КЛАВИАТУР
data.texture.forEach(val => textureKeybrd.text(val.name, val.path).row())
data.exclusive.forEach(val => exclusiveKeybrd.text(val.name, val.path).row())
data.lightning.forEach(val => lightningKeybrd.text(val.name, val.path).row())

// КОМАНДЫ
bot.command('start', async (ctx) => {
   await ctx.reply(`<b>${ctx.from.first_name}, добро пожаловать в магазин <a href='https://arsen-project.onrender.com/#/'>JBY-Group</a>!</b>`, {
      reply_markup: menuKbrd,
      parse_mode: 'HTML'
   })
   ctx.react("❤")
});
// доделать
bot.command('support', async (ctx) => {
   await ctx.reply('')
});


// КОЛЛБЕКИ
bot.callbackQuery('catalog', async (ctx) => {
   await ctx.callbackQuery.message.editText('Выберите интересующую Вас категорию', {
      reply_markup: catalogKeybrd
   })
   await ctx.answerCallbackQuery()
});
bot.callbackQuery('start', async (ctx) => {
   await ctx.callbackQuery.message.editText('Выберите пункт меню', {
      reply_markup: menuKbrd
   })
   await ctx.answerCallbackQuery()
});


// РАЗНЫЕ СЛУШАТЕЛИ
bot.on('msg', async(ctx) => {
   await ctx.reply('jby')
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