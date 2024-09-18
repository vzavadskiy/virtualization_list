import {useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState} from "react";

const items = Array.from({length: 10_000}, (_, index) => ({
    id: Math.random().toString(36).slice(2),
    text: String(index),
}));

interface UseFixedSizeListProps {
    itemsCount: number;
    itemHeight: number;
    listHeight: number;
    overscan?: number;
    scrollingDelay?: number;
    getScrollElement: () => HTMLElement | null;
}

const DEFAULT_OVERSCAN = 3;
const DEFAULT_SCROLLING_DELAY = 150;

const itemHeight = 40;
const containerHeight = 600;

export const useFixedSizeList = (props: UseFixedSizeListProps) => {
    const {
        itemsCount,
        itemHeight,
        listHeight,
        overscan= DEFAULT_OVERSCAN,
        scrollingDelay = DEFAULT_SCROLLING_DELAY,
        getScrollElement
    } = props;

    const [scrollTop, setScrollTop] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);

    useLayoutEffect(() => {
        const scrollElement = getScrollElement();

        if (!scrollElement) {
            return;
        }

        const handleScroll = () => {
            const scrollTop = scrollElement.scrollTop;

            setScrollTop(scrollTop);
        };

        handleScroll()

        scrollElement.addEventListener('scroll', handleScroll);

        return () => {
            scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [getScrollElement]);

    useEffect(() => {
        const scrollElement = getScrollElement();

        if (!scrollElement) {
            return;
        }

        let timeoutId: number | null = null;
        const handleScroll = () => {

            setIsScrolling(true);

            if (typeof timeoutId === 'number') {
                clearTimeout(timeoutId)
            }


            timeoutId = setTimeout(() => {
                setIsScrolling(false);
            }, scrollingDelay)
        };


        scrollElement.addEventListener('scroll', handleScroll);

        return () => {
            scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [getScrollElement]);

    const {virtualItems, startIndex, endIndex} = useMemo(() => {
        const startRange = scrollTop;
        const endRange = startRange + containerHeight;

        let startIndex = Math.floor(startRange / itemHeight);
        let endIndex = Math.ceil(endRange / itemHeight);

        startIndex = Math.max(0, startIndex - overscan);
        endIndex = Math.min(endIndex + overscan, itemsCount - 1);

        const virtualItems = [];

        for (let index = startIndex; index <= endIndex; index++) {
            virtualItems.push({
                index,
                offsetTop: index * itemHeight,
            });
        }

        return {
            startIndex,
            endIndex,
            virtualItems
        }
    }, [scrollTop, listHeight, itemsCount]);


    const totalListHeight = itemsCount * itemHeight;

    return {
        virtualItems,
        startIndex,
        endIndex,
        totalListHeight,
        isScrolling
    }
}

export const FixedSizeList = () => {
    const [listItems, setListItems] = useState(items);
    const scrollElementRef = useRef<HTMLDivElement>(null);

    const {virtualItems, isScrolling, totalListHeight} = useFixedSizeList({
        itemHeight: itemHeight,
        itemsCount: listItems.length,
        listHeight: containerHeight,
        getScrollElement: useCallback(() => scrollElementRef.current, []),
    })

    return (
        <div style={{padding: '0 12px'}}>
            <h1>List</h1>
            <div style={{marginBottom: 12}}>
                <button
                    onClick={() => setListItems(items => items.slice().reverse())}
                >
                    Reverse
                </button>
            </div>
            <div
                ref={scrollElementRef}
                style={{
                    position: 'relative',
                    height: containerHeight,
                    overflow: 'auto',
                    border: '1px solid black',
                }}
            >
                <div style={{height: totalListHeight}}>
                    {
                        virtualItems.map((virtualItem) => {
                            const item = listItems[virtualItem.index];
                            return (
                                <div
                                    key={item.id}
                                    style={{
                                        position: 'absolute',
                                        top: 0,
                                        height: itemHeight,
                                        padding: '6px 12px',
                                        transform: `translateY(${virtualItem.offsetTop}px)`,
                                    }}
                                >
                                    {isScrolling ? 'Scrolling...' :item.text}
                                </div>
                            )
                        })
                    }
                </div>

            </div>
        </div>
    )
}

