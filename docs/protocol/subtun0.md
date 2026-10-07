---
title: Connecting over subtun0
sidebar_label: Connecting over subtun0
sidebar_position: 10
description: How to reach SUBFROST services on subtun0, the peer-to-peer overlay. The entry relays and their identities, the one-hop bootstrap, a CLI and a TypeScript example, and the HTTPS gateways.
---

# Connecting over subtun0

Several SUBFROST services are not published at an ordinary HTTPS address. They live on **subtun0**, SUBFROST's peer-to-peer overlay network, and you reach each one by a name ending in `.peer`. The peg-in service, the DIESEL fee broker and the Fractal gateway service are all reached this way. The [Services on subtun0](./peer-services) page lists them, with what each one serves.

This page explains how a client gets onto subtun0 and reaches one of those names.

## Names are keys

Every node on subtun0 has an identity key, and its name is derived from that key:

```
fr1 + bech32m( BLAKE3( public key ) ) + .peer
```

So a name like `fr173rdd4ld26sequ3ps6jrwaemxxzrsrnaaua9z6vh58y04guckmtqd23s4r.peer` is not a label someone chose. Only the holder of the matching key can register it, and the relays check the signature before they accept a registration. If you have the right name, you reach the right service, whoever runs the relay in between.

## Entry relays

A client joins subtun0 by opening a WebSocket to an **entry relay**. These are the public entry relays and their identities:

| Entry relay | Its identity |
|---|---|
| `wss://wss-1.subdns.to/ws` | `fr1rx2zvtw676fm3x5krvt893ktu5cdycu9ft4jmcfxlleeuvmp587su6wsmp.peer` |
| `wss://wss-2.subdns.to/ws` | `fr17yfwdtxxcam46uzgsy3zhz69rwlxzazg6jvtcmhyl36em6ydex9qxdky65.peer` |
| `wss://wss-3.subdns.to/ws` | `fr1zmjd04fcqca3fdrraxlkyrj2eym545ggty4jwjsgugf9rs000d8s24uxl6.peer` |
| `wss://wss-1.asilos.ltd/ws` | `fr1698vdase8v9ufrprxcl3xe9vd5wkuhp69mznj0kheha5s9t5juaqp2kduv.peer` |
| `wss://wss-2.asilos.ltd/ws` | `fr1yg76pekuymzznc8fg2rtnz3sqv36vu9q4vhf6mj6czg9mugsudzqkqsyt3.peer` |
| `wss://wss-3.asilos.ltd/ws` | `fr1d0msjgdmf5e08766twtksuh9lqyq4xcep5dc0v2jy6uq78m8mudsvlktyx.peer` |

**Start with `wss://wss-1.subdns.to/ws`.** The relays form one mesh, so any of them reaches every service listed on this site; the others are fallbacks.

## The bootstrap: one hop, to the relay itself

Traffic on subtun0 travels through **circuits**: an encrypted path of one or more relays, where the client names every hop by its identity. A client that has just connected knows nothing about the network yet, so its first circuit has exactly one hop, and that hop is **the entry relay it is connected to**.

That is why you need the relay's identity, not just its URL. The circuit handshake is encrypted to the identity you name, so you know you are talking to the relay you meant even though the connection runs through a CDN.

:::warning[A wrong hop fails silently]
If the hop you name is not the identity of the relay you connected to, there is no error message. The circuit simply never becomes ready, and after about 10 seconds it is gone. If a circuit never comes up, check that the identity matches the URL first.
:::

Once the circuit is ready, open a stream through it to any `fr1….peer` name and port. The relay finds the service by its name and joins the two ends. The service is reached on the port it serves; the services on this site serve HTTP on port 80 unless their entry says otherwise.

## From the command line

`subtun0-proxychains` runs any command with its network traffic sent over subtun0. Give it the entry relay and that relay's identity as the exit:

```bash
subtun0-proxychains \
  --ingress wss://wss-1.subdns.to/ws \
  --exit fr1rx2zvtw676fm3x5krvt893ktu5cdycu9ft4jmcfxlleeuvmp587su6wsmp.peer \
  -- curl http://fr12quta238kx3l4mfd2jnqv6sgsfa87gskm7avzegg66kdcwjqsh5scqqm58.peer/v1/tokens
```

That asks the [DIESEL fee broker](./peer-services#diesel-fee-broker) for its current terms.

- `--ingress` is the entry relay URL. It can be repeated, for fallbacks.
- `--exit` is the last hop of the circuit. For a one-hop circuit it **must** be the identity of the `--ingress` relay. An `--ingress` without an `--exit` is refused.
- `--resolve` defaults to `peer-only`: only `.peer` names are resolved, and anything else is refused, so the command cannot leak a request to the public internet by mistake.
- `--identity` loads a persistent identity. Without it, a fresh anonymous identity is made for each run.

:::note[TODO: distribution]
`subtun0-proxychains` and the TypeScript module below are not yet published as public downloads or packages. Until they are, use the [HTTPS gateway](#without-a-client-the-https-gateways) for plain HTTP services.
:::

## From TypeScript (browser or Node)

The browser and Node client is a WebAssembly build of the subtun0 client. You own the WebSocket and the timer; the module turns frames into circuits and streams. These are the calls a minimal client needs:

| Call | Does |
|---|---|
| `new WasmClient(configToml)` | A client from a TOML config |
| `push_inbound_frame(bytes)` / `next_outbound_frame()` | Feed it what the WebSocket receives; send what it hands back |
| `pump(nowMs)` | Run its timers. Call it every few milliseconds |
| `circuit_build(exitPeer)` → id | Start a one-hop circuit to `exitPeer` |
| `circuit_is_ready(id)` | Whether the circuit is up |
| `tcp_connect_peer_circuit(id, peerName, port)` → handle | Open a stream to a `.peer` service through the circuit |
| `tcp_send(h, bytes)` / `tcp_recv(h)` | Write and read the stream (sends are buffered until it connects) |
| `tcp_state(h)` | The stream's TCP state, such as `Established` |

```ts
import init, { WasmClient } from './subtun0_wasm.js';

const RELAY_URL = 'wss://wss-1.subdns.to/ws';
const RELAY_ID  = 'fr1rx2zvtw676fm3x5krvt893ktu5cdycu9ft4jmcfxlleeuvmp587su6wsmp.peer';
const SERVICE   = 'fr12quta238kx3l4mfd2jnqv6sgsfa87gskm7avzegg66kdcwjqsh5scqqm58.peer'; // DIESEL fee broker

await init();
const client = new WasmClient(`
[node]
mode = "client"
identity = "mem"
anonymous_identity = "mem-anon"

[tun]
address = "100.64.0.1/10"
mtu = 1400

[dns]
bogon_range = "100.100.0.0/16"
intercept_tlds = [".peer"]

[transport]
method = "wss"
server = "wss-1.subdns.to"
port = 443
path = "/ws"
`);

// 1. Wire the WebSocket to the client.
const ws = new WebSocket(RELAY_URL);
ws.binaryType = 'arraybuffer';
ws.onmessage = (ev) => client.push_inbound_frame(new Uint8Array(ev.data));
await new Promise((r) => (ws.onopen = r));
setInterval(() => {
  client.pump(performance.now());
  for (let f; (f = client.next_outbound_frame()); ) ws.send(f);
}, 5);

// 2. One-hop circuit to the entry relay itself.
const cid = client.circuit_build(RELAY_ID);
while (!client.circuit_is_ready(cid)) await new Promise((r) => setTimeout(r, 50));

// 3. A stream to the service, and a plain HTTP/1.1 request over it.
const h = client.tcp_connect_peer_circuit(cid, SERVICE, 80);
client.tcp_send(h, new TextEncoder().encode(
  `GET /v1/tokens HTTP/1.1\r\nHost: ${SERVICE}\r\nConnection: close\r\n\r\n`));

let body = '';
const deadline = Date.now() + 20_000;
while (Date.now() < deadline) {
  const chunk = client.tcp_recv(h);
  if (chunk) body += new TextDecoder().decode(chunk);
  // The stream leaves "Established" once the service has closed its side.
  else if (body && client.tcp_state(h) !== 'Established') break;
  await new Promise((r) => setTimeout(r, 10));
}
console.log(body);
```

In Node, use a WebSocket implementation such as the `ws` package, and pass the `.wasm` bytes to `init({ module_or_path })`. In either, put a timeout on the circuit wait: a wrong hop never becomes ready.

## Without a client: the HTTPS gateways

A plain HTTP service on port 80 can also be reached over ordinary HTTPS, through a subtun0 gateway. Drop the `.peer` suffix and append the gateway's domain:

```bash
curl https://fr12quta238kx3l4mfd2jnqv6sgsfa87gskm7avzegg66kdcwjqsh5scqqm58.subdns.to/v1/tokens
```

Gateways run on `subdns.to`, `asilos.ltd` and `fr.style`. Use the `fr1….subdns.to` form, not `fr1….peer.subdns.to`, which fails the TLS handshake.

A gateway is a convenience with a cost. It terminates your TLS, so the gateway operator can see and alter the traffic, and the name-to-key guarantee above now depends on trusting it. Use a direct subtun0 client for anything you sign or rely on. The [Fractal gateway service](./peer-services#fractal-gateway-service) does not speak HTTP at all, so no gateway can reach it.

## Where to go next

- [Services on subtun0](./peer-services): every public `.peer` service and its API.
- [Fractal Developer Guide](../fractal/developer-guide): the Fractal gateway service and its own client.
- [Signer Groups and Contracts](./signer-groups-and-contracts): the groups and contracts these services act for.
