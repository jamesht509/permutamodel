
-- Fix remaining duplicates with unique URLs (second profile in each pair gets a new URL)

-- James Rodriguez (was Noah Rivera/Kevin Park duplicate)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1605462863863-10d9e47e15ee?w=400&h=400&fit=crop&crop=face' WHERE id = '31186406-3012-4f4b-939d-0ace9b5d25cc';

-- Kevin Park 
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1602471615287-d785f4143854?w=400&h=400&fit=crop&crop=face' WHERE id = '3983ba86-e314-47f2-8cc0-75e5123756f1';

-- Nicole Park (duplicate of Sarah Chen)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1614644147724-2d4785d69962?w=400&h=400&fit=crop&crop=face' WHERE id = 'be24d9d1-d1e2-4065-b0bc-f49e70d5423a';

-- Kai Bennett (duplicate of Paulo Vieira)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1611403119860-57c4862f56cd?w=400&h=400&fit=crop&crop=face' WHERE id = '7b8d4e0c-09c4-487c-8d07-a0dc12d7fb97';

-- Zoe Anderson (duplicate of Carolina Dias)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400&h=400&fit=crop&crop=face' WHERE id = '46e345f3-8644-49c7-94d6-f8499a6f15b0';

-- Isabella Santos (duplicate of Amanda Lopes)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400&h=400&fit=crop&crop=face' WHERE id = '29248e93-bce6-4df9-906f-866945eda47c';

-- Ava Mitchell (duplicate of Marina Oliveira)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1611432579402-7037e3e2c1e4?w=400&h=400&fit=crop&crop=face' WHERE id = 'd9f6601c-d06a-40bf-9c02-7b593bc2263f';

-- Hannah Kim (duplicate of Rachel Martinez)
UPDATE profiles SET avatar_url = 'https://images.unsplash.com/photo-1616766098956-c81f12114571?w=400&h=400&fit=crop&crop=face' WHERE id = 'bcc230c8-4308-4bc9-bf93-f7164cf37c6f';
