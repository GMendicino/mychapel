DROP TABLE IF EXISTS admins;
CREATE TABLE admins (
    admin_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    is_superadmin INTEGER DEFAULT 0
);

DROP TABLE IF EXISTS tours;
CREATE TABLE tours (
    tour_ID INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_ID INTEGER,
    tour TEXT,
    is_published INTEGER DEFAULT 0,
    FOREIGN KEY (admin_ID) REFERENCES admins(admin_ID)
);

-- Seed with a default superadmin if needed (password: admin123)
-- INSERT INTO admins (username, password, is_superadmin) 
-- VALUES ('admin', '$2a$10$YourBcryptHashHere', 1);
