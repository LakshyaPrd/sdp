import express from "express";
import path from "path";
import fs from "fs";
import mime from "mime-types";
import cookieParser from "cookie-parser";

const app = express();
app.use(cookieParser());

const DIST_DIR = path.resolve(__dirname, "../../vercel-upload-service/dist");
console.log("Request handler serving from:", DIST_DIR);

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

function serveFile(filePath: string, res: express.Response) {
    if (!fs.existsSync(filePath)) return false;
    if (fs.statSync(filePath).isDirectory()) return false;

    const mimeType = mime.lookup(filePath) || "application/octet-stream";
    res.setHeader("Content-Type", mimeType);
    res.sendFile(filePath);
    return true;
}

// ── Improved Stickiness & Routing ──────────────────────────────────
app.use((req, res, next) => {
    const url = req.url.split('?')[0];
    
    // 1. Direct hit on deployment ID (e.g. /a4e8s)
    const idMatch = url.match(/^\/([a-z0-9]{5})$/);
    if (idMatch) {
        const id = idMatch[1];
        if (fs.existsSync(path.join(DIST_DIR, id))) {
            res.cookie("deployment_id", id, { path: '/', maxAge: 3600000 });
            const indexPath = path.join(DIST_DIR, id, "index.html");
            if (serveFile(indexPath, res)) return;
        }
    }

    // 2. Identify deployment ID
    const id = req.cookies.deployment_id || req.header('Referer')?.match(/localhost:3001\/([a-z0-9]{5})/)?.[1];
    
    if (id) {
        const fullPath = path.join(DIST_DIR, id, url);
        
        // If the file exists, serve it
        if (fs.existsSync(fullPath) && !fs.statSync(fullPath).isDirectory()) {
            return serveFile(fullPath, res);
        }

        // 3. SPA Fallback (Only for routes, NOT for missing assets)
        // If it doesn't have an extension, it's likely a React/Next route
        const hasExtension = url.includes('.') && !url.endsWith('.html');
        if (!hasExtension) {
            const indexPath = path.join(DIST_DIR, id, "index.html");
            if (fs.existsSync(indexPath)) {
                return serveFile(indexPath, res);
            }
        }
    }

    next();
});

app.get("*", (req, res) => {
    res.status(404).send(`
        <body style="background:#09090b;color:#f4f4f5;font-family:sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;">
            <h1>Deployment not found</h1>
            <p>Visit your project link again: <a href="http://localhost:5173/dashboard" style="color:#60a5fa;">Dashboard</a></p>
        </body>
    `);
});

app.listen(3001, () => console.log("Request handler → http://localhost:3001"));
