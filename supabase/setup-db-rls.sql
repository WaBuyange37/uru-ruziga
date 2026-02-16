-- ==========================================
-- Database Table RLS (Public Schema)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE "public"."languages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."characters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."character_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."stroke_data" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cultural_contexts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."cultural_context_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."context_examples" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lessons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lesson_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lesson_steps" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."step_translations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."lesson_progress" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_attempts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."user_achievements" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;

-- Content Tables: Public Read Access
CREATE POLICY "Public Read Languages" ON "public"."languages" FOR SELECT USING (true);
CREATE POLICY "Public Read Characters" ON "public"."characters" FOR SELECT USING (true);
CREATE POLICY "Public Read CharTranslations" ON "public"."character_translations" FOR SELECT USING (true);
CREATE POLICY "Public Read StrokeData" ON "public"."stroke_data" FOR SELECT USING (true);
CREATE POLICY "Public Read CulturalContexts" ON "public"."cultural_contexts" FOR SELECT USING (true);
CREATE POLICY "Public Read ContextTranslations" ON "public"."cultural_context_translations" FOR SELECT USING (true);
CREATE POLICY "Public Read ContextExamples" ON "public"."context_examples" FOR SELECT USING (true);
CREATE POLICY "Public Read Lessons" ON "public"."lessons" FOR SELECT USING (true);
CREATE POLICY "Public Read LessonTranslations" ON "public"."lesson_translations" FOR SELECT USING (true);
CREATE POLICY "Public Read LessonSteps" ON "public"."lesson_steps" FOR SELECT USING (true);
CREATE POLICY "Public Read StepTranslations" ON "public"."step_translations" FOR SELECT USING (true);
CREATE POLICY "Public Read Achievements" ON "public"."achievements" FOR SELECT USING (true);

-- User Data: Private Access (Owner Only)
CREATE POLICY "Users read own progress" ON "public"."lesson_progress" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users update own progress" ON "public"."lesson_progress" FOR ALL USING (auth.uid()::text = "userId");

CREATE POLICY "Users read own attempts" ON "public"."user_attempts" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users insert own attempts" ON "public"."user_attempts" FOR INSERT WITH CHECK (auth.uid()::text = "userId");

CREATE POLICY "Users read own achievements" ON "public"."user_achievements" FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "Users update own achievements" ON "public"."user_achievements" FOR ALL USING (auth.uid()::text = "userId");

CREATE POLICY "Users read own profile" ON "public"."users" FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users update own profile" ON "public"."users" FOR UPDATE USING (auth.uid()::text = id);
