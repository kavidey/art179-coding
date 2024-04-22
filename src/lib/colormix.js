const k = 2;
/**
 * @param {number} z
 */
function sigmoid(z) {
    return 1 / (1 + Math.exp(-z / k));
}

/**
 * @param {{ x: number; y: number; }} a
 * @param {{ x: number; y: number; }} b
 * @param {{ x: number; y: number; }} c
 */
function getProjectionDistance(a, b, c) {
    const k2 = b.x * b.x - b.x * a.x + b.y * b.y - b.y * a.y;
    const k1 = a.x * a.x - b.x * a.x + a.y * a.y - b.y * a.y;
    const ab2 = (a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y);
    const kcom = (c.x * (a.x - b.x) + c.y * (a.y - b.y));
    const d1 = ((k1 - kcom) / ab2);
    const d2 = ((k2 + kcom) / ab2);
    const exponent = 1;
    const d1_mod = Math.sign(d1) * Math.abs(d1) ** exponent;
    const d2_mod = Math.sign(d2) * Math.abs(d2) ** exponent;
    return { d1: d1_mod, d2: d2_mod };
    return { d1, d2}
    // const d1 = Math.sqrt((a.x - c.x) ** 2 + (a.y - c.y) ** 2)/100;
    // const d2 = Math.sqrt((b.x - c.x) ** 2 + (b.y - c.y) ** 2)/100;
    // // console.log(d1, d2)
    // // console.log(sigmoid(d1*10), sigmoid(d2*10))
    // return {d2: d1*d2};
}

/**
 * @param {number} value
 */
function limit01(value) {
    if (value < 0) {
        return 0;
    }
    if (value > 1) {
        return 1;
    }
    return value;
}


/**
 * @param {any[]} points
 * @param {any[]} ratios
 */
function getWeightedColorMix(points, ratios) {
    let l = 0;
    let a = 0;
    let b = 0;

    points.forEach((point, ind) => {
        l += point.c.l * ratios[ind];
        a += point.c.a * ratios[ind];
        b += point.c.b * ratios[ind];
    })

    return { mode: "oklab", l: l, a: a, b: b };
}

/**
 * Given some points with color attached, calculate the color for a new point
 * @param {{ x: number; y: number; }} p The new point position {x: number, y: number}
 * @param {any[]} points The array of given colored points [{x: nember, y: number, c: hexColor}]
 * @return hex color string -- The weighted color mix
 */
export function getGeometricColorMix(p, points) {
    let colorRatios = new Array(points.length);
    colorRatios.fill(1);

    points.forEach((point1, ind1) => {
        points.forEach((point2, ind2) => {
            if (ind1 != ind2) {
                let d = getProjectionDistance(point1, point2, p);
                colorRatios[ind1] *= limit01(d.d2);
            }
        })
    })

    let totalRatiosSum = 0;
    colorRatios.forEach(c => totalRatiosSum += c);
    colorRatios.forEach((c, i) => colorRatios[i] /= totalRatiosSum);

    let c = getWeightedColorMix(points, colorRatios);
    return c;
}