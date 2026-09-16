// New-format Supabase API keys (sb_publishable_* / sb_secret_*) are opaque
// strings rather than JWTs, so PostgREST needs them in the apikey header only.
export function createSupabaseFetch(supabaseKey: string): typeof fetch {
  const isNewFormat = supabaseKey.startsWith("sb_publishable_") || supabaseKey.startsWith("sb_secret_");

  return (input, init) => {
    const headers = new Headers(
      typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined,
    );

    if (init?.headers) {
      new Headers(init.headers).forEach((value, key) => headers.set(key, value));
    }

    if (isNewFormat && headers.get("Authorization") === `Bearer ${supabaseKey}`) {
      headers.delete("Authorization");
    }

    headers.set("apikey", supabaseKey);
    return fetch(input, { ...init, headers });
  };
}
