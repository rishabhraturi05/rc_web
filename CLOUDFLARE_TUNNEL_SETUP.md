# Cloudflare DNS & Klipper Tunnel Setup Guide
**Domain:** `rc-nitw.org`  
**Subdomain:** `prints.rc-nitw.org`  
**Target:** Ender-3 V3 SE Klipper (Mainsail / Moonraker on DietPi Raspberry Pi 3B+)

---

## 1. Domain & DNS Architecture

### Domain Ownership vs DNS Management
* **Domain Registrar & Billing:** **GoDaddy**
  * Domain ownership, renewal fees, and billing remain 100% on GoDaddy.
* **DNS Manager:** **Cloudflare** (Free Tier)
  * Cloudflare manages DNS records, DDoS protection, CDN caching, and SSL certificates.
* **Website Hosting:** **Vercel**
  * Existing website records were mirrored with zero downtime:
    * `A` record (`@`) -> `216.198.79.1`
    * `CNAME` (`www`) -> `a10ac000369b1a4d.vercel-dns-017.com`
    * `TXT` (`_dmarc`) -> email DMARC policy

### Nameservers Configured in GoDaddy:
* `coco.ns.cloudflare.com`
* `rene.ns.cloudflare.com`

---

## 2. Cloudflare Tunnel Setup

* **Tunnel Name:** `e3v3se-klipper`
* **Tunnel ID:** `5c23fabf-45c9-4d51-8f21-44ea784392eb`
* **Client Machine:** DietPi on Raspberry Pi 3 Model B+ (`linux_arm64`)
* **Tunnel Route (Published Application):**
  * **Subdomain:** `prints`
  * **Domain:** `rc-nitw.org`
  * **Full Hostname:** `prints.rc-nitw.org`
  * **Service URL:** `http://localhost:80`
* **DNS Record Created:**
  * `prints.rc-nitw.org` CNAME -> `5c23fabf-45c9-4d51-8f21-44ea784392eb.cfargotunnel.com`

---

## 3. Moonraker CORS & Trusted Origin Configuration

When opening `https://prints.rc-nitw.org`, Mainsail loads its web assets, but Moonraker (the Klipper API) rejects incoming WebSocket requests from unauthorized domains unless explicitly added to `moonraker.conf`.

### Steps to resolve:
1. SSH into the DietPi machine as root (or open terminal):
   ```bash
   nano /home/*/printer_data/config/moonraker.conf
   ```
   *(Alternative paths if needed: `~/printer_data/config/moonraker.conf` or `/root/printer_data/config/moonraker.conf`)*

2. Locate the `[authorization]` block and append your domain under `cors_domains:`:
   ```ini
   [authorization]
   cors_domains:
       https://my.mainsail.xyz
       http://my.mainsail.xyz
       http://*.local
       http://*.lan
       *://prints.rc-nitw.org
       *://*.rc-nitw.org
   ```

3. Save the file:
   * Press `Ctrl + O`, then hit `Enter`.
   * Press `Ctrl + X` to exit.

4. Restart the Moonraker service:
   ```bash
   systemctl restart moonraker
   ```

5. Refresh `https://prints.rc-nitw.org` in your browser. Mainsail will now connect to Moonraker and display the full Klipper control dashboard.
