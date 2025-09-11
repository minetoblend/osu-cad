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
├── editor-web          # Web client for the editor
└── server-multiplayer  # Development server for multiplayer editing
packages           
├── core                # Core logic for beatmaps & hitobjects
├── editor              # Provides anything needed to build a ruleset editor
├── framework           # Game engine that powers the project, a typescript port of osu-framework
└── ruleset-osu         # Osu gameplay & editor logic
multiplayer
├── client              # Multiplayer client 
├── core                # Implementation of multiplayer runtime & core data structures
├── protocol            # Type definitions for all communication between multiplayer client & server 
└── server              # Implementation of specific server-side multiplayer services  
```

## Support this project

If you like this project, please consider supporting it on [Kofi](https://ko-fi.com/maarvin).
