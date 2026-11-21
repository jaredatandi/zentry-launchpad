# Zentry 7-day cashflow playbook

## Objective
Sell the existing fixed-price launch page, not a new product. Target **10 orders in 7 days**:
**US$790 / KES 25,000**.

## The offer
**One-page launch site — US$79 / KES 2,500**
- Live within 48 hours of confirmed details and payment.
- Mobile-first page with phone, address, service blurb and a three-field enquiry form.
- Two rounds of changes included.
- No subscription, no card.

**Payment**
- Kenya: M-Pesa Till **6200945**, using the client's phone number as the reference.
- International: bank transfer; details are sent on confirmation.
- Never invent, hardcode, publish or store bank details.

**Links**
- Main: https://zentry-offer.vercel.app
- What is included: https://zentry-offer.vercel.app/holding-page
- Live example: https://zentry-offer.vercel.app/demo
- Order form: https://zentry-offer.vercel.app/contact

**Tagline:** Guard the entry. Move at speed.

## Non-negotiable rules
1. No paid ads, trials, card-required tools or subscriptions.
2. No mass messaging, bulk scraping, personal-data enrichment or friend invites.
3. No PayPal. Never say “serving worldwide”.
4. No security scanning or testing of any kind.
5. Every post, comment and email is **drafted first** and approved by the owner before sending.
6. Use plain English. No “excited to announce”, “game-changing”, “unlock”, “leverage”, “solutions”.
7. Target small local businesses with a public presence that is weak, outdated or “coming soon”. Use only information already public.

## 7-day schedule

### Day 1 — Setup
- Pin the Facebook post template below.
- Add the demo link to Facebook and Reddit bios.
- Make three proof assets: live demo link, one phone screenshot, one 30-second screen recording.
- Build a list of 50 targeted businesses. Columns: business, public page, location, observed public problem, public contact source, date contacted, stage.

### Days 2–3 — First wave
- Facebook: 2 value posts and 5 helpful group comments per day.
- Reddit: 5 helpful comments per day. Link only when directly relevant and allowed.
- Cold email: 20 personalised emails per day, from the real owner address, one at a time.
- Reply within one hour during Nairobi business hours.

### Day 4 — Deliver and prove
- Build the first pages.
- Ask each buyer for a one-line testimonial and permission to show the page.
- Post the first result with the screenshot.

### Days 5–6 — Follow up
- One follow-up only to warm replies.
- 20 more personalised emails per day.
- Close remaining buyers and send M-Pesa instructions.

### Day 7 — Consolidate
- Invoice and log every source in the admin.
- Record cash collected.
- Ask each buyer to refer one business. No mass invites.

## Copy templates

### Facebook pinned post
Your site still says “coming soon”?

We will put one clear page live in 48 hours: your phone number, address, a short note on what you do, and a form that sends enquiries straight to us.

US$79 / KES 2,500. Two rounds of changes. No subscription.

See the example: https://zentry-offer.vercel.app/demo

Kenya: M-Pesa Till 6200945. Comment PAGE or send a message.

### Facebook value post
A holding page only needs four things: who you are, where you are, how to reach you now, and one next step.

If a visitor cannot find a phone number in five seconds, the site is costing you calls.

Example: https://zentry-offer.vercel.app/demo

### Reddit comment
If you are pre-launch, you do not need the full site yet. Put up one page with the business name, a tappable phone number, address and one action. I use this checklist: name, phone, address, one clear next step, honest line about the new site. Happy to share the page we built as an example if useful.

### Cold email 1
Subject: quick question about [Business]

Hi [Name],

I saw [specific public observation — e.g. your Facebook page says appointments are open but there is no site].

We build one-page sites in 48 hours with a tappable phone number, address and short enquiry form. KES 2,500 / US$79, two rounds of changes, no subscription.

Example: https://zentry-offer.vercel.app/demo

If useful, I can send the details you would need to fill in. If not, no problem — I will not follow up again.

[Owner name]  
+254 701 074 998  
To stop these emails, reply “stop”.

### Cold email follow-up — warm replies only
Subject: Re: [Business]

Hi [Name],

Following up once. The details we need are business name, phone, address, one line on what you do, and an accent colour.

Payment is M-Pesa Till 6200945 in Kenya, using your phone as the reference. Bank transfer internationally; details sent on confirmation.

I can have it live within 48 hours of those details and payment.

[Owner name]

### DM reply
Thanks for the message. Here is the example page: https://zentry-offer.vercel.app/demo

It is US$79 or KES 2,500. We need your business name, phone, address, one line on what you do and an accent colour. Two rounds of changes are included. Kenya payment is M-Pesa Till 6200945, phone number as reference. Bank transfer internationally, details sent on confirmation.

Shall I send the short intake form?

### Closing reply
Confirmed. Please pay KES 2,500 to M-Pesa Till 6200945 using your phone number as the reference, then send the payment message and the five details. I will put the page live within 48 hours.

## Pipeline stages
`new → qualified → quoted → paid → in_production → delivered`

Use the Zentry admin at `/admin` as the board. All links go to `/contact` so the source is captured.

## AppuBot bots
Three new bots are added alongside the existing ones:

1. **Zentry Drafter** — writes Facebook posts, Reddit comments and cold email drafts. Never sends.
2. **Zentry Scout** — builds a targeted list from public information only. No scraping tools.
3. **Zentry Closer** — triages pasted replies, drafts responses and updates the pipeline file. Never sends.

Two routines are added:
- 08:30 daily — draft the day's posts, comments and emails into `outbox/`.
- 17:00 daily — summarise replies and list who needs invoicing.

All bots use OpenCode as the provider. Keep approvals on. Use the free local AppuBot only; no AppuBot Cloud, no card, no trial.

## To customise this
Send me:
1. The Facebook page URL or its current bio and last five posts.
2. The subreddits you posted in and the exact comment/email you used.
3. One cold email already sent, with the reply if there was one.
4. Your preferred sending name and phone number for signatures.
