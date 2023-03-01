import React, {memo, ReactNode, useEffect, useState} from 'react';
import {DragDropContext, Droppable, Draggable} from 'react-beautiful-dnd';
import type {
    DraggableProvided,
    DraggableStateSnapshot,
    DroppableProvided,
    DropResult
} from 'react-beautiful-dnd';

interface Props {
    handleChange: Function;
    items: {
        id: string;
        content: ReactNode;
        move?: ReactNode;
        remove: ReactNode;
    }[];
}

const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result as Props['items'];
};

const OrderList: React.FC<Props> = ({handleChange, items = []}: Props) => {
    const [orderItems, setOrderItems] = useState(items);

    const onDragEnd = (result: DropResult) => {
        if (!result.destination) {
            return;
        }

        if (result.destination.index === result.source.index) {
            return;
        }

        const updatedOrderItems = reorder(
            orderItems,
            result.source.index,
            result.destination.index
        );

        setOrderItems(updatedOrderItems);
    };

    useEffect(() => {
        handleChange(orderItems.map(item => item.id));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [orderItems]);

    // Accept new incoming items into the list
    useEffect(() => {
        if (items.length !== orderItems.length) {
            setOrderItems(items);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
                {(provided: DroppableProvided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
                        {orderItems.map((item, index) => (
                            <Draggable
                                key={item.id}
                                draggableId={item.id}
                                index={index}
                                disableInteractiveElementBlocking={false}
                            >
                                {(
                                    provided: DraggableProvided,
                                    draggableSnapshot: DraggableStateSnapshot
                                ) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        className="group mb-1 flex items-center space-x-2 outline-none"
                                    >
                                        {item.content}

                                        <div
                                            {...provided.dragHandleProps}
                                            className={item.move ? '' : 'hidden'}
                                        >
                                            {item.move || null}
                                        </div>
                                        {item.remove}
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
};

export default OrderList;
