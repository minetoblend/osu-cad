export type EasingFunction = (time: number) => number;

const expo_offset = 2 ** -10;

const elastic_const = (2 * Math.PI) / 0.3;
const elastic_const2 = 0.3 / 4;

const elastic_offset_full = 2 ** -11;
const elastic_offset_half = 2 ** -10 * Math.sin((0.5 - elastic_const2) * elastic_const);

const back_const = 1.70158;
const back_const2 = back_const * 1.525;

const bounce_const = 1 / 2.75;

export namespace EasingFunction 
{
  export const None: EasingFunction = () => 1;
  export const Default: EasingFunction = time => time;

  export const In: EasingFunction = time => time * time;
  export const InQuad = In;

  export const Out: EasingFunction = time => time * (2 - time);
  export const OutQuad = Out;

  export const InOutQuad: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return time * time * 2;
    }
    else 
    {
      return --time * time * -2 + 1;
    }
  };

  export const InCubic: EasingFunction = time => time * time * time;
  export const OutCubic: EasingFunction = time => --time * time * time + 1;
  export const InOutCubic: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return time * time * time * 4;
    }
    else 
    {
      return --time * time * time * 4 + 1;
    }
  };

  export const InQuart: EasingFunction = time => time * time * time * time;
  export const OutQuart: EasingFunction = time => 1 - --time * time * time * time;
  export const InOutQuart: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return time * time * time * time * 8;
    }
    else 
    {
      return --time * time * time * time * -8 + 1;
    }
  };

  export const InQuint: EasingFunction = time => time * time * time * time * time;
  export const OutQuint: EasingFunction = time => --time * time * time * time * time + 1;
  export const InOutQuint: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return time * time * time * time * time * 16;
    }
    else 
    {
      return --time * time * time * time * time * 16 + 1;
    }
  };

  export const InSine: EasingFunction = time => 1 - Math.cos(time * Math.PI * 0.5);
  export const OutSine: EasingFunction = time => Math.sin(time * Math.PI * 0.5);
  export const InOutSine: EasingFunction = time => (1 - Math.cos(Math.PI * time)) * 0.5;

  export const InExpo: EasingFunction = time => 2 ** (10 * (time - 1)) + expo_offset * (time - 1);
  export const OutExpo: EasingFunction = time => -(2 ** (-10 * time)) + 1 + expo_offset * time;
  export const InOutExpo: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return (2 ** (20 * time - 10) + expo_offset * (10 * time - 5)) / 2;
    }
    else 
    {
      return (2 - 2 ** (-20 * time + 10) - expo_offset * (10 * time - 5)) / 2;
    }
  };

  export const InCirc: EasingFunction = time => 1 - Math.sqrt(1 - time * time);
  export const OutCirc: EasingFunction = time => Math.sqrt(1 - --time * time);
  export const InOutCirc: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return (1 - Math.sqrt(1 - 4 * time * time)) / 2;
    }
    else 
    {
      return (Math.sqrt(1 - -4 * time * time) + 1) / 2;
    }
  };

  export const InElastic: EasingFunction = time =>
    -(2 ** (-10 + 10 * time)) * Math.sin((1 - elastic_const2 - time) * elastic_const)
    + elastic_offset_full * (1 - time);
  export const OutElastic: EasingFunction = time =>
    2 ** (-10 * time) * Math.sin((time - elastic_const2) * elastic_const) + 1 - elastic_offset_full * time;

  export const OutElasticHalf: EasingFunction = time =>
    2 ** (-10 * time) * Math.sin((0.5 * time - elastic_const2) * elastic_const) + 1 - elastic_offset_half * time;

  // case Easing.OutElasticHalf:
  //   return Math.Pow(2, -10 * time) * Math.Sin((.5 * time - elastic_const2) * elastic_const) + 1 - elastic_offset_half * time;

  export const InBack: EasingFunction = time => time * time * ((back_const + 1) * time - back_const);
  export const OutBack: EasingFunction = time => --time * time * ((back_const + 1) * time + back_const) + 1;
  export const InOutBack: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return time * time * ((back_const2 + 1) * time - back_const2) * 2;
    }
    else 
    {
      return (--time * time * ((back_const2 + 1) * time + back_const2) + 1) * 2;
    }
  };

  export const InBounce: EasingFunction = (time) => 
  {
    time = 1 - time;
    if (time < bounce_const)
      return 1 - 7.5625 * time * time;
    if (time < 2 * bounce_const)
      return 1 - (7.5625 * (time -= 1.5 * bounce_const) * time + 0.75);
    if (time < 2.5 * bounce_const)
      return 1 - (7.5625 * (time -= 2.25 * bounce_const) * time + 0.9375);

    return 1 - (7.5625 * (time -= 2.625 * bounce_const) * time + 0.984375);
  };
  export const OutBounce: EasingFunction = time => 1 - InBounce(1 - time);
  export const InOutBounce: EasingFunction = (time) => 
  {
    if (time < 0.5) 
    {
      return InBounce(time * 2) * 0.5;
    }
    else 
    {
      return OutBounce(time * 2 - 1) * 0.5 + 0.5;
    }
  };

  export const OutPow10: EasingFunction = time => --time * time ** 10 + 1;
}
