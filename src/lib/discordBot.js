import { Client, GatewayIntentBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js'

class DiscordBotService {
  constructor() {
    this.client = null
    this.isConnected = false
    this.targetChannelId = null
    this.participationData = new Map() // Store participation data for each message
  }

  // Initialize the Discord bot
  async initialize(token, channelId) {
    try {
      this.targetChannelId = channelId
      
      this.client = new Client({
        intents: [
          GatewayIntentBits.Guilds,
          GatewayIntentBits.GuildMessages,
          GatewayIntentBits.GuildMessageReactions,
          GatewayIntentBits.MessageContent
        ]
      })

      // Set up event handlers
      this.setupEventHandlers()

      // Login to Discord
      await this.client.login(token)
      
      console.log('Discord bot connected successfully!')
      this.isConnected = true
      
      return true
    } catch (error) {
      console.error('Failed to initialize Discord bot:', error)
      this.isConnected = false
      return false
    }
  }

  // Set up Discord event handlers
  setupEventHandlers() {
    this.client.on('ready', () => {
      console.log(`Discord bot logged in as ${this.client.user.tag}!`)
    })

    this.client.on('messageReactionAdd', async (reaction, user) => {
      if (user.bot) return
      await this.handleReactionAdd(reaction, user)
    })

    this.client.on('messageReactionRemove', async (reaction, user) => {
      if (user.bot) return
      await this.handleReactionRemove(reaction, user)
    })

    this.client.on('error', (error) => {
      console.error('Discord bot error:', error)
    })

    this.client.on('disconnect', () => {
      console.log('Discord bot disconnected')
      this.isConnected = false
    })
  }

  // Handle reaction additions (user wants to participate)
  async handleReactionAdd(reaction, user) {
    try {
      // Fetch the message if it's partial
      if (reaction.partial) {
        await reaction.fetch()
      }

      const messageId = reaction.message.id
      const emoji = reaction.emoji.name

      // Only handle check mark and X reactions
      if (emoji !== '✅' && emoji !== '❌') return

      // Get or create participation data for this message
      if (!this.participationData.has(messageId)) {
        this.participationData.set(messageId, {
          participating: new Set(),
          notParticipating: new Set()
        })
      }

      const data = this.participationData.get(messageId)

      // Remove user from opposite list and add to appropriate list
      if (emoji === '✅') {
        data.notParticipating.delete(user.id)
        data.participating.add(user.id)
      } else if (emoji === '❌') {
        data.participating.delete(user.id)
        data.notParticipating.add(user.id)
      }

      // Update the embed with new participation counts
      await this.updateParticipationEmbed(reaction.message, data)

    } catch (error) {
      console.error('Error handling reaction add:', error)
    }
  }

  // Handle reaction removals (user removes their participation status)
  async handleReactionRemove(reaction, user) {
    try {
      if (reaction.partial) {
        await reaction.fetch()
      }

      const messageId = reaction.message.id
      const emoji = reaction.emoji.name

      if (emoji !== '✅' && emoji !== '❌') return

      const data = this.participationData.get(messageId)
      if (!data) return

      // Remove user from appropriate list
      if (emoji === '✅') {
        data.participating.delete(user.id)
      } else if (emoji === '❌') {
        data.notParticipating.delete(user.id)
      }

      // Update the embed
      await this.updateParticipationEmbed(reaction.message, data)

    } catch (error) {
      console.error('Error handling reaction remove:', error)
    }
  }

  // Update the participation embed with current counts
  async updateParticipationEmbed(message, participationData) {
    try {
      const embed = message.embeds[0]
      if (!embed) return

      const participatingCount = participationData.participating.size
      const notParticipatingCount = participationData.notParticipating.size

      // Create updated embed
      const updatedEmbed = EmbedBuilder.from(embed)
        .setFields(
          embed.fields.slice(0, -1), // Keep all fields except the last one (participation)
          {
            name: '👥 Participation Status',
            value: `✅ **Participating:** ${participatingCount}\n❌ **Not Participating:** ${notParticipatingCount}`,
            inline: false
          }
        )
        .setTimestamp()

      await message.edit({ embeds: [updatedEmbed] })

    } catch (error) {
      console.error('Error updating participation embed:', error)
    }
  }

  // Send boss notification to Discord
  async sendBossNotification(bossData) {
    try {
      if (!this.isConnected || !this.client || !this.targetChannelId) {
        throw new Error('Discord bot not connected or channel not configured')
      }

      const channel = await this.client.channels.fetch(this.targetChannelId)
      if (!channel) {
        throw new Error('Could not find target Discord channel')
      }

      // Create embed for boss notification
      const embed = this.createBossEmbed(bossData)

      // Send the message
      const message = await channel.send({ embeds: [embed] })

      // Add reaction emojis for participation
      await message.react('✅') // Check mark for participating
      await message.react('❌') // X mark for not participating

      // Initialize participation data for this message
      this.participationData.set(message.id, {
        participating: new Set(),
        notParticipating: new Set()
      })

      console.log('Boss notification sent to Discord successfully!')
      return {
        success: true,
        messageId: message.id,
        channelId: channel.id
      }

    } catch (error) {
      console.error('Error sending boss notification:', error)
      return {
        success: false,
        error: error.message
      }
    }
  }

  // Create Discord embed for boss notification
  createBossEmbed(bossData) {
    const embed = new EmbedBuilder()
      .setTitle(`🔥 Boss Alert: ${bossData.name || bossData.monster}`)
      .setColor(0xFF6B35) // Orange color for boss alerts
      .setDescription(`A boss is ready for hunting! React below to indicate your participation.`)
      .addFields(
        {
          name: '👹 Boss Name',
          value: bossData.monster || 'Unknown Boss',
          inline: true
        },
        {
          name: '⏰ Respawn Time',
          value: bossData.formattedTime || 'Unknown',
          inline: true
        },
        {
          name: '💰 Points',
          value: bossData.points ? `${bossData.points} pts` : 'Unknown',
          inline: true
        },
        {
          name: '📝 Notes',
          value: bossData.notes || 'No additional notes',
          inline: false
        },
        {
          name: '👥 Participation Status',
          value: '✅ **Participating:** 0\n❌ **Not Participating:** 0',
          inline: false
        }
      )
      .setFooter({
        text: 'React with ✅ to participate or ❌ to skip this boss'
      })
      .setTimestamp()

    // Add boss image if available
    if (bossData.image_url || bossData.display_image) {
      embed.setThumbnail(bossData.image_url || bossData.display_image)
    }

    return embed
  }

  // Get participation summary for a specific message
  getParticipationSummary(messageId) {
    const data = this.participationData.get(messageId)
    if (!data) {
      return {
        participating: 0,
        notParticipating: 0,
        participatingUsers: [],
        notParticipatingUsers: []
      }
    }

    return {
      participating: data.participating.size,
      notParticipating: data.notParticipating.size,
      participatingUsers: Array.from(data.participating),
      notParticipatingUsers: Array.from(data.notParticipating)
    }
  }

  // Disconnect the bot
  async disconnect() {
    if (this.client) {
      await this.client.destroy()
      this.isConnected = false
      console.log('Discord bot disconnected')
    }
  }

  // Check if bot is connected
  isReady() {
    return this.isConnected && this.client && this.client.readyAt
  }
}

// Create singleton instance
export const discordBot = new DiscordBotService()
export default discordBot
