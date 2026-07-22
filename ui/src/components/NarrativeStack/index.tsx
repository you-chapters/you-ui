import { useState, useEffect, useCallback } from 'react';
import { getNarrative } from '../../api/narrative';
import type { NarrativeSummary } from '../../types/narrative';
import NarrativeCard from '../NarrativeCard';
import './NarrativeStack.css';

const TITLES: Record<'week' | 'month', [string, string]> = {
  week: ['This week', 'Last week'],
  month: ['This month', 'Last month'],
};

interface Props {
  type: 'week' | 'month';
  currentKey: string;
  previousKey: string;
}

export default function NarrativeStack({ type, currentKey, previousKey }: Props) {
  const [activeIndex, setActiveIndex] = useState<0 | 1>(0);
  const [fading, setFading] = useState(false);

  const [current, setCurrent] = useState<NarrativeSummary | null>(null);
  const [currentLoading, setCurrentLoading] = useState(true);
  const [currentRefreshing, setCurrentRefreshing] = useState(false);

  const [previous, setPrevious] = useState<NarrativeSummary | null>(null);
  const [previousLoading, setPreviousLoading] = useState(false);
  const [previousLoaded, setPreviousLoaded] = useState(false);

  useEffect(() => {
    getNarrative(type, currentKey)
      .then(setCurrent)
      .catch(() => {})
      .finally(() => setCurrentLoading(false));
  }, [type, currentKey]);

  const handleRefresh = useCallback(() => {
    setCurrentRefreshing(true);
    getNarrative(type, currentKey, true)
      .then(setCurrent)
      .finally(() => setCurrentRefreshing(false));
  }, [type, currentKey]);

  const loadPrevious = useCallback(() => {
    if (previousLoaded) return;
    setPreviousLoaded(true);
    setPreviousLoading(true);
    getNarrative(type, previousKey)
      .then(setPrevious)
      .catch(() => {})
      .finally(() => setPreviousLoading(false));
  }, [type, previousKey, previousLoaded]);

  const navigate = useCallback((index: 0 | 1) => {
    setFading(true);
    setTimeout(() => {
      setActiveIndex(index);
      if (index === 1) loadPrevious();
      setFading(false);
    }, 120);
  }, [loadPrevious]);

  const isCurrent = activeIndex === 0;
  const [currentTitle, previousTitle] = TITLES[type];

  return (
    <div className={`narrative-stack${fading ? ' narrative-stack--fading' : ''}`}>
      <div className="narrative-stack__front">
        <NarrativeCard
          title={isCurrent ? currentTitle : previousTitle}
          narrative={isCurrent ? current : previous}
          loading={isCurrent ? currentLoading : previousLoading}
          refreshing={isCurrent ? currentRefreshing : false}
          showRefresh={false}
          onRefresh={handleRefresh}
          onBack={!isCurrent ? () => navigate(0) : undefined}
          onForward={isCurrent ? () => navigate(1) : undefined}
        />
      </div>
      {isCurrent && <div className="narrative-stack__peek" />}
    </div>
  );
}