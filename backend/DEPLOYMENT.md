# Ashray Backend Deployment Guide

This guide describes how to deploy the Ashray FastAPI backend application to local environments, Render, and standard Ubuntu VPS hosts (such as Hostinger, DigitalOcean, Hetzner, AWS EC2).

---

## Architecture Overview

The backend uses two main control scripts to keep installation isolated from execution:
1. **`setup.sh`**: One-time bootstrap script. It installs Python packages and downloads the Playwright Chromium binaries (plus system dependencies if run as `root`).
2. **`start.sh`**: Runtime-only execution script. Starts the `uvicorn` server without running any installation procedures.

This architecture ensures the app is portable, launches quickly, and handles environments where Chromium is missing gracefully without failing application startup.

---

## 1. Local Development Setup

### Prerequisites
- Python 3.10 or higher
- Node.js (optional, only if using Node runner fallback)

### Installation
From the `ashray-backend/` directory:

```bash
# Make scripts executable
chmod +x setup.sh start.sh

# Run the bootstrap setup script
./setup.sh
```

### Start the Server
```bash
./start.sh
```
The server will start on port `8000` by default.

---

## 2. Ubuntu VPS Deployment (Hostinger, DigitalOcean, Hetzner, AWS, etc.)

For VPS deployments, you can run the bootstrap setup script with `root` privileges. This allows Playwright to install the necessary Linux system libraries required for Chromium to run in a headless environment.

### Steps:
1. **Clone the repository** to your VPS.
2. **Navigate to the backend directory**:
   ```bash
   cd ashray-backend
   ```
3. **Make scripts executable**:
   ```bash
   chmod +x setup.sh start.sh
   ```
4. **Run the bootstrap script as root**:
   ```bash
   sudo ./setup.sh
   ```
   *Note: This will automatically install python dependencies, download the Playwright Chromium browser (~300MB), and install required OS-level system libraries (`libgbm`, `libnss3`, etc.) via APT.*

5. **Start the server**:
   We recommend running the server using a systemd service or `pm2` to keep it running in the background.

   **Example PM2 Command**:
   ```bash
   pm2 start ./start.sh --name "ashray-backend"
   ```

   **Example systemd service definition (`/etc/systemd/system/ashray-backend.service`)**:
   ```ini
   [Unit]
   Description=Ashray FastAPI Backend
   After=network.target

   [Service]
   User=www-data
   WorkingDirectory=/var/www/ashray-backend
   ExecStart=/var/www/ashray-backend/start.sh
   Restart=always
   Environment=PORT=8000 DATABASE_URL=postgresql://user:pass@localhost/dbname

   [Install]
   WantedBy=multi-user.target
   ```

---

## 3. Render Deployment

Render uses a stateless build-and-run environment. You must separate the build phase from the run phase.

### Configuration Settings
When creating a **Web Service** on Render, set the following fields:

- **Environment**: `Python`
- **Build Command**: `./setup.sh`
- **Start Command**: `./start.sh`

### Environment Variables
Configure the following Environment Variables in the Render dashboard:
- `PORT`: `8000` (or leave default, Render automatically provides this)
- `DATABASE_URL`: Your production database connection string (e.g. PostgreSQL)

*Note: Playwright browser binaries downloaded during the build step are cached in Render's build directory and carried over to the runtime environment automatically.*

---

## 4. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `PORT` | The port on which uvicorn listens. | `8000` |
| `DATABASE_URL` | SQLAlchemy connection string (e.g. SQLite, PostgreSQL). | `sqlite:///./test.db` |
| `PLAYWRIGHT_BROWSERS_PATH` | Directory where Playwright downloads and looks for browser binaries. | `~/.cache/ms-playwright` |

---

## 5. Troubleshooting Guide

### Missing Browser Binary Error
**Error**: `BrowserType.launch: Executable doesn't exist at...`
- **Solution**: The Playwright Chromium binary was not installed. Run:
  ```bash
  python -m playwright install chromium
  ```

### Missing Shared Libraries
**Error**: `error while loading shared libraries: libgbm.so.1: cannot open shared object file...`
- **Solution**: Headless Chromium requires specific system libraries. Run the installer script as `root`/`sudo`:
  ```bash
  sudo python -m playwright install-deps chromium
  ```

### Startup Resilience
The backend is designed to be resilient. If Playwright or Chromium is completely missing or fails to launch, the FastAPI application **will still start** and serve all Ledger APIs normally. Only the `/api/seo/validate` endpoint will return a clear JSON diagnostic message describing the missing browser binary.
