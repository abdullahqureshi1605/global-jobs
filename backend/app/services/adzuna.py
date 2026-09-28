from typing import Any

import httpx

from app.core.settings import ADZUNA_APP_ID, ADZUNA_APP_KEY


class AdzunaClient:
    base_url = "https://api.adzuna.com/v1/api"

    async def search_jobs(
        self,
        country: str,
        page: int = 1,
        results_per_page: int = 20,
        what: str | None = None,
        where: str | None = None,
    ) -> dict[str, Any]:

        params: dict[str, Any] = {
            "app_id": ADZUNA_APP_ID,
            "app_key": ADZUNA_APP_KEY,
            "results_per_page": results_per_page,
            "content-type": "application/json",
        }

        if what:
            params["what"] = what

        if where:
            params["where"] = where

        url = (
            f"{self.base_url}/jobs/"
            f"{country}/search/{page}"
        )

        async with httpx.AsyncClient(timeout=45) as client:
            response = await client.get(
                url,
                params=params,
                headers={"Accept": "application/json"},
            )

        if response.status_code != 200:
            raise RuntimeError(
                f"Adzuna API returned "
                f"{response.status_code}: "
                f"{response.text[:1000]}"
            )

        return response.json()
