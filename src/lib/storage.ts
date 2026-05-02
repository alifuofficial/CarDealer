"use server";

import { prisma } from "@/lib/prisma";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Uploads a file either to local storage or FTP based on organization settings.
 * Returns the URL path to access the file.
 */
export async function uploadFile(file: File, prefix: string): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileName = `${prefix}-${Date.now()}${path.extname(file.name)}`;
  
  const org = await prisma.organization.findUnique({ where: { id: "singleton" } });
  
  if (org?.isFtpEnabled && org.ftpHost) {
    const ftp = require("basic-ftp");
    const client = new ftp.Client();
    try {
      await client.access({
        host: org.ftpHost,
        port: org.ftpPort || 21,
        user: org.ftpUser || "",
        password: org.ftpPassword || "",
        secure: org.ftpIsSecure,
      });
      
      const remoteRoot = org.ftpRoot || "/";
      await client.ensureDir(remoteRoot);
      
      const { Readable } = require("stream");
      const stream = Readable.from(buffer);
      
      // Use relative filename since we are already in the correct directory
      await client.uploadFrom(stream, fileName);
      
      // Return local proxy URL for better compatibility (iframes, CORS)
      // Even if ftpBaseUrl is configured, the proxy is more reliable for in-app previews
      /*
      if (org.ftpBaseUrl) {
        const baseUrl = org.ftpBaseUrl.endsWith("/") ? org.ftpBaseUrl.slice(0, -1) : org.ftpBaseUrl;
        return `${baseUrl}/${fileName}`;
      }
      */
      
      return `/api/uploads/${fileName}`;
    } catch (err) {
      console.error("FTP Upload Error:", err);
      throw new Error(`FTP Upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      client.close();
    }
  } else {
    // Local storage
    const UPLOADS_DIR = process.env.NODE_ENV === "production" ? "/data/uploads" : path.join(process.cwd(), "public", "uploads");
    await mkdir(UPLOADS_DIR, { recursive: true });
    const filePath = path.join(UPLOADS_DIR, fileName);
    await writeFile(filePath, buffer);
    return `/api/uploads/${fileName}`;
  }
}
