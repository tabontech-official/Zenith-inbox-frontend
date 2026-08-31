/*
|--------------------------------------------------------------------------
| Account timezone
|--------------------------------------------------------------------------
|
| Every timestamp shown to a user is rendered in the timezone their
| account is set to, not in whatever zone the browser happens to be in
| and not in UTC. A run that fired at 08:40 local should read 08:40.
|
| STORED FORMAT
|
| An IANA identifier — "Asia/Karachi", "America/Toronto", "UTC". That is
| the only form that survives daylight saving: a stored offset is right
| for half the year and an hour wrong for the other half.
|
| The settings form used to write a decorated label instead, e.g.
| "(GMT-05:00) America/Toronto", from a list of three hardcoded options.
| That string is not a timezone as far as any date API is concerned, so
| normalizeTimeZone() digs the identifier back out of it and existing
| accounts keep working without a migration.
|
| DETECTION
|
| The browser knows where it is. A new account gets that zone rather than
| a default that is wrong for almost everyone, and the settings form
| offers a one-click "use my system timezone" for anyone who moves.
*/

/* The zone the browser is in, or UTC if it will not say. */
export const systemTimeZone = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
};

/* Does the runtime recognise this identifier? */
export const isValidTimeZone = (zone) => {
  if (!zone || typeof zone !== 'string') return false;

  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone }).format(new Date());
    return true;
  } catch {
    return false;
  }
};

/*
 * Turn whatever is stored into a usable IANA identifier.
 *
 * Accepts a bare identifier, or the legacy decorated label the old
 * three-option picker wrote. Falls back to the system zone rather than
 * to UTC — a wrong-but-local time is far less confusing than a correct
 * time in a zone the reader does not live in.
 */
export const normalizeTimeZone = (stored) => {
  const raw = String(stored || '').trim();

  if (!raw) return systemTimeZone();
  if (isValidTimeZone(raw)) return raw;

  /* "(GMT-05:00) America/Toronto" -> "America/Toronto" */
  const decorated = raw.match(/\)\s*(.+)$/);
  if (decorated && isValidTimeZone(decorated[1].trim())) {
    return decorated[1].trim();
  }

  /* Any Region/City token anywhere in the string. */
  const token = raw.match(/[A-Za-z]+(?:_[A-Za-z]+)*\/[A-Za-z]+(?:_[A-Za-z]+)*/);
  if (token && isValidTimeZone(token[0])) return token[0];

  return systemTimeZone();
};

/*
 * The current UTC offset of a zone, as "+05:00", for labelling.
 * Computed from a real date so it reflects daylight saving today rather
 * than a value written down once.
 */
export const offsetLabel = (zone, when = new Date()) => {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      timeZoneName: 'longOffset',
    }).formatToParts(when);

    const name = parts.find((p) => p.type === 'timeZoneName')?.value || '';

    /* Intl gives "GMT+5:00" or plain "GMT" for zero. */
    if (name === 'GMT') return '+00:00';

    const match = name.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
    if (!match) return '';

    const [, sign, hours, minutes = '00'] = match;
    return `${sign}${hours.padStart(2, '0')}:${minutes}`;
  } catch {
    return '';
  }
};

/*
 * Every zone the runtime knows, newest browsers first, with a small
 * hand-written list as a fallback for runtimes without
 * Intl.supportedValuesOf — a picker with three entries is what caused
 * the problem this replaces.
 */
const FALLBACK_ZONES = [
  'UTC',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Sao_Paulo',
  'Europe/London',
  'Europe/Dublin',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Istanbul',
  'Africa/Lagos',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Australia/Perth',
  'Australia/Sydney',
  'Pacific/Auckland',
];

export const allTimeZones = () => {
  try {
    const supported = Intl.supportedValuesOf?.('timeZone');
    if (Array.isArray(supported) && supported.length) return supported;
  } catch {
    /* fall through */
  }

  return FALLBACK_ZONES;
};

/*
 * Options for a <select>, sorted west to east so the list reads like a
 * map rather than an alphabet.
 */
export const timeZoneOptions = () =>
  allTimeZones()
    .map((zone) => {
      const offset = offsetLabel(zone);
      return {
        value: zone,
        label: offset ? `(GMT${offset}) ${zone.replace(/_/g, ' ')}` : zone,
        sort: offset
          ? Number(offset.slice(0, 3)) * 60 +
            Number(offset.slice(0, 1) + offset.slice(4))
          : 0,
      };
    })
    .sort((a, b) => a.sort - b.sort || a.value.localeCompare(b.value));

const DEFAULT_PARTS = {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
};

/*
 * Render a date in the account's zone.
 *
 * Returns "" for a missing or unparseable value rather than "Invalid
 * Date", so a row with no timestamp shows an empty cell instead of an
 * error string.
 */
export const formatInTimeZone = (value, zone, options = {}) => {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return '';

  const timeZone = normalizeTimeZone(zone);

  try {
    return new Intl.DateTimeFormat('en-US', {
      ...DEFAULT_PARTS,
      ...options,
      timeZone,
    }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-US', {
      ...DEFAULT_PARTS,
      ...options,
    }).format(date);
  }
};

/* Short label for a footer or a column header: "PKT (GMT+05:00)". */
export const timeZoneBadge = (zone) => {
  const timeZone = normalizeTimeZone(zone);
  const offset = offsetLabel(timeZone);

  try {
    const abbrev = new Intl.DateTimeFormat('en-US', {
      timeZone,
      timeZoneName: 'short',
    })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value;

    if (abbrev && !/^GMT/.test(abbrev)) {
      return offset ? `${abbrev} (GMT${offset})` : abbrev;
    }
  } catch {
    /* fall through to the identifier */
  }

  return offset ? `${timeZone} (GMT${offset})` : timeZone;
};
