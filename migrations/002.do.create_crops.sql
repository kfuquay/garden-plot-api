CREATE TABLE crops (
    cropid SERIAL PRIMARY KEY,
    plotid INTEGER REFERENCES plots(plotid) ON DELETE SET NULL,
    cropname TEXT NOT NULL,
    dateplanted DATE,
    dateharvested DATE,
    cropnotes TEXT
);