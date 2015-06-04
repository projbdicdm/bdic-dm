CREATE KEYSPACE IF NOT EXISTS "BDICDM" WITH replication = {'class': 'SimpleStrategy', 'replication_factor': '1'}  AND durable_writes = true;

CREATE TABLE IF NOT EXISTS "BDICDM"."USER" (
    usr_login text PRIMARY KEY,
    usr_password text,
    usr_token text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = '{"keys":"ALL", "rows_per_partition":"NONE"}'
    AND comment = ''
    AND compaction = {'min_threshold': '4', 'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32'}
    AND compression = {'sstable_compression': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99.0PERCENTILE';

INSERT INTO "BDICDM"."USER" (usr_login, usr_password, usr_token) VALUES ('lamas3000@gmail.com','123456','a4a70900-24e1-11df-8924-001ff3591711')
	
	
CREATE INDEX IF NOT EXISTS idx_usr_token ON "BDICDM"."USER" (usr_token);

CREATE TABLE IF NOT EXISTS "BDICDM"."CLIENT" (
    usr_login text PRIMARY KEY,
    cli_annualincome decimal,
    cli_birthdate timestamp,
    cli_cpf text,
    cli_email text,
    cli_firstname text,
    cli_gender text,
    cli_loc_id int,
    cli_middlename text,
    cli_phones list<text>,
    cli_rg text,
    cli_surname text
) WITH bloom_filter_fp_chance = 0.01
    AND caching = '{"keys":"ALL", "rows_per_partition":"NONE"}'
    AND comment = ''
    AND compaction = {'min_threshold': '4', 'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32'}
    AND compression = {'sstable_compression': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99.0PERCENTILE';

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), 0, 0, 'PENDING', 999);

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), 0, 0, 'PENDING', 999);

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), 0, 0, 'PENDING', 999);

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), 0, 0, 'PENDING', 999);

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), 0, 0, 'PENDING', 999);

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), 0, 0, 'PENDING', 999);

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), 0, 0, 'PENDING', 999);


--MATOS CORDEIRO
INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value, tra_segment) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), -23.493596, -46.651210, 'PENDING', 999, 'VAREJO');


--METRO LIBERDADE

INSERT INTO "BDICDM"."TRANSACTION" (usr_token, tra_id, car_id, loc_id, tra_confirmationcode, tra_date, tra_lat, tra_lon, tra_status, tra_value, tra_segment) 
VALUES ('a4a70900-24e1-11df-8924-001ff3591711', now(), -1, -1, '9999', dateof(now()), -23.555085, -46.635834, 'PENDING', 999, 'VAREJO');

CREATE TABLE IF NOT EXISTS "BDICDM"."TRANSACTION" (
    usr_token text,
    tra_id timeuuid,
    car_id int,
    loc_id int,
    tra_confirmationcode text,
    tra_date timestamp,
    tra_lat float,
    tra_lon float,
    tra_status text,
    tra_value double,
	tra_segment text,
    PRIMARY KEY (usr_token, tra_id)
) WITH CLUSTERING ORDER BY (tra_id ASC)
    AND bloom_filter_fp_chance = 0.01
    AND caching = '{"keys":"ALL", "rows_per_partition":"NONE"}'
    AND comment = ''
    AND compaction = {'min_threshold': '4', 'class': 'org.apache.cassandra.db.compaction.SizeTieredCompactionStrategy', 'max_threshold': '32'}
    AND compression = {'sstable_compression': 'org.apache.cassandra.io.compress.LZ4Compressor'}
    AND dclocal_read_repair_chance = 0.1
    AND default_time_to_live = 0
    AND gc_grace_seconds = 864000
    AND max_index_interval = 2048
    AND memtable_flush_period_in_ms = 0
    AND min_index_interval = 128
    AND read_repair_chance = 0.0
    AND speculative_retry = '99.0PERCENTILE';

CREATE INDEX IF NOT EXISTS idx_tra_segment ON "BDICDM"."TRANSACTION" (tra_segment);
CREATE INDEX IF NOT EXISTS idx_tra_status ON "BDICDM"."TRANSACTION" (tra_status);