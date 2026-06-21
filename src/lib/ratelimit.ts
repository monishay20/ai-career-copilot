import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// 5 analyze requests per 10 minutes per user
export const analyzeRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:analyze",
});

// 3 rewrite requests per 10 minutes per user
export const rewriteRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "10 m"),
  prefix: "ratelimit:rewrite",
});

// 5 download requests per 10 minutes per user
export const downloadRatelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "10 m"),
  prefix: "ratelimit:download",
});