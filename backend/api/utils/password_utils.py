"""
Centralized password hashing utility using bcrypt directly.
Replaces passlib CryptContext to avoid the 72-byte limit ValueError.
Bcrypt natively handles 72-byte truncation — this wrapper makes it safe.
"""
import bcrypt as _bcrypt


def _safe_encode(password: str) -> bytes:
    """UTF-8 encode and truncate to bcrypt's 72-byte limit."""
    return password.encode("utf-8")[:72]


def hash_password(password: str) -> str:
    """Hash a plaintext password. Returns a bcrypt hash string."""
    pw_bytes = _safe_encode(password)
    hashed = _bcrypt.hashpw(pw_bytes, _bcrypt.gensalt(rounds=12))
    return hashed.decode("utf-8")


def verify_password(password: str, password_hash: str) -> bool:
    """
    Safely verify a plaintext password against a stored bcrypt hash.
    Returns False on any error (bad hash format, empty values, etc.)
    """
    if not password or not password_hash:
        return False
    try:
        pw_bytes = _safe_encode(password)
        hash_bytes = password_hash.encode("utf-8") if isinstance(password_hash, str) else password_hash
        return _bcrypt.checkpw(pw_bytes, hash_bytes)
    except Exception:
        return False
