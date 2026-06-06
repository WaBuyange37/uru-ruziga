# Requirements Document

## Introduction

This document specifies the requirements for transforming Uruziga from a content delivery platform into a world-class adaptive didactic learning system for teaching the Umwero Alphabet and preserving Kinyarwanda linguistic and cultural heritage. The transformation applies modern educational science principles including scaffolding, competency-based learning, immediate feedback loops, retrieval practice, active learning, adaptive learning paths, cultural didactics, constructivism, gamification, and learning analytics.

The system will build upon the existing Uruziga platform infrastructure (Next.js, Prisma, PostgreSQL, Python OCR services) while fundamentally redesigning the learning experience to follow evidence-based pedagogical principles.

## Glossary

- **Learning_System**: The complete adaptive didactic learning platform for Umwero alphabet instruction
- **Learner**: A user actively engaged in learning the Umwero alphabet through the platform
- **Character**: An individual Umwero alphabet symbol (vowel, consonant, or ligature)
- **Learning_Stage**: One of eight progressive stages in the scaffolding system (Recognition → Identification → Tracing → Guided Writing → Independent Writing → Word Formation → Sentence Formation → Cultural Application)
- **Mastery_Score**: A quantitative measure (0-100) of learner competency for a specific character or skill
- **OCR_Engine**: The Python-based handwriting evaluation service that analyzes learner writing attempts
- **Feedback_System**: The component that provides immediate, actionable guidance to learners based on their performance
- **Spaced_Review_System**: The retrieval practice mechanism that schedules character reviews based on forgetting curve principles
- **Adaptive_Engine**: The component that personalizes learning paths based on learner performance data
- **Cultural_Context**: Rwandan proverbs, stories, historical events, traditional practices, and values associated with characters
- **Gamification_System**: The XP, levels, achievements, and rewards mechanism that motivates learners
- **Analytics_Dashboard**: Visual interface displaying learning progress, mastery status, and performance metrics
- **Dataset_Pipeline**: The system that collects and stores learner handwriting data for future AI training
- **Learning_Journey**: The complete progression path from introduction through mastery for a character or concept

## Requirements


### Requirement 1: Eight-Stage Scaffolding System

**User Story:** As a learner, I want to progress through structured learning stages for each character, so that I can build mastery incrementally from recognition to cultural application.

#### Acceptance Criteria

1. THE Learning_System SHALL implement eight sequential learning stages: Recognition, Identification, Tracing, Guided Writing, Independent Writing, Word Formation, Sentence Formation, and Cultural Application
2. WHEN a learner begins learning a character, THE Learning_System SHALL start them at the Recognition stage
3. WHEN a learner achieves the mastery threshold for a stage, THE Learning_System SHALL unlock the next stage for that character
4. THE Learning_System SHALL track stage completion status for each character-learner pair
5. THE Learning_System SHALL display the current stage and available stages for each character in the learner interface
6. WHEN a learner attempts to access a locked stage, THE Learning_System SHALL display the mastery requirements needed to unlock it
7. THE Learning_System SHALL allow learners to revisit completed stages for review
8. THE Learning_System SHALL persist stage progression data across sessions

### Requirement 2: Competency-Based Mastery Tracking

**User Story:** As a learner, I want my competency measured across multiple dimensions, so that I receive accurate assessment of my mastery level.

#### Acceptance Criteria

1. THE Learning_System SHALL track mastery_score (0-100) for each character-learner pair
2. THE Learning_System SHALL track accuracy_rate as the percentage of correct attempts
3. THE Learning_System SHALL track attempt_count for each character
4. THE Learning_System SHALL track completion_status (NOT_STARTED, IN_PROGRESS, LEARNED, MASTERED)
5. THE Learning_System SHALL track time_spent in seconds for each learning session
6. THE Learning_System SHALL track confidence_score based on consistency across attempts
7. THE Learning_System SHALL apply mastery thresholds: Recognition stage requires 80% mastery_score, Writing stages require 85%, OCR evaluation requires 90%, Cultural application requires 75%
8. WHEN a learner achieves the mastery threshold, THE Learning_System SHALL update completion_status to LEARNED or MASTERED
9. THE Learning_System SHALL recalculate mastery metrics after each attempt
10. THE Learning_System SHALL store all historical mastery data for analytics


### Requirement 3: Immediate Feedback Loop with OCR Integration

**User Story:** As a learner, I want immediate detailed feedback on my handwriting attempts, so that I can correct mistakes and improve my writing technique.

#### Acceptance Criteria

1. WHEN a learner submits a handwriting attempt, THE OCR_Engine SHALL evaluate shape_accuracy within 500 milliseconds
2. THE OCR_Engine SHALL evaluate stroke_order correctness
3. THE OCR_Engine SHALL evaluate stroke_direction correctness
4. THE OCR_Engine SHALL evaluate stroke_consistency across the character
5. THE OCR_Engine SHALL evaluate size_balance of character proportions
6. THE OCR_Engine SHALL evaluate spacing for multi-stroke characters
7. THE Feedback_System SHALL generate a visual correction overlay highlighting specific errors
8. THE Feedback_System SHALL provide textual guidance describing how to correct identified errors
9. THE Feedback_System SHALL categorize feedback as constructive, corrective, or encouraging based on performance level
10. WHEN shape_accuracy is below 50%, THE Feedback_System SHALL provide corrective feedback with specific improvement steps
11. WHEN shape_accuracy is between 50% and 85%, THE Feedback_System SHALL provide constructive feedback highlighting strengths and areas for improvement
12. WHEN shape_accuracy is above 85%, THE Feedback_System SHALL provide encouraging feedback and suggest advancing to the next stage

### Requirement 4: Spaced Repetition Review System

**User Story:** As a learner, I want characters automatically scheduled for review based on memory science, so that I retain what I have learned over time.

#### Acceptance Criteria

1. THE Spaced_Review_System SHALL schedule character reviews at intervals of 1, 3, 7, 14, and 30 days after initial mastery
2. WHEN a learner masters a character, THE Spaced_Review_System SHALL create the first review scheduled for 1 day later
3. WHEN a learner completes a review successfully (score ≥ 80%), THE Spaced_Review_System SHALL schedule the next review at the next interval
4. WHEN a learner fails a review (score < 80%), THE Spaced_Review_System SHALL reset the interval to 1 day
5. THE Spaced_Review_System SHALL display due reviews prominently in the learner dashboard
6. THE Spaced_Review_System SHALL send notifications when reviews are due
7. THE Spaced_Review_System SHALL track review completion rate per learner
8. THE Spaced_Review_System SHALL prioritize overdue reviews in the learning queue
9. THE Spaced_Review_System SHALL apply forgetting curve principles to adjust intervals based on individual learner performance patterns


### Requirement 5: Active Learning Interactions

**User Story:** As a learner, I want every lesson to require active participation, so that I engage deeply with the material rather than passively consuming content.

#### Acceptance Criteria

1. THE Learning_System SHALL require at least one interaction per lesson screen before allowing progression
2. THE Learning_System SHALL implement click-to-reveal interactions for character recognition exercises
3. THE Learning_System SHALL implement drag-and-drop interactions for character identification exercises
4. THE Learning_System SHALL implement canvas drawing interactions for writing exercises
5. THE Learning_System SHALL implement audio recording interactions for pronunciation exercises
6. THE Learning_System SHALL implement text input interactions for word formation exercises
7. THE Learning_System SHALL implement discussion posting interactions for cultural reflection exercises
8. WHEN a learner attempts to skip without interaction, THE Learning_System SHALL display a prompt requiring engagement
9. THE Learning_System SHALL track interaction completion for each lesson component
10. THE Learning_System SHALL validate interaction quality (not just presence) before marking as complete

### Requirement 6: Adaptive Learning Path Generation

**User Story:** As a learner, I want the system to personalize my learning path based on my performance, so that I focus on areas where I need the most improvement.

#### Acceptance Criteria

1. THE Adaptive_Engine SHALL track character-specific strengths for each learner
2. THE Adaptive_Engine SHALL track character-specific weaknesses for each learner
3. THE Adaptive_Engine SHALL identify confusing_characters that learners frequently mistake for each other
4. THE Adaptive_Engine SHALL identify writing_patterns (common stroke errors) for each learner
5. THE Adaptive_Engine SHALL calculate learning_speed based on time-to-mastery metrics
6. THE Adaptive_Engine SHALL generate personalized character recommendations prioritizing weak areas
7. WHEN a learner completes a character, THE Adaptive_Engine SHALL recommend the next character based on difficulty progression and identified weaknesses
8. THE Adaptive_Engine SHALL adjust lesson difficulty dynamically based on recent performance
9. THE Adaptive_Engine SHALL provide learners with a visual mastery map showing strengths and weaknesses
10. THE Adaptive_Engine SHALL generate weekly personalized practice recommendations


### Requirement 7: Cultural Didactics Integration

**User Story:** As a learner, I want every character connected to Rwandan cultural context, so that I learn both the alphabet and the cultural heritage it represents.

#### Acceptance Criteria

1. THE Learning_System SHALL associate at least one Rwandan proverb with each character
2. THE Learning_System SHALL associate at least one traditional story with each character
3. THE Learning_System SHALL associate historical events relevant to each character's symbolism
4. THE Learning_System SHALL associate traditional practices connected to each character
5. THE Learning_System SHALL associate Rwandan values embodied by each character
6. THE Learning_System SHALL present cultural context progressively throughout the eight learning stages
7. THE Learning_System SHALL require learners to engage with cultural content before completing the Cultural Application stage
8. THE Learning_System SHALL allow learners to contribute their own cultural meanings and stories (subject to moderation)
9. THE Learning_System SHALL display cultural context in multiple languages (English, Kinyarwanda, Umwero)
10. THE Learning_System SHALL track cultural content engagement metrics

### Requirement 8: Constructivist Learning Contributions

**User Story:** As a learner, I want to contribute my own examples and cultural meanings, so that I actively construct knowledge rather than passively receive it.

#### Acceptance Criteria

1. THE Learning_System SHALL allow learners to submit personal stories related to characters
2. THE Learning_System SHALL allow learners to submit example words using characters
3. THE Learning_System SHALL allow learners to submit cultural meanings they have discovered
4. THE Learning_System SHALL queue all learner submissions for moderation before publication
5. WHEN a submission is approved, THE Learning_System SHALL display it in the community cultural context section
6. WHEN a submission is rejected, THE Learning_System SHALL provide feedback explaining the reason
7. THE Learning_System SHALL attribute approved contributions to the submitting learner
8. THE Learning_System SHALL award XP for approved contributions
9. THE Learning_System SHALL allow other learners to upvote helpful contributions
10. THE Learning_System SHALL track contribution quality metrics per learner


### Requirement 9: Gamification System

**User Story:** As a learner, I want to earn XP, levels, and achievements, so that I stay motivated throughout my learning journey.

#### Acceptance Criteria

1. THE Gamification_System SHALL award XP for completing lessons
2. THE Gamification_System SHALL award XP for achieving mastery thresholds
3. THE Gamification_System SHALL award XP for maintaining daily streaks
4. THE Gamification_System SHALL award XP for completing reviews on time
5. THE Gamification_System SHALL award XP for contributing approved cultural content
6. THE Gamification_System SHALL calculate learner level based on total XP earned
7. THE Gamification_System SHALL unlock achievements for specific milestones (first character mastered, 7-day streak, all vowels mastered, etc.)
8. THE Gamification_System SHALL display achievement badges in learner profiles
9. THE Gamification_System SHALL maintain a daily streak counter that resets if a learner misses a day
10. THE Gamification_System SHALL provide visual rewards (animations, sounds) when learners earn achievements
11. THE Gamification_System SHALL display leaderboards showing top learners by XP, streak, and mastery count
12. THE Gamification_System SHALL allow learners to opt out of leaderboard participation while retaining personal gamification features

### Requirement 10: Learner Analytics Dashboard

**User Story:** As a learner, I want to see detailed analytics of my progress, so that I understand my strengths, weaknesses, and learning trajectory.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display a visual mastery map showing completion status for all characters
2. THE Analytics_Dashboard SHALL display a progress path showing the learner's journey through stages
3. THE Analytics_Dashboard SHALL highlight weak characters requiring additional practice
4. THE Analytics_Dashboard SHALL display the spaced review schedule with due dates
5. THE Analytics_Dashboard SHALL show time spent learning per character
6. THE Analytics_Dashboard SHALL show accuracy trends over time
7. THE Analytics_Dashboard SHALL show XP earned and current level
8. THE Analytics_Dashboard SHALL show achievement progress with locked and unlocked badges
9. THE Analytics_Dashboard SHALL show daily streak status
10. THE Analytics_Dashboard SHALL provide downloadable progress reports
11. THE Analytics_Dashboard SHALL update in real-time as learners complete activities


### Requirement 11: Administrator Analytics Dashboard

**User Story:** As an administrator, I want to see system-wide learning analytics, so that I can identify effective lessons, difficult characters, and areas for improvement.

#### Acceptance Criteria

1. THE Analytics_Dashboard SHALL display lesson effectiveness metrics (completion rate, average mastery score, time to completion)
2. THE Analytics_Dashboard SHALL display OCR accuracy metrics per character
3. THE Analytics_Dashboard SHALL identify dropout points where learners commonly stop progressing
4. THE Analytics_Dashboard SHALL identify difficult characters with low average mastery scores
5. THE Analytics_Dashboard SHALL display engagement metrics (daily active users, session duration, return rate)
6. THE Analytics_Dashboard SHALL display cultural content engagement metrics
7. THE Analytics_Dashboard SHALL display gamification effectiveness metrics (achievement unlock rate, streak retention)
8. THE Analytics_Dashboard SHALL allow filtering by date range, learner cohort, and character type
9. THE Analytics_Dashboard SHALL provide exportable reports in CSV and PDF formats
10. THE Analytics_Dashboard SHALL display dataset collection metrics (total handwriting samples, quality distribution, character coverage)

### Requirement 12: Enhanced OCR Educational Functions

**User Story:** As a learner, I want the OCR system to provide educational guidance beyond simple scoring, so that I understand how to improve my handwriting technique.

#### Acceptance Criteria

1. THE OCR_Engine SHALL implement a compare_to_reference function that overlays the learner's writing with the correct reference
2. THE OCR_Engine SHALL implement a generate_feedback function that produces specific, actionable improvement suggestions
3. THE OCR_Engine SHALL implement an estimate_mastery function that predicts overall character mastery from a single attempt
4. THE OCR_Engine SHALL implement a detect_repeated_mistakes function that identifies persistent errors across multiple attempts
5. THE OCR_Engine SHALL implement a recommend_practice function that suggests targeted exercises based on identified weaknesses
6. WHEN stroke_order is incorrect, THE OCR_Engine SHALL generate feedback specifying which strokes are out of sequence
7. WHEN stroke_direction is incorrect, THE OCR_Engine SHALL generate feedback indicating the correct direction with visual arrows
8. WHEN size_balance is poor, THE OCR_Engine SHALL generate feedback showing ideal proportions
9. THE OCR_Engine SHALL store all evaluation metadata for learning analytics
10. THE OCR_Engine SHALL maintain evaluation latency below 500 milliseconds


### Requirement 13: AI Dataset Collection Pipeline

**User Story:** As a system administrator, I want to collect high-quality handwriting data for future AI training, so that we can build better OCR models for Umwero script.

#### Acceptance Criteria

1. THE Dataset_Pipeline SHALL store writing_image for every handwriting attempt
2. THE Dataset_Pipeline SHALL store correct_character label for each attempt
3. THE Dataset_Pipeline SHALL store user_age_group (anonymized demographic data)
4. THE Dataset_Pipeline SHALL store difficulty_level of the exercise
5. THE Dataset_Pipeline SHALL store ocr_score from the evaluation
6. THE Dataset_Pipeline SHALL store mistake_type classification (stroke order, direction, shape, spacing)
7. THE Dataset_Pipeline SHALL store correction_history showing how learners improved over time
8. THE Dataset_Pipeline SHALL apply quality filtering to include only attempts with OCR score ≥ 50
9. THE Dataset_Pipeline SHALL split collected data into training (70%), validation (15%), and test (15%) sets
10. THE Dataset_Pipeline SHALL export datasets in JSON, CSV, TensorFlow TFRecord, and PyTorch formats
11. THE Dataset_Pipeline SHALL anonymize all personally identifiable information before export
12. THE Dataset_Pipeline SHALL track dataset collection metrics (total samples, character coverage, quality distribution)

### Requirement 14: Learning Journey UI Transformation

**User Story:** As a learner, I want lessons presented as engaging learning journeys, so that I experience a cohesive progression from introduction to mastery.

#### Acceptance Criteria

1. THE Learning_System SHALL structure each character lesson as a journey with phases: Introduction → Observe → Recognize → Trace → Practice → Master → Apply → Reflect → Review
2. THE Learning_System SHALL display visual progress indicators showing the current phase within the journey
3. THE Learning_System SHALL use animations and transitions between journey phases
4. THE Learning_System SHALL provide contextual help at each journey phase
5. THE Learning_System SHALL allow learners to pause and resume journeys across sessions
6. THE Learning_System SHALL celebrate milestone completions with visual rewards
7. THE Learning_System SHALL display estimated time remaining for each journey phase
8. THE Learning_System SHALL adapt journey pacing based on learner performance
9. THE Learning_System SHALL provide a journey map showing all phases and completion status
10. THE Learning_System SHALL maintain consistent visual design language across all journey phases


### Requirement 15: Database Schema Evolution

**User Story:** As a system architect, I want the database schema to support all adaptive didactic features, so that the system can track comprehensive learning data.

#### Acceptance Criteria

1. THE Learning_System SHALL extend the User model to include learning_speed, preferred_difficulty, and total_xp fields
2. THE Learning_System SHALL extend the Character model to include difficulty_rating and prerequisite_characters fields
3. THE Learning_System SHALL extend the LessonProgress model to include current_stage, stage_completion_data, and time_spent_per_stage fields
4. THE Learning_System SHALL create a LearningStage model tracking stage_name, mastery_threshold, and interaction_requirements
5. THE Learning_System SHALL create a SpacedReview model tracking character_id, learner_id, scheduled_date, completion_status, and review_score
6. THE Learning_System SHALL create a LearnerAnalytics model tracking strengths, weaknesses, confusing_characters, writing_patterns, and learning_trajectory
7. THE Learning_System SHALL create a GamificationProgress model tracking xp, level, achievements_unlocked, daily_streak, and last_activity_date
8. THE Learning_System SHALL create a CulturalContribution model tracking learner_id, character_id, contribution_type, content, moderation_status, and approval_date
9. THE Learning_System SHALL add database indexes on frequently queried fields (learner_id, character_id, scheduled_date, completion_status)
10. THE Learning_System SHALL implement database migrations to evolve the schema without data loss

### Requirement 16: Performance Optimization for Adaptive Features

**User Story:** As a learner, I want the adaptive learning system to respond quickly, so that my learning experience is smooth and uninterrupted.

#### Acceptance Criteria

1. THE Learning_System SHALL load the learner dashboard in under 2 seconds
2. THE Learning_System SHALL calculate adaptive recommendations in under 500 milliseconds
3. THE Learning_System SHALL update mastery scores in real-time (under 200 milliseconds)
4. THE Learning_System SHALL cache frequently accessed data (character references, cultural content)
5. THE Learning_System SHALL use database connection pooling to handle concurrent learners
6. THE Learning_System SHALL implement lazy loading for analytics visualizations
7. THE Learning_System SHALL use server-side rendering for initial page loads
8. THE Learning_System SHALL implement optimistic UI updates for learner interactions
9. THE Learning_System SHALL batch database writes for non-critical updates
10. THE Learning_System SHALL monitor and log performance metrics for all critical operations


### Requirement 17: Mobile-Responsive Adaptive Learning Interface

**User Story:** As a learner using a mobile device, I want all adaptive learning features to work seamlessly on my phone or tablet, so that I can learn anywhere.

#### Acceptance Criteria

1. THE Learning_System SHALL render all learning journey phases responsively on screens from 320px to 2560px width
2. THE Learning_System SHALL optimize canvas drawing for touch input on mobile devices
3. THE Learning_System SHALL display analytics dashboards in mobile-friendly layouts
4. THE Learning_System SHALL use touch-friendly interaction targets (minimum 44px)
5. THE Learning_System SHALL optimize image loading for mobile bandwidth constraints
6. THE Learning_System SHALL support both portrait and landscape orientations
7. THE Learning_System SHALL provide mobile-optimized navigation for learning journeys
8. THE Learning_System SHALL cache learning content for offline access where possible
9. THE Learning_System SHALL test all features on iOS Safari, Android Chrome, and mobile Firefox
10. THE Learning_System SHALL maintain 60fps performance for animations on mobile devices

### Requirement 18: Accessibility Compliance

**User Story:** As a learner with accessibility needs, I want the learning system to support assistive technologies, so that I can participate fully in the learning experience.

#### Acceptance Criteria

1. THE Learning_System SHALL provide keyboard navigation for all interactive elements
2. THE Learning_System SHALL include ARIA labels for screen reader compatibility
3. THE Learning_System SHALL maintain color contrast ratios of at least 4.5:1 for text
4. THE Learning_System SHALL provide text alternatives for all visual content
5. THE Learning_System SHALL support screen reader announcements for dynamic content updates
6. THE Learning_System SHALL allow font size adjustment without breaking layouts
7. THE Learning_System SHALL provide captions for all audio content
8. THE Learning_System SHALL support reduced motion preferences for animations
9. THE Learning_System SHALL ensure focus indicators are clearly visible
10. THE Learning_System SHALL test with NVDA, JAWS, and VoiceOver screen readers


### Requirement 19: Security and Privacy for Learning Data

**User Story:** As a learner, I want my learning data and handwriting samples to be stored securely and privately, so that my personal information is protected.

#### Acceptance Criteria

1. THE Learning_System SHALL encrypt all handwriting images at rest using AES-256
2. THE Learning_System SHALL encrypt all personal learning data in transit using TLS 1.3
3. THE Learning_System SHALL anonymize learner data before including it in exported datasets
4. THE Learning_System SHALL implement role-based access control for analytics dashboards
5. THE Learning_System SHALL require authentication for all OCR evaluation endpoints
6. THE Learning_System SHALL implement rate limiting on evaluation endpoints to prevent abuse
7. THE Learning_System SHALL log all access to learner data for audit purposes
8. THE Learning_System SHALL allow learners to download their complete learning data
9. THE Learning_System SHALL allow learners to request deletion of their learning data
10. THE Learning_System SHALL comply with GDPR and data protection regulations

### Requirement 20: Integration with Existing Uruziga Infrastructure

**User Story:** As a system architect, I want the adaptive learning system to integrate seamlessly with existing Uruziga components, so that we preserve working functionality while adding new features.

#### Acceptance Criteria

1. THE Learning_System SHALL maintain compatibility with the existing Prisma database schema
2. THE Learning_System SHALL integrate with the existing NextAuth.js authentication system
3. THE Learning_System SHALL utilize the existing Python OCR service infrastructure
4. THE Learning_System SHALL preserve the existing Umwero font rendering and ligature system
5. THE Learning_System SHALL maintain the existing community discussion features
6. THE Learning_System SHALL integrate with the existing Supabase storage for handwriting images
7. THE Learning_System SHALL preserve the existing Latin-to-Umwero translation functionality
8. THE Learning_System SHALL maintain the existing lesson content structure while adding adaptive features
9. THE Learning_System SHALL use the existing Next.js App Router architecture
10. THE Learning_System SHALL preserve all existing API routes while adding new adaptive endpoints
11. THE Learning_System SHALL maintain backward compatibility with existing user progress data
12. THE Learning_System SHALL provide migration scripts to transform existing data to the new adaptive schema
