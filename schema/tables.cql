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

CREATE TABLE IF NOT EXISTS "BDICDM"."TRANSACTION" (
    usr_token text,
    tra_id uuid,
    car_id int,
    loc_id int,
    tra_confirmationcode text,
    tra_date timestamp,
    tra_lat float,
    tra_lon float,
    tra_status text,
    tra_value decimal,
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

