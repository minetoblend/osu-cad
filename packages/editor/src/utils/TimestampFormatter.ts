export namespace TimestampFormatter
{
  function padZeroes(value: number, zeroes: number)
  {
    return value.toString().padStart(zeroes, "0");
  }

  export function format(time: number)
  {
    const minutes = Math.floor(time / 60_000);
    const seconds = Math.floor(time / 1000) % 60;
    const milliseconds = Math.floor(time % 1000);

    return `${padZeroes(minutes, 2)}:${padZeroes(seconds, 2)}:${padZeroes(milliseconds,3)}`;
  }
}

