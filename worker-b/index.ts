import { WorkerEntrypoint } from "cloudflare:workers";

export default class extends WorkerEntrypoint {
  override fetch() {
    return Response.json({
      name: "Worker B",
    });
  }
  add(a: number, b: number) {
    return a + b;
  }
  foo(emoji: string) {
    return {
      bar: {
        baz: () => `You made it! ${emoji}`,
      },
    };
  }
  get name() {
    return "Cloudflare";
  }
}
