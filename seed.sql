-- Seed data for D1 Database - Popular Karaoke Songs
-- Run after schema.sql

-- Pop hits and classics perfect for karaoke
INSERT INTO songs (id, title, artist, duration) VALUES
('song_001', 'Bohemian Rhapsody', 'Queen', 355),
('song_002', 'Don''t Stop Believin''', 'Journey', 258),
('song_003', 'Sweet Caroline', 'Neil Diamond', 220),
('song_004', 'Living on a Prayer', 'Bon Jovi', 245),
('song_005', 'I Want It That Way', 'Backstreet Boys', 210),
('song_006', 'Wonderwall', 'Oasis', 255),
('song_007', 'Mr. Brightside', 'The Killers', 220),
('song_008', 'Dancing Queen', 'ABBA', 235),
('song_009', 'Total Eclipse of the Heart', 'Bonnie Tyler', 300),
('song_010', 'Africa', 'Toto', 270),
('song_011', 'September', 'Earth Wind & Fire', 215),
('song_012', 'Shut Up and Dance', 'Walk the Moon', 180),
('song_013', 'Uptown Funk', 'Mark Ronson ft. Bruno Mars', 240),
('song_014', 'Happy', 'Pharrell Williams', 225),
('song_015', 'I Will Survive', 'Gloria Gaynor', 295),
('song_016', 'Eye of the Tiger', 'Survivor', 240),
('song_017', 'Don''t Stop Me Now', 'Queen', 180),
('song_018', 'Shake It Off', 'Taylor Swift', 210),
('song_019', 'Can''t Stop the Feeling', 'Justin Timberlake', 225),
('song_020', '24K Magic', 'Bruno Mars', 210),
('song_021', 'Love Shack', 'The B-52''s', 210),
('song_022', 'Summer of ''69', 'Bryan Adams', 240),
('song_023', 'Pour Some Sugar on Me', 'Def Leppard', 240),
('song_024', 'You Shook Me All Night Long', 'AC/DC', 210),
('song_025', 'Livin'' La Vida Loca', 'Ricky Martin', 210),
('song_026', 'Macarena', 'Los Del Rio', 180),
('song_027', 'Wannabe', 'Spice Girls', 165),
('song_028', '...Baby One More Time', 'Britney Spears', 180),
('song_029', 'Hey Ya!', 'OutKast', 210),
('song_030', 'Since U Been Gone', 'Kelly Clarkson', 210),
('song_031', 'Someone Like You', 'Adele', 250),
('song_032', 'Rolling in the Deep', 'Adele', 240),
('song_033', 'Thinking Out Loud', 'Ed Sheeran', 280),
('song_034', 'Perfect', 'Ed Sheeran', 260),
('song_035', 'Shape of You', 'Ed Sheeran', 210),
('song_036', 'Count on Me', 'Bruno Mars', 180),
('song_037', 'Just the Way You Are', 'Bruno Mars', 210),
('song_038', 'Grenade', 'Bruno Mars', 210),
('song_039', 'Somebody That I Used to Know', 'Gotye', 240),
('song_040', 'Radioactive', 'Imagine Dragons', 210),
('song_041', 'Firework', 'Katy Perry', 210),
('song_042', 'Roar', 'Katy Perry', 210),
('song_043', 'California Gurls', 'Katy Perry', 210),
('song_044', 'Party in the USA', 'Miley Cyrus', 180),
('song_045', 'Tik Tok', 'Ke$ha', 180),
('song_046', 'Dynamite', 'Taio Cruz', 210),
('song_047', 'On the Floor', 'Jennifer Lopez', 210),
('song_048', 'We Found Love', 'Rihanna', 210),
('song_049', 'Call Me Maybe', 'Carly Rae Jepsen', 180),
('song_050', 'Gangnam Style', 'PSY', 210);

-- Divas / Ballads
INSERT INTO songs (id, title, artist, duration) VALUES
('song_100', 'I Have Nothing', 'Whitney Houston', 270),
('song_101', 'I Wanna Dance with Somebody', 'Whitney Houston', 240),
('song_052', 'Greatest Love of All', 'Whitney Houston', 270),
('song_102', 'And I Am Telling You', 'Jennifer Hudson', 270),
('song_103', 'Listen', 'Beyoncé', 240),
('song_104', 'Halo', 'Beyoncé', 240),
('song_105', 'Love on Top', 'Beyoncé', 270),
('song_106', 'Respect', 'Aretha Franklin', 180),
('song_107', 'Natural Woman', 'Aretha Franklin', 210),
('song_108', 'At Last', 'Etta James', 240),
('song_109', 'Summertime', 'Ella Fitzgerald', 210),
('song_110', 'My Heart Will Go On', 'Celine Dion', 270);

-- Rock Classics
INSERT INTO songs (id, title, artist, duration) VALUES
('song_200', 'Hotel California', 'Eagles', 320),
('song_201', 'Stairway to Heaven', 'Led Zeppelin', 480),
('song_202', 'Dream On', 'Aerosmith', 270),
('song_203', 'Free Bird', 'Lynyrd Skynyrd', 360),
('song_204', 'Simple Man', 'Lynyrd Skynyrd', 270),
('song_205', 'Creep', 'Radiohead', 210);

-- Country / Crossover
INSERT INTO songs (id, title, artist, duration) VALUES
('song_300', 'Jolene', 'Dolly Parton', 180),
('song_301', 'Before He Cheats', 'Carrie Underwood', 210),
('song_302', 'Man! I Feel Like a Woman', 'Shania Twain', 210),
('song_303', 'Friends in Low Places', 'Garth Brooks', 210),
('song_304', 'Wagon Wheel', 'Darius Rucker', 210);

-- Duets
INSERT INTO songs (id, title, artist, duration) VALUES
('song_400', 'Ebony and Ivory', 'Paul McCartney & Michael Jackson', 210),
('song_401', 'I Got You Babe', 'Sonny & Cher', 180),
('song_402', 'Islands in the Stream', 'Kenny Rogers & Dolly Parton', 210),
('song_403', 'Don''t Go Breaking My Heart', 'Elton John & Kiki Dee', 180),
('song_404', 'Shallow', 'Lady Gaga & Bradley Cooper', 240);