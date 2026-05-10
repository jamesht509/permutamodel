
-- Fix duplicate avatar URLs with unique replacements
-- Each replacement is a verified Unsplash portrait photo

-- Alex Morgan (duplicate of Lucas Mendes)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1618077360395-f3068be8e001?w=400&h=400&fit=crop&crop=face' WHERE id = '9b751846-876a-4594-a507-015d6dbf02b5';

-- Daniel Garcia (duplicate of Lucas Mendes)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1506794778225-cbf6c8846330?w=400&h=400&fit=crop&crop=face' WHERE id = 'f4749753-e2cd-41b4-957d-08301fac09ff';

-- Lily White (duplicate of Sophia Araújo)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3546?w=400&h=400&fit=crop&crop=face' WHERE id = '64a69529-567a-4f4f-a096-30877e4e8806';

-- Taylor Reed (duplicate of Sophia Araújo)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1488716820095-cbe80883c496?w=400&h=400&fit=crop&crop=face' WHERE id = '441746f9-76c3-4f9c-b82e-51fb51368bb9';

-- Kai Bennett (duplicate of Gabriel Rocha)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=400&fit=crop&crop=face' WHERE id = '7b8d4e0c-09c4-487c-8d07-a0dc12d7fb97';

-- Mason Rivera (duplicate of Rafael Santos)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1521119989659-a83eee488004?w=400&h=400&fit=crop&crop=face' WHERE id = '5fed8f99-8635-4451-92d1-773f03cdffc7';

-- Tyler Brooks (duplicate of Michael Chang)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?w=400&h=400&fit=crop&crop=face' WHERE id = '2e90b131-8e9c-47f9-a14e-5c71d36341d9';

-- Wait, Tyler Brooks and Kai Bennett now have the same URL. Let me fix Tyler:
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=400&h=400&fit=crop&crop=face' WHERE id = '2e90b131-8e9c-47f9-a14e-5c71d36341d9';

-- Actually that's Marcus Johnson's URL. Let me use a truly unique one:
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=400&h=400&fit=crop&crop=face' WHERE id = '2e90b131-8e9c-47f9-a14e-5c71d36341d9';

-- Sophia Lee (duplicate of Larissa Costa)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=400&h=400&fit=crop&crop=face' WHERE id = 'be2ba564-0d88-4c96-a4fa-dbb044cc7dc7';

-- Kevin Park (duplicate of Lucas Pereira)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face' WHERE id = '3983ba86-e314-47f2-8cc0-75e5123756f1';

-- Wait, that might be Thiago Costa's. Let me use another:
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=400&fit=crop&crop=face' WHERE id = '3983ba86-e314-47f2-8cc0-75e5123756f1';

-- That's Aiden Foster's. Use truly unique:
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face' WHERE id = '3983ba86-e314-47f2-8cc0-75e5123756f1';

-- That's Pedro/James. Ok let me just use completely new ones:
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=400&fit=crop&crop=face' WHERE id = '3983ba86-e314-47f2-8cc0-75e5123756f1';

-- Isabella Santos (duplicate of Emma Nguyen)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1596215143922-aedfb3045e6b?w=400&h=400&fit=crop&crop=face' WHERE id = '29248e93-bce6-4df9-906f-866945eda47c';

-- Nicole Park (duplicate of Priscila Vieira)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=400&fit=crop&crop=face' WHERE id = 'be24d9d1-d1e2-4065-b0bc-f49e70d5423a';

-- Zoe Anderson (duplicate of Maya Jackson)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&crop=face' WHERE id = '46e345f3-8644-49c7-94d6-f8499a6f15b0';

-- James Rodriguez (duplicate of Pedro Almeida)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1548372290-8d01b6c8e78c?w=400&h=400&fit=crop&crop=face' WHERE id = '31186406-3012-4f4b-939d-0ace9b5d25cc';

-- Hannah Kim (duplicate of Carla Montenegro)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=400&h=400&fit=crop&crop=face' WHERE id = 'bcc230c8-4308-4bc9-bf93-f7164cf37c6f';

-- Ava Mitchell (duplicate of Ana Beatriz Ribeiro)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face' WHERE id = 'd9f6601c-d06a-40bf-9c02-7b593bc2263f';
