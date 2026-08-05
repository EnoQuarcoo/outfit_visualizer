import jwt
from jwt import PyJWKClient
from fastapi import Header, HTTPException
from app.config import SUPABASE_URL

# Supabase signs session JWTs with ES256 (ECC P-256), not a shared HMAC
# secret, so verification requires fetching the project's public signing key
# from its JWKS endpoint rather than a static secret in .env.
JWKS_URL = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"

# cache_keys=True keeps the fetched public key in memory so we're not
# round-tripping to Supabase's JWKS endpoint on every request.
jwks_client = PyJWKClient(JWKS_URL, cache_keys=True)


async def get_current_user(authorization: str = Header(...)) -> str:
    """
    Verifies a Supabase-issued session JWT from the Authorization header and
    returns the authenticated user's id (the token's `sub` claim).

    Raises HTTPException(401) if the header is missing/malformed, the
    signature doesn't verify, the token has expired, or the audience claim
    doesn't match.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401, detail="Missing or malformed Authorization header"
        )

    token = authorization.removeprefix("Bearer ").strip()

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["ES256"],
            audience="authenticated",
        )
    except jwt.PyJWKClientError as e:
        # Supabase rotates its signing key rarely, but if verification starts
        # failing for tokens that otherwise look valid (e.g. right after a
        # key rotation), the fix is to refresh what PyJWKClient has cached —
        # e.g. re-instantiate jwks_client above, or add an explicit cache
        # TTL/refresh call here. Not built now since rotation is rare enough
        # that it isn't worth the added complexity yet.
        print(f"JWKS signing key lookup failed: {e}")
        raise HTTPException(status_code=401, detail="Unable to verify token")
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Session expired")
    except jwt.InvalidTokenError as e:
        print(f"JWT verification failed: {e}")
        raise HTTPException(status_code=401, detail="Invalid authentication token")
 
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Token missing subject claim")

    return user_id
