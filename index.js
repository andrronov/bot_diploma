import 'dotenv/config'
import { Bot, InlineKeyboard, GrammyError, HttpError, session } from 'grammy'
import { hydrate } from '@grammyjs/hydrate'
import { data, admins_id } from './data.js'

const bot = new Bot(process.env.BOT_API_KEY)
bot.use(hydrate())

// КОМАНДЫ
bot.api.setMyCommands([
   { command: 'start', description: 'Начать' },
   { command: 'support', description: 'Обратиться в техподдержку' },
])

// ДАННЫЕ СЕССИИ
function initial() {
   return { isName: false, isPhone: false, isSupportMode: false };
 }
 bot.use(session({ initial }));

let userName, userPhone, userOption = 'Не определён'

 // КЛАВИАТУРЫ
const menuKbrd = new InlineKeyboard().text('Каталог', 'catalog').row().text('О нас', 'us').text('Наш сайт', 'our_cite')
const catalogKeybrd = new InlineKeyboard().text('По фактуре', 'texture').row().text('Эксклюзивные', 'exclusive').row().text('Не определились с выбором?', 'what_choose').row().text('<< Назад', 'start')
const textureKeybrd = new InlineKeyboard().row().text('<< Назад', 'catalog')
const exclusiveKeybrd = new InlineKeyboard().row().text('<< Назад', 'catalog')
const buyKeybrd = new InlineKeyboard().text('Заказать', 'buy').row().text('< Назад', 'catalog_delete')
const backKeybrd = new InlineKeyboard().text('<< Назад', 'catalog_delete')

const categoryKeyboards = {textureKeybrd, exclusiveKeybrd}

// НАПОЛНЕНИЕ КНОПКАМИ КЛАВИАТУР ДЛЯ ПОТОЛКОВ ИЗ КАТЕГОРИИ
Object.keys(data).forEach(type => {
   data[type].forEach(val => {
      categoryKeyboards[type + 'Keybrd'].text(val.name, val.path).row()
   })
})

// КОМАНДЫ
bot.command('start', async (ctx) => {
   await ctx.reply(`<b>${ctx.from.first_name}, добро пожаловать в магазин <a href='https://jby-group.onrender.com/#/'>JBY-Group</a>!</b>`, {
      reply_markup: menuKbrd,
      parse_mode: 'HTML'
   })
   ctx.react("❤")
});

bot.command('support', async (ctx) => {
   await ctx.reply('У Вас есть вопрос? Напишите его одним сообшением, и наш администратор ответит Вам как можно скорее!', {
      reply_markup: backKeybrd
   })
   ctx.session.isSupportMode = true
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

bot.callbackQuery('us', async (ctx) => {
   await ctx.replyWithPhoto('https://yandex-images.clstorage.net/4rv7S2z41/0aa9e9KWL/m8W-VL8oUZX1r8C2TOSvVe--gpf_0ydC4X4TP3YD7HUZDziMVIJbLLqkx4cWd7N5X9h3AOcfabA-tY62ddgIu2sVO7TSkWmsqL6EAv1YH81eOi43W2eLR91-F3orJ7Bw0eIcrBhCQtlL_VbS5xLuBb_AH4TCm60IEiGSjh1ELYvT1csdJpDpVdFv5CaVUNOtEt7qswvvuzuZbrc6bkdsBPWr0ORYsga9S42yBu8eTv2jxG-8aqNNZEY9yvIRTI1r66n3lWY00f2VO3BGPWzXTcbCtpenX3Ozda6v2gY3qPB1X5TA5FKqdUOpst6XDiZdl6DLVN6fpeTOlX6-FUjl8_vhMykSsPGN0a-UIlVYL_meImoD4xs_O0WOz6ZCy5BgoRskaPjSRgFjIboe_y6OIVcsp-iay1UEyrk6thnUHU_Xsed5hvB1JTW_jK6JxIf1nsK2d0Ob--vtzoOq1gtMeImTeBRU0lIJXw2qblP-YuHfjA_8ctOdjEapEqrxxEEDz-G7DQ64BZ1972jWhZiv-X4iUg9_C5e3dUqPVo7TLBAltzgk_BpuHbO5xmbjfkYdewBLsBbzGcy66YoWbdC583-Rl_VazA1JKWfIbtXUo62GCqqfg2d3L0H2s6rSTzgskTeM8OiGloHLtVZie_7a3ZfMb6gCj70oUtnChjlQ7c8fmXuZtsz9cZU7VC7pmAvtHtIiWyOrHwPRHjteqn-4xJEXeMCoRqoVR2FSfk96rhGvmFeAShtVFLYR_g4JcCGL4103ETpMwZUlx2xmiVALzZZKOrdnC6vD5SavjtqH7OQ9T8xwEJ6ejT8xWt7v5vbhu9SbuAYDBay25WpqNXitm1MNR3mGqP1tFa8Q0hXQB-Fivs4f-xePl10KQ6IKN6BMGTfElNhWYtFzuTrSf4Z2HZPEmxAy9wXI1pkm2p2YVZMbtVuRStRtLTXrzDIJzB9BMorqF3fH93vF5ovybq-w',{
      reply_markup: backKeybrd, caption: '«JBY-Group» выполняет качественную установку натяжных потолков. Мы работаем оперативно и аккуратно, а стоимость услуг находится на доступном уровне. Компания, работающая на рынке Москвы и Московской области, была создана в 2013 году. Однако за нашими плечами стоит большой опыт, более 12 лет оказывания услуги по монтажу натяжных потолков. \n Выполняя заказ, мы гарантируем качество натяжных потолков. Многие клиенты отмечают высокие как профессиональные, так и личностные качества сотрудников «JBY-Group». Мы открыты, вежливы, доброжелательны и внимательны, поэтому сотрудничать с нами – одно удовольствие. \n Такая работа вызывает позитивный отклик: исследования показывают, что нашей деятельностью довольны 98,8 % клиентов. При этом более 78 % оценили ее высшим баллом, оставшись довольными результатами работы грамотных специалистов. \n Мы стремимся поддерживать свою репутацию на таком же высоком уровне, не удовлетворяясь уже достигнутыми вершинами.'})
   await ctx.answerCallbackQuery()
});
bot.callbackQuery('our_cite', async (ctx) => {
   await ctx.replyWithPhoto('https://jby-group.ru/wp-content/themes/jby-theme/assets/images/logo.png',{
      reply_markup: backKeybrd, parse_mode: 'HTML', caption: '<a href="https://jby-group.onrender.com">Посетите наш сайт</a>, чтобы увидеть полный ассортимент натяжных потолков, которые мы предлагаем. На сайте вы найдете подробные описания и фотографии наших работ, что поможет вам сделать правильный выбор. Наш сайт предоставляет удобный интерфейс для ознакомления с различными вариантами и стилями потолков, а также вы можете оставить заявку прямо там. Переходите на сайт «JBY-Group» и убедитесь в качестве и разнообразии наших услуг! \n \n <a href="https://jby-group.onrender.com">JBY-Group</a>'})
   await ctx.answerCallbackQuery()
});


// Определение циклом категорий
Object.keys(data).forEach(category => {
   const keyboardName = category + 'Keybrd'
   const keyboard = categoryKeyboards[keyboardName]
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
         userOption = type.name
         await ctx.replyWithPhoto(type.img, {caption: captionText, parse_mode: 'HTML', reply_markup: buyKeybrd})
         await ctx.answerCallbackQuery()
      })
   })
})

// возврат назад - удаление сообщения
bot.callbackQuery('catalog_delete', async (ctx) => {
   ctx.session.isName = false
   ctx.session.isPhone = false
   ctx.session.isSupportMode = false
   await ctx.deleteMessage()
})

// РАЗНЫЕ СЛУШАТЕЛИ
bot.on('msg', async (ctx) => {
   // Ответ службы поддержки
   if(ctx.chat.id == process.env.BOT_CHANNEL){
      let origin_chat_id = ctx.msg.reply_to_message.text.split('Chat_id: ')[1]
      return bot.api.sendMessage(origin_chat_id, `Ответ службы поддержки на Ваше обращение! \n \n <b>${ctx.update.channel_post.text}</b>`, {parse_mode: 'HTML'})
   }
   if(ctx.session.isName && ctx.session.isPhone){
      userPhone = ctx.message.text
      await bot.api.sendMessage(process.env.BOT_CHANNEL, `Заявка! \n Имя: <b>${userName}</b> \n <b>Телефон: ${userPhone}</b> \n <b>Пользователь: @${ctx.from.username}</b> \n <b>Выбранный потолок: ${userOption}</b>`, {parse_mode: 'HTML'})
      await ctx.reply(`<b>Заявка принята!</b> \n Имя: ${userName} \n Телефон: ${userPhone} \n Выбранный потолок: ${userOption} \n \n <b>Ожидайте обратной связи!</b>`, {
         parse_mode: 'HTML',
         reply_markup: new InlineKeyboard().text('В меню', 'start')
      })
      ctx.session.isName = false
      ctx.session.isPhone = false
   } else if (ctx.session.isName){
      userName = ctx.message.text
      await ctx.reply('Номер телефона:', {
         reply_markup: backKeybrd
      })
      ctx.session.isPhone = true
   } else if (ctx.session.isSupportMode){
      await ctx.reply('Вопрос отправлен, ответ придет очень скоро!', {
         reply_markup: new InlineKeyboard().text('В меню', 'start')
      })
      await bot.api.sendMessage(process.env.BOT_CHANNEL, `Обращение в поддержку! \n <b>Пользователь: @${ctx.from.username}</b> \n <b>${ctx.message.text}</b> \n Chat_id: ${ctx.chat.id}`, {
         parse_mode: 'HTML'
      })
      ctx.session.isSupportMode = false
   } else {
      await ctx.reply('Я не понимаю Вас. Пожалуйста, используйте кнопки навигации', {
         reply_markup: new InlineKeyboard().text('< В меню', 'start')
      })
   }
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