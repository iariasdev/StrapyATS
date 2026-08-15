from datetime import datetime, date
from typing import Dict, Tuple, Optional
from fastapi import HTTPException
from app.core.config import settings
import logging

logger = logging.getLogger("strapy_ats.rate_limiter")


class IPRateLimiter:
    def __init__(self, max_requests: int = 2):
        self.max_requests = max_requests
        # Store format: ip -> (count, date)
        self.records: Dict[str, Tuple[int, date]] = {}

    def check_and_increment(self, ip_address: str, byok_key: Optional[str] = None) -> Tuple[bool, int]:
        """
        Checks if IP has remaining quota today.
        If BYOK API key is provided, bypass rate limit completely.
        Returns tuple: (is_allowed, remaining_quota)
        """
        if byok_key and len(byok_key.strip()) > 10:
            logger.info(f"Bypassing rate limit for IP {ip_address} (BYOK active)")
            return True, 999999

        today = date.today()
        count, last_date = self.records.get(ip_address, (0, today))

        if last_date != today:
            # Reset daily quota for a new day
            count = 0
            last_date = today

        if count >= self.max_requests:
            remaining = 0
            logger.warning(f"Rate limit exceeded for IP {ip_address}: {count}/{self.max_requests}")
            return False, remaining

        count += 1
        self.records[ip_address] = (count, today)
        remaining = self.max_requests - count
        return True, remaining

    def get_remaining(self, ip_address: str) -> int:
        today = date.today()
        count, last_date = self.records.get(ip_address, (0, today))
        if last_date != today:
            return self.max_requests
        return max(0, self.max_requests - count)


rate_limiter = IPRateLimiter(max_requests=settings.MAX_REQUESTS_PER_IP_PER_DAY)
