import type { Drawable } from "@osucad/framework";
import { Action, Axes, Bindable, Dimension, effect, effectScope, FillDirection, FillFlowContainer, GridContainer, GridSizeMode, track, TrackOpTypes, trigger, TriggerOpTypes, Vec2 } from "@osucad/framework";
import v from "voca";
import { Checkbox } from "../../userInterface";
import { OsucadTextBox } from "../../userInterface/OsucadTextBox";
import { LabelledOperator } from "./LabelledOperator";
import type { EditorBeatmap } from "src/runtime";
import type { HitObject } from "@osucad/core";


export interface OperatorContext
{
  invalidate: () => void
  complete: (commit: boolean) => void
  editorBeatmap: EditorBeatmap
}

export abstract class Operator
{
  public abstract readonly title: string;

  public readonly invalidated = new Action<Operator>();

  public readonly parameters: Operator.ParameterMetadata[] = [];

  public readonly effectScope = effectScope();

  public invalidate()
  {
    this.context.invalidate();
  }

  public abstract apply(): void;

  public onComplete()
  {
  }

  public onCancel()
  {
  }

  public complete()
  {
    this.context.complete(true);
  }

  public cancel()
  {
    this.context.complete(false);
  }


  public constructor(protected readonly context: OperatorContext)
  {
  }

  public get isValid()
  {
    return true;
  }

  protected applyDefaults(hitObject: HitObject)
  {
    const { difficulty, controlPointInfo } = this.context.editorBeatmap;

    hitObject.applyDefaults(difficulty, controlPointInfo);
  }

  public createContent(): Drawable
  {
    const flow = new FillFlowContainer({
      relativeSizeAxes: Axes.X,
      autoSizeAxes: Axes.Y,
      direction: FillDirection.Vertical,
      spacing: new Vec2(4),
    });

    this.effectScope.run(() =>
    {
      for (const p of this.parameters)
      {
        const drawable = p.parameter.createDrawable({
          metadata: p,
          get: () => p.get(),
          set: (value) => p.set(value),
        });

        flow.add(drawable);
      }
    });

    return flow;
  }

  #disposed = false;

  public get isDisposed()
  {
    return this.#disposed;
  }

  public dispose()
  {
    if (this.isDisposed)
      return;

    this.#disposed = true;

    this.effectScope.stop();
    (this.effectScope as unknown) = null;
  }
}

export namespace Operator
{
  export interface Parameter<T>
  {
    createDrawable: (ctx: ParameterContext<T>) => Drawable
  }

  export interface ParameterMetadata
  {
    name: string
    parameter: Parameter<any>
    get: () => any
    set: (value: any) => void
  }

  export interface ParameterContext<T>
  {
    get: () => T,
    set: (value: T) => void
    metadata: ParameterMetadata
  }

  export function parameter<This extends Operator, Value>(
    parameter?: Parameter<Value>,
    name?: string,
  )
  {
    return (
      { get, set }: ClassAccessorDecoratorTarget<This, Value>,
      context: ClassAccessorDecoratorContext<This, Value>,
    ): ClassAccessorDecoratorResult<This, Value> =>
    {
      if (parameter)
      {
        context.addInitializer(function()
        {
          this.parameters.push({
            name: name ?? v.titleCase(context.name as string),
            parameter,
            get: () =>
            {
              track(this, TrackOpTypes.GET, context.name);

              return get.call(this);
            },
            set: (value) =>
            {
              set.call(this, value);

              trigger(this, TriggerOpTypes.SET, context.name);

              this.invalidate();
            },
          });
        });
      }

      return {
        get(this: This)
        {
          track(this, TrackOpTypes.GET, context.name);

          return get.call(this);
        },
        set(this: This, value: Value)
        {
          set.call(this, value);

          trigger(this, TriggerOpTypes.SET, context.name);

          this.invalidate();
        },
      };
    };
  }

  export namespace parameter
  {
    export function checkbox<This extends Operator>(name?: string)
    {
      return parameter<This, boolean>({
        createDrawable: ctx =>
        {
          const current = new Bindable(ctx.get());

          effect(() =>
          {
            current.value = ctx.get();
          });

          current.bindValueChanged(e => ctx.set(e.value));

          return new LabelledOperator(ctx.metadata.name, new Checkbox({ current }), 250);
        },
      }, name);
    }

    export function vec2<This extends Operator>(name?: string)
    {
      return parameter<This, Vec2>({
        createDrawable: ctx =>
        {
          const xTextBox = new OsucadTextBox();
          const yTextBox = new OsucadTextBox();

          effect(() =>
          {
            const { x, y } = ctx.get();

            xTextBox.text = Math.round(x).toString();
            yTextBox.text = Math.round(y).toString();
          });

          xTextBox.onCommit.addListener(() =>
          {
            const x = Number.parseFloat(xTextBox.text);
            const value = ctx.get();

            if (isFinite(x))
              ctx.set(value.withX(x));
            else
              xTextBox.text = Math.round(value.x).toString();
          });

          yTextBox.onCommit.addListener(() =>
          {
            const y = Number.parseFloat(yTextBox.text);
            const value = ctx.get();

            if (isFinite(y))
              ctx.set(value.withY(y));
            else
              yTextBox.text = Math.round(value.y).toString();
          });

          return new LabelledOperator(ctx.metadata.name, new GridContainer({
            relativeSizeAxes: Axes.X,
            autoSizeAxes: Axes.Y,
            rowDimensions: [new Dimension(GridSizeMode.AutoSize)],
            columnDimensions: [new Dimension(), new Dimension(GridSizeMode.Absolute, 4), new Dimension()],
            content: [[xTextBox, undefined, yTextBox]],
          }));
        },
      }, name);
    }

    export function float<This extends Operator>(
      options: {
        min?: number,
        max?: number,
        precision?: number
      } = {},
      name?: string,
    )
    {
      const {
        precision = 0.01,
      } = options;

      return parameter<This, number>({
        createDrawable: ctx =>
        {
          const textBox = new OsucadTextBox();

          const getText = () =>
            (Math.round(ctx.get() / precision) * precision).toString();

          effect(() =>
          {
            textBox.text = getText();
          });

          textBox.onCommit.addListener(() =>
          {
            const value = Number.parseFloat(textBox.text);

            if (isFinite(value))
              ctx.set(value);
            else
              textBox.text = getText();
          });

          return new LabelledOperator(ctx.metadata.name, textBox);
        },
      }, name);
    }
  }
}
