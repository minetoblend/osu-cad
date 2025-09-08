import type { TsgoExecutorSchema } from "./schema";
import { viteBuildExecutor } from "@nx/vite/executors";
import type { AsyncIteratorExecutor } from "nx/src/config/misc-interfaces";
import tsgoExecutor from "./tsgo";

const executor: AsyncIteratorExecutor<TsgoExecutorSchema> = async function*(options, context)
{
  const tsgo = tsgoExecutor(options, context);

  yield *viteBuildExecutor(options, context);

  await tsgo;

  return {
    success: true,
  };
};

export default executor;
