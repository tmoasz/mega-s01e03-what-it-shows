import reports from '#lib/data/reports-4471.json';
import notes from '#lib/data/desk-notes.json';
import { causeOf, uniqueById, type Cause, type Report, type Tenant } from '#lib/kb/causes';
import { tenantOf } from '#lib/kb/locales';

// Body-level readings, not alternative root causes. Desk membership comes from desk-notes.json.
const bodyReadings: Record<string, { symptom: 'one-day candidate' | 'chronology anomaly'; reason: string }> = {
  'R-41202': { symptom: 'one-day candidate', reason: '12 May versus 11 May: explicit adjacent calendar dates.' },
  'R-41209': { symptom: 'one-day candidate', reason: 'Explicitly says June bookings are one day off; no mechanism or direction established.' },
  'R-41236': { symptom: 'chronology anomaly', reason: 'Invite reportedly arrived before booking; neither a one-day interval nor a date swap is stated.' },
  'R-41344': { symptom: 'one-day candidate', reason: 'Same meeting shown as Tuesday in Lisbon and Monday in Toronto. A location-related day difference is reported, but timezone causation is not proved.' },
  'R-41620': { symptom: 'one-day candidate', reason: 'Tuesday 6 October reportedly showed as Monday; adjacent weekdays, without a full output date.' }
};

type ClassifiedReport = { report: Report; tenant: Tenant | undefined; cause: Cause | 'unplaced' };
const byId = (a: Report, b: Report) => a.id.localeCompare(b.id);
const instant = (value: string) => Date.parse(value);
const range = (values: string[]) => {
  const sorted = [...values].sort((a, b) => instant(a) - instant(b));
  return { first: sorted[0] ?? null, last: sorted.at(-1) ?? null };
};

/** Pure projection: no source mutation, clock, network, or intake-tag-based cause assignment. */
export function summarizeEvidence(
  source: Report[],
  lookupTenant: (report: Report) => Tenant | undefined,
  deskNoteIds: readonly string[],
  ticket = 4471
) {
  const unique = uniqueById(source);
  const merged = unique.filter((r) => r.mergedInto === ticket).sort(byId);
  const classified: ClassifiedReport[] = merged.map((report) => {
    const tenant = lookupTenant(report);
    return { report, tenant, cause: causeOf(report, tenant) ?? 'unplaced' };
  });
  const groups = (['parser', 'hint', 'unplaced'] as const).map((cause) => {
    const members = classified.filter((r) => r.cause === cause);
    return {
      cause,
      members,
      ids: members.map((r) => r.report.id),
      tenants: [...new Set(members.map((r) => r.report.tenant))].sort(),
      received: range(members.map((r) => r.report.receivedAt)),
      merged: range(members.flatMap((r) => r.report.mergedAt ? [r.report.mergedAt] : []))
    };
  }).filter((g) => g.members.length);
  const copies = new Map<string, Report[]>();
  for (const r of source) {
    const existing = copies.get(r.id);
    if (existing) existing.push(r);
    else copies.set(r.id, [r]);
  }
  const overlaps = [...copies].filter(([, rs]) => rs.length > 1).map(([id, rs]) => ({
    id,
    copies: rs.length,
    // Compare every field in the export; object property order is irrelevant.
    conflicting: rs.some((r) => {
      const first = rs[0];
      return r.receivedAt !== first.receivedAt || r.tenant !== first.tenant || r.channel !== first.channel
        || r.subject !== first.subject || r.body !== first.body || r.mergedInto !== first.mergedInto
        || r.mergedAt !== first.mergedAt || r.meta.browserLocale !== first.meta.browserLocale
        || r.meta.intakeTag !== first.meta.intakeTag;
    })
  })).sort((a, b) => a.id.localeCompare(b.id));
  const disagreements = classified.filter((r) => r.report.meta.intakeTag !== r.cause);
  const tagMatrix = groups.map((group) => ({
    cause: group.cause,
    tags: [...new Set(group.members.map((r) => r.report.meta.intakeTag))].sort().map((tag) => ({
      tag, ids: group.members.filter((r) => r.report.meta.intakeTag === tag).map((r) => r.report.id)
    }))
  }));
  const exceptions = classified.filter((r) => deskNoteIds.includes(r.report.id)).map((r) => ({
    ...r,
    ...(bodyReadings[r.report.id] ?? { symptom: 'unreviewed desk note', reason: 'No body-level assessment is recorded here.' })
  }));
  const months = [...new Set(merged.flatMap((r) => [r.receivedAt.slice(0, 7), ...(r.mergedAt ? [r.mergedAt.slice(0, 7)] : [])]))].sort();
  const chronology = months.map((month) => ({
    month,
    received: merged.filter((r) => r.receivedAt.startsWith(month)).map((r) => r.id),
    merged: merged.filter((r) => r.mergedAt?.startsWith(month)).map((r) => r.id)
  }));
  const mergeDays = [...new Set(merged.flatMap((r) => r.mergedAt ? [r.mergedAt.slice(0, 10)] : []))];
  const busiestMergeDay = mergeDays.map((day) => {
    const members = merged.filter((r) => r.mergedAt?.startsWith(day));
    return {
      day,
      ids: members.map((r) => r.id),
      earlierReceipts: members.filter((r) => r.receivedAt.slice(0, 10) < day).map((r) => r.id),
      times: range(members.flatMap((r) => r.mergedAt ? [r.mergedAt] : []))
    };
  }).sort((a, b) => b.ids.length - a.ids.length || a.day.localeCompare(b.day))[0] ?? null;
  return {
    ticket, rawCount: source.length, uniqueCount: unique.length, merged, classified, groups,
    duplicateRows: source.length - unique.length, overlaps, disagreements, tagMatrix, exceptions,
    missingDeskNoteIds: deskNoteIds.filter((id) => !merged.some((r) => r.id === id)),
    chronology, busiestMergeDay,
    received: range(merged.map((r) => r.receivedAt)),
    mergeRange: range(merged.flatMap((r) => r.mergedAt ? [r.mergedAt] : []))
  };
}

export const evidence = summarizeEvidence(reports as Report[], tenantOf, notes.oneDayMove);
