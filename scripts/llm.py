#!/usr/bin/env python3
"""Tiny helper for calling a FreeLLMAPI router (OpenAI-compatible). No pip installs needed.

Settings come from environment variables (never put the key in a file you commit):
  FREELLMAPI_BASE_URL  e.g. http://localhost:3001/v1   (default)
  FREELLMAPI_KEY       the "unified key" shown on the Keys page of the dashboard
  FREELLMAPI_MODEL     optional, default "auto" (router picks). Also "auto:fast" / "auto:smart".

Use from another script:
    from llm import ask
    print(ask("Give 5 title ideas for a video about ancient trade."))

Test from the terminal:
    python3 scripts/llm.py "Say hello in five words"
"""
import json
import os
import sys
import urllib.error
import urllib.request


def ask(prompt, system="You are a careful assistant for a YouTube explainer channel. "
        "Do not invent facts; say when you are unsure.", model=None, temperature=0.7, timeout=120):
    base = os.environ.get("FREELLMAPI_BASE_URL", "http://localhost:3001/v1").rstrip("/")
    key = os.environ.get("FREELLMAPI_KEY")
    if not key:
        raise SystemExit("Set FREELLMAPI_KEY first (the unified key from the FreeLLMAPI dashboard).")
    body = {
        "model": model or os.environ.get("FREELLMAPI_MODEL", "auto"),
        "temperature": temperature,
        "messages": [{"role": "system", "content": system}, {"role": "user", "content": prompt}],
    }
    req = urllib.request.Request(
        base + "/chat/completions",
        data=json.dumps(body).encode(),
        headers={"Content-Type": "application/json", "Authorization": "Bearer " + key},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as r:
            served_by = r.headers.get("X-Routed-Via", "unknown")
            data = json.load(r)
    except urllib.error.HTTPError as e:
        raise SystemExit(f"Router returned HTTP {e.code}: {e.read().decode()[:300]}")
    except urllib.error.URLError as e:
        raise SystemExit(f"Cannot reach {base}: {e.reason}")
    print(f"[served by {served_by}]", file=sys.stderr)
    return data["choices"][0]["message"]["content"]


if __name__ == "__main__":
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    print(ask(" ".join(sys.argv[1:])))
