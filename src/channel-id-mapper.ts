export function getChannelId(channelName: string): number {
  if (channelName === 'stable') {
    return 0;
  } else if (channelName === 'beta') {
    return 1;
  } else if (channelName === 'dev') {
    return 2;
  } else if (channelName === 'canary') {
    return 3;
  } else {
    throw new Error(`Unexpected channel name: '${channelName}'.`);
  }
}
