import { AggregatedScore, AllAggregatedScores, RelativeProbabilities } from '../types';

export const createRelativeProbabilities = (
    aggregatedScores: AllAggregatedScores,
    probabilityGetter: (aggregatedScore: AggregatedScore) => number
): RelativeProbabilities => {
    return Object.values(aggregatedScores).reduce<RelativeProbabilities>((reduced, next) => {
        return {
            ...reduced,
            [next.key]: probabilityGetter(next)
        };
    }, {});
};

export const getScoreRelativeProbabilities = (
    relativeProbabilities: RelativeProbabilities,
    score: number | AggregatedScore
) => {
    return relativeProbabilities[typeof score === 'number' ? String(score) : score.key];
};

export const mergeRelativeProbabilities = (
    a: RelativeProbabilities,
    b: RelativeProbabilities
): RelativeProbabilities => {
    return Object.keys(a).reduce<RelativeProbabilities>((reduced, nextKey) => {
        return {
            ...reduced,
            [nextKey]: a[nextKey] + b[nextKey]
        };
    }, {});
};

export const weightRelativeProbabilities = (
    relativeProbabilities: RelativeProbabilities,
    weight: number
): RelativeProbabilities => {
    return Object.keys(relativeProbabilities).reduce<RelativeProbabilities>((reduced, nextKey) => {
        return {
            ...reduced,
            [nextKey]: relativeProbabilities[nextKey] * weight
        };
    }, {});
};
