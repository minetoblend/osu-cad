<p align="center">
  <a href="https://osucad.com">
    <img width="200" src="./packages/resources/resources-raw/textures/logo-text.png">
  </a>
</p>

<p align="center">
  <a href="https://ko-fi.com/maarvin"><img src="https://img.shields.io/badge/Kofi-F16061.svg?logo=ko-fi&logoColor=white" alt="Kofi"></a>
  <a href="https://github.com/minetoblend/osu-cad/actions/workflows/ci.yml"><img src="https://github.com/minetoblend/osu-cad/actions/workflows/ci.yml/badge.svg?branch=master" alt="build status"></a>
  <a href="https://discord.gg/JYFTaYDSC6"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
  <a href="https://github.com/minetoblend/osu-cad" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/minetoblend/osu-cad?style=social"></a>
</p>

<p align="center">
a third party beatmap editor for [osu](https://osu.ppy.sh).
</p>

## Project status

The project is still under active development, however the [online beatmap viewer](https://viewer.osucad.com) can already be used.

The editor currently hosted at https://osucad.com is currently in maintenance mode, and will eventually be
replaced by this project once it supports multiplayer.

## Setup

```
git clone https://github.com/minetoblend/osu-cad.git
cd osu-cad
pnpm install

nx run <package-name>:serve
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

## Support this project

If you like this project, please consider supporting it on [Kofi](https://ko-fi.com/maarvin).
