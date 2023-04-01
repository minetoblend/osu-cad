export const formatTimestamp = (timeMs: number) => {
  const minutes = Math.floor(timeMs / 60000);
  const seconds = Math.floor((timeMs - minutes * 60000) / 1000);
  const milliseconds = Math.floor(timeMs - minutes * 60000 - seconds * 1000);

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}:${milliseconds.toString().padStart(3, "0")}`;
};