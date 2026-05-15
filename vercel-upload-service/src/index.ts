import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import fs from "fs";
import { exec, ChildProcess } from "child_process";
import http from "http";
import net from "net";

const app = express();
app.use(cors());
app.use(express.json());

const DB_PATH = path.join(__dirname, "..", "projects.json");
const OUTPUT_DIR = path.join(__dirname, "..", "output");
const DIST_DIR = path.join(__dirname, "..", "dist");

if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, JSON.stringify({}));

const statusMap: Record<string, string> = {};
const logMap: Record<string, string[]> = {};
const portMap: Record<string, number> = {};        // id → assigned port
const processMap: Record<string, ChildProcess> = {}; // id → child process

let nextPort = 4000;

function log(id: string, msg: string) {
    const clean = msg.toString().trim();
    if (!clean) return;
    console.log(`[${id}] ${clean}`);
    if (!logMap[id]) logMap[id] = [];
    logMap[id].push(clean);
}

function runCommand(command: string, cwd: string, id?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = exec(command, { cwd, maxBuffer: 1024 * 1024 * 100 });
        child.stdout?.on("data", (d: any) => { if (id) log(id, d.toString()); });
        child.stderr?.on("data", (d: any) => { if (id) log(id, d.toString()); });
        child.on("close", (code: any) => {
            if (code === 0) resolve();
            else reject(new Error(`Command exited with code ${code}`));
        });
    });
}

/** Find a free port starting from `nextPort` */
function findFreePort(start: number): Promise<number> {
    return new Promise((resolve) => {
        const server = net.createServer();
        server.listen(start, () => {
            const port = (server.address() as net.AddressInfo).port;
            server.close(() => resolve(port));
        });
        server.on("error", () => resolve(findFreePort(start + 1)));
    });
}

/** Wait until a TCP port is accepting connections */
function waitForPort(port: number, timeout = 90000): Promise<void> {
    return new Promise((resolve, reject) => {
        const started = Date.now();
        const attempt = () => {
            const sock = new net.Socket();
            sock.setTimeout(1500);
            sock.connect(port, "127.0.0.1", () => { sock.destroy(); resolve(); });
            sock.on("error", () => { sock.destroy(); if (Date.now() - started > timeout) reject(new Error("Timeout")); else setTimeout(attempt, 2000); });
            sock.on("timeout", () => { sock.destroy(); if (Date.now() - started > timeout) reject(new Error("Timeout")); else setTimeout(attempt, 2000); });
        };
        setTimeout(attempt, 3000); // give process a head start
    });
}

function updateProjectDb(id: string, data: any) {
    try {
        const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        db[id] = { ...db[id], ...data, id };
        fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
    } catch (e) {
        console.error("Failed to update DB", e);
    }
}

/** Serve a plain static site on its own port */
function serveStatic(id: string, folder: string, port: number) {
    const staticApp = express();
    staticApp.use(cors());
    staticApp.use(express.static(folder, { index: "index.html" }));
    staticApp.get("*", (_req, res) => {
        const idx = path.join(folder, "index.html");
        if (fs.existsSync(idx)) res.sendFile(idx); else res.status(404).send("Not found");
    });
    const srv = http.createServer(staticApp);
    srv.listen(port, () => log(id, `Static site live → http://localhost:${port}`));
    portMap[id] = port;
}

/** Launch `next start` (or `next dev` as fallback) and wait for it to be ready */
async function serveNextJs(id: string, projectDir: string, port: number) {
    const nextBin = path.join(projectDir, "node_modules", ".bin", "next");
    const hasNextBuild = fs.existsSync(path.join(projectDir, ".next"));
    const cmd = hasNextBuild
        ? `"${nextBin}" start -p ${port}`
        : `"${nextBin}" dev -p ${port}`;

    log(id, `Launching Next.js: ${cmd}`);
    const child = exec(cmd, { cwd: projectDir, maxBuffer: 1024 * 1024 * 100 });
    processMap[id] = child;
    child.stdout?.on("data", (d: any) => log(id, d.toString()));
    child.stderr?.on("data", (d: any) => log(id, d.toString()));
    child.on("close", (code: any) => {
        if (code !== 0 && statusMap[id] !== "deployed") {
            log(id, `Next.js process exited with code ${code}`);
            statusMap[id] = "failed";
        }
    });

    portMap[id] = port;
    await waitForPort(port, 120000);
}

async function detectAndBuild(projectDir: string, id: string): Promise<void> {
    const pkgPath = path.join(projectDir, "package.json");

    // ── Pure static site (no package.json) ──────────────────────────
    if (!fs.existsSync(pkgPath)) {
        log(id, "Static site detected.");
        statusMap[id] = "building";
        const port = await findFreePort(nextPort++);
        serveStatic(id, projectDir, port);
        statusMap[id] = "deployed";
        updateProjectDb(id, { status: "deployed", port, date: new Date().toISOString() });
        return;
    }

    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

    // ── Install ──────────────────────────────────────────────────────
    log(id, "Installing dependencies...");
    statusMap[id] = "installing";
    try {
        await runCommand("npm install", projectDir, id);
    } catch {
        log(id, "Retrying with --legacy-peer-deps...");
        await runCommand("npm install --legacy-peer-deps", projectDir, id);
    }

    // ── Build ────────────────────────────────────────────────────────
    if (pkg.scripts?.build) {
        log(id, "Building project...");
        statusMap[id] = "building";
        await runCommand("npm run build", projectDir, id);
    }

    const port = await findFreePort(nextPort++);

    // ── Next.js → run with `next start` ─────────────────────────────
    if (deps["next"]) {
        log(id, `Next.js detected. Starting server on port ${port}...`);
        await serveNextJs(id, projectDir, port);
        statusMap[id] = "deployed";
        updateProjectDb(id, { status: "deployed", port, date: new Date().toISOString() });
        log(id, `Deployed → http://localhost:${port}`);
        return;
    }

    // ── React/Vite/CRA → serve static dist ─────────────────────────
    for (const folder of ["dist", "build", "out", "public"]) {
        const builtPath = path.join(projectDir, folder);
        if (fs.existsSync(builtPath) && fs.existsSync(path.join(builtPath, "index.html"))) {
            log(id, `Serving ${folder}/ on port ${port}`);
            serveStatic(id, builtPath, port);
            statusMap[id] = "deployed";
            updateProjectDb(id, { status: "deployed", port, date: new Date().toISOString() });
            log(id, `Deployed → http://localhost:${port}`);
            return;
        }
    }

    // ── Fallback: serve root if it has index.html ────────────────────
    if (fs.existsSync(path.join(projectDir, "index.html"))) {
        log(id, "Serving project root.");
        serveStatic(id, projectDir, port);
        statusMap[id] = "deployed";
        updateProjectDb(id, { status: "deployed", port, date: new Date().toISOString() });
        return;
    }

    throw new Error("No deployable output found. Make sure the project builds an index.html.");
}

// ── API ────────────────────────────────────────────────────────────
app.post("/deploy", async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) return res.status(400).json({ error: "repoUrl is required" });

    const id = generate();
    const name = repoUrl.split("/").pop()?.replace(".git", "") || "new-project";
    statusMap[id] = "cloning";
    logMap[id] = ["Deployment request received."];
    updateProjectDb(id, { name, repoUrl, status: "cloning", date: new Date().toISOString() });
    res.json({ id });

    (async () => {
        try {
            const projectDir = path.join(OUTPUT_DIR, id);
            log(id, `Cloning ${repoUrl}...`);
            await simpleGit().clone(repoUrl, projectDir);
            await detectAndBuild(projectDir, id);
        } catch (err: any) {
            log(id, "Deployment failed: " + err.message);
            statusMap[id] = "failed";
            updateProjectDb(id, { status: "failed" });
        }
    })();
});

app.get("/status", (req, res) => {
    const id = req.query.id as string;
    res.json({
        status: statusMap[id] ?? "not_found",
        port:   portMap[id]  ?? null,
        logs:   logMap[id]   ?? []
    });
});

app.get("/projects", (req, res) => {
    try {
        const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
        res.json(Object.values(db).reverse());
    } catch {
        res.status(500).json({ error: "Failed to load projects" });
    }
});

app.listen(3000, () => console.log("Upload service → http://localhost:3000"));
