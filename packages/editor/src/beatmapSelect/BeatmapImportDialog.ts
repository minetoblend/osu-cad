import type { ScreenExitEvent } from 'osucad-framework';
import {
  Action,
  Anchor,
  Axes,
  Bindable,
  CompositeDrawable,
  Container,
  RoundedBox,
  clamp,
  dependencyLoader,
  resolved,
} from 'osucad-framework';
import gsap from 'gsap';
import { BackdropBlurFilter } from 'pixi-filters';
import type { BeatmapImportProgress, MapsetInfo as MapsetInfoDto } from '@osucad/common';
import { BeatmapAccess } from '@osucad/common';
import axios from 'axios';
import { Dialog } from '../modals/Dialog';
import { ThemeColors } from '../editor/ThemeColors';
import { OsucadSpriteText } from '../OsucadSpriteText';
import type { MapsetInfo } from '../beatmaps/MapsetInfo';
import { OnlineBeatmapInfo } from '../beatmaps/OnlineBeatmapInfo';

type UploadStatus =
  | BeatmapImportProgress
  | {
    status: 'uploading';
    progress: number;
  };

export class BeatmapImportDialog extends Dialog {
  constructor(readonly file: File) {
    super();
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  #progress!: UploadProgressBar;

  #background!: RoundedBox;

  #content!: Container;

  @dependencyLoader()
  load() {
    this.masking = true;

    const filter = new BackdropBlurFilter({
      strength: 15,
      quality: 3,
    });
    filter.padding = 30;

    this.filters = [filter];

    this.addInternal(this.#content = new Container({
      anchor: Anchor.Center,
      origin: Anchor.Center,
      width: 200,
      height: 100,
      children: [
        this.#background = new RoundedBox({
          relativeSizeAxes: Axes.Both,
          color: this.colors.translucent,
          cornerRadius: 25,
          alpha: 0.7,
        }),
        this.#progress = new UploadProgressBar(),
        this.#uploadText = new OsucadSpriteText({
          text: 'Uploading...',
          color: this.colors.text,
          fontSize: 12,
          alpha: 0,
          x: 20,
          y: 25,
        }),
      ],
    }));

    this.playEntryAnimation();

    this.schedule(() => this.uploadFile());
  }

  uploadFinished = new Action<MapsetInfo>();

  async uploadFile() {
    const formData = new FormData();
    formData.append('file', this.file);

    const response = await axios.post('/api/beatmaps/import', formData, {
      method: 'POST',
      onUploadProgress: (progressEvent) => {
        const progress = progressEvent.loaded / (progressEvent.total ?? this.file.size);

        this.status.value = {
          status: 'uploading',
          progress,
        };
        this.#progress.progress = progress;
      },
    });

    this.#uploadText.text = 'Processing...';

    const job = response.data.job;

    const eventSource = new EventSource(`/api/beatmaps/import/events/${job}`, {
      withCredentials: true,
    });

    eventSource.onmessage = async (event) => {
      const data = JSON.parse(event.data) as BeatmapImportProgress;
      this.status.value = data;

      if (data.status === 'done') {
        eventSource.close();

        const response = await axios.get<MapsetInfoDto>(`/api/mapsets/${data.mapsetId}`, {
          withCredentials: true,
        });

        this.uploadFinished.emit({
          id: response.data.id,
          beatmaps: response.data.beatmaps.map((b) => {
            return new OnlineBeatmapInfo({
              id: b.id,
              artist: response.data.artist,
              title: response.data.title,
              creator: response.data.creator,
              access: BeatmapAccess.MapsetOwner,
              isOwner: true,
              version: b.name,
              setId: response.data.id,
              lastEdited: '',
              starRating: b.starRating,
              links: {
                audioUrl: b.links.audioUrl,
                thumbnailLarge: b.links.thumbnailLarge,
                thumbnailSmall: b.links.thumbnailSmall,
                view: b.links.self,
                edit: b.links.edit,
              },

            });
          }),
          artist: response.data.artist,
          title: response.data.title,
          creator: response.data.creator,
          thumbnailLarge: response.data.links.thumbnailLarge,
          thumbnailSmall: response.data.links.thumbnailSmall,
        });

        this.exit();
      }
    };
  }

  status = new Bindable<UploadStatus>({
    status: 'uploading',
    progress: 0,
  });

  #uploadText!: OsucadSpriteText;

  playEntryAnimation() {
    const timeline = gsap.timeline();

    timeline.fromTo(
      this.#content,
      { height: 0 },
      {
        height: 50,
        duration: 0.2,
      },
      '<',
    );

    timeline.fromTo(
      this.#content,
      { width: 0 },
      {
        width: 500,
        duration: 1,
        ease: 'expo.out',
      },
      '<',
    );

    timeline.to(
      this.#background,
      {
        cornerRadius: 10,
        duration: 1.3,
        ease: 'expo.out',
      },
      '<',
    );

    timeline.to(
      this.#uploadText,
      {
        alpha: 1,
        duration: 0.6,
      },
      '<',
    );
  }

  onExiting(e: ScreenExitEvent): boolean {
    gsap.to(this.#content, {
      height: 0,
      duration: 0.2,
      ease: 'expo.out',
    });

    this.fadeOut({ duration: 200 });

    return false;
  }
}

class UploadProgressBar extends CompositeDrawable {
  constructor() {
    super();
    this.relativeSizeAxes = Axes.X;
    this.height = 30;
    this.padding = { horizontal: 20 };
  }

  @resolved(ThemeColors)
  colors!: ThemeColors;

  @dependencyLoader()
  load() {
    this.addInternal(
      new Container({
        relativeSizeAxes: Axes.X,
        height: 4,
        anchor: Anchor.Center,
        origin: Anchor.Center,
        children: [
          new RoundedBox({
            relativeSizeAxes: Axes.Both,
            color: this.colors.text,
            alpha: 0.5,
            cornerRadius: 2,
          }),
          this.#progressBar = new RoundedBox({
            relativeSizeAxes: Axes.Both,
            width: 0,
            color: this.colors.primary,
            cornerRadius: 2,
          }),
        ],
      }),
    );
  }

  get progress() {
    return this.#progress;
  }

  set progress(value: number) {
    value = clamp(value, 0, 1);

    if (this.#progress === value)
      return;

    this.#progress = value;

    gsap.to(this.#progressBar, {
      width: value,
      duration: 0.3,
      ease: 'expo.out',
    });
  }

  #progress = 0;

  #progressBar!: RoundedBox;
}
