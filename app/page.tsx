'use client';

import AuthWrapper from '../components/AuthWrapper';
import WorkoutTracker from '../components/workout/WorkoutTracker';

export default function Home() {
  return (
    <AuthWrapper>
      {(user) => <WorkoutTracker user={user} />}
    </AuthWrapper>
  );
}