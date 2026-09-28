const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

async function request(
  path: string,
  options: RequestInit = {},
) {
  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      cache: "no-store",
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.detail ||
      data?.error ||
      "Request failed",
    );
  }

  return data;
}


export async function getCategories() {
  return request("/catalog/categories");
}


export async function getCountries() {
  return request("/catalog/countries");
}


export async function getJobs(
  params: Record<string, string | number | undefined> = {},
) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        searchParams.set(key, String(value));
      }
    },
  );

  const query = searchParams.toString();

  return request(
    `/jobs${query ? `?${query}` : ""}`,
  );
}


export async function getJob(jobId: string) {
  return request(`/jobs/${jobId}`);
}


export async function generateAI(
  prompt: string,
  token: string,
) {
  return request("/ai/generate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      prompt,
    }),
  });
}
