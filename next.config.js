/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.shutterstock.com",
      },
      {
        protocol: "https",
        hostname: "motherwouldknow.com",
      },
      {
        protocol: "https",
        hostname: "*.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "woodsala.com",
      },
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "ultranl.com",
      },
      {
        protocol: "https",
        hostname: "gardenzeus.com",
      },
      {
        protocol: "https",
        hostname: "www.gardenzeus.com",
      },
    ],
  },
};

export default config;
