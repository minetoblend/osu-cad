import { ContainerDrawable } from '@/framework/drawable/ContainerDrawable';
import { HBox } from '@/framework/drawable/HBox';
import { MenuItem } from '../components/MenuItem';
import { MarginPadding } from '@/framework/drawable/MarginPadding';
import { dependencyLoader, resolved } from '@/framework/di/DependencyLoader';
import { CommandManager } from '../CommandManager';

export class EditorMenuBar extends ContainerDrawable {
  constructor() {
    super({
      padding: 4,
    });
  }

  @dependencyLoader()
  load() {
    this.addInternal(
      new HBox({
        gap: 2,
        children: [
          this.createFileMenu(),
          this.createEditMenu(),
          new MenuItem({
            text: 'View',
            padding: new MarginPadding({ horizontal: 8, vertical: 2 }),
            items: [
              new MenuItem({ text: 'Snaking Sliders' }),
              new MenuItem({ text: 'Hit Animations' }),
            ],
          }),
          new MenuItem({
            text: 'Help',
            padding: new MarginPadding({ horizontal: 8, vertical: 2 }),
            items: [
              new MenuItem({ text: 'About' }),
              new MenuItem({ text: 'Settings' }),
            ],
          }),
        ],
      }),
    );
  }

  @resolved(CommandManager)
  private commandManager!: CommandManager;

  createFileMenu() {
    return new MenuItem({
      text: 'File',
      padding: new MarginPadding({ horizontal: 8, vertical: 2 }),
      items: [
        new MenuItem({
          text: 'Exit',
          action: () => (window.location.href = '/'),
        }),
        new MenuItem({
          text: 'Export',
          disabled: true,
          items: [
            new MenuItem({ text: '.osu' }),
            new MenuItem({ text: '.osz' }),
          ],
        }),
      ],
    });
  }

  createEditMenu() {
    const items = [
      new MenuItem({
        text: 'Undo',
        shortcut: 'Ctrl+Z',
        action: () => this.commandManager.undo(),
      }),
      new MenuItem({
        text: 'Redo',
        shortcut: 'Ctrl+Y',
        action: () => this.commandManager.redo(),
      }),
    ];
    const [undo, redo] = items;

    watchEffect(() => (undo.disabled = !this.commandManager.history.canUndo));
    watchEffect(() => (redo.disabled = !this.commandManager.history.canRedo));

    return new MenuItem({
      text: 'Edit',
      padding: new MarginPadding({ horizontal: 8, vertical: 2 }),
      items,
    });
  }
}
