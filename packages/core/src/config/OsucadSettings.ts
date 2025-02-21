import type { ConfigKey } from './ConfigManager';

export class OsucadSettings<T> implements ConfigKey<T> {
  __type__!: T;

  constructor(readonly name: string) {
  }

  static readonly Version = new OsucadSettings<number>('Version');
  static readonly Skin = new OsucadSettings<string | null>('Skin');
  static readonly UseSkinHitSounds = new OsucadSettings<boolean>('UseSkinHitSounds');
  static readonly UseBeatmapSkins = new OsucadSettings<boolean>('UseBeatmapSkins');

  static readonly MasterVolume = new OsucadSettings<number>('MasterVolume');
  static readonly MusicVolume = new OsucadSettings<number>('MusicVolume');
  static readonly HitsoundVolume = new OsucadSettings<number>('HitsoundVolume');
  static readonly UIVolume = new OsucadSettings<number>('UIVolume');
  static readonly AudioOffset = new OsucadSettings<number>('AudioOffset');
  static readonly HitSoundOffset = new OsucadSettings<number>('HitSoundOffset');
  static readonly UseAudioStreaming = new OsucadSettings<boolean>('UseAudioStreaming');

  static readonly Antialiasing = new OsucadSettings<boolean>('Antialiasing');

  static readonly HitAnimations = new OsucadSettings<boolean>('HitAnimations');
  static readonly SnakingInSliders = new OsucadSettings<boolean>('SnakingInSliders');
  static readonly SnakingOutSliders = new OsucadSettings<boolean>('SnakingOutSliders');
  static readonly FollowPoints = new OsucadSettings<boolean>('FollowPoints');
  static readonly SampleSetExpanded = new OsucadSettings<boolean>('SampleSetExpanded');
  static readonly AnimatedSeek = new OsucadSettings<boolean>('AnimatedSeek');
  static readonly CompactTimeline = new OsucadSettings<boolean>('CompactTimeline');
  static readonly BeatmapComboColors = new OsucadSettings<boolean>('BeatmapComboColors');
  static readonly BeatmapHitSounds = new OsucadSettings<boolean>('BeatmapHitSounds');
  static readonly NativeCursor = new OsucadSettings<boolean>('NativeCursor');
  static readonly PlayIntroSequence = new OsucadSettings<boolean>('PlayIntroSequence');
  static readonly ShowGameplayCursor = new OsucadSettings<boolean>('ShowGameplayCursor');

  static readonly SkinVisualizerColoredLines = new OsucadSettings<boolean>('SkinVisualizerColoredLines');

  static readonly SongSelectPreventLoadOnScroll = new OsucadSettings<boolean>('SongSelectPreventLoadOnScroll');
  static readonly SongSelectParallax = new OsucadSettings<boolean>('SongSelectParallax');
  static readonly SongSelectBackgroundBlur = new OsucadSettings<boolean>('SongSelectBackgroundBlur');
}
