import { $, $$, action, copy, status, escapeHtml } from "./common.mjs";
import md5 from "./md5.mjs";
import { load as yamlLoad, dump as yamlDump } from "./yaml.mjs";
const definitions = [
  ["base64", "Base64 编解码", ["编码", "解码"]],
  ["url", "URL 编解码", ["编码", "解码"]],
  ["hash", "哈希 / 摘要", ["MD5", "SHA-1", "SHA-256", "SHA-512"]],
  ["time", "时间戳转换", ["时间戳 → 日期", "日期 → 时间戳"]],
  ["regex", "正则测试", ["匹配"]],
  ["json", "JSON 工具", ["格式化", "压缩", "转义", "反转义"]],
  ["yaml", "JSON ↔ YAML", ["JSON → YAML", "YAML → JSON"]],
  ["urlparse", "URL 解析", ["解析"]],
  ["radix", "进制转换", ["10 → 2", "10 → 16", "16 → 10", "2 → 10"]],
  ["uuid", "UUID 生成", ["生成"]],
  ["text", "文本处理", ["去重行", "排序行", "大写", "小写", "统计"]],
];
let current = definitions[0],
  revision = 0;
function menu() {
  const q = $("#tool-search").value.toLowerCase();
  $("#tools").innerHTML = definitions
    .filter((d) => d[1].toLowerCase().includes(q))
    .map(
      (d) =>
        '<button class="' +
        (d === current ? "active" : "") +
        '" data-id="' +
        d[0] +
        '">' +
        d[1] +
        "</button>",
    )
    .join("");
  $$("#tools button").forEach((b) => (b.onclick = () => select(b.dataset.id)));
}
function select(id) {
  current = definitions.find((d) => d[0] === id);
  menu();
  $("#title").textContent = current[1];
  $("#operation").innerHTML = current[2]
    .map((x, i) => '<option value="' + i + '">' + escapeHtml(x) + "</option>")
    .join("");
  $("#extra").innerHTML =
    id === "regex"
      ? '<div class="row"><input id="pattern" placeholder="正则表达式" value="\\w+" style="flex:1"><input id="flags" placeholder="标志" value="g" style="width:65px"></div>'
      : id === "time"
        ? '<label>时间戳单位 <select id="unit"><option value="seconds">秒</option><option value="milliseconds">毫秒</option></select></label>'
        : "";
  $("#output").value = "";
  status("输入后点击执行 · Ctrl+Enter");
}
async function run() {
  const rev = ++revision;
  const text = $("#input").value,
    op = Number($("#operation").value);
  let output = "";
  switch (current[0]) {
    case "base64":
      output = op
        ? new TextDecoder("utf-8", { fatal: true }).decode(
            Uint8Array.from(atob(text.replace(/\s/g, "")), (c) =>
              c.charCodeAt(0),
            ),
          )
        : btoa(
            Array.from(new TextEncoder().encode(text), (b) =>
              String.fromCharCode(b),
            ).join(""),
          );
      break;
    case "url":
      output = op ? decodeURIComponent(text) : encodeURIComponent(text);
      break;
    case "hash":
      output = op
        ? [
            ...new Uint8Array(
              await crypto.subtle.digest(
                current[2][op],
                new TextEncoder().encode(text),
              ),
            ),
          ]
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("")
        : md5(text);
      break;
    case "time": {
      let d;
      if (op === 0) {
        if (!/^\d+$/.test(text.trim())) throw Error("请输入数字时间戳");
        d = new Date(
          Number(text) * ($("#unit").value === "seconds" ? 1000 : 1),
        );
      } else d = new Date(text);
      if (Number.isNaN(d.getTime())) throw Error("日期无效");
      output = op
        ? String(
            $("#unit").value === "seconds"
              ? Math.floor(d.getTime() / 1000)
              : d.getTime(),
          )
        : "本地时间：" + d.toLocaleString() + "\nUTC：" + d.toISOString();
      break;
    }
    case "regex": {
      if (text.length > 200000) throw Error("正则测试输入不能超过 200 KB");
      output = await new Promise((resolve, reject) => {
        const worker = new Worker(
          new URL("./regex-worker.mjs", import.meta.url),
          { type: "module" },
        );
        const timer = setTimeout(() => {
          worker.terminate();
          reject(Error("正则运行超过 1 秒，已停止"));
        }, 1000);
        worker.onmessage = (e) => {
          clearTimeout(timer);
          worker.terminate();
          e.data.error ? reject(Error(e.data.error)) : resolve(e.data.result);
        };
        worker.onerror = () => {
          clearTimeout(timer);
          worker.terminate();
          reject(Error("正则测试失败"));
        };
        worker.postMessage({
          text,
          pattern: $("#pattern").value,
          flags: $("#flags").value,
        });
      });
      break;
    }
    case "json":
      output =
        op === 0
          ? JSON.stringify(JSON.parse(text), null, 2)
          : op === 1
            ? JSON.stringify(JSON.parse(text))
            : op === 2
              ? JSON.stringify(text)
              : JSON.parse(text);
      break;
    case "yaml":
      output = op
        ? JSON.stringify(yamlLoad(text), null, 2)
        : yamlDump(JSON.parse(text));
      break;
    case "urlparse": {
      const u = new URL(text);
      output = JSON.stringify(
        {
          protocol: u.protocol,
          host: u.host,
          hostname: u.hostname,
          port: u.port,
          pathname: u.pathname,
          hash: u.hash,
          query: [...u.searchParams],
        },
        null,
        2,
      );
      break;
    }
    case "radix": {
      const n = BigInt(
        op === 2
          ? "0x" + text.replace(/^0x/i, "")
          : op === 3
            ? "0b" + text.replace(/^0b/i, "")
            : text,
      );
      output = n.toString(op === 0 ? 2 : op === 1 ? 16 : 10);
      break;
    }
    case "uuid":
      output = crypto.randomUUID();
      break;
    case "text": {
      const lines = text.split("\n");
      output =
        op === 0
          ? [...new Set(lines)].join("\n")
          : op === 1
            ? lines.sort((a, b) => a.localeCompare(b, "zh-CN")).join("\n")
            : op === 2
              ? text.toUpperCase()
              : op === 3
                ? text.toLowerCase()
                : JSON.stringify(
                    {
                      字符数: [...text].length,
                      字节数: new TextEncoder().encode(text).length,
                      行数: lines.length,
                    },
                    null,
                    2,
                  );
      break;
    }
  }
  if (rev === revision) {
    $("#output").value =
      typeof output === "string" ? output : JSON.stringify(output, null, 2);
    status("执行完成");
  }
}
$("#run").onclick = action(run);
$("#copy").onclick = action(() => copy($("#output").value));
$("#swap").onclick = () => {
  $("#input").value = $("#output").value;
};
$("#tool-search").oninput = menu;
document.onkeydown = (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    $("#run").click();
  }
};
select("base64");
