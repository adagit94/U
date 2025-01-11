export const changeIndex = <T>(items: T[], currentIndex: number, newIndex: number) => {
    items = [...items]

    const item = items[currentIndex]

    items.splice(currentIndex, 1)
    items.splice(newIndex > currentIndex ? newIndex - 1 : newIndex, 0, item)

    return items
}

export const addAtIndex = <T>(items: T[], item: T, index: number) => {
    items = [...items]

    items.splice(index, 0, item)

    return items
}

export const replaceAtIndex = <T>(items: T[], item: T, index: number) => {
    items = [...items]

    items.splice(index, 1, item)

    return items
}