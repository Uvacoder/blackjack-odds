import React, { useMemo, useState } from 'react';
import { CellProps, Column } from 'react-table';
import { getRootHands } from '../logic/all-hands';
import { getHandProbabilities } from '../logic/all-hands-probabilities';
import { dealerStandingScore, maximumScore } from '../logic/constants';
import { getHandScores, getHandSymbols } from '../logic/hand';
import {
    getEqualToScoreProbability,
    getHigherThanScoreProbability,
    getLowerThanScoreProbability
} from '../logic/hand-probabilities';
import { isBustScore } from '../logic/utils';
import { AllHands, AllHandsProbabilities, ExpandedRows, Hand, OutcomesSet } from '../types';
import { CustomTable } from './custom-table';
import { RoundedFloat } from './rounded-float';

interface HandsTableProps {
    allHands: AllHands;
    decimals: number;
    longRunPlayerProbabilities: AllHandsProbabilities;
    nextCardProbabilities: AllHandsProbabilities;
    outcomesSet: OutcomesSet;
}

const getHandRows = (hand: Hand, expandedRows: ExpandedRows): Hand[] => {
    const handRows = [hand];
    const handSymbols = getHandSymbols(hand);

    if (expandedRows[handSymbols]) {
        hand.followingHands.forEach((followingHand) => {
            handRows.push(...getHandRows(followingHand, expandedRows));
        });
    }

    return handRows;
};

export const HandsTable = (props: HandsTableProps) => {
    const [expandedRows, setExpandedRows] = useState<ExpandedRows>({});

    const { columns, data } = useMemo((): { columns: Column<Hand>[]; data: Hand[] } => {
        const columns: Column<Hand>[] = [
            {
                accessor: 'followingHands',
                Cell: (cellProps: CellProps<Hand, Hand['followingHands']>) => {
                    const cardSymbols = getHandSymbols(cellProps.row.original);
                    const symbolsNumber = cellProps.row.original.cardSymbols.length;
                    const hasChildRows =
                        cellProps.value.length > 0 && cellProps.row.original.score < maximumScore;

                    return (
                        <span
                            onClick={
                                hasChildRows
                                    ? () => {
                                          setExpandedRows({
                                              ...expandedRows,
                                              [cardSymbols]: !expandedRows[cardSymbols]
                                          });
                                      }
                                    : undefined
                            }
                            style={{
                                cursor: 'pointer',
                                paddingLeft: `${(symbolsNumber - 1) * 24}px`
                            }}
                        >
                            {hasChildRows ? (expandedRows[cardSymbols] ? '????' : '????') : '-'}
                        </span>
                    );
                },
                id: 'expander'
            },
            {
                Cell: (cellProps: CellProps<Hand>) => (
                    <span>{getHandSymbols(cellProps.row.original)}</span>
                ),
                Header: 'Cards',
                id: 'cards'
            },
            {
                Cell: (cellProps: CellProps<Hand>) => {
                    return (
                        <span
                            style={{
                                color: isBustScore(cellProps.row.original.score) ? 'red' : 'black',
                                fontWeight: 'bold'
                            }}
                        >
                            {getHandScores(cellProps.row.original)}
                        </span>
                    );
                },
                Header: 'Score',
                id: 'score'
            },
            {
                accessor: 'lastCard',
                Cell: (cellProps: CellProps<Hand, Hand['lastCard']>) => (
                    <RoundedFloat
                        decimals={props.decimals}
                        value={cellProps.value.weight / props.outcomesSet.totalWeight}
                        isPercentage={true}
                    />
                ),
                Header: 'Probability',
                id: 'probability'
            },
            {
                columns: [
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.nextCardProbabilities
                            );
                            return isBustScore(cellProps.row.original.score) ? (
                                '-'
                            ) : (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={getLowerThanScoreProbability(
                                        handProbabilities,
                                        dealerStandingScore
                                    )}
                                />
                            );
                        },
                        Header: `<${dealerStandingScore}`,
                        id: 'next-card-lower'
                    },
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.nextCardProbabilities
                            );
                            return isBustScore(cellProps.row.original.score) ? (
                                '-'
                            ) : (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={
                                        getEqualToScoreProbability(
                                            handProbabilities,
                                            dealerStandingScore
                                        ) +
                                        getHigherThanScoreProbability(
                                            handProbabilities,
                                            dealerStandingScore
                                        )
                                    }
                                />
                            );
                        },
                        Header: `>=${dealerStandingScore}`,
                        id: 'next-card-equal-or-higher'
                    },
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.nextCardProbabilities
                            );
                            return isBustScore(cellProps.row.original.score) ? (
                                '-'
                            ) : (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={handProbabilities.overMaximum}
                                />
                            );
                        },
                        Header: `>${maximumScore}`,
                        id: 'next-card-over-maximum'
                    }
                ],
                Header: 'Next card',
                id: 'next-card-probabilities'
            },
            {
                columns: [
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.longRunPlayerProbabilities
                            );
                            return isBustScore(cellProps.row.original.score) ? (
                                '-'
                            ) : (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={getLowerThanScoreProbability(
                                        handProbabilities,
                                        dealerStandingScore
                                    )}
                                />
                            );
                        },
                        Header: `<${dealerStandingScore}`,
                        id: 'long-run-lower'
                    },
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.longRunPlayerProbabilities
                            );
                            return isBustScore(cellProps.row.original.score) ? (
                                '-'
                            ) : (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={
                                        getEqualToScoreProbability(
                                            handProbabilities,
                                            dealerStandingScore
                                        ) +
                                        getHigherThanScoreProbability(
                                            handProbabilities,
                                            dealerStandingScore
                                        )
                                    }
                                />
                            );
                        },
                        Header: `>=${dealerStandingScore}`,
                        id: 'long-run-equal-or-higher'
                    },
                    {
                        Cell: (cellProps: CellProps<Hand>) => {
                            const handProbabilities = getHandProbabilities(
                                cellProps.row.original,
                                props.longRunPlayerProbabilities
                            );
                            return isBustScore(cellProps.row.original.score) ? (
                                '-'
                            ) : (
                                <RoundedFloat
                                    decimals={props.decimals}
                                    value={handProbabilities.overMaximum}
                                />
                            );
                        },
                        Header: `>${maximumScore}`,
                        id: 'long-run-over-maximum'
                    }
                ],
                Header: 'Long run',
                id: 'long-run-probabilities'
            }
        ];

        const data = getRootHands(props.allHands, props.outcomesSet.allOutcomes)
            .map((hand) => getHandRows(hand, expandedRows))
            .reduce((reduced, row) => reduced.concat(row), []);

        return { columns, data };
    }, [
        expandedRows,
        props.allHands,
        props.longRunPlayerProbabilities,
        props.nextCardProbabilities,
        props.outcomesSet
    ]);

    return (
        <CustomTable
            columns={columns}
            columnStyle={(cell) =>
                cell.column.id === 'expander' ? { textAlign: 'left' } : undefined
            }
            data={data}
        />
    );
};
