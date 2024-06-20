import { Renderer } from 'pixi.js';
import { InjectionKey } from './DependencyContainer';

export const RENDERER: InjectionKey<Renderer> = Symbol('Renderer');
