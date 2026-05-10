const ONLINE_WINDOW_MS = 5 * 60 * 1000;
const activeAccounts = new Map();

const getKey = (user) => `${user.role || 'user'}:${user.id}`;

const touchOnlineUser = (user) => {
  if (!user?.id) return;
  activeAccounts.set(getKey(user), {
    id: user.id,
    role: user.role || 'user',
    lastSeen: Date.now(),
  });
};

const pruneOnlineUsers = () => {
  const cutoff = Date.now() - ONLINE_WINDOW_MS;
  for (const [key, account] of activeAccounts.entries()) {
    if (account.lastSeen < cutoff) activeAccounts.delete(key);
  }
};

const getOnlineUserCount = () => {
  pruneOnlineUsers();
  return [...activeAccounts.values()].filter(account => account.role === 'user').length;
};

module.exports = {
  getOnlineUserCount,
  touchOnlineUser,
};
