// Functional Requirements

import { useImperativeHandle } from "react";

// 1) Allow/Deny incoming reuqests based on user/client key and configured rate limits
// 2)  Support plugable rate limituing algorithms (Token bucket, sliding window, etc)
// 3) support dynamic configuration per client tier (free vs trial)


interface RateLimitRule {
    capacity: Number;
    refillRatePerSec: Number;
}

interface IRateLimitStrategy {
    allowRequest(clientId: string, cost?: number): Promise<boolean>;
}

interface TokenBucketState{
    tokens: Number;
    lastRefillTimeStamps: Number;
}

export class TokenBucketStrategy implements IRateLimitStrategy{
    private buckets: Map<string, TokenBucketState> = new Map();
    private readonly defaultRule: RateLimitRule;
    private readonly clientRules: Map<string, RateLimitRule>;

    constructor(defaultRule: RateLimitRule, clientRules: Map<String, RateLimitRule> = new Map()) {
        this.defaultRule = defaultRule;
        this.clientRules = clientRules;
    }

    public async allowRequest(clientId: string, cost: numnber =1): Promise<boolean> {
        const rule = this.clientRules.get(clientId) ?? this.defaultRule;
        const now = Date.now();

        let bucket = this.buckets.get(clientId);
        if (!bucket) {
            bucket = {
                tokens: rule.capacity,
                lastRefillTimeStampsL: now,
            };
            this.buckets.set(clientId, bucket);
        }

        const elapsedTime = (now - bucket.lastRefillTimeStamps)/1000;
        const tokensToAdd = elapsedTimeSec * rule.refillRatePerSec;

        if (tokensToAdd > 0){
            bucket.tokens = Math.min(rule.capacity, bucket.tokens + tokensToAdd);
            bucket.lastRefillTimestampMs = now;
        }

        if (bucket.tokens >= cost){
            bucket.tokens -= cost;
            return true;
        }

        return false;
    }
}

class SlidingWindowLogStrategy implements IRateLimitStrategy {
    private requestLogs: Map<String, number[]> = new Map();
    private readonly windowSizeMs: number;
    private readonly maxRequests: number;

    constructor(windowSizeMs: number, maxRequests: number){
        this.windowSizeMs = windowSizeMs;
        this.maxRequests = maxRequests;
    }
} 