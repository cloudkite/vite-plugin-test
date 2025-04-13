import http from "node:http";
import process from "node:process";
import getPort from "get-port";
import httpProxy from "http-proxy";
import stripAnsi from "strip-ansi";
import { type IncomingMessage, ServerResponse } from "node:http";
import { type ResultPromise, type Options, execa } from "execa";

type Exec = ResultPromise<Options>;

let allocatedPorts: number[] = [];

async function allocatePort() {
  let port = await getPort({ exclude: allocatedPorts });
  allocatedPorts.push(port);
  return port;
}

let workers = [
  {
    pkg: "worker-b",
    port: await allocatePort(),
    match: (url: URL) => url.pathname.startsWith("/test"),
  },
  {
    pkg: "worker-a",
    port: await allocatePort(),
    match: (_: URL) => true,
  },
];

let devServerOpts: Options = {
  stderr: "inherit",
  stdin: "ignore",
  env: { FORCE_COLOR: "1" },
};

let devServers: Exec[] = [];

for (let worker of workers) {
  let { resolve, promise: ready } = Promise.withResolvers<void>();

  let devServer = execa(
    "pnpm",
    [`--filter=${worker.pkg}`, "dev", `--port=${worker.port}`],
    devServerOpts,
  );
  devServer.on("exit", (signal) => process.exit(signal ?? 0));
  devServers.push(devServer);
  let output: string | null = "";
  devServer.stdout?.on("data", (data: Buffer) => {
    process.stdout.write(data);
    if (output != null) {
      output += data.toString();
      if (stripAnsi(output).includes(`:${worker.port}`)) {
        resolve();
      }
    }
  });
  await Promise.race([
    ready,
    new Promise((_, resolve) => setTimeout(resolve, 5000)),
  ]);
  output = null;
}

function findTarget(
  req: IncomingMessage,
  fn: (t: (typeof workers)[number]) => void,
) {
  let url = new URL(`https://${req.headers.host}${req.url ?? ""}`);
  for (let worker of workers) {
    if (worker.match(url)) {
      fn(worker);
      return;
    }
  }
  console.error("Error no target found:", url);
}

let proxy = httpProxy.createProxyServer({});

proxy.on("error", (err, req, res) => {
  console.log(err);
  if (res instanceof ServerResponse) res.statusCode = 500;
  res.end(`
      <h1>Error proxying ${req.url}</h1>
      <div><code>${err.stack}</code></div>
    `);
});

let server = http.createServer((req, res) => {
  findTarget(req, (target) => {
    proxy.web(req, res, { target: `http://localhost:${target.port}` });
  });
});

server.on("upgrade", (req, socket, head) => {
  socket.on("error", (err) => console.error(err));
  findTarget(req, (target) => {
    proxy.ws(req, socket, head, {
      target: `http://localhost:${target.port}`,
    });
  });
});

let port = await allocatePort();
server.listen(port);

console.log(`Server listening on port ${port}`);
