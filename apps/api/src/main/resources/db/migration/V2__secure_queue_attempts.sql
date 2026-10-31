ALTER TABLE daily_queue_entry ADD COLUMN completed BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE learning_attempt ADD COLUMN queue_entry_id BIGINT;
ALTER TABLE learning_attempt ADD CONSTRAINT fk_attempt_queue_entry FOREIGN KEY (queue_entry_id) REFERENCES daily_queue_entry(id);
