from datetime import datetime, date
from typing import Dict, Tuple, Optional
from fastapi import HTTPException
from app.core.config import settings
import logging

logger = logging.getLogger("strapy_ats.rate_limiter")


class FreemiumRateLimiter:
    def __init__(self, anon_limit: int = 2, free_user_limit: int = 10):
        self.anon_limit = anon_limit
        self.free_user_limit = free_user_limit
        # Store format: key (ip or user_id) -> (count, date)
        self.records: Dict[str, Tuple[int, date]] = {}

    def check_and_increment(
        self,
        ip_address: str,
        user_id: Optional[str] = None,
        plan: str = "anon",
        byok_key: Optional[str] = None
    ) -> Tuple[bool, int]:
        """
        Checks if the request is within daily quota.
        - Pro plan: unlimited
        - BYOK key: unlimited
        - Free registered user (user_id): 10 requests/day
        - Anonymous visitor (ip_address): 2 requests/day
        """
        # Pro users and BYOK have unlimited quota
        if plan.lower() == "pro":
            return True, 999999

        if byok_key and len(byok_key.strip()) > 10:
            logger.info(f"Bypassing rate limit for {ip_address} (BYOK provided)")
            return True, 999999

        # Local development bypass
        if settings.ENVIRONMENT == "development" and ip_address in ("127.0.0.1", "localhost", "::1"):
            if not user_id:
                # In development without user, allow unlimited or high limit
                return True, 999999

        today = date.today()

        if user_id:
            track_key = f"user:{user_id}"
            limit = self.free_user_limit
        else:
            track_key = f"ip:{ip_address}"
            limit = self.anon_limit

        count, last_date = self.records.get(track_key, (0, today))

        if last_date != today:
            count = 0
            last_date = today

        if count >= limit:
            remaining = 0
            logger.warning(f"Rate limit reached for {track_key}: {count}/{limit}")
            return False, remaining

        count += 1
        self.records[track_key] = (count, today)
        remaining = limit - count
        return True, remaining

    def get_remaining(self, ip_address: str, user_id: Optional[str] = None, plan: str = "anon") -> int:
        if plan.lower() == "pro":
            return 999999
        today = date.today()
        track_key = f"user:{user_id}" if user_id else f"ip:{ip_address}"
        limit = self.free_user_limit if user_id else self.anon_limit
        count, last_date = self.records.get(track_key, (0, today))
        if last_date != today:
            return limit
        return max(0, limit - count)


rate_limiter = FreemiumRateLimiter(
    anon_limit=settings.MAX_REQUESTS_PER_IP_PER_DAY,
    free_user_limit=settings.MAX_REQUESTS_FREE_USER_PER_DAY
)
