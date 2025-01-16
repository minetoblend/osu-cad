import { type Drawable, resolved } from '@osucad/framework';
import { OsucadConfigManager } from '../../config/OsucadConfigManager';
import { OsucadSettings } from '../../config/OsucadSettings';
import { PreferencesPanel } from './PreferencesPanel';
import { PreferencesToggle } from './PreferencesToggle';

export class ViewportPreferencesSection extends PreferencesPanel {
  getTitle(): string {
    return 'Viewport';
  }

  @resolved(OsucadConfigManager)
  config!: OsucadConfigManager;

  createContent(): Drawable[] {
    return [
      new PreferencesToggle(
        'Hit animations',
        this.config.getBindable(OsucadSettings.HitAnimations)!,
      ),
      new PreferencesToggle(
        'Follow points',
        this.config.getBindable(OsucadSettings.FollowPoints)!,
      ),
      new PreferencesToggle(
        'Animated seek',
        this.config.getBindable(OsucadSettings.AnimatedSeek)!,
      ),
      new PreferencesToggle(
        'Compact timeline',
        this.config.getBindable(OsucadSettings.CompactTimeline)!,
      ),
      new PreferencesToggle(
        'Use native cursor',
        this.config.getBindable(OsucadSettings.NativeCursor)!,
      ),
      new PreferencesToggle(
        'Colored slider path lines',
        this.config.getBindable(OsucadSettings.SkinVisualizerColoredLines)!,
      ),
    ];
  }
}
