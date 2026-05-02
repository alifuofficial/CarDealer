import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import fs from "fs";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path: pathSegments } = await params;
  const fileName = pathSegments[pathSegments.length - 1]; // Use the last segment as the filename
  const filePath = pathSegments.join("/");
  
  const org = await prisma.organization.findUnique({ where: { id: "singleton" } });
  
  let fileBuffer: Buffer;
  const mimeTypes: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".pdf": "application/pdf",
    ".ico": "image/x-icon",
  };
  const ext = path.extname(filePath).toLowerCase();

  try {
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
        
        const { PassThrough, Readable } = require("stream");
        const passThrough = new PassThrough();
        
        // Start the download and ensure client closes after stream ends or fails
        client.downloadTo(passThrough, fileName)
          .finally(() => client.close());

        return new NextResponse(Readable.toWeb(passThrough) as any, {
          headers: {
            "Content-Type": mimeTypes[ext] || "application/octet-stream",
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      } catch (err) {
        client.close();
        console.error("FTP Download Error:", err);
        throw err;
      }
    } else {
      const UPLOADS_DIR = process.env.NODE_ENV === "production" ? "/data/uploads" : path.join(process.cwd(), "public", "uploads");
      const fullPath = path.join(UPLOADS_DIR, filePath);

      // Security check
      if (!fullPath.startsWith(UPLOADS_DIR)) {
        return new NextResponse("Forbidden", { status: 403 });
      }

      if (!fs.existsSync(fullPath)) {
        return new NextResponse("Not Found", { status: 404 });
      }

      fileBuffer = await readFile(fullPath);
    }
    
    const contentType = mimeTypes[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer as any, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("API Upload Error:", error);
    return new NextResponse("Error reading file", { status: 500 });
  }
}
