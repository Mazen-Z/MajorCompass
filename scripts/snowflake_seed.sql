-- Minimal Snowflake schema for demo (adjust DATABASE/SCHEMA by your env)

create or replace table majors (
  code string,
  name string,
  cluster string,
  reason string
);

create or replace table careers (
  code string,
  title string,
  cluster string,
  reason string
);

-- Sample rows
insert into majors (code, name, cluster, reason) values
  ('CS','Computer Science','analytical','Your analytical scores suggest comfort with abstraction & logic.'),
  ('DS','Data Science','analytical','Data affinity indicates strength in modeling & inference.'),
  ('BUS','Business Administration','people','People-focus aligns with leadership & coordination.'),
  ('PSY','Psychology','people','Interest in people dynamics suits behavioral studies.'),
  ('BIO','Biology','handsOn','Hands-on inclination fits lab work & experimentation.'),
  ('DES','Design','creative','Creative scores suggest visual communication strengths.');

insert into careers (code, title, cluster, reason) values
  ('SWE','Software Engineer','analytical','Logic & systems thinking fit engineering roles.'),
  ('DA','Data Analyst','analytical','Quant skills match analytics & insights roles.'),
  ('PM','Product Manager','people','Collaboration & communication align with PM work.'),
  ('UX','UX Designer','creative','Creativity & empathy fit design research & prototyping.'),
  ('LAB','Lab Technician','handsOn','Hands-on preference matches experimental workflows.');
