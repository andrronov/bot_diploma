import 'dotenv/config'
import { Bot, InlineKeyboard, GrammyError, HttpError, session } from 'grammy'
import { hydrate } from '@grammyjs/hydrate'
import data from './data.js'

const bot = new Bot(process.env.BOT_API_KEY)
bot.use(hydrate())

// КОМАНДЫ
bot.api.setMyCommands([
   { command: 'start', description: 'Начать' },
   { command: 'support', description: 'Обратиться в техподдержку' },
])

// ДАННЫЕ СЕССИИ
function initial() {
   return { isName: false, isPhone: false };
 }
 bot.use(session({ initial }));

 let userName, userPhone

 // КЛАВИАТУРЫ
const menuKbrd = new InlineKeyboard().text('Каталог', 'catalog').row().text('О нас', 'cart').text('Наш сайт', 'orders')
//это основная клава с категорией подсветки const catalogKeybrd = new InlineKeyboard().text('По фактуре', 'texture').row().text('Эксклюзивные', 'exclusive').row().text('С подсветкой', 'lightning').row().text('Не знаете, что выбрать?', 'what_choose').row().text('<< Назад', 'start')
const catalogKeybrd = new InlineKeyboard().text('По фактуре', 'texture').row().text('Эксклюзивные', 'exclusive').row().text('Не определились с выбором?', 'what_choose').row().text('<< Назад', 'start')
const textureKeybrd = new InlineKeyboard().row().text('<< Назад', 'catalog')
const exclusiveKeybrd = new InlineKeyboard().row().text('<< Назад', 'catalog')
const lightningKeybrd = new InlineKeyboard().row().text('<< Назад', 'catalog')
// доработать
const buyKeybrd = new InlineKeyboard().text('Заказать', 'buy').row().text('< Назад', 'catalog_delete')
const backKeybrd = new InlineKeyboard().text('<< Назад', 'catalog_delete')

const categotyKeyboards = {textureKeybrd, exclusiveKeybrd, lightningKeybrd}

// НАПОЛНЕНИЕ КНОПКАМИ КЛАВИАТУР
Object.keys(data).forEach(type => {
   data[type].forEach(val => {
      categotyKeyboards[type + 'Keybrd'].text(val.name, val.path).row()
   })
})

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
bot.callbackQuery('buy', async (ctx) => {
   await ctx.deleteMessage()
   await ctx.reply('Введите Ваше имя:', {
      reply_markup: backKeybrd,
   })
   ctx.session.isName = true
   await ctx.answerCallbackQuery()
});
bot.callbackQuery('what_choose', async (ctx) => {
   await ctx.callbackQuery.message.editText('<b>Не можете определиться с выбором?</b> Не беспокойтесь, это нормально! Натяжные потолки — это важный элемент интерьера, который служит долгие годы. Мы предлагаем бесплатную консультацию, чтобы помочь вам выбрать идеальный вариант, который будет соответствовать вашим вкусам и потребностям. Наши специалисты готовы ответить на все ваши вопросы и предложить лучшие решения, исходя из вашего бюджета и стиля интерьера. <b>Свяжитесь с нами сегодня!</b>', {
      reply_markup: new InlineKeyboard().text('Оставить заявку', 'buy').row().text('<< Назад', 'catalog'),
      parse_mode: 'HTML'
   })
   await ctx.answerCallbackQuery()
});


// Определение циклом категорий
Object.keys(data).forEach(category => {
   const keyboardName = category + 'Keybrd'
   const keyboard = categotyKeyboards[keyboardName]
   bot.callbackQuery(category, async (ctx) => {
      await ctx.callbackQuery.message.editText('Выберите тип потолка', {
         reply_markup: keyboard
      })
      await ctx.answerCallbackQuery()
   })
   // Определение циклом типов потолков
   data[category].forEach(type => {
      const captionText = `${type.description} \n \n <b>Цена от: ${type.price} руб/м2</b>`
      bot.callbackQuery(type.path, async (ctx) => {
         await ctx.replyWithPhoto(type.img, {caption: captionText, parse_mode: 'HTML', reply_markup: buyKeybrd})
         await ctx.answerCallbackQuery()
      })
   })
})

// возврат назад - удаление сообщения
bot.callbackQuery('catalog_delete', async (ctx) => {
   ctx.session.isName = false
   ctx.session.isPhone = false
   await ctx.deleteMessage()
})

// РАЗНЫЕ СЛУШАТЕЛИ
bot.on('msg', async (ctx) => {
   console.log(ctx.message.text)
   if(ctx.session.isName && ctx.session.isPhone){
      userPhone = ctx.message.text
      await bot.api.sendMessage(-1002060568122, `Заявка! \n Имя: ${userName}, Телефон: ${userPhone}`)
      await ctx.reply(`<b>Заявка принята!</b> \n Имя: ${userName}, Телефон: ${userPhone} \n Ожидайте обратной связи!`, {
         parse_mode: 'HTML'
      })
   } else if (ctx.session.isName){
      userName = ctx.message.text
      await ctx.reply('Номер телефона:', {
         reply_markup: backKeybrd
      })
      ctx.session.isPhone = true
   } else {
      await ctx.reply('Я не понимаю Вас. Пожалуйста, используйте кнопки навигации')
   }
})

// bot.on('msg', async(ctx) => {
//    if(ctx.session.isName){
//       userName = ctx.message.text
//       console.log(userName)
//       await ctx.reply('Номер телефона:', {
//          reply_markup: backKeybrd
//       })
//       ctx.session.isPhone = true
//    } else {
//       await ctx.reply('Я не понимаю Вас. Пожалуйста, используйте кнопки навигации')
//    }
// })

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