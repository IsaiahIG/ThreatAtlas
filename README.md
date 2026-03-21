# Threat Atlas

Threat Atlas is a malware and reputation lookup dashboard built with Next.js and the VirusTotal API. It lets users scan and review URLs, domains, IP addresses, file hashes, and uploaded files through a clean web interface.

## Features

- URL scanning
- Domain lookup
- IP address lookup
- File hash lookup
- File upload scanning
- Vendor result modal for detailed engine results
- Simple responsive UI

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- React Icons
- VirusTotal API

## Project Structure

```bash
app/
  api/
    vt/
      domain/
      file/
      hash/
      ip/
      url/
components/
  Domain.tsx
  File.tsx
  Hash.tsx
  IP.tsx
  URL.tsx

  How It Works

The frontend sends requests to internal Next.js API routes. Those routes then communicate with the VirusTotal API and return formatted data back to the client.

Each scan type has:

a React component for the UI

a route.ts file for the server-side API request

Supported Scan Types
URL

Submits a URL for analysis and displays detection stats and vendor results.

Domain -Looks up a domain report and displays detection stats and vendor results.

IP -Looks up an IP address report and displays detection stats and vendor results.

Hash -Looks up an existing file hash report and displays detection stats and vendor results.

File -Uploads a file to VirusTotal for scanning and displays detection stats and vendor results.
Note: the ZIP password field is only used for password-protected ZIP files.


Setup

Clone the project and install dependencies:

npm install

Create a .env.local file:

VIRUSTOTAL_API_KEY=your_api_key_here

Start the development server:

npm run dev
Environment Variable
VIRUSTOTAL_API_KEY

This key is required for all VirusTotal API requests.

Disclaimer

Threat Atlas is an independent project that uses the VirusTotal API. It is not affiliated with, endorsed by, or an official product of VirusTotal. Results are provided through VirusTotal services and remain subject to their terms and usage limits.

Purpose

This project was built for learning, practice, and demonstration purposes. It is intended to show how a modern web application can integrate with external malware intelligence APIs and present the results in a user-friendly interface.