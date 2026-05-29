-- Stations
INSERT INTO stations (name, city) VALUES
('Kyiv-Pasazhyrskyi', 'Kyiv'),
('Lviv',              'Lviv'),
('Kharkiv-Pasazhyrskyi', 'Kharkiv'),
('Odesa-Holovna',     'Odesa'),
('Dnipro-Holovnyi',   'Dnipro');

-- Routes
INSERT INTO routes (origin_station_id, destination_station_id) VALUES
(1, 2), -- Kyiv → Lviv
(1, 3), -- Kyiv → Kharkiv
(1, 4), -- Kyiv → Odesa
(1, 5); -- Kyiv → Dnipro

-- Trains
INSERT INTO trains (number) VALUES
('IS-741'),
('IS-743'),
('RE-101');

-- Wagons (3 wagons per train)
INSERT INTO wagons (train_id, number, total_seats) VALUES
(1, 1, 54), (1, 2, 54), (1, 3, 54),
(2, 1, 54), (2, 2, 54), (2, 3, 54),
(3, 1, 54), (3, 2, 54), (3, 3, 54);

-- Seats (54 seats per wagon)
INSERT INTO seats (wagon_id, seat_number)
SELECT w.id, s.seat_number
FROM wagons w
CROSS JOIN generate_series(1, 54) AS s(seat_number);

-- Trips
INSERT INTO trips (train_id, route_id, departure_at, arrival_at, price) VALUES
(1, 1, '2026-06-01 08:00:00', '2026-06-01 13:30:00', 450.00),
(1, 1, '2026-06-02 08:00:00', '2026-06-02 13:30:00', 450.00),
(2, 2, '2026-06-01 09:00:00', '2026-06-01 15:00:00', 380.00),
(3, 3, '2026-06-01 10:00:00', '2026-06-01 17:00:00', 520.00);

-- Test users for load testing (1000 users)
INSERT INTO users (email, password, full_name)
SELECT
  'testuser' || s || '@test.com',
  '$2b$10$92PwxifWSxS5LzXnUp2k1ep4H1HOU03ajxM7zI/7Ji5dCBJ5iYtTG',
  'Test User ' || s
FROM generate_series(1, 1000) AS s;