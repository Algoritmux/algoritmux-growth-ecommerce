export const utmParameterNames = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
] as const;

export type UtmParameterName = (typeof utmParameterNames)[number];
export type StoredUtmParameters = Partial<Record<UtmParameterName, string>>;
export type UtmPayload = Record<UtmParameterName, string | null>;

const storageKey = 'diagnostic_lead_utms';
const maximumUtmLength = 255;

export function getStoredUtmParameters(): StoredUtmParameters {
  try {
    const storedValue = window.sessionStorage.getItem(storageKey);

    if (!storedValue) return {};

    const parsed = JSON.parse(storedValue) as unknown;

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};

    return Object.fromEntries(
      utmParameterNames.flatMap((parameter) => {
        const value = (parsed as Record<string, unknown>)[parameter];

        return typeof value === 'string' && value.trim()
          ? [[parameter, value.trim().slice(0, maximumUtmLength)]]
          : [];
      }),
    );
  } catch {
    return {};
  }
}

export function captureUtmParameters(search: string): StoredUtmParameters {
  const searchParameters = new URLSearchParams(search);
  const storedParameters = getStoredUtmParameters();

  utmParameterNames.forEach((parameter) => {
    const value = searchParameters.get(parameter)?.trim();

    if (value) {
      storedParameters[parameter] = value.slice(0, maximumUtmLength);
    }
  });

  try {
    if (Object.keys(storedParameters).length > 0) {
      window.sessionStorage.setItem(storageKey, JSON.stringify(storedParameters));
    }
  } catch {
    // The form still works when browser storage is unavailable.
  }

  return storedParameters;
}

export function getUtmPayload(): UtmPayload {
  const storedParameters = getStoredUtmParameters();

  return Object.fromEntries(
    utmParameterNames.map((parameter) => [parameter, storedParameters[parameter] ?? null]),
  ) as UtmPayload;
}

export function clearStoredUtmParameters(): void {
  try {
    window.sessionStorage.removeItem(storageKey);
  } catch {
    // Nothing to clear when browser storage is unavailable.
  }
}
