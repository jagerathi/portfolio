---
title: "What production AI actually costs you"
date: "2026-07-29"
excerpt: "The impressive demo is easy. The part where the model lives in your system, serves real users, and doesn't quietly embarrass you — that's the job nobody shows you."
tags: ["ai", "architecture", "cloud"]
slug: "ai-in-production"
---

Every new technology I've taken seriously in my career has had a demo phase and a production phase,
and they are almost nothing alike. The demo phase is fun. You connect the pieces, something
surprising happens, and the room gets excited. The production phase is where you find out what
you're actually dealing with.

AI is proving no different — except that the gap between the demo and the real thing is wider
than almost anything else I've worked with. That gap is what this post is about.

<div class="takeaways">
  <p class="tw-label">key takeaways</p>
  <ul>
    <li>The demo is not the product. The model is one component; the system around it is the engineering work.</li>
    <li>Latency, cost, and observability need to be designed in from the beginning, not bolted on after.</li>
    <li>Evaluation is the discipline that separates AI experiments from AI systems — and most teams skip it.</li>
    <li>Data quality problems don't disappear when you add a model. They become more visible, and more embarrassing.</li>
    <li>The old reliability disciplines don't retire. If anything, they matter more when the component you're depending on is nondeterministic.</li>
  </ul>
</div>

## The demo problem

I've now seen enough AI demonstrations — and built enough of them myself — to recognize a
pattern. The demo works because someone chose the inputs carefully, the context fits comfortably
inside the model's window, and you only show the outputs you're proud of. None of that is
dishonest, exactly. But none of it tells you anything useful about what happens when real users
show up with their actual data, their edge cases, and their complete indifference to the
assumptions your demo was built on.

The thing that gets glossed over in nearly every AI demo is *evaluation*. It's not exciting to
talk about, which is why almost nobody does. But evaluation is to AI what testing is to software:
the discipline that separates something that sometimes works from something you can deploy with
confidence. Building an LLM-powered feature without a real eval harness is roughly like shipping
code with no tests and trusting that it looked fine in local development.

I spent a lot of time early on being impressed by what models could do. I spent a lot of time
later building the scaffolding that lets you actually know whether they're doing it — consistently,
across the inputs you didn't hand-pick.

## Latency is a product problem, not a footnote

The first time I wired a real language model call into a production code path, I was struck by
something obvious that I hadn't fully internalized: these calls are slow. Not "maybe a little
slow" slow — sometimes multiple seconds, on the fast path, with nothing else happening.

In a traditional system, if a critical operation takes three seconds, you have a performance bug.
You find it, you fix it, and you ship a fix. With an LLM in the loop, three seconds is often
just... the situation. Which means latency isn't a bug to fix — it's a design constraint to
engineer around, from the beginning.

That means streaming responses where the user is waiting. It means async patterns where the
user doesn't have to wait at all. It means caching aggressively for inputs that are common and
stable. And it means being ruthless about which calls actually need to be synchronous and which
ones can be deferred. None of this is intellectually novel — these are patterns every backend
engineer knows. But they have to be planned for, not discovered after the fact when someone
files a ticket saying the new AI feature feels sluggish.

## The cost model will surprise you

Tokens cost money, and the cost model for AI features is unlike almost anything else in a
typical system's budget. It's not a flat license fee and it's not a predictable monthly bill
based on users. It's a usage-driven number that scales with how much content flows through the
model — and that number can move in surprising ways depending on what your users actually do.

The failure mode I've seen most often is a team that prototypes a feature with no thought given
to context window size, then discovers in production that the average request is three times
longer than the examples they tested with, and the monthly cost is something nobody planned for.

The discipline I'd advocate for is treating token budget the same way you treat database query
cost: as a first-class concern during design, not an afterthought. Know what you're putting in
the context window, why each piece is there, and what it costs. Build retrieval pipelines that
are precise rather than generous. And track the actual distribution of your costs in production
— the mean is usually less interesting than the tail.

## Observability for nondeterministic components

With a traditional API or service, observability is straightforward in principle. You log the
inputs, you log the outputs, you measure latency and error rates, and if something goes wrong
you can trace it. The hard part is operationalizing the tooling, not defining what you're
looking for.

With a language model, you add a layer that is genuinely nondeterministic. The same input can
produce different outputs. The model can be confident and wrong. It can produce something
technically within spec but subtly off in ways that damage user trust — and those problems don't
show up in your error rate, because the system didn't throw an error.

This changes what you need to observe. You still need latency and failure metrics. But you also
need something that looks more like qualitative sampling: a practice of regularly pulling real
inputs and outputs and asking whether the model is actually doing what you intended. This is
partly automated (eval harnesses, assertions on output structure, confidence scores where
available) and partly human (someone has to look at the examples). It's unglamorous. It's also
the only thing that catches the class of problems that never appear in your dashboards.

> You can have green metrics and a quietly failing AI feature. The only defense is building the
> discipline to look at what the model is actually producing, on a regular basis, with real data.

## Data quality doesn't get easier

One of the quieter lessons from this exploration is that AI amplifies your data quality problems
rather than hiding them. Garbage in, garbage out is not a new principle — but with a model in
the loop, the garbage comes out in complete, fluent, confidently-phrased sentences, which is
considerably more embarrassing than a validation error.

The systems I've worked on for most of my career — ERP, data integration, warehouse management —
are full of messy data that humans have learned to interpret charitably. A part number with an
extra space. An address field with a note stuffed into it. A status code that means three
different things depending on when it was written. People who work with the system every day
know how to read around these problems. A model doesn't, and it won't tell you it's confused.

The implication is that serious AI integration requires honest data quality work upstream —
cleaning, normalizing, disambiguating — not as a nice-to-have but as a prerequisite. The model
is going to use whatever you hand it. If you hand it clean data, it has a chance to do something
useful. If you hand it your real ERP data in its natural state, you're going to get results that
reflect that.

## What the old disciplines are actually for

I came into this from a background in systems architecture — distributed systems, cloud
infrastructure, the unglamorous mechanics of keeping things reliable at scale. My instinct
going in was that AI was a new layer that would sit on top of the things I already knew, and
that the familiar disciplines would still apply.

That instinct has held up, but with a sharper edge than I expected. The old disciplines don't
just *apply* to AI systems — they're *more important*, because you're now depending on a
component that can fail silently, drift subtly, and behave differently under inputs you didn't
anticipate. The case for reliability engineering, for rigorous cost controls, for proper data
governance, for security boundaries that don't depend on the model making good decisions — all
of it gets stronger, not weaker, when the component in question is a large language model.

The teams I've seen struggle with production AI are usually the ones who treated it as a special
case that deserved a pass on the disciplines they apply to everything else. The teams that have
made it work are the ones who treated the model as a capable but demanding component in a system
that still has to be reliable, observable, and affordable — and who built accordingly.

That's the lens I keep coming back to. Not whether AI is impressive — it is. But whether you've
built the system around it that lets it earn a place in production.
