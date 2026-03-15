import useAppStore from '../store/appStore';
import { getSubjectSectionCount } from '../utils/curriculum';

export function useProgress() {
  const markSectionComplete = useAppStore((state) => state.markSectionComplete);
  const isComplete = useAppStore((state) => state.isComplete);
  const getSubjectProgress = useAppStore((state) => state.getSubjectProgress);
  const completedSections = useAppStore((state) => state.completedSections);

  function getProgress(subjectId) {
    const total = getSubjectSectionCount(subjectId);
    return getSubjectProgress(subjectId, total);
  }

  return {
    markSectionComplete,
    isComplete,
    getProgress,
    completedSections,
  };
}

export default useProgress;
