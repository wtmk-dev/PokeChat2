const { RefreshingAuthProvider } = require('@twurple/auth');
const { ApiClient } = require('@twurple/api');
const { PubSubClient } = require('@twurple/pubsub');
const fs = require('fs');
require('dotenv').config();

const tokenData = JSON.parse(fs.readFileSync('./tokens.json', 'utf8'));
const clientId = process.env.U_CLIENT_ID;
const clientSecret = process.env.U_CLIENT_SECRETE;

const authProvider = new RefreshingAuthProvider(
  {
    clientId,
    clientSecret,
    onRefresh: async (newTokenData) => {
      fs.writeFileSync('./tokens.json', JSON.stringify(newTokenData, null, 2));
    }
  },
  tokenData
);

authProvider.onRefreshFailure((userId, err) => {
  console.error("⚠️ Token refresh failed:", err);
});

const apiClient = new ApiClient({ authProvider });
const pubSubClient = new PubSubClient({ authProvider });

(async () => {
  const user = await apiClient.users.getUserByName(process.env.CHANNEL);
  if (!user) return console.error('⚠️ Channel not found.');

  await pubSubClient.onRedemption(user.id, (message) => {
    console.log(`🎯 ${message.userDisplayName} redeemed ${message.rewardTitle}`);
    // Your game logic here
  });

  console.log(`✅ Listening for redemptions on channel: ${user.displayName}`);
})();
