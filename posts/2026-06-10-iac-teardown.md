---
title: "Tearing down production in 12 hours: our IaC journey"
date: "2026-06-10"
excerpt: "How infrastructure-as-code turned a fragile data center into something we could rebuild from scratch in an afternoon."
tags: ["aws", "infrastructure", "devops"]
slug: "iac-teardown"
---

For most of my career, "production" was a place. It lived in a rack, in a room, with a
specific set of cables that someone had labeled years ago and nobody dared to touch. If it
went down hard, recovery was measured in days — and in the number of people you could get on
a call who still remembered how a particular box had been configured.

When we moved our ERP platform to AWS, the goal I cared about most wasn't cost, and it wasn't
even raw performance. It was this: **I wanted to be able to delete production and bring it
back.** Not because I planned to — but because being able to was the clearest proof I could
imagine that we actually understood our own system.

<div class="takeaways">
  <p class="tw-label">key takeaways</p>
  <ul>
    <li>If you can't rebuild your environment from code, you don't fully understand it — you just remember it.</li>
    <li>The teardown drill is valuable for what it forces you to make explicit, not for how often you'll do it.</li>
    <li>Backups protect your data; infrastructure-as-code protects everything around the data.</li>
    <li>Treat tribal knowledge as a bug. Every "only Dave knows that" is an outage waiting for Dave's vacation.</li>
    <li>Start with the goal of reproducibility early — the discipline pays off long before you ever delete anything.</li>
  </ul>
</div>

## The problem with a production you can't reproduce

In the data center, our resilience story was built almost entirely on backups. We backed up
the database religiously, we had a runbook, and we told ourselves we were covered. And for the
*data*, we mostly were.

But a backup only restores the things you remembered to back up. It restores rows in tables.
It does not restore the shape of the world those rows live in: the network topology, the
firewall rules, the service accounts, the scheduled jobs, the exact version of the runtime, the
one registry key someone set during an incident in 2014 and never wrote down. That knowledge
lived in people's heads and in the muscle memory of a few long-tenured engineers. It was real,
it was load-bearing, and it was completely undocumented.

The uncomfortable truth is that a system like that isn't *understood* — it's *remembered*. And
memory is a single point of failure. The day someone retires, or simply forgets, a piece of
your production environment quietly becomes unreproducible. You won't notice until the worst
possible moment.

## Why "can you delete it?" is the right question

When I started pushing for the cloud move, people expected me to lead with cost savings or
elasticity. Instead I kept coming back to a deceptively simple test: *if this whole environment
vanished tomorrow, how would we get it back — and how confident are we in that answer?*

It's a better question than "do we have backups?" because it refuses to let you hide. You can
have perfect backups and still be unable to rebuild, because the backups assume the surrounding
environment already exists. The teardown question collapses that assumption. It asks whether
every decision that makes production *production* is written down somewhere a machine can read
and act on.

If the answer is yes, you've achieved something profound: you've converted institutional memory
into version-controlled, reviewable, testable artifacts. The environment stops being a place and
becomes a definition. And a definition can be copied, diffed, rolled back, and reasoned about —
none of which you can do with a rack of servers.

## What it actually took

I'd love to say it was a clean process. It wasn't. Moving to infrastructure-as-code surfaced
every hidden assumption we'd been carrying for years, and each one had to be dragged into the
light and made explicit.

The first category was configuration sprawl. In the data center we had effectively one
environment that mattered, plus a sickly staging box nobody trusted. In the cloud we wanted
several environments that were genuinely alike, which meant our configuration system — built for
a world of one — needed a serious overhaul. Anything that had been hardcoded "because there's
only ever one of these" had to become a parameter.

The second category was the quiet machine-specific dependencies. Code that assumed a particular
drive letter existed. A process that worked only because it happened to run on the same server
as the thing it talked to. Jobs that depended on a clock, a path, or a permission that no one
had ever declared out loud. None of these were bugs in the data center, because the data center
never changed. The moment we tried to describe the environment as code, every one of them became
a thing we had to name.

The third category was sequencing. It turns out a production environment has an implicit order
of operations — this must exist before that can attach to it — and that order had also lived only
in people's heads. Writing it as code meant writing down the dependency graph we'd been
improvising for a decade.

None of this was glamorous. A lot of it was archaeology. But each assumption we made explicit was
one less thing that could only be recovered by finding the right person.

## The first real teardown

The milestone I remember most clearly was the first time we stood up a complete production-shaped
environment from a clean slate and watched it come back healthy. We could deploy the entire thing
in hours, from nothing, with no human stepping in to "just fix that one thing."

It's hard to overstate what that did to the team's relationship with risk. Before, a major change
felt like surgery on a patient who couldn't be put under. After, it felt like editing a document
we could always revert. The environment had become disposable in the best possible sense — not
fragile, but reproducible.

> We rarely delete data — but being able to delete *everything else* and rebuild it on demand was
> the most reassuring thing we ever shipped.

## The payoff was never really about teardown

Here's the part that surprised me. We don't actually tear down production very often — of course
we don't. The value was almost entirely in what the discipline forced us to do along the way.

Because the environment was now code, our CI/CD pipeline got dramatically better; deployment was
just another reproducible step instead of a careful manual ritual. Patching got safer, because we
could rehearse it on an identical environment first. Onboarding got faster, because "how is
production configured?" had a real answer that didn't require booking time with one of three
people. Audits got easier, because the configuration *was* the documentation, and it was always
current by definition.

In other words, the teardown capability was a forcing function. The real prize was that we could
no longer get away with hand-wavy, person-shaped knowledge. The system made us honest.

## What I'd tell someone starting out

If you're early in a cloud migration, I'd push for reproducibility as a north star sooner than
feels comfortable. Not because you'll be tearing down production on a regular basis — you won't —
but because the *ability* to do it is a proxy for a dozen other things you actually want:
documented infrastructure, repeatable deployments, fast recovery, and freedom from tribal
knowledge.

Make the teardown drill a real, scheduled exercise, even when it's painful. Every time it fails,
it's pointing at a piece of your system that still lives only in someone's memory. Fix that, and
you haven't just gotten closer to a clean rebuild — you've made the whole platform a little more
knowable, and a lot less dependent on any one person being in the room.

The goal was never to throw production away. The goal was to reach the point where we *could* — and
to discover, in getting there, that we finally understood the thing we'd been running all along.
