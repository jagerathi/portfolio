---
title: "Monolith to SOA to SaaS: what I'd do differently"
date: "2026-05-18"
excerpt: "A decade modernizing a custom ERP, and the handful of lessons I'd hand to my past self."
tags: ["architecture", "erp", "modernization"]
slug: "monolith-to-saas"
---

I inherited a custom ERP system that was built on .NET and SQL — but on an early version of the
framework, and it was showing its age. Over the next decade-plus it became my focus, and we took
it through a full arc: monolith, to service-oriented architecture, to a cloud-based SaaS.

I'm genuinely proud of where it landed. The system carried real customers and real money the
entire time, and it never had a flag day, never had the dreaded big-bang rewrite. But a ten-year
journey leaves you with opinions. If I could hand a few notes to the version of me who was just
starting out, here's what they'd say.

<div class="takeaways">
  <p class="tw-label">key takeaways</p>
  <ul>
    <li>Modernize the delivery pipeline before the architecture — everything downstream gets cheaper.</li>
    <li>Service boundaries are a data-ownership problem first and a code problem second.</li>
    <li>Reliability earns you the right to chase performance, not the other way around.</li>
    <li>Avoid the big-bang rewrite. Strangle the old system one capability at a time.</li>
    <li>Patience compounds: every step that leaves the system more maintainable than you found it pays off for years.</li>
  </ul>
</div>

## A quick word on where it started

When I took it over, the ERP was a classic monolith of its era. One large codebase, one
database, a deployment process that involved a lot of care and a fair amount of holding your
breath. It worked — it had worked for years — but every change was riskier than it should have
been, and the cost of that risk compounded with every release.

The temptation in that situation is enormous: *rip it out and start clean.* I'm very glad we
didn't. What follows is, in large part, the story of why incremental beat heroic.

## 1. Modernize the delivery pipeline first

The single best decision we made was to fix how we shipped before we tried to change what we
shipped. We moved source control off SourceSafe and onto a modern system. We stood up a
continuous build environment so that "does it compile and pass tests" stopped being a question
a human answered. Then we tackled deployment and configuration, so that releasing stopped being
a ritual and started being a button.

This ordering matters more than it looks. Every architectural change you make afterward — every
service you extract, every boundary you draw — has to be built, tested, and deployed. If those
steps are slow, manual, and scary, then the cost of *each* architectural improvement is inflated
by the broken pipeline underneath it. Fix the pipeline first and you lower the price of every
subsequent change. It's leverage.

If your build and deploy story is manual today, that's where I'd start, full stop. Not because
it's glamorous, but because it makes everything else affordable.

## 2. Service boundaries are a data problem, not a code problem

When people imagine breaking up a monolith, they picture untangling code — extracting classes,
drawing module lines, splitting a repository. In my experience the code was never the hard part.
The data was.

A monolith gets to cheat. It shares tables freely. It wraps unrelated operations in a single
transaction and leans on the database to keep everything consistent. Those are conveniences you
don't even notice you're using until you try to pull two services apart and discover they've been
quietly holding hands inside the same schema the whole time.

The real work of service-oriented architecture was deciding who *owns* what data, and then making
every cross-boundary interaction an explicit contract instead of an implicit shared table. Once we
got the data ownership right, the code boundaries mostly drew themselves. When we got impatient and
drew a boundary around code without sorting out the data underneath, we always paid for it later.

So my rule of thumb now: don't ask "how do I split this code?" Ask "who should own this data, and
what's the contract for everyone else who needs it?" The architecture falls out of the answer.

## 3. Reliability buys you the right to chase performance

In an ERP, reliability isn't a feature — it's the entire value proposition. People are running
their business on it. Data has to be protected, both inside the application and in the environment
hosting it. Changes have to be auditable: who changed what, and when, surviving years of financial
scrutiny. We rarely delete anything, which makes an ever-growing dataset its own ongoing challenge.

For a long stretch, reliability was nearly all we thought about, and that was correct. But it also
meant performance work kept getting deferred — there was always a more important "don't lose
anything" concern in front of it.

What changed the equation was the move to the cloud, with solid CI/CD and reproducible
infrastructure underneath it. Once we could trust that we wouldn't lose data and that we could
recover quickly, we finally had the standing to shift attention to making things fast. The lesson I
took from that: you earn the right to optimize performance by first being trustworthy. Chase speed
before you've earned it and you're just adding risk to a system people already can't afford to lose.

## 4. Don't underestimate the database decision

When we sized the cloud migration, database hosting turned out to be both the largest recurring
cost and the most critical single component. That combination makes it the natural anchor of the
whole architecture — everything else ends up designed around the constraints it sets.

I won't relitigate the whole decision here; it deserves its own write-up. The note to my past self
is simply: take that decision seriously and early. Don't let it become a surprise on the first
month's bill, and don't treat it as an implementation detail. It shapes far more than it appears to.

## 5. Avoid the big-bang rewrite

The thread running through all of this is incrementalism. We never stopped the world to rebuild.
We strangled the old system one capability at a time — modernizing delivery, then carving out
services around data ownership, then moving to the cloud — while it kept running the business.

Big-bang rewrites are seductive because they promise to escape the mess all at once. In practice
they trade a known, working, messy system for an unknown, unfinished, also-messy one, and they ask
your customers to wait through the gap. A ten-year incremental march sounds glacial, but at no point
were we betting the company on a flag day, and at every point the system was a little better than the
month before.

## The thing I got right

If I had to name the single thing I'd repeat without hesitation, it's patience. Each step left the
platform more maintainable than I found it. There was never a moment where we paused delivery to
"clean things up." Improvement was continuous, woven into normal work, and it compounded.

Monolith to SOA to SaaS reads like three big leaps. Lived from the inside, it was a long series of
small, deliberate, boring decisions — and that's exactly why it worked.
