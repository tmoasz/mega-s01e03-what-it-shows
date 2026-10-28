<script lang="ts">
  import { evidence } from '#lib/kb/evidence';

  const candidates = evidence.exceptions.filter((r) => r.symptom === 'one-day candidate');
  const anomalies = evidence.exceptions.filter((r) => r.symptom === 'chronology anomaly');
</script>

<section aria-labelledby="computed-evidence">
  <h2 id="computed-evidence">Computed evidence for #{evidence.ticket}</h2>
  <p>
    <strong>{evidence.rawCount} exported rows → {evidence.uniqueCount} unique report IDs → {evidence.merged.length} reports merged into #{evidence.ticket}.</strong>
    Overlapping export pages contribute {evidence.duplicateRows} extra rows, not extra reports.
    Counts below use <code>uniqueById</code>, <code>tenantOf</code>, and <code>causeOf</code>;
    browser locale and intake tags do not assign the cause.
  </p>
  <p class="caveat">
    These are the source classifier's groups, not independently reproduced root causes.
    Its tenant-locale/channel/form rule does not read report bodies. Desk-note exceptions remain
    inside their classifier group and are examined separately below; they are not additional reports.
  </p>

  <p>
    <code>parser</code>: a day-first tenant outside booking-v3's form route.
    <code>hint</code>: a day-first tenant using the booking-v3 form, whose displayed hint is month-first.
    A shared “wrong date” symptom or a common merge target does not establish one root problem.
  </p>
  {#each evidence.groups as group (group.cause)}
    <details>
      <summary>{group.cause}: all {group.ids.length} report IDs and tenant membership</summary>
      <p>Tenants: {group.tenants.join(', ')}</p>
      <p class="ids">{group.ids.join(', ')}</p>
    </details>
  {/each}

  <h3>Intake tags disagree with the classifier</h3>
  <p>
    <strong>{evidence.disagreements.length} unique reports</strong> have an intake tag different from their source classifier output.
    This comparison diagnoses intake disagreement; it does not prove the classifier correct for every report.
  </p>
  <table>
    <caption>Cross-tabulation with exact membership</caption>
    <thead><tr><th>Source classifier</th><th>Intake tag</th><th>Reports</th><th>IDs</th></tr></thead>
    <tbody>
      {#each evidence.tagMatrix as row (row.cause)}
        {#each row.tags as cell (cell.tag)}
          <tr>
            <td>{row.cause}</td><td>{cell.tag}</td><td>{cell.ids.length}</td>
            <td><details><summary>Show {cell.ids.length} IDs</summary><p class="ids">{cell.ids.join(', ')}</p></details></td>
          </tr>
        {/each}
      {/each}
    </tbody>
  </table>

  <h3>Desk-note caveats: symptoms are not root causes</h3>
  <p>
    <code>desk-notes.json → oneDayMove</code> names {evidence.exceptions.length} reports.
    Body review supports <strong>{candidates.length} one-day-move candidates</strong> and
    <strong>{anomalies.length} chronology anomaly</strong>, not five confirmed one-day failures.
    All remain counted under their source classifier outputs. Neither a timezone bug nor a parser
    failure is established by these bodies alone; no third proven root cause is asserted.
  </p>
  {#each evidence.exceptions as item (item.report.id)}
    <article>
      <h4>{item.report.id} — {item.symptom}</h4>
      <p>
        {item.report.tenant} · {item.report.channel} · tenant locale {item.tenant?.locale ?? 'unknown'} ·
        {item.tenant?.form ?? 'unknown form'} · classifier <code>{item.cause}</code> ·
        intake <code>{item.report.meta.intakeTag}</code>
      </p>
      <blockquote>{item.report.body}</blockquote>
      <p>{item.reason}</p>
      <p>Received {item.report.receivedAt}; merged {item.report.mergedAt ?? 'not recorded'}.</p>
    </article>
  {/each}
  {#if evidence.missingDeskNoteIds.length}
    <p class="caveat">Desk-note IDs absent from this ticket: {evidence.missingDeskNoteIds.join(', ')}.</p>
  {/if}

  <h3>Receipt chronology is not merge chronology</h3>
  <p>
    Reports were received from {evidence.received.first} through {evidence.received.last};
    merges run from {evidence.mergeRange.first} through {evidence.mergeRange.last}.
    Month/day buckets below preserve each timestamp's exported local date; timestamps retain their
    explicit offsets, and first/last instants are ordered by parsed time rather than lexical timezone text.
  </p>
  <table>
    <caption>Unique reports by receipt month versus merge month</caption>
    <thead><tr><th>Month</th><th>Received</th><th>Merged</th><th>Audit membership</th></tr></thead>
    <tbody>
      {#each evidence.chronology as month (month.month)}
        <tr>
          <td>{month.month}</td><td>{month.received.length}</td><td>{month.merged.length}</td>
          <td><details><summary>IDs for each clock</summary><p class="ids">Received: {month.received.join(', ') || 'none'}</p><p class="ids">Merged: {month.merged.join(', ') || 'none'}</p></details></td>
        </tr>
      {/each}
    </tbody>
  </table>
  {#if evidence.busiestMergeDay}
    {@const batch = evidence.busiestMergeDay}
    <p>
      The busiest merge day, <strong>{batch.day}</strong>, contains <strong>{batch.ids.length}</strong>
      unique reports, merged between {batch.times.first} and {batch.times.last}.
      <strong>{batch.earlierReceipts.length}</strong> were received on earlier local calendar dates.
      A merge spike is therefore not evidence of an incident starting that day, a new release, or a regression.
    </p>
    <details><summary>Audit busiest-day IDs</summary><p class="ids">Merged: {batch.ids.join(', ')}</p><p class="ids">Received earlier: {batch.earlierReceipts.join(', ')}</p></details>
  {/if}

  <h3>Export overlap audit</h3>
  <p>
    {evidence.overlaps.length} IDs occur more than once; {evidence.overlaps.filter((r) => r.conflicting).length}
    have conflicting exported field values. <code>uniqueById</code> keeps the last copy of each ID.
  </p>
  <details>
    <summary>Show overlapping IDs and copy counts</summary>
    <ul>{#each evidence.overlaps as item (item.id)}<li>{item.id}: {item.copies} copies; {item.conflicting ? 'conflicting values' : 'identical exported values'}</li>{/each}</ul>
  </details>

  <h3>Full report audit</h3>
  <p>
    Provenance: <code>src/lib/data/reports-4471.json</code>, the tenant directory under
    <code>src/lib/data/tenants/</code>, <code>src/lib/data/desk-notes.json</code>,
    <code>src/lib/kb/causes.ts</code>, and <code>src/lib/kb/locales.ts</code>.
    The following rows expose every unique report's body, tenant rule, intake tag, and both clocks.
  </p>
  <details>
    <summary>Inspect all {evidence.classified.length} unique reports</summary>
    {#each evidence.classified as item (item.report.id)}
      <article>
        <h4>{item.report.id} — {item.report.subject}</h4>
        <p>{item.report.tenant} · {item.tenant?.locale ?? 'unknown locale'} · {item.tenant?.form ?? 'unknown form'} · {item.report.channel}</p>
        <p>Classifier: {item.cause}; intake: {item.report.meta.intakeTag}; reporter browser locale: {item.report.meta.browserLocale}.</p>
        <blockquote>{item.report.body}</blockquote>
        <p>Received {item.report.receivedAt}; merged into #{item.report.mergedInto} at {item.report.mergedAt ?? 'unknown'}.</p>
      </article>
    {/each}
  </details>
</section>

<style>
  .caveat { border-left: 3px solid var(--warn); padding-left: 1rem; }
  .ids { overflow-wrap: anywhere; font-family: monospace; font-size: 0.9em; }
  details { margin-block: 0.75rem; }
  summary { cursor: pointer; }
  article { border-top: 1px solid var(--muted); padding-block: 0.75rem; }
  td { vertical-align: top; }
</style>
