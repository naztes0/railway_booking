CREATE TYPE booking_status AS ENUM (
    'confirmed',
    'reserved',
    'expired',
    'cancelled'
);

CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255) NOT NULL, -- bcrypt hash
    full_name   VARCHAR(255) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE stations (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    city    VARCHAR(255) NOT NULL
);

CREATE TABLE routes (
    id                      SERIAL PRIMARY KEY,
    origin_station_id       INT NOT NULL REFERENCES stations(id),
    destination_station_id  INT NOT NULL REFERENCES stations(id)
);

CREATE TABLE trains (
    id      SERIAL PRIMARY KEY,
    number  VARCHAR(50) NOT NULL
);

CREATE TABLE wagons (
    id          SERIAL PRIMARY KEY,
    train_id    INT NOT NULL REFERENCES trains(id),
    number      INT NOT NULL,
    total_seats INT NOT NULL
);

CREATE TABLE seats (
    id          SERIAL PRIMARY KEY,
    wagon_id    INT NOT NULL REFERENCES wagons(id),
    seat_number INT NOT NULL,
    version     INT NOT NULL DEFAULT 0 -- for optimistic locking
);

CREATE TABLE trips (
    id              SERIAL PRIMARY KEY,
    train_id        INT NOT NULL REFERENCES trains(id),
    route_id        INT NOT NULL REFERENCES routes(id),
    departure_at    TIMESTAMP NOT NULL,
    arrival_at      TIMESTAMP NOT NULL,
    price           DECIMAL(10, 2) NOT NULL
);

CREATE TABLE bookings (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id),
    trip_id         INT NOT NULL REFERENCES trips(id),
    seat_id         INT NOT NULL REFERENCES seats(id),
    status          booking_status NOT NULL DEFAULT 'confirmed',
    reserved_until  TIMESTAMP, -- only soft reservation pattern
    booked_at       TIMESTAMP DEFAULT NOW(),

    UNIQUE (trip_id, seat_id)
);

-- no UNIQUE constraint and no FK — intentional for race condition demo
CREATE TABLE bookings_naive (
    id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id   UUID NOT NULL,
    trip_id   INT NOT NULL,
    seat_id   INT NOT NULL,
    booked_at TIMESTAMP DEFAULT NOW()
);