import type { ConfigKey } from './ConfigManager.ts';

export class OsucadSettings<T> implements ConfigKey<T> {
  __type__!: T;

  constructor(readonly name: string) {
  }

  static readonly Version = new OsucadSettings<number>('Version');
  static readonly Skin = new OsucadSettings<string>('Skin');

  static readonly MasterVolume = new OsucadSettings<number>('MasterVolume');
  static readonly MusicVolume = new OsucadSettings<number>('MusicVolume');
  static readonly HitsoundVolume = new OsucadSettings<number>('HitsoundVolume');
  static readonly UIVolume = new OsucadSettings<number>('UIVolume');
  static readonly AudioOffset = new OsucadSettings<number>('AudioOffset');
  static readonly HitSoundOffset = new OsucadSettings<number>('HitSoundOffset');
  static readonly UseAudioStreaming = new OsucadSettings<boolean>('UseAudioStreaming');

  static readonly HitAnimations = new OsucadSettings<boolean>('HitAnimations');
  static readonly FollowPoints = new OsucadSettings<boolean>('FollowPoints');
  static readonly SampleSetExpanded = new OsucadSettings<boolean>('SampleSetExpanded');
  static readonly AnimatedSeek = new OsucadSettings<boolean>('AnimatedSeek');
  static readonly CompactTimeline = new OsucadSettings<boolean>('CompactTimeline');
  static readonly NativeCursor = new OsucadSettings<boolean>('NativeCursor');

  static readonly SongSelectPreventLoadOnScroll = new OsucadSettings<boolean>('SongSelectPreventLoadOnScroll');
  static readonly SongSelectParallax = new OsucadSettings<boolean>('SongSelectParallax');
  static readonly SongSelectBackgroundBlur = new OsucadSettings<boolean>('SongSelectBackgroundBlur');
}
