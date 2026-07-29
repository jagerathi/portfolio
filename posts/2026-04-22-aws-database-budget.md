---
title: "Choosing an AWS database without blowing the budget"
date: "2026-04-22"
excerpt: "Database hosting was our biggest cloud expense and our most critical component. Here's how we approached the trade-off."
tags: ["aws", "databases", "cost"]
slug: "aws-database-budget"
---

When we finally got the green light to move to the cloud, I assumed approval was the hard part.
It wasn't. The hard part started right after: picking a provider, and then picking the right
services *within* that provider. And the decision that mattered most — the one I lost the most
sleep over — was the database.

Database hosting was going to be the single largest line item on our monthly bill, and also the
most critical piece of the entire system. That's an uncomfortable combination. You can't cheap out
on the thing your business runs on, but you also can't let it quietly consume the whole budget you
just fought to get approved. This post is about how I learned to hold both of those truths at once.

<div class="takeaways">
  <p class="tw-label">key takeaways</p>
  <ul>
    <li>Treat the database as the anchor of the architecture, then design everything else around it.</li>
    <li>Start from your real data set and your performance floor — not the vendor feature matrix.</li>
    <li>Compare idle cost and under-load cost separately; the gap tells you whether the pricing model fits you.</li>
    <li>Part of the value you're buying is offloaded operational burden, not just compute.</li>
    <li>An explicit budget is a design input, not a number you reconcile after the first bill.</li>
  </ul>
</div>

## Why the database dominates everything else

In most architectures, the database is special for two reasons at once, and they pull in opposite
directions.

First, it's the most critical component. If it's slow, everything is slow. If it's down, you're
down. If it loses data, no amount of clever application code saves you. That argues for spending
generously and never compromising.

Second, for a data-heavy system like ours, it's the most expensive component. Storage, throughput,
high availability, backups — it all adds up, and it recurs every single month. That argues for
spending carefully and questioning every dollar.

The trap is treating those as a tug-of-war you resolve with a gut feeling. What worked for us was
reframing the database not as one cost center among many, but as the *anchor* of the architecture.
Once we accepted that it set the constraints everything else would live within, the decision got
clearer. We weren't trying to minimize the database bill in isolation; we were trying to find the
configuration that met our non-negotiables and then shaping the rest of the system to fit.

## The mistake I almost made: starting from the feature matrix

My first instinct was the wrong one. I started where I think most people start: comparing the
managed database options feature by feature. This one has that replication mode, that one has this
failover story, this other one has a slightly different scaling model. Within a day I had a
spreadsheet with thirty rows and no idea what actually mattered.

The problem with the feature matrix is that it answers the question "what *can* these do?" when the
question I needed answered was "what does *my* workload actually require?" Those are completely
different. A feature is only valuable if it maps to a real constraint of yours, and the matrix has no
opinion about which of your constraints are real.

So we threw the matrix away — not literally, but as the starting point — and started from our own
system instead.

## The questions that actually did the work

We spent weeks comparing the major players before settling on a vendor, and then weeks more on the
specific services within it. The questions that earned their keep were not about features. They were
about us.

**What is the real data set, today and in a few years?** We rarely delete data, so growth wasn't a
footnote — it was a primary design constraint. A choice that's comfortable at today's size and
miserable at triple the size isn't a real choice; it's a deferred migration.

**What is the performance floor we genuinely cannot go below?** Not the dazzling peak we'd love to
hit — the floor beneath which the business actually suffers. Designing to the floor instead of the
ceiling kept us honest about what we were really paying for.

**What does it cost idle, and what does it cost under load?** These are two different numbers, and the
gap between them tells you whether a pricing model fits your usage pattern. A model that's cheap when
idle but punishing under load means something very different for a steady workload than for a spiky
one. Look at both; don't average them in your head.

**How much operational burden are we offloading?** A big part of the entire point of moving to the
cloud was to stop needing a subject-matter expert for every layer of the stack. A managed option that
costs more but removes a whole category of work we used to do by hand isn't just an expense — it's a
trade we were specifically trying to make.

## Budget as a design input, not a postmortem

The most important shift in how I think about this: the budget belongs at the *start* of the design,
not at the end.

It's tempting to design the ideal architecture and then find out what it costs. But the cloud will
happily sell you nearly unlimited resources, which means cost is not a natural constraint the way a
finite data center was. If you don't bring the constraint yourself, nothing else will, and you'll meet
your real budget for the first time on an invoice. That's a bad place to discover it.

So we set the number early and treated it as a first-class requirement, exactly like a performance or
reliability requirement. "It must stay within this monthly envelope" sat right next to "it must meet
this performance floor" and "it must not lose data." When a candidate option failed the budget test,
that was a real failure, considered up front — not a surprise we'd have to explain later.

## What I'd tell someone starting now

Don't start from the feature matrix. Start from your data set and your performance floor. Turn those
into a budget number you're willing to commit to. *Then* go see which managed option fits — and let
that choice anchor the rest of the architecture, rather than bolting the database on at the end.

And give the decision the time it deserves. Ours took weeks of genuine comparison, and the whole
migration ran about ten months. Getting the database choice right early is a big part of why the rest
of it went as smoothly as it did. The database is the one decision where "measure twice, cut once" is
not a cliché — it's just good economics.
