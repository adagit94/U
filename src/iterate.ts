/**
 * @description Calls given function for every iteration of predefined range.
 * @param to    Last iteration index (exclusive).
 * @param f     Function to trigger for every iteration. In case of returned true value, loop gets terminated.
 * @param from  Optional initial index from which loop will start. Defaults to 0.
 */

export const range = (to: number, f: (index: number) => boolean | void, from = 0): void => {
    for (let i = from; i < to; i++) {
        const terminate = f(i)

        if (terminate) break
    }
};
