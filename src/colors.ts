const AUTO_COLOR_ATTEMPTS_LIMIT = 100

export type RgbColor = [number, number, number]

export const autoGenerateColorComponent = () => Math.round(255 * Math.random())

/**
 * @description Function generates new color automatically based upon pseudo-randomization and divergence of any constituent color component (that is r, g or b) for all used colors. Such color is then considered sufficiently different.
 * @param usedColors An array of used colors for which new color must sufficiently differ for at least one color component (based on divergence value).
 * @param divergence Divergence defines acceptable ranges for color components that constitutes color itself. For example value 20 for color component with value of 100 will result in following acceptable ranges: bottom range would be 0 - 79 and upper range would be 121 - 255. Inside of these ranges color component is considered sufficiently different (to divert) from original color component. Min./max. values for color component are 0 and 255 respectively. Values outside of this range (0 - 255) are clamped.
 * @returns New color generated or black color ([0, 0, 0]) if attempts to generate new color based on divergence from used colors failed.
 */
export const autoGenerateColor = (usedColors: RgbColor[], divergence: number): RgbColor => {
    for (let i = 0; i < AUTO_COLOR_ATTEMPTS_LIMIT; i++) {
        for (let j = 0; j < 3; j++) {
            const newColorComponent = autoGenerateColorComponent()
            const colorComponentWithoutOverlap = usedColors.every((usedColor) => {
                const usedColorComponent = usedColor[j]
                const usedColorRanges = [
                    [0, Math.max(Math.round(usedColorComponent - divergence), 0)],
                    [Math.min(Math.round(usedColorComponent + divergence), 255), 255],
                ]

                if (
                    newColorComponent >= usedColorRanges[0][0] &&
                    newColorComponent < usedColorRanges[0][1]
                ) {
                    return true
                }

                if (
                    newColorComponent > usedColorRanges[1][0] &&
                    newColorComponent <= usedColorRanges[1][1]
                ) {
                    return true
                }

                return false
            })

            if (colorComponentWithoutOverlap) {
                let newColor: RgbColor = [
                    autoGenerateColorComponent(),
                    autoGenerateColorComponent(),
                    autoGenerateColorComponent(),
                ]

                newColor[j] = newColorComponent

                return newColor
            }
        }
    }

    return [0, 0, 0]
}

export const autoGenerateColors = (colorsCount: number, divergence: number): RgbColor[] => {
    let colors: RgbColor[] = []

    for (let i = 0; i < colorsCount; i++) {
        colors.push(autoGenerateColor(colors, divergence))
    }

    return colors
}
