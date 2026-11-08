ALTER TABLE user_profiles ADD COLUMN mascot_id VARCHAR(16);
ALTER TABLE user_profiles ADD CONSTRAINT user_profiles_mascot_id_check
    CHECK (mascot_id IS NULL OR mascot_id IN ('cat', 'fox', 'rabbit', 'bear', 'frog', 'penguin',
        'dog', 'panda', 'tiger', 'koala', 'pig', 'duck', 'hamster', 'raccoon', 'lion', 'monkey'));
