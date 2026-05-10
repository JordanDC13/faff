-- =============================================================================
-- Faff — activities table + seed data
-- Run this in the Supabase SQL Editor AFTER schema.sql.
-- Safe to re-run: CREATE TABLE IF NOT EXISTS + ON CONFLICT DO NOTHING.
-- =============================================================================


-- ── 1. Table ──────────────────────────────────────────────────────────────────

create table if not exists public.activities (
  id              text        primary key,
  title           text        not null,
  description     text        not null,
  category        text        not null,
  tags            text[]      not null default '{}',
  energy_required int         not null check (energy_required between 1 and 5),
  cost_min        int         not null default 0,
  cost_max        int         not null default 0,
  duration_mins   int         not null,
  indoor_outdoor  text        not null
                              check (indoor_outdoor in ('indoor','outdoor','both')),
  solo_social     text        not null
                              check (solo_social in ('solo','social','both')),
  color           text        not null,
  emoji           text        not null,
  created_at      timestamptz not null default now()
);

-- ── 2. RLS — public catalogue, read-only for everyone ────────────────────────

alter table public.activities enable row level security;

do $$ begin
  create policy "activities: public read"
    on public.activities for select
    using (true);
exception when duplicate_object then null; end $$;


-- ── 3. Seed data (58 activities) ─────────────────────────────────────────────

insert into public.activities
  (id, title, description, category, tags,
   energy_required, cost_min, cost_max, duration_mins,
   indoor_outdoor, solo_social, color, emoji)
values

  -- OUTDOOR
  ('a1',
   'Wander a park with no destination',
   'Possibly the most underrated activity known to humankind. Just… walk. Let your feet decide.',
   'outdoor', ARRAY['walking','nature','solo','free'],
   2, 0, 0, 60, 'outdoor', 'both', '#4A7C59', '🌳'),

  ('a2',
   'Find a bench with a view',
   'Sit down. Watch the world carry on without you for a bit. Revolutionary.',
   'outdoor', ARRAY['relaxing','nature','solo','free','low-effort'],
   1, 0, 0, 30, 'outdoor', 'both', '#5B8A6E', '🪑'),

  ('a3',
   'Cycle somewhere you''ve never been',
   'Borrow a Boris bike, dust off your own, or hire one. The getting lost is sort of the point.',
   'outdoor', ARRAY['cycling','adventure','exercise','solo'],
   3, 0, 5, 90, 'outdoor', 'both', '#2D6A8F', '🚴'),

  ('a4',
   'Feed the ducks',
   'A classic that never gets old. Bring suitable duck-appropriate snacks (not bread — they deserve better).',
   'outdoor', ARRAY['nature','wholesome','family','free'],
   1, 0, 2, 45, 'outdoor', 'both', '#7B9E47', '🦆'),

  ('a5',
   'Outdoor swimming',
   'Lidos, lakes, and rivers. Absolutely freezing. Absolutely worth it. Very British.',
   'outdoor', ARRAY['swimming','exercise','adventure','social'],
   4, 0, 8, 60, 'outdoor', 'both', '#1E7FA8', '🏊'),

  ('a6',
   'Picnic in the park',
   'Grab something from a deli, find a patch of grass, and pretend you''re in a Claude Monet painting.',
   'outdoor', ARRAY['picnic','social','relaxing','food'],
   2, 5, 20, 120, 'outdoor', 'social', '#8FBC5E', '🧺'),

  ('a7',
   'Run a new route',
   'Same legs, totally different vibe. Pick a direction you''ve never run before and see what happens.',
   'fitness', ARRAY['running','exercise','solo','free','adventure'],
   4, 0, 0, 45, 'outdoor', 'solo', '#C44B2A', '🏃'),

  ('a8',
   'Spot some wildlife',
   'Squirrels count. So do pigeons if you squint a bit. Nature is everywhere.',
   'outdoor', ARRAY['nature','wildlife','free','solo','mindful'],
   1, 0, 0, 60, 'outdoor', 'both', '#5A7A3E', '🦊'),

  -- FOOD & DRINK
  ('b1',
   'Try a café you''ve walked past 100 times',
   'You''ve always meant to. Today is finally the day. It''s probably fine.',
   'food_drink', ARRAY['café','coffee','solo','local'],
   2, 4, 12, 60, 'indoor', 'both', '#8B5E3C', '☕'),

  ('b2',
   'Find the best local pub',
   'Conduct a completely unofficial survey of your nearest pubs. For science.',
   'food_drink', ARRAY['pub','drinks','social','local'],
   2, 6, 25, 120, 'indoor', 'social', '#6B3A2E', '🍺'),

  ('b3',
   'Cook something ambitious',
   'That recipe you bookmarked six months ago. Today''s the day it either becomes dinner or a cautionary tale.',
   'food_drink', ARRAY['cooking','creative','home','solo'],
   3, 10, 30, 120, 'indoor', 'both', '#C25B2B', '👨‍🍳'),

  ('b4',
   'Street food market crawl',
   'Pick a market, eat half-portions of everything, and call it research.',
   'food_drink', ARRAY['food','market','social','local','exploring'],
   2, 10, 30, 90, 'outdoor', 'both', '#D4891C', '🥙'),

  ('b5',
   'Afternoon tea, properly',
   'Tiny sandwiches. Scones with clotted cream. The correct finger-raising form. Very civilised.',
   'food_drink', ARRAY['tea','treat','social','classic'],
   1, 20, 50, 90, 'indoor', 'social', '#C4957A', '🫖'),

  ('b6',
   'Wine bar on a Tuesday',
   'The exact energy of "we deserve this" without any justification needed.',
   'food_drink', ARRAY['wine','drinks','social','treat'],
   2, 15, 40, 120, 'indoor', 'social', '#7B2D5E', '🍷'),

  ('b7',
   'Make a proper Sunday roast',
   'Any day can be a Sunday if you commit to the roasties.',
   'food_drink', ARRAY['cooking','home','social','comfort'],
   3, 15, 40, 180, 'indoor', 'social', '#A06030', '🍖'),

  ('b8',
   'Find a hidden gem restaurant',
   'That slightly battered place with no Instagram presence. It''s always the best one.',
   'food_drink', ARRAY['restaurant','food','social','adventure','local'],
   2, 15, 50, 120, 'indoor', 'social', '#4A3728', '🍽️'),

  -- INDOOR
  ('c1',
   'Read an actual book',
   'The one that''s been on your bedside table since approximately 2019. Today you make a dent.',
   'indoor', ARRAY['reading','relaxing','solo','free','mindful'],
   1, 0, 15, 90, 'indoor', 'solo', '#4A6741', '📚'),

  ('c2',
   'Binge a documentary series',
   'Educational AND cosy. Fully defensible. Pick something you''d never normally choose.',
   'indoor', ARRAY['tv','relaxing','solo','home'],
   1, 0, 0, 120, 'indoor', 'both', '#2D3A5E', '📺'),

  ('c3',
   'Board game afternoon',
   'Dust off Catan, Ticket to Ride, or anything from that stack no one ever touches.',
   'indoor', ARRAY['games','social','fun','home'],
   2, 0, 0, 120, 'indoor', 'social', '#7B4FA0', '🎲'),

  ('c4',
   'Learn something on YouTube',
   'Woodworking, oil painting, the history of the Byzantine Empire — it''s all there.',
   'indoor', ARRAY['learning','solo','free','creative'],
   1, 0, 0, 60, 'indoor', 'solo', '#D44132', '🎓'),

  ('c5',
   'Declutter one room',
   'Deeply unglamorous. Deeply satisfying. The Marie Kondo high is real.',
   'indoor', ARRAY['home','productive','solo','free'],
   3, 0, 0, 120, 'indoor', 'solo', '#8A9B6E', '🗂️'),

  ('c6',
   'Write letters to people',
   'Old-fashioned, personal, and almost guaranteed to make someone''s day. Radical.',
   'indoor', ARRAY['writing','social','creative','free'],
   2, 1, 5, 60, 'indoor', 'solo', '#B8926A', '✉️'),

  ('c7',
   'Build a playlist',
   'Not for a specific occasion. Just for the pure pleasure of curating something.',
   'indoor', ARRAY['music','solo','free','creative'],
   1, 0, 0, 45, 'indoor', 'solo', '#2E4A7A', '🎵'),

  ('c8',
   'Jigsaw puzzle',
   'Meditative, absorbing, and gives you something to look at smugly when it''s done.',
   'indoor', ARRAY['puzzle','relaxing','solo','home'],
   1, 0, 20, 120, 'indoor', 'both', '#5C6B8A', '🧩'),

  -- CULTURE
  ('d1',
   'Visit a free museum',
   'Britain has an embarrassing number of world-class free museums. Pick one.',
   'culture', ARRAY['museum','culture','free','solo','learning'],
   2, 0, 0, 120, 'indoor', 'both', '#3A4A6E', '🏛️'),

  ('d2',
   'See what''s on at a gallery',
   'Even if modern art leaves you baffled, staring at something for a while does something useful to your brain.',
   'culture', ARRAY['art','gallery','culture','solo'],
   2, 0, 20, 90, 'indoor', 'both', '#6A3F5B', '🖼️'),

  ('d3',
   'Catch a film at the cinema',
   'Doesn''t have to be the blockbuster. Indie cinemas often have the genuinely good stuff.',
   'culture', ARRAY['cinema','film','social','culture'],
   2, 8, 20, 150, 'indoor', 'both', '#1A2A4E', '🎬'),

  ('d4',
   'See live music at a local venue',
   'Skip the arena. The 200-cap venue with the sticky floor is where the actual memories are made.',
   'culture', ARRAY['music','live','social','night-out'],
   3, 5, 30, 180, 'indoor', 'both', '#2A1A4E', '🎸'),

  ('d5',
   'Explore a market town',
   'Get on a train to somewhere you''ve never been and just… mooch.',
   'culture', ARRAY['exploring','travel','adventure','solo'],
   3, 10, 40, 240, 'outdoor', 'both', '#5A6B4E', '🚂'),

  ('d6',
   'Stand-up comedy night',
   'New acts and old hands. The worst sets are often the most memorable stories.',
   'culture', ARRAY['comedy','social','night-out','fun'],
   2, 5, 25, 120, 'indoor', 'social', '#E8A020', '🎤'),

  ('d7',
   'Browse a second-hand bookshop',
   'No agenda. No list. Just the smell of old paper and whatever finds you.',
   'culture', ARRAY['books','browsing','solo','free','culture'],
   1, 0, 15, 60, 'indoor', 'solo', '#6B4E2A', '📖'),

  ('d8',
   'Visit a historic building',
   'Britain is basically one giant open-air museum if you squint. Find something ancient nearby.',
   'culture', ARRAY['history','exploring','culture','solo'],
   2, 0, 20, 120, 'outdoor', 'both', '#7A6040', '🏰'),

  -- FITNESS
  ('e1',
   'Yoga at home',
   'YouTube has 800 options. Pick one. 20 minutes is enough to feel like a reformed person.',
   'fitness', ARRAY['yoga','exercise','home','solo','free','mindful'],
   2, 0, 0, 30, 'indoor', 'solo', '#7A9E7E', '🧘'),

  ('e2',
   'Swim at the local pool',
   'Methodical, meditative, and you''ll feel smug for the rest of the day.',
   'fitness', ARRAY['swimming','exercise','solo'],
   3, 4, 10, 60, 'indoor', 'solo', '#1A6A9E', '🏊'),

  ('e3',
   'Rock climbing (bouldering)',
   'Indoor climbing walls are everywhere now. No experience needed. Ego is optional.',
   'fitness', ARRAY['climbing','exercise','social','challenge'],
   4, 10, 20, 90, 'indoor', 'both', '#8B5E3C', '🧗'),

  ('e4',
   '5-a-side with whoever''s around',
   'Recruit from the group chat. Standards optional. Commitment mandatory.',
   'fitness', ARRAY['football','exercise','social','team'],
   4, 5, 15, 90, 'outdoor', 'social', '#2E6E2E', '⚽'),

  ('e5',
   'Pilates class',
   'Your core will send a strongly-worded letter the next morning. Worth it.',
   'fitness', ARRAY['pilates','exercise','solo','class'],
   3, 10, 25, 60, 'indoor', 'both', '#C4A0B0', '🤸'),

  -- SOCIAL
  ('f1',
   'Call someone you''ve been meaning to call',
   'You know who it is. They''ll be glad you did.',
   'social', ARRAY['social','connecting','free','home'],
   2, 0, 0, 45, 'indoor', 'social', '#E88020', '📞'),

  ('f2',
   'Host an impromptu dinner',
   'Text three people. Tell them to bring a dish and themselves. Accept chaos.',
   'social', ARRAY['hosting','food','social','home'],
   3, 20, 50, 240, 'indoor', 'social', '#C44B2A', '🍕'),

  ('f3',
   'Quiz night at the pub',
   'Nothing bonds a group like spectacularly getting a geography round wrong together.',
   'social', ARRAY['pub','quiz','social','fun','night-out'],
   2, 5, 20, 150, 'indoor', 'social', '#3A3A6E', '🧠'),

  ('f4',
   'Long lunch with no agenda',
   'Just food and conversation and seeing where it goes. Deeply underrated.',
   'social', ARRAY['lunch','social','food','relaxing'],
   2, 15, 40, 120, 'indoor', 'social', '#B87A3A', '🥗'),

  ('f5',
   'Park hang with a football and whatever',
   'Just be in a park with people. The activity doesn''t matter.',
   'social', ARRAY['park','social','outdoor','free','friends'],
   2, 0, 5, 120, 'outdoor', 'social', '#5A9A4A', '🌤️'),

  -- SPONTANEOUS / WILDCARD
  ('g1',
   'Take a train somewhere random',
   'Pick a station. Buy a ticket. See what''s there. The answer is usually: more than you''d think.',
   'spontaneous', ARRAY['adventure','travel','solo','exploring'],
   3, 5, 30, 300, 'outdoor', 'both', '#2A4A7A', '🚆'),

  ('g2',
   'Say yes to the next thing someone suggests',
   'Whatever it is. Commit. You can be cynical about it after.',
   'spontaneous', ARRAY['adventure','social','spontaneous'],
   3, 0, 30, 120, 'outdoor', 'social', '#E8521A', '🎯'),

  ('g3',
   'Explore a neighbourhood you''ve never been to',
   'Every city has pockets nobody talks about. Go find one. Bring snacks.',
   'spontaneous', ARRAY['exploring','adventure','free','solo','walking'],
   2, 0, 10, 120, 'outdoor', 'both', '#4A6A8A', '🗺️'),

  ('g4',
   'Compete in something ridiculous',
   'Crazy golf. Darts in a bar. Anything with a slight possibility of embarrassing yourself.',
   'spontaneous', ARRAY['fun','social','games','spontaneous','night-out'],
   2, 5, 20, 90, 'indoor', 'social', '#E8A020', '🏌️'),

  ('g5',
   'Do something you haven''t done since childhood',
   'Rollerskating. Trampolining. Flying a kite. Dignity is overrated.',
   'spontaneous', ARRAY['fun','adventure','nostalgic','social'],
   3, 5, 25, 90, 'outdoor', 'both', '#D4891C', '🪁'),

  ('g6',
   'Volunteer for something local',
   'Community garden. Food bank. Litter pick. An hour of usefulness does something good to you.',
   'social', ARRAY['volunteering','community','solo','free','purposeful'],
   3, 0, 0, 120, 'outdoor', 'both', '#5A8A5A', '🤝'),

  ('g7',
   'Watch the sunset from somewhere good',
   'Find a hill, a roof terrace, a bridge — somewhere the sky has room to do its thing.',
   'outdoor', ARRAY['sunset','peaceful','solo','free','mindful'],
   1, 0, 0, 30, 'outdoor', 'both', '#E87030', '🌅'),

  ('g8',
   'Have a proper bath with a book',
   'You know what you need. And it''s not another scroll.',
   'indoor', ARRAY['relaxing','solo','home','self-care','free'],
   1, 0, 5, 45, 'indoor', 'solo', '#5A7A9A', '🛁'),

  ('g9',
   'Sketch or doodle without a goal',
   'Paper, pen, no plan. The point is the doing, not the result.',
   'indoor', ARRAY['art','creative','solo','free','mindful'],
   1, 0, 5, 45, 'indoor', 'solo', '#8A6AAA', '✏️'),

  ('g10',
   'Nothing. Just sit.',
   'No phone. No podcast. No plan. Doing nothing is an activity. Own it.',
   'spontaneous', ARRAY['mindful','rest','solo','free','low-effort'],
   1, 0, 0, 30, 'indoor', 'solo', '#9A8A78', '🌿')

on conflict (id) do nothing;
