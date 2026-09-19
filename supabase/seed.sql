-- Sample blog posts (HTML, as produced by the admin rich-text editor). Safe to delete.

insert into public.posts
  (title, slug, excerpt, category, status, published_at, meta_title, meta_description, meta_keywords, content)
values
(
  'The 3-Layer Meta Ads Structure That Scales Without Killing ROAS',
  'meta-ads-3-layer-structure',
  'Most Meta accounts stall because structure, signals and scaling rules fight each other. Here is the simple three-layer framework we use to scale profitably.',
  'Meta Ads',
  'published',
  now() - interval '2 days',
  'Meta Ads Account Structure: The 3-Layer Scaling Framework',
  'Learn the three-layer Meta Ads structure (prospecting, retargeting and margin-led scaling) that grows revenue without killing ROAS.',
  'meta ads structure, facebook ads scaling, advantage+ shopping, roas',
  $html$<p>Most Meta ad accounts don't fail because of a single bad campaign. They fail because <strong>structure, signals and scaling rules fight each other</strong>. Here's the three-layer framework we use to fix that.</p>
<h2>Layer 1: Prospecting that lets the algorithm work</h2>
<p>Meta's delivery system is excellent at finding buyers, <em>if</em> you give it room and good data.</p>
<ul>
<li><p>Consolidate prospecting into as few ad sets as possible so each exits the learning phase fast.</p></li>
<li><p>Test <strong>Advantage+ Shopping</strong> against a broad manual campaign before committing budget.</p></li>
<li><p>Cap spend on existing customers so new-customer revenue isn't inflated.</p></li>
</ul>
<h2>Layer 2: Retargeting that respects frequency</h2>
<p>Warm audiences convert best, but they also fatigue fastest. Split retargeting into windows and match the message to the moment:</p>
<ol>
<li><p><strong>1–3 days:</strong> objection handling and social proof.</p></li>
<li><p><strong>4–14 days:</strong> offer or bundle.</p></li>
<li><p><strong>15–30 days:</strong> a new creative angle or a reason to come back.</p></li>
</ol>
<h2>Layer 3: Scaling on margin, not mood</h2>
<blockquote><p>Scale what is profitable, not what looked good yesterday.</p></blockquote>
<p>We move budgets in controlled steps (roughly 20% at a time) and only when <strong>contribution margin</strong> and <strong>marginal ROAS</strong> clear thresholds agreed upfront. Winners get duplicated into new audiences; losers get cut within 72 hours.</p>
<h2>The takeaway</h2>
<p>Structure gives the algorithm room, signals give it direction, and scaling rules protect your margin. Get all three aligned and growth stops feeling like gambling.</p>$html$
),
(
  'Facebook Lead Ads: How to Get Leads That Actually Pick Up the Phone',
  'facebook-lead-ads-quality',
  'Cheap leads are easy. Leads that answer, book and buy take a different playbook. Here is how to fix lead quality on Facebook without doubling your cost.',
  'Facebook Ads',
  'published',
  now() - interval '9 days',
  'Facebook Lead Ads Quality: Get Leads That Pick Up the Phone',
  'Fix Facebook lead quality with higher-intent forms, instant follow-up and CRM feedback loops, and track cost per customer, not cost per lead.',
  'facebook lead ads, lead quality, instant forms, conversion leads',
  $html$<p>A low cost per lead feels great until your sales team starts calling. If half your leads never answer, your <strong>real</strong> cost per customer is double what the dashboard says.</p>
<h2>1. Add friction where it counts</h2>
<p>Instant Forms default to <em>More volume</em>. Switch to <strong>Higher intent</strong> and add one or two qualifying questions, such as your timeline or approximate budget. A few fewer leads that actually close beats a flood of tyre-kickers.</p>
<h2>2. Win the first five minutes</h2>
<p>Speed-to-lead is the most underrated lever in lead generation. Every new lead should get:</p>
<ol>
<li><p>An instant SMS or WhatsApp message.</p></li>
<li><p>A confirmation email with a booking link.</p></li>
<li><p>A real-time alert to your sales team.</p></li>
</ol>
<h2>3. Close the feedback loop</h2>
<p>Facebook optimises for whatever you tell it is a conversion. Sync your CRM stages back to Meta and use the <strong>Conversion Leads</strong> optimisation goal, so the algorithm starts finding people who look like your <em>customers</em>, not your form-fillers.</p>
<blockquote><p>Stop measuring cost per lead. Start measuring cost per booked call and cost per customer.</p></blockquote>$html$
),
(
  'Why Your Landing Page Is Quietly Killing Your ROAS',
  'landing-page-killing-roas',
  'You can have the best ads on Meta and still lose money if the page they land on is slow, generic or confusing. Here are the fixes that move the needle.',
  'Web Development',
  'published',
  now() - interval '16 days',
  'Landing Page Speed & CRO: Why Your Page Is Killing Your ROAS',
  'Slow, generic landing pages waste paid traffic. Hit Core Web Vitals, match your ad message and put proof above the fold to lift ROAS.',
  'landing page optimization, core web vitals, cro, roas',
  $html$<p>Paid social gets the blame when ROAS drops, but the culprit is often the page the click lands on. Every visitor who bounces is ad spend you've already paid for.</p>
<h2>Speed is a conversion feature</h2>
<p>On mobile, every extra second of load time costs conversions. Aim for:</p>
<table><tbody>
<tr><th><p>Metric</p></th><th><p>Target</p></th></tr>
<tr><td><p>Largest Contentful Paint</p></td><td><p>under 2.5s</p></td></tr>
<tr><td><p>Interaction to Next Paint</p></td><td><p>under 200ms</p></td></tr>
<tr><td><p>Cumulative Layout Shift</p></td><td><p>under 0.1</p></td></tr>
</tbody></table>
<p>Server-rendered frameworks like <strong>Next.js</strong>, optimised images and lean scripts get you there.</p>
<h2>Match the page to the ad</h2>
<p>If your ad promises a specific offer, the landing page headline should repeat it word for word. Message match reassures visitors they're in the right place.</p>
<h2>Put proof above the fold</h2>
<p>Reviews, results and recognisable logos belong near the top, not buried in the footer. Trust is what turns a curious click into a purchase.</p>
<hr>
<p>Fix the page, and the same ad spend suddenly works harder. That's the cheapest ROAS improvement you'll ever make.</p>$html$
);

-- Sample case studies (carried forward from the old homepage-teaser defaults). Safe to delete.

insert into public.case_studies
  (title, slug, excerpt, industry, channels, status, published_at, metrics, meta_title, meta_description, content)
values
(
  'Breaking a 1.9x ROAS Plateau for a DTC Skincare Brand',
  'dtc-skincare-roas-plateau',
  'Creative fatigued every 10 days and a pixel-only setup was missing roughly a third of purchase events. Here is how we broke the plateau.',
  'DTC Skincare',
  'Meta Ads · Advantage+ · CAPI',
  'published',
  now() - interval '5 days',
  '[{"value":"4.6x","label":"ROAS","detail":"from 1.9x"},{"value":"-41%","label":"CPA","detail":"90-day median"},{"value":"+212%","label":"Revenue","detail":"same margin target"}]'::jsonb,
  'DTC Skincare: Breaking a 1.9x ROAS Plateau',
  'How a full-funnel Advantage+ rebuild and server-side tracking took a DTC skincare account from a 1.9x ROAS plateau to 4.6x.',
  $html$<p>The account had been stuck at a 1.9x ROAS for two straight months. Creative was fatiguing every 10 days, and a pixel-only setup meant roughly a third of purchase events were never reaching Meta.</p>
<h2>The challenge</h2>
<p>Fast creative turnover was outpacing the team's production capacity, and the missing purchase signal was quietly starving the algorithm of the data it needed to find buyers.</p>
<h2>The approach</h2>
<ul>
<li><p>Layered the Conversions API on top of the pixel to recover the missing third of purchase events.</p></li>
<li><p>Rebuilt the top of funnel around Advantage+ Shopping campaigns to consolidate signal.</p></li>
<li><p>Stood up a UGC-led creative testing pipeline to keep fresh angles in rotation.</p></li>
</ul>
<h2>The result</h2>
<p>Within 90 days, ROAS moved from 1.9x to 4.6x, cost per purchase fell 41%, and revenue was up 212% at the same margin target.</p>$html$
),
(
  'Filling the Calendar With Real Jobs for a Home Services Company',
  'home-services-lead-quality',
  'Cheap leads that never answered the phone meant the sales team spent most of its week chasing junk. Here is how we fixed lead quality.',
  'Home Services',
  'Facebook Lead Ads · CRM sync',
  'published',
  now() - interval '9 days',
  '[{"value":"-52%","label":"Cost / booked job"},{"value":"3.1x","label":"Lead-to-call"},{"value":"+180%","label":"Jobs / month"}]'::jsonb,
  'Home Services: Fixing Lead Quality on Facebook Lead Ads',
  'A qualifying-question rework and instant CRM sync turned cheap, unanswered Facebook leads into real booked jobs.',
  $html$<p>Leads were cheap, but almost none of them answered the phone. The sales team was spending most of its week chasing contacts who had never really needed the service.</p>
<h2>The challenge</h2>
<p>The lead form asked nothing that filtered out tire-kickers, and by the time a rep called, the lead had gone cold.</p>
<h2>The approach</h2>
<ul>
<li><p>Added qualifying questions to the lead form to filter for real intent and budget.</p></li>
<li><p>Synced leads instantly into the CRM so reps could call within minutes, not hours.</p></li>
<li><p>Rebuilt audiences around households that matched the profile of past booked jobs.</p></li>
</ul>
<h2>The result</h2>
<p>Cost per booked job fell 52%, the lead-to-call rate tripled, and booked jobs per month were up 180%.</p>$html$
),
(
  'A Faster Store That Finally Converts for a Fitness Apparel Brand',
  'fitness-apparel-site-speed',
  'A 6-second mobile load time was burning paid traffic before product pages had even rendered. Here is how the rebuild fixed it.',
  'Fitness Apparel',
  'Website rebuild · Meta Ads',
  'published',
  now() - interval '13 days',
  '[{"value":"1.4s","label":"Mobile LCP","detail":"from 6.2s"},{"value":"+74%","label":"Conv. rate"},{"value":"+1.8x","label":"ROAS"}]'::jsonb,
  'Fitness Apparel: A Faster Store That Finally Converts',
  'A Next.js storefront rebuild cut mobile load time from 6.2s to 1.4s and lifted conversion rate 74% for a fitness apparel brand.',
  $html$<p>Paid traffic was landing on product pages that took over 6 seconds to load on mobile. Most visitors bounced before the page had even rendered.</p>
<h2>The challenge</h2>
<p>A legacy storefront platform, unoptimised images and heavy third-party scripts were the main culprits, and every fix competed with a growing feature backlog.</p>
<h2>The approach</h2>
<ul>
<li><p>Rebuilt the storefront on Next.js with server-rendered product pages.</p></li>
<li><p>Optimised and lazy-loaded imagery, and trimmed third-party scripts to the essentials.</p></li>
<li><p>Matched ad creative and landing page messaging so paid traffic landed on the right offer.</p></li>
</ul>
<h2>The result</h2>
<p>Mobile Largest Contentful Paint dropped from 6.2s to 1.4s, conversion rate rose 74%, and blended ROAS improved 1.8x.</p>$html$
);

-- Video testimonials are uploaded through /admin/video-testimonials (they live in the `videos`
-- storage bucket), so there is no sample row to seed here.
