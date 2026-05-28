-- Inferno seed data. Run after 0001_init.sql.
-- Populates the skin catalog, the current battle pass, and a weekly tournament.

insert into public.skins (sku, kind, name, description, price_cents) values
  ('board_marble', 'board', 'Marble', 'Cold stone for a hot game.', 499),
  ('board_obsidian', 'board', 'Volcanic Obsidian', 'Forged in the caldera.', 499),
  ('board_galaxy', 'board', 'Galaxy Resin', 'Drop discs into the void.', 499),
  ('board_steel', 'board', 'Cyberpunk Steel', 'Neon-lit brushed metal.', 499),
  ('disc_gem', 'disc', 'Gem', 'Faceted, refractive discs.', 199),
  ('disc_holo', 'disc', 'Holo', 'Iridescent holo foil.', 199),
  ('disc_glyph', 'disc', 'Glyph', 'Ancient runes that glow when hot.', 199),
  ('fx_lightning', 'burnfx', 'Lightning Burn', 'Discs vanish in a thunderclap.', 299),
  ('fx_frost', 'burnfx', 'Frost Dissolve', 'They shatter instead of burning.', 299),
  ('fx_blossom', 'burnfx', 'Cherry Blossom', 'Petals scatter on burn.', 299),
  ('sfx_thunder', 'sfx', 'Thunder SFX', 'Every drop lands like a storm.', 99),
  ('bundle_volcano', 'bundle', 'Volcano Bundle', 'Obsidian + Glyph + Lightning.', 799)
on conflict (sku) do nothing;

insert into public.battle_passes (season, title, starts_at, ends_at, tiers) values
  ('2026-S1', 'First Spark', now(), now() + interval '21 days',
   '[{"tier":1,"reward":"disc_gem","premium":false},{"tier":5,"reward":"fx_lightning","premium":true},{"tier":10,"reward":"board_obsidian","premium":true},{"tier":14,"reward":"frame_founder","premium":true}]'::jsonb)
on conflict (season) do nothing;

insert into public.tournaments (title, kind, format, scheduled_at, status) values
  ('Weekly Blitz Open', 'free', 'blitzInferno', date_trunc('week', now()) + interval '6 days 18 hours', 'scheduled'),
  ('Pro Cup', 'pro', 'blitzInferno', date_trunc('week', now()) + interval '6 days 20 hours', 'scheduled')
on conflict do nothing;
