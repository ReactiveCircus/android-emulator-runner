import * as mapper from '../src/channel-id-mapper';

describe('channel id mapper tests', () => {
  it('Throws if channelName is unknown', () => {
    const func = () => {
      mapper.getChannelId('unknown-channel');
    };
    expect(func).toThrowError(`Unexpected channel name: 'unknown-channel'.`);
  });

  it('Returns expected channelId from channelName', () => {
    expect(mapper.getChannelId('stable')).toBe(0);
    expect(mapper.getChannelId('beta')).toBe(1);
    expect(mapper.getChannelId('dev')).toBe(2);
    expect(mapper.getChannelId('canary')).toBe(3);
  });
});
