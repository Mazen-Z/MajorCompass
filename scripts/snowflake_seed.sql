-- Minimal Snowflake schema with tags/values/constraints as VARIANT arrays
create or replace table majors (
  code string,
  name string,
  cluster string,
  reason string,
  tags variant,          -- e.g. ['Software','AI/ML','Coding']
  value_fit variant,     -- optional boost tags
  constraints variant    -- optional tags that may be conflict-prone
);

create or replace table careers (
  code string,
  title string,
  cluster string,
  reason string,
  tags variant,
  value_fit variant,
  constraints variant
);

-- Sample rows
insert into majors (code, name, cluster, reason, tags, value_fit) select
  'CS','Computer Science','analytical','Your analytical scores suggest comfort with abstraction & logic.',
  parse_json('["Software","AI/ML","Coding","Math/Stats"]'),
  parse_json('["High pay","Remote-friendly"]')
union all select
  'DS','Data Science','analytical','Data affinity indicates strength in modeling & inference.',
  parse_json('["Data/Analytics","Math/Stats","Research"]'),
  parse_json('["High pay","Stability","Remote-friendly"]')
union all select
  'BUS','Business Administration','people','People-focus aligns with leadership & coordination.',
  parse_json('["Business","Leadership","Client interaction"]'),
  parse_json('["High pay","Work–life balance"]')
union all select
  'PSY','Psychology','people','Interest in people dynamics suits behavioral studies.',
  parse_json('["Psychology","Research","Education"]'),
  parse_json('["Social impact","Research depth"]')
union all select
  'BIO','Biology','handsOn','Hands-on inclination fits lab work & experimentation.',
  parse_json('["Bio/Lab","Labs/fieldwork","Health"]'),
  parse_json('["Research depth","Social impact"]')
union all select
  'DES','Design','creative','Creative scores suggest visual communication strengths.',
  parse_json('["Design/UX","Creativity","Media/Comms"]'),
  parse_json('["Creative freedom"]')
;

insert into careers (code, title, cluster, reason, tags, value_fit) select
  'SWE','Software Engineer','analytical','Logic & systems thinking fit engineering roles.',
  parse_json('["Software","Coding","High pay"]'),
  parse_json('["High pay","Remote-friendly"]')
union all select
  'DA','Data Analyst','analytical','Quant skills match analytics & insights roles.',
  parse_json('["Data/Analytics","Math/Stats"]'),
  parse_json('["Stability","Remote-friendly"]')
union all select
  'PM','Product Manager','people','Collaboration & communication align with PM work.',
  parse_json('["Business","Leadership","Client interaction"]'),
  parse_json('["High pay"]')
union all select
  'UX','UX Designer','creative','Creativity & empathy fit design research & prototyping.',
  parse_json('["Design/UX","Creativity"]'),
  parse_json('["Creative freedom","Work–life balance"]')
union all select
  'RA','Research Assistant','handsOn','Hands-on preference matches experimental workflows.',
  parse_json('["Research","Education"]'),
  parse_json('["Research depth","Social impact"]')
;
