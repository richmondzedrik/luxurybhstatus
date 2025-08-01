# Discord Bot Setup Guide

This guide will help you set up the Discord bot for boss monitoring notifications.

## Prerequisites

1. A Discord server where you want to receive boss notifications
2. Administrator permissions on that Discord server
3. Node.js installed on your system

## Step 1: Create a Discord Application

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application"
3. Give your application a name (e.g., "Boss Monitor Bot")
4. Click "Create"

## Step 2: Create a Bot

1. In your application, go to the "Bot" section in the left sidebar
2. Click "Add Bot"
3. Confirm by clicking "Yes, do it!"
4. Under the "Token" section, click "Copy" to copy your bot token
5. **Important**: Keep this token secret and never share it publicly

## Step 3: Set Bot Permissions

1. In the "Bot" section, scroll down to "Privileged Gateway Intents"
2. Enable the following intents:
   - Message Content Intent (required for reading message content)
3. Save your changes

## Step 4: Invite Bot to Your Server

1. Go to the "OAuth2" section in the left sidebar
2. Click on "URL Generator"
3. Under "Scopes", select:
   - `bot`
4. Under "Bot Permissions", select:
   - Send Messages
   - Use External Emojis
   - Add Reactions
   - Read Message History
   - View Channels
5. Copy the generated URL and open it in a new tab
6. Select your Discord server and authorize the bot

## Step 5: Get Channel ID

1. In Discord, enable Developer Mode:
   - Go to User Settings (gear icon)
   - Go to Advanced
   - Enable "Developer Mode"
2. Right-click on the channel where you want boss notifications
3. Click "Copy ID"
4. This is your Channel ID

## Step 6: Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file and add your Discord configuration:
   ```env
   DISCORD_BOT_TOKEN=your_bot_token_here
   DISCORD_CHANNEL_ID=your_channel_id_here
   ```

## Step 7: Start the Discord Bot Server

You have several options to run the Discord bot:

### Option 1: Run Bot Server Only
```bash
npm run discord-bot
```

### Option 2: Run Both Web App and Bot Server
```bash
npm run dev-with-bot
```

### Option 3: Run Separately (in different terminals)
Terminal 1 (Web App):
```bash
npm run dev
```

Terminal 2 (Discord Bot):
```bash
npm run discord-bot
```

## Step 8: Configure in Admin Panel

1. Open your web application
2. Go to Admin Panel → Discord Bot
3. Enter your bot token and channel ID
4. Click "Connect Bot"
5. Test the connection by clicking "Test Connection"

## Usage

Once everything is set up:

1. Go to the Boss Monitor page
2. When a boss is available, you'll see a "Send to Discord" button
3. Click the button to send a notification to your Discord channel
4. Team members can react with ✅ (to participate) or ❌ (to skip)
5. The message will update in real-time showing:
   - **Participation Status**: Always visible, showing who is participating and who is not
   - **User Names**: Shows actual Discord usernames of participants (up to 10 each)
   - **Quick Stats**: Total responses and participation rate percentage
   - **Real-time Updates**: Automatically updates when reactions are added/removed

## Troubleshooting

### Bot Not Responding
- Check that the bot token is correct
- Ensure the bot has proper permissions in your Discord server
- Verify the channel ID is correct

### "Discord bot server is not running" Error
- Make sure you've started the Discord bot server (`npm run discord-bot`)
- Check that port 3001 is not being used by another application
- Look at the console output for any error messages

### Permission Errors
- Ensure the bot has the required permissions in your Discord server
- Check that the bot can see and send messages in the target channel

### Connection Issues
- Verify your internet connection
- Check Discord's status page for any outages
- Ensure your firewall isn't blocking the connection

## Security Notes

- Never share your bot token publicly
- Keep your `.env` file out of version control
- Only give the bot the minimum required permissions
- Regularly rotate your bot token if needed

## Support

If you encounter issues:
1. Check the console output for error messages
2. Verify all configuration steps were followed correctly
3. Test with a simple Discord channel first
4. Check Discord's developer documentation for additional help
