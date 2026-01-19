import type { ExecutorContext, PromiseExecutor } from "@nx/devkit";
import type { TsgoExecutorSchema } from "./schema";
import * as child_process from "node:child_process";
import { promisify } from "node:util";
import type { NormalizedOptions } from "./normalize-options";
import { normalizeOptions } from "./normalize-options";

const exec = promisify(child_process.exec);

function* generateCommand(options: NormalizedOptions): Iterable<string>
{
  yield "npx tsgo";

  if (options.emitDeclarationOnly)
    yield "--emitDeclarationOnly";

  yield `-b ${options.tsConfig}`;
}

const tsgoExecutor: PromiseExecutor<TsgoExecutorSchema> = async (_options, context: ExecutorContext) =>
{
  const { sourceRoot , root } = context.projectsConfigurations.projects[context.projectName!];
  const options = normalizeOptions(_options, context.root, sourceRoot!, root);


  try
  {
    const command = [...generateCommand(options)].join(" ");

    console.log(command);

    const { stdout, stderr } = await exec(command, {
      cwd: context.root,
    });

    console.log(stdout);
    console.error(stderr);

    return { success: true };
  }
  catch (e: any)
  {
    if ("stdout" in e)
      console.log(e.stdout);
    if ("stderr" in e)
      console.error(e.stderr);

    return { success: false, error: e?.message };
  }
};


export default tsgoExecutor;
