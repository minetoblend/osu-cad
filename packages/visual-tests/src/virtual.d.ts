declare module "virtual:test-browser"
{
  import type { TestBrowser } from "./TestBrowser";

  export function createTestBrowser(): TestBrowser;
}
