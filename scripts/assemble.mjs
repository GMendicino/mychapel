import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";

const OUT_DIR = "dist";
const WEBSITE_BUILD_DIR = path.join("apps", "website", "build");
const CREATOR_BUILD_DIR = path.join("apps", "tour-creator", "dist");
const CREATOR_MOUNT_PATH = path.join(OUT_DIR, "creator");

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

await cp(WEBSITE_BUILD_DIR, OUT_DIR, { recursive: true });
await mkdir(CREATOR_MOUNT_PATH, { recursive: true });
await cp(CREATOR_BUILD_DIR, CREATOR_MOUNT_PATH, { recursive: true });