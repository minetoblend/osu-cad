<p align="center">
  <a href="https://osucad.com">
    <img width="200" src="docs/logo-text.png">
  </a>
</p>

<p align="center">
  <a href="https://ko-fi.com/maarvin"><img src="https://img.shields.io/badge/Kofi-F16061.svg?logo=ko-fi&logoColor=white" alt="Kofi"></a>
  <a href="https://github.com/minetoblend/osu-cad/actions/workflows/ci.yml"><img src="https://github.com/minetoblend/osu-cad/actions/workflows/ci.yml/badge.svg?branch=master" alt="build status"></a>
  <a href="https://discord.gg/JYFTaYDSC6"><img src="https://img.shields.io/badge/chat-discord-blue?style=flat&logo=discord" alt="discord chat"></a>
  <a href="https://github.com/minetoblend/osu-cad" target="__blank"><img alt="GitHub stars" src="https://img.shields.io/github/stars/minetoblend/osu-cad?style=social"></a>
</p>

<p align="center">
a third party beatmap editor for [osu](https://osu.ppy.sh) with multiplayer support.
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
apps
├── skinning-demo       # A small demo for loading a skin & beatmap
packages           
├── core                # Core logic for the editor & osu ruleset
├── framework           # Game engine that powers the project, a typescript port of osu-framework
└── ruleset-osu         # Osu ruleset
```

## Support this project

If you like this project, please consider supporting it on [Kofi](https://ko-fi.com/maarvin).
