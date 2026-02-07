import { TelegramBotService } from './services/telegram.service';
import dotenv from 'dotenv';

dotenv.config();

const token = process.env.TELEGRAM_BOT_TOKEN || '';

console.log('Token:', token ? `${token.substring(0, 10)}...` : 'NOT FOUND');
console.log('Starting bot test...');

const bot = new TelegramBotService(token);

bot.start()
  .then(() => {
    console.log('✅ Bot started successfully!');
    console.log('Go to Telegram and send /start to your bot');
    console.log('Bot username: @ModernColoursBot');
    console.log('\nPress Ctrl+C to stop');
  })
  .catch((error) => {
    console.error('❌ Bot failed to start:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  });

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping bot...');
  bot.stop();
  process.exit(0);
});
