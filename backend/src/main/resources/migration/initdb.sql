-- users
DROP TABLE IF EXISTS  users cascade ;
CREATE TABLE IF NOT EXISTS users (
                       id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                       avatar VARCHAR(255),
                       display_name VARCHAR(255),
                       is_admin BOOLEAN,
                       login VARCHAR(255) UNIQUE NOT NULL ,
                       password VARCHAR(255)
);

-- projects
DROP TABLE IF EXISTS  projects cascade;
CREATE TABLE IF NOT EXISTS projects (
                          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                          name VARCHAR(255),
                          path VARCHAR(255),
                          owner_id UUID,
                          FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);
-- join table for members
DROP TABLE IF EXISTS  project_members cascade;
CREATE TABLE IF NOT EXISTS project_members (
                                 project_id UUID NOT NULL,
                                 user_id UUID NOT NULL,
                                 PRIMARY KEY (project_id, user_id),
                                 FOREIGN KEY (project_id) REFERENCES projects(id),
                                 FOREIGN KEY (user_id) REFERENCES users(id)
);

--
DROP TABLE IF EXISTS orders cascade;
CREATE TABLE IF NOT EXISTS orders (
                            order_id SERIAL PRIMARY KEY,
                            issuer UUID NOT NULL,
                            seller UUID,
                            content json NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            status INTEGER,
                            FOREIGN KEY (issuer) REFERENCES users(id)
);

INSERT INTO users (avatar, display_name, is_admin, login, password) values ('','Test Ing',true,'admin.test','test')