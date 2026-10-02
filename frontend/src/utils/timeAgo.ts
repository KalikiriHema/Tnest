/**
 * Universal UTC Date Parser & Relative Time Formatter
 * Corrects for timezone offsets (e.g. IST +05:30) when parsing ISO strings without explicit Z suffix.
 */

export const parseUniversalDate = (dateStr?: string | Date | null): Date => {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;

  const trimmed = String(dateStr).trim();
  if (!trimmed) return new Date();

  // If it's a numeric timestamp
  if (/^\d+$/.test(trimmed)) {
    return new Date(Number(trimmed));
  }

  // If ISO format without timezone offset (e.g. "2026-10-02T03:03:31.123" or "2026-10-02 03:03:31")
  // Append 'Z' to guarantee it is parsed as UTC rather than local time
  if (trimmed.includes('T')) {
    if (!trimmed.endsWith('Z') && !trimmed.includes('+') && !trimmed.slice(10).includes('-')) {
      return new Date(`${trimmed}Z`);
    }
  } else if (trimmed.includes(' ')) {
    if (!trimmed.endsWith('Z') && !trimmed.includes('+') && !trimmed.slice(10).includes('-')) {
      return new Date(`${trimmed.replace(' ', 'T')}Z`);
    }
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
};

export const formatRelativeTime = (dateStr?: string | Date | null): string => {
  if (!dateStr) return 'Just now';
  const date = parseUniversalDate(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();

  // Freshly posted or minor clock skew
  if (diffMs <= 60 * 1000) {
    return 'Just now';
  }

  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return 'Yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays}d ago`;
  }
  if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return `${weeks}w ago`;
  }
  const months = Math.floor(diffDays / 30);
  if (months < 12) {
    return `${months}mo ago`;
  }
  const years = Math.floor(diffDays / 365);
  return `${years}y ago`;
};

export const formatMessageTime = (dateStr?: string | Date | null): string => {
  if (!dateStr) return '';
  const d = parseUniversalDate(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatUniversalDate = (
  dateStr?: string | Date | null,
  options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' }
): string => {
  if (!dateStr) return '';
  const d = parseUniversalDate(dateStr);
  return d.toLocaleDateString(undefined, options);
};

