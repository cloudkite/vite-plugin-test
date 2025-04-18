import type WorkerB from "../worker-b";

interface Env {
  WORKER_B: Fetcher<WorkerB>;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    switch (url.pathname) {
      case "/fetch": {
        const response = await env.WORKER_B.fetch(request);
        const result = await response.json();
        return Response.json({
          result,
        });
      }
      case "/rpc-method": {
        const result = await env.WORKER_B.add(4, 5);
        return Response.json({
          result,
        });
      }
      case "/rpc-method/promise-pipelining": {
        const foo = env.WORKER_B.foo("🎉");
        const result = await foo.bar.baz();
        return Response.json({
          result,
        });
      }
      case "/rpc-getter": {
        const result = await env.WORKER_B.name;
        return Response.json({ result });
      }
    }

    return Response.json({ name: "Worker A" });
  },
} satisfies ExportedHandler<Env>;
