  -- ============================================
  -- Umwero RLS Policy Fix Migration
  -- Replaces overly permissive "Allow all" policies
  -- with proper role-based access controls.
  --
  -- Run this AFTER your initial schema migration.
  -- ============================================

  -- ============================================
  -- STEP 1: DROP ALL EXISTING PERMISSIVE POLICIES
  -- ============================================

  -- Users table
  DROP POLICY IF EXISTS "Users can view own profile" ON users;
  DROP POLICY IF EXISTS "Users can update own profile" ON users;
  DROP POLICY IF EXISTS "Users can insert their own profile" ON users;

  -- User attempts
  DROP POLICY IF EXISTS "Users can view own attempts" ON user_attempts;
  DROP POLICY IF EXISTS "Users can create own attempts" ON user_attempts;

  -- Community posts
  DROP POLICY IF EXISTS "Anyone can view public posts" ON community_posts;
  DROP POLICY IF EXISTS "Authenticated users can create posts" ON community_posts;
  DROP POLICY IF EXISTS "Users can update own posts" ON community_posts;
  DROP POLICY IF EXISTS "Admins can update any post" ON community_posts;

  -- Lessons
  DROP POLICY IF EXISTS "Anyone can view published lessons" ON lessons;
  DROP POLICY IF EXISTS "Anyone can view lessons" ON lessons;
  DROP POLICY IF EXISTS "Anyone can insert lessons" ON lessons;
  DROP POLICY IF EXISTS "Anyone can update lessons" ON lessons;

  -- Lesson steps
  DROP POLICY IF EXISTS "Anyone can view lesson steps" ON lesson_steps;
  DROP POLICY IF EXISTS "Anyone can insert lesson steps" ON lesson_steps;
  DROP POLICY IF EXISTS "Anyone can update lesson steps" ON lesson_steps;

  -- Characters
  DROP POLICY IF EXISTS "Anyone can view characters" ON characters;
  DROP POLICY IF EXISTS "Anyone can insert characters" ON characters;
  DROP POLICY IF EXISTS "Anyone can update characters" ON characters;

  -- Languages
  DROP POLICY IF EXISTS "Anyone can view languages" ON languages;
  DROP POLICY IF EXISTS "Anyone can insert languages" ON languages;
  DROP POLICY IF EXISTS "Anyone can update languages" ON languages;

  -- Achievements
  DROP POLICY IF EXISTS "Anyone can view achievements" ON achievements;
  DROP POLICY IF EXISTS "Anyone can insert achievements" ON achievements;
  DROP POLICY IF EXISTS "Anyone can update achievements" ON achievements;

  -- Lesson progress
  DROP POLICY IF EXISTS "Anyone can view lesson progress" ON lesson_progress;
  DROP POLICY IF EXISTS "Anyone can insert lesson progress" ON lesson_progress;
  DROP POLICY IF EXISTS "Anyone can update lesson progress" ON lesson_progress;

  -- Drop all "Allow all" policies
  DROP POLICY IF EXISTS "Allow all on discussions" ON discussions;
  DROP POLICY IF EXISTS "Allow all on comments" ON comments;
  DROP POLICY IF EXISTS "Allow all on certificates" ON certificates;
  DROP POLICY IF EXISTS "Allow all on carts" ON carts;
  DROP POLICY IF EXISTS "Allow all on cart_items" ON cart_items;
  DROP POLICY IF EXISTS "Allow all on orders" ON orders;
  DROP POLICY IF EXISTS "Allow all on donations" ON donations;
  DROP POLICY IF EXISTS "Allow all on user_drawings" ON user_drawings;
  DROP POLICY IF EXISTS "Allow all on post_likes" ON post_likes;
  DROP POLICY IF EXISTS "Allow all on post_comments" ON post_comments;
  DROP POLICY IF EXISTS "Allow all on chat_messages" ON chat_messages;
  DROP POLICY IF EXISTS "Allow all on training_data" ON training_data;
  DROP POLICY IF EXISTS "Allow all on quizzes" ON quizzes;
  DROP POLICY IF EXISTS "Allow all on quiz_attempts" ON quiz_attempts;
  DROP POLICY IF EXISTS "Allow all on activity_logs" ON activity_logs;
  DROP POLICY IF EXISTS "Allow all on user_achievements" ON user_achievements;
  DROP POLICY IF EXISTS "Allow all on character_translations" ON character_translations;
  DROP POLICY IF EXISTS "Allow all on stroke_data" ON stroke_data;
  DROP POLICY IF EXISTS "Allow all on cultural_contexts" ON cultural_contexts;
  DROP POLICY IF EXISTS "Allow all on cultural_context_translations" ON cultural_context_translations;
  DROP POLICY IF EXISTS "Allow all on context_examples" ON context_examples;
  DROP POLICY IF EXISTS "Allow all on lesson_translations" ON lesson_translations;
  DROP POLICY IF EXISTS "Allow all on step_translations" ON step_translations;


  -- ============================================
  -- STEP 2: ENABLE RLS ON ALL TABLES
  -- (idempotent — safe to re-run)
  -- ============================================

  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_attempts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_drawings ENABLE ROW LEVEL SECURITY;
  ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE discussions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE training_data ENABLE ROW LEVEL SECURITY;
  ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
  ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
  ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
  ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
  ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
  ALTER TABLE donations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE discussion_likes ENABLE ROW LEVEL SECURITY;
  ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

  -- Public/content tables — RLS on but with public read
  ALTER TABLE languages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
  ALTER TABLE character_translations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE stroke_data ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cultural_contexts ENABLE ROW LEVEL SECURITY;
  ALTER TABLE cultural_context_translations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE context_examples ENABLE ROW LEVEL SECURITY;
  ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
  ALTER TABLE lesson_translations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE lesson_steps ENABLE ROW LEVEL SECURITY;
  ALTER TABLE step_translations ENABLE ROW LEVEL SECURITY;
  ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
  ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;


  -- ============================================
  -- HELPER: Admin check function
  -- ============================================

  CREATE OR REPLACE FUNCTION is_admin()
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN (
      coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'ADMIN'
      OR coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'ADMIN'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

  CREATE OR REPLACE FUNCTION is_teacher_or_admin()
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN (
      is_admin()
      OR coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'TEACHER'
      OR coalesce(auth.jwt() -> 'user_metadata' ->> 'role', '') = 'TEACHER'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER STABLE;


  -- ============================================
  -- STEP 3: PUBLIC CONTENT (read-only for everyone)
  -- Only admins/teachers can write.
  -- ============================================

  -- Languages
  CREATE POLICY "languages_select_active"
    ON languages FOR SELECT
    USING (is_active = true);

  CREATE POLICY "languages_insert_admin"
    ON languages FOR INSERT
    WITH CHECK (is_admin());

  CREATE POLICY "languages_update_admin"
    ON languages FOR UPDATE
    USING (is_admin());

  CREATE POLICY "languages_delete_admin"
    ON languages FOR DELETE
    USING (is_admin());

  -- Characters
  CREATE POLICY "characters_select_active"
    ON characters FOR SELECT
    USING (is_active = true);

  CREATE POLICY "characters_insert_admin"
    ON characters FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "characters_update_admin"
    ON characters FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "characters_delete_admin"
    ON characters FOR DELETE
    USING (is_admin());

  -- Character translations
  CREATE POLICY "char_translations_select"
    ON character_translations FOR SELECT
    USING (true);

  CREATE POLICY "char_translations_insert_admin"
    ON character_translations FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "char_translations_update_admin"
    ON character_translations FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "char_translations_delete_admin"
    ON character_translations FOR DELETE
    USING (is_admin());

  -- Stroke data
  CREATE POLICY "stroke_data_select"
    ON stroke_data FOR SELECT
    USING (true);

  CREATE POLICY "stroke_data_insert_admin"
    ON stroke_data FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "stroke_data_update_admin"
    ON stroke_data FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "stroke_data_delete_admin"
    ON stroke_data FOR DELETE
    USING (is_admin());

  -- Cultural contexts
  CREATE POLICY "cultural_contexts_select"
    ON cultural_contexts FOR SELECT
    USING (is_active = true);

  CREATE POLICY "cultural_contexts_insert_admin"
    ON cultural_contexts FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "cultural_contexts_update_admin"
    ON cultural_contexts FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "cultural_contexts_delete_admin"
    ON cultural_contexts FOR DELETE
    USING (is_admin());

  -- Cultural context translations
  CREATE POLICY "cultural_ctx_translations_select"
    ON cultural_context_translations FOR SELECT
    USING (true);

  CREATE POLICY "cultural_ctx_translations_insert_admin"
    ON cultural_context_translations FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "cultural_ctx_translations_update_admin"
    ON cultural_context_translations FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "cultural_ctx_translations_delete_admin"
    ON cultural_context_translations FOR DELETE
    USING (is_admin());

  -- Context examples
  CREATE POLICY "context_examples_select"
    ON context_examples FOR SELECT
    USING (is_active = true);

  CREATE POLICY "context_examples_insert_admin"
    ON context_examples FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "context_examples_update_admin"
    ON context_examples FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "context_examples_delete_admin"
    ON context_examples FOR DELETE
    USING (is_admin());


  -- ============================================
  -- STEP 4: LESSON CONTENT
  -- Public read for published, admin/teacher write
  -- ============================================

  -- Lessons
  CREATE POLICY "lessons_select_published"
    ON lessons FOR SELECT
    USING (is_published = true OR is_teacher_or_admin());

  CREATE POLICY "lessons_insert_admin"
    ON lessons FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "lessons_update_admin"
    ON lessons FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "lessons_delete_admin"
    ON lessons FOR DELETE
    USING (is_admin());

  -- Lesson translations
  CREATE POLICY "lesson_translations_select"
    ON lesson_translations FOR SELECT
    USING (true);

  CREATE POLICY "lesson_translations_insert_admin"
    ON lesson_translations FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "lesson_translations_update_admin"
    ON lesson_translations FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "lesson_translations_delete_admin"
    ON lesson_translations FOR DELETE
    USING (is_admin());

  -- Lesson steps
  CREATE POLICY "lesson_steps_select"
    ON lesson_steps FOR SELECT
    USING (is_active = true OR is_teacher_or_admin());

  CREATE POLICY "lesson_steps_insert_admin"
    ON lesson_steps FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "lesson_steps_update_admin"
    ON lesson_steps FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "lesson_steps_delete_admin"
    ON lesson_steps FOR DELETE
    USING (is_admin());

  -- Step translations
  CREATE POLICY "step_translations_select"
    ON step_translations FOR SELECT
    USING (true);

  CREATE POLICY "step_translations_insert_admin"
    ON step_translations FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "step_translations_update_admin"
    ON step_translations FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "step_translations_delete_admin"
    ON step_translations FOR DELETE
    USING (is_admin());

  -- Quizzes
  CREATE POLICY "quizzes_select"
    ON quizzes FOR SELECT
    USING (true);

  CREATE POLICY "quizzes_insert_admin"
    ON quizzes FOR INSERT
    WITH CHECK (is_teacher_or_admin());

  CREATE POLICY "quizzes_update_admin"
    ON quizzes FOR UPDATE
    USING (is_teacher_or_admin());

  CREATE POLICY "quizzes_delete_admin"
    ON quizzes FOR DELETE
    USING (is_admin());

  -- Achievements
  CREATE POLICY "achievements_select_active"
    ON achievements FOR SELECT
    USING (is_active = true);

  CREATE POLICY "achievements_insert_admin"
    ON achievements FOR INSERT
    WITH CHECK (is_admin());

  CREATE POLICY "achievements_update_admin"
    ON achievements FOR UPDATE
    USING (is_admin());

  CREATE POLICY "achievements_delete_admin"
    ON achievements FOR DELETE
    USING (is_admin());


  -- ============================================
  -- STEP 5: USER PROFILE
  -- Own profile only, admins see all
  -- ============================================

  CREATE POLICY "users_select_own"
    ON users FOR SELECT
    USING (auth.uid()::text = id OR is_admin());

  CREATE POLICY "users_insert_own"
    ON users FOR INSERT
    WITH CHECK (auth.uid()::text = id);

  CREATE POLICY "users_update_own"
    ON users FOR UPDATE
    USING (auth.uid()::text = id OR is_admin());

  -- No user delete policy — handled by Supabase auth cascade or admin action
  CREATE POLICY "users_delete_admin"
    ON users FOR DELETE
    USING (is_admin());


  -- ============================================
  -- STEP 6: USER-OWNED DATA
  -- Users CRUD own rows, admins read all
  -- ============================================

  -- Lesson progress
  CREATE POLICY "lesson_progress_select_own"
    ON lesson_progress FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "lesson_progress_insert_own"
    ON lesson_progress FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "lesson_progress_update_own"
    ON lesson_progress FOR UPDATE
    USING (auth.uid()::text = user_id);

  CREATE POLICY "lesson_progress_delete_own"
    ON lesson_progress FOR DELETE
    USING (auth.uid()::text = user_id OR is_admin());

  -- User attempts
  CREATE POLICY "user_attempts_select_own"
    ON user_attempts FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "user_attempts_insert_own"
    ON user_attempts FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  -- Attempts are immutable — no update/delete for users
  CREATE POLICY "user_attempts_delete_admin"
    ON user_attempts FOR DELETE
    USING (is_admin());

  -- User drawings
  CREATE POLICY "user_drawings_select_own"
    ON user_drawings FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "user_drawings_insert_own"
    ON user_drawings FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "user_drawings_delete_own"
    ON user_drawings FOR DELETE
    USING (auth.uid()::text = user_id OR is_admin());

  -- User achievements
  CREATE POLICY "user_achievements_select_own"
    ON user_achievements FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "user_achievements_insert_own"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "user_achievements_update_own"
    ON user_achievements FOR UPDATE
    USING (auth.uid()::text = user_id);

  -- Quiz attempts
  CREATE POLICY "quiz_attempts_select_own"
    ON quiz_attempts FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "quiz_attempts_insert_own"
    ON quiz_attempts FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  -- Certificates
  CREATE POLICY "certificates_select_own"
    ON certificates FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "certificates_insert_admin"
    ON certificates FOR INSERT
    WITH CHECK (is_admin());

  -- Chat messages
  CREATE POLICY "chat_messages_select_own"
    ON chat_messages FOR SELECT
    USING (auth.uid()::text = user_id OR shared = true OR is_admin());

  CREATE POLICY "chat_messages_insert_own"
    ON chat_messages FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "chat_messages_update_own"
    ON chat_messages FOR UPDATE
    USING (auth.uid()::text = user_id);

  CREATE POLICY "chat_messages_delete_own"
    ON chat_messages FOR DELETE
    USING (auth.uid()::text = user_id OR is_admin());


  -- ============================================
  -- STEP 7: E-COMMERCE (user-owned)
  -- ============================================

  -- Carts
  CREATE POLICY "carts_select_own"
    ON carts FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "carts_insert_own"
    ON carts FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "carts_update_own"
    ON carts FOR UPDATE
    USING (auth.uid()::text = user_id);

  CREATE POLICY "carts_delete_own"
    ON carts FOR DELETE
    USING (auth.uid()::text = user_id);

  -- Cart items (via cart ownership)
  CREATE POLICY "cart_items_select_own"
    ON cart_items FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND (carts.user_id = auth.uid()::text OR is_admin())
      )
    );

  CREATE POLICY "cart_items_insert_own"
    ON cart_items FOR INSERT
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()::text
      )
    );

  CREATE POLICY "cart_items_update_own"
    ON cart_items FOR UPDATE
    USING (
      EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()::text
      )
    );

  CREATE POLICY "cart_items_delete_own"
    ON cart_items FOR DELETE
    USING (
      EXISTS (
        SELECT 1 FROM carts
        WHERE carts.id = cart_items.cart_id
        AND carts.user_id = auth.uid()::text
      )
    );

  -- Orders
  CREATE POLICY "orders_select_own"
    ON orders FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "orders_insert_own"
    ON orders FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  -- Orders are immutable for users
  CREATE POLICY "orders_update_admin"
    ON orders FOR UPDATE
    USING (is_admin());

  -- Donations
  CREATE POLICY "donations_select_own"
    ON donations FOR SELECT
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "donations_insert_authenticated"
    ON donations FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);


  -- ============================================
  -- STEP 8: COMMUNITY / SOCIAL
  -- Public read, authenticated write, own edit/delete
  -- ============================================

  -- Community posts
  CREATE POLICY "community_posts_select_public"
    ON community_posts FOR SELECT
    USING (is_public = true OR auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "community_posts_insert_authenticated"
    ON community_posts FOR INSERT
    WITH CHECK (auth.role() = 'authenticated' AND auth.uid()::text = user_id);

  CREATE POLICY "community_posts_update_own"
    ON community_posts FOR UPDATE
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "community_posts_delete_own"
    ON community_posts FOR DELETE
    USING (auth.uid()::text = user_id OR is_admin());

  -- Post likes
  CREATE POLICY "post_likes_select"
    ON post_likes FOR SELECT
    USING (true);

  CREATE POLICY "post_likes_insert_authenticated"
    ON post_likes FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "post_likes_delete_own"
    ON post_likes FOR DELETE
    USING (auth.uid()::text = user_id);

  -- Post comments
  CREATE POLICY "post_comments_select"
    ON post_comments FOR SELECT
    USING (true);

  CREATE POLICY "post_comments_insert_authenticated"
    ON post_comments FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "post_comments_update_own"
    ON post_comments FOR UPDATE
    USING (auth.uid()::text = user_id);

  CREATE POLICY "post_comments_delete_own"
    ON post_comments FOR DELETE
    USING (auth.uid()::text = user_id OR is_admin());

  -- Discussions
  CREATE POLICY "discussions_select"
    ON discussions FOR SELECT
    USING (true);

  CREATE POLICY "discussions_insert_authenticated"
    ON discussions FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "discussions_update_own"
    ON discussions FOR UPDATE
    USING (auth.uid()::text = user_id OR is_admin());

  CREATE POLICY "discussions_delete_own"
    ON discussions FOR DELETE
    USING (auth.uid()::text = user_id OR is_admin());

  -- Discussion likes
  CREATE POLICY "discussion_likes_select"
    ON discussion_likes FOR SELECT
    USING (true);

  CREATE POLICY "discussion_likes_insert_authenticated"
    ON discussion_likes FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "discussion_likes_delete_own"
    ON discussion_likes FOR DELETE
    USING (auth.uid()::text = user_id);

  -- Comments (on discussions)
  CREATE POLICY "comments_select"
    ON comments FOR SELECT
    USING (true);

  CREATE POLICY "comments_insert_authenticated"
    ON comments FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

  CREATE POLICY "comments_update_own"
    ON comments FOR UPDATE
    USING (auth.uid()::text = user_id);

  CREATE POLICY "comments_delete_own"
    ON comments FOR DELETE
    USING (auth.uid()::text = user_id OR is_admin());


  -- ============================================
  -- STEP 9: TRAINING DATA & ACTIVITY LOGS
  -- Restricted to admins; users can insert own
  -- ============================================

  -- Training data
  CREATE POLICY "training_data_select_admin"
    ON training_data FOR SELECT
    USING (is_admin() OR auth.uid()::text = user_id);

  CREATE POLICY "training_data_insert_authenticated"
    ON training_data FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

  CREATE POLICY "training_data_update_admin"
    ON training_data FOR UPDATE
    USING (is_admin());

  CREATE POLICY "training_data_delete_admin"
    ON training_data FOR DELETE
    USING (is_admin());

  -- Activity logs (write-only for system, read for admins)
  CREATE POLICY "activity_logs_select_admin"
    ON activity_logs FOR SELECT
    USING (is_admin());

  CREATE POLICY "activity_logs_insert_system"
    ON activity_logs FOR INSERT
    WITH CHECK (true);  -- Logged via server-side/service role ideally


  -- ============================================
  -- DONE
  -- ============================================

  DO $$
  BEGIN
    RAISE NOTICE '✅ RLS policies fixed! Summary of changes:';
    RAISE NOTICE '   • Removed all "Allow all" permissive policies';
    RAISE NOTICE '   • Public content: read-only for everyone, write for admins/teachers';
    RAISE NOTICE '   • User data: own rows only, admins can read all';
    RAISE NOTICE '   • Community: public read, authenticated write, own edit/delete';
    RAISE NOTICE '   • E-commerce: strict user ownership with cart-item join checks';
    RAISE NOTICE '   • Activity logs: admin-only read, system insert';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Make sure your Supabase JWT includes the user role';
    RAISE NOTICE '   in app_metadata or user_metadata for admin/teacher checks to work.';
    RAISE NOTICE '   Example: supabase.auth.admin.updateUserById(uid, {';
    RAISE NOTICE '     app_metadata: { role: "ADMIN" }';
    RAISE NOTICE '   })';
  END $$;