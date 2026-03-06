import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { AdminGuard } from './admin.guard';
import { StatusService, AppStatus } from '../status/status.service';

@Controller('admin')
export class AdminController {
  constructor(private readonly statusService: StatusService) {}

  // ── GET /admin ─────────────────────────────────────────────────────────────
  // Serve a minimal HTML admin page — no separate frontend needed.
  @Get()
  @Header('Content-Type', 'text/html')
  async adminPage(@Res() res: Response) {
    const { status } = await this.statusService.getStatus();

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>App Status Admin</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: #0f172a;
      color: #f1f5f9;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 12px;
      padding: 2.5rem 3rem;
      width: 100%;
      max-width: 420px;
      text-align: center;
    }
    h1 { font-size: 1.4rem; margin-bottom: 0.4rem; }
    p.sub { color: #94a3b8; font-size: 0.875rem; margin-bottom: 2rem; }
    .badge {
      display: inline-block;
      padding: 0.35rem 1rem;
      border-radius: 999px;
      font-weight: 600;
      font-size: 1rem;
      margin-bottom: 2rem;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .badge.active   { background: #14532d; color: #4ade80; }
    .badge.inactive { background: #450a0a; color: #f87171; }
    .btn-group { display: flex; gap: 1rem; justify-content: center; }
    button {
      padding: 0.65rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      transition: opacity .15s;
    }
    button:disabled { opacity: .45; cursor: not-allowed; }
    .btn-active   { background: #16a34a; color: #fff; }
    .btn-inactive { background: #dc2626; color: #fff; }
    .secret-wrap { margin-bottom: 1.5rem; }
    input[type="password"] {
      width: 100%;
      padding: 0.6rem 0.9rem;
      background: #0f172a;
      border: 1px solid #475569;
      border-radius: 8px;
      color: #f1f5f9;
      font-size: 0.9rem;
    }
    input[type="password"]::placeholder { color: #64748b; }
    #msg {
      margin-top: 1.2rem;
      font-size: 0.875rem;
      min-height: 1.2em;
    }
    #msg.ok  { color: #4ade80; }
    #msg.err { color: #f87171; }
  </style>
</head>
<body>
  <div class="card">
    <h1>App Status Control</h1>
    <p class="sub">Change the status seen by all Electron clients</p>

    <div class="badge ${status}" id="currentBadge">${status}</div>

    <div class="secret-wrap">
      <input type="password" id="secretInput" placeholder="Admin secret" />
    </div>

    <div class="btn-group">
      <button class="btn-active"   onclick="setStatus('active')">Set Active</button>
      <button class="btn-inactive" onclick="setStatus('inactive')">Set Inactive</button>
    </div>

    <p id="msg"></p>
  </div>

  <script>
    async function setStatus(newStatus) {
      const secret = document.getElementById('secretInput').value.trim();
      const msg    = document.getElementById('msg');
      const badge  = document.getElementById('currentBadge');

      if (!secret) { msg.className = 'err'; msg.textContent = 'Enter admin secret first.'; return; }

      msg.className = ''; msg.textContent = 'Updating…';

      try {
        const res = await fetch('/admin/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-admin-secret': secret },
          body: JSON.stringify({ status: newStatus }),
        });
        const data = await res.json();

        if (!res.ok) {
          msg.className = 'err';
          msg.textContent = data.message ?? 'Error: ' + res.status;
          return;
        }

        badge.textContent = data.status;
        badge.className   = 'badge ' + data.status;
        msg.className     = 'ok';
        msg.textContent   = 'Status updated to "' + data.status + '"';
      } catch (e) {
        msg.className = 'err'; msg.textContent = 'Network error.';
      }
    }
  </script>
</body>
</html>`;

    res.send(html);
  }

  // ── POST /admin/status ──────────────────────────────────────────────────────
  // Protected by AdminGuard (x-admin-secret header must match ADMIN_SECRET env).
  // Body: { "status": "active" } | { "status": "inactive" }
  @Post('status')
  @UseGuards(AdminGuard)
  @HttpCode(200)
  async updateStatus(@Body() body: { status: AppStatus }) {
    const newStatus: AppStatus =
      body?.status === 'inactive' ? 'inactive' : 'active';
    return this.statusService.setStatus(newStatus);
  }
}
