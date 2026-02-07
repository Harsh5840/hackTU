import { Telegraf } from 'telegraf';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || '';

console.log('Token present:', !!token);
console.log('Token length:', token.length);
console.log('Starting simple bot test...\n');

const bot = new Telegraf(token);

bot.command('start', (ctx) => {
  ctx.reply('Hello from Modern Colours! 🎉');
});

console.log('Bot configured, launching...');

bot.launch()
  .then(() => {
    console.log('✅✅✅ Bot started successfully!');
    console.log('➡️  Open Telegram and go to: https://t.me/ModernColoursBot');
    console.log('➡️  Send /start to test');
    console.log('\nPress Ctrl+C to stop\n');
  })
  .catch((error) => {
    console.error('❌ ERROR starting bot:');
    console.error('Message:', error.message);
    console.error('Code:', error.code);
    console.error('Full error:', error);
    process.exit(1);
  });

// Graceful stop
process.once('SIGINT', () => {
  console.log('\nStopping bot...');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('\nStopping bot...');
  bot.stop('SIGTERM');
});
