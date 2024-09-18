import {useCallback, useRef, useState} from "react";
import {useFixedSizeList} from "./useFixedSizeList.tsx";

const items = Array.from({length: 10_000}, (_, index) => ({
    id: Math.random().toString(36).slice(2),
    text: String(index),
}));

const itemHeight = 40;
const containerHeight = 600;

export const App = () => {
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

