# osucad [![Kofi](https://img.shields.io/badge/Kofi-F16061.svg?logo=ko-fi&logoColor=white)](https://ko-fi.com/maarvin)


osucad is a web based osu beatmap editor.

## Setup

```
git clone https://github.com/minetoblend/osu-cad.git
cd osu-cad
pnpm install

nx run [package]:serve
```

## Project structure
#### [/packages/common](./packages/common)
Contains the core logic for the editor & gameplay.
Also contains the osu ruleset, which will eventually be moved
into its own package.

#### [/packages/framework](./packages/framework)
Contains the game engine running the entire project. 
It is a typescript port of osu-framework, using pixi.js for rendering.

#### [/packages/editor](./packages/editor)
Legacy editor package, mainly kept around for reference.
Most of it's content have been moved into the common package by now.

#### [/packages/beatmap-viewer](./packages/beatmap-viewer)
A small application that allows viewing beatmaps fetched from a beatmap mirror.
Hosted under https://viewer.osucad.com

#### [/packages/electron-app](./packages/electron-app)
Contains the desktop client, currently broken until migration from editor to common package is complete.

#### [/packages/multiplayer](./packages/multiplayer)
Contains logic required for multiplayer editing.

#### [/packages/resources](./packages/resources)
Contains sprites & samples used for the editor.

#### [/packages/ruleset-mania](./packages/ruleset-mania)
Contains the mania ruleset.

#### [/packages/serialization](./packages/serialization)
A typescript port of kotlinx-serialization.

#### [/packages/server](./packages/server)
Server that hosts multiplayer sessions.

#### [/packages/web](./packages/web)
Web version of the editor.
