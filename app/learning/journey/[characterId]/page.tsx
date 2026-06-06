import { LearningJourneyPage } from '@/components/learning-journey/LearningJourneyPage';

interface CharacterJourneyRouteProps {
  params: Promise<{
    characterId: string;
  }>;
}

export default async function CharacterJourneyRoute({ params }: CharacterJourneyRouteProps) {
  const { characterId } = await params;

  return <LearningJourneyPage characterId={characterId} />;
}
