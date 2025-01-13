# osucad [![Kofi](https://img.shields.io/badge/Kofi-F16061.svg?logo=ko-fi&logoColor=white)](https://ko-fi.com/maarvin)

osucad is a web based osu beatmap editor.

The project is still under active development, however the [online beatmap viewer](https://viewer.osucad.com) is already accessible.

## Setup

```
git clone https://github.com/minetoblend/osu-cad.git
cd osu-cad
pnpm install

nx run [package]:serve
```

## Project structure

```tree
packages           
├── beatmap-viewer      # An online beatmap viewer
├── common              # Core logic for the editor & osu ruleset
├── editor              # Legacy editor package, mostly moved to common package by now
├── electron-app        # Osucad desktop client
├── framework           # Game engine that powers the project, a typescript port of osu-framework
├── multiplayer         # Logic for keeping everything in sync during multiplayer
├── resources           # Sprites & samples for the editor
├── ruleset-mania       # Mania ruleset
├── serialization       # Typescript port of kotlinx-serialization
├── server              # Server that hosts the multiplayer logic
└── web                 # Osucad web client
```

Most things can be found in the [common](./packages/common) package.
The editor package is currently being moved into the common package, with plans to completely remove it once that is completed.
The osu ruleset is currently part of the common package, however it will eventually get its own package.

The desktop client package is currently broken, until the migration to the common package is complete.
