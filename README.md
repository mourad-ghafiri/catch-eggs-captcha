# Catch Eggs CAPTCHA

A fun and engaging CAPTCHA system where users need to catch eggs of a specific color while avoiding others. The game features a chicken that moves horizontally and drops eggs with random motion and colors, making it challenging for bots while remaining accessible to humans.

## Demo
https://mourad-ghafiri.github.io/catch-eggs-captcha/

## Features

- Interactive gameplay with mouse control
- Random target color selection for each session
- Dynamic egg movement with realistic physics
- Multiple layers of noise and color variations to prevent bot detection
- Configurable difficulty and density settings
- Responsive design that works on all screen sizes
- No external dependencies

## Usage

```javascript

const captcha = new CatchEggsCaptcha({
    canvasId: 'catch-eggs-canvas',
    requiredCatches: 3,
    duration: 30000,
    width: 400,
    height: 400,
    chickenSpeed: 1,
    eggSpeed: 0.7,
    noiseLevel: 0.15,
    targetEggChance: 0.4,
    colorVariation: 0.2,
    patternNoise: 0.1,
    maxEggs: 15,
    spawnRate: 0.05,
    minEggs: 5
});

captcha.init();

captcha.start((success) => {
    if (success) {
        console.log('CAPTCHA passed!');
    } else {
        console.log('CAPTCHA failed!');
    }
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `canvasId` | string | - | ID of the canvas element |
| `requiredCatches` | number | 3 | Number of target eggs to catch |
| `duration` | number | 30000 | Game duration in milliseconds |
| `width` | number | 400 | Canvas width |
| `height` | number | 400 | Canvas height |
| `chickenSpeed` | number | 1 | Speed of chicken movement |
| `eggSpeed` | number | 0.7 | Base speed of falling eggs |
| `noiseLevel` | number | 0.15 | Level of noise in egg colors |
| `targetEggChance` | number | 0.4 | Probability of spawning target eggs |
| `colorVariation` | number | 0.2 | Amount of color variation in eggs |
| `patternNoise` | number | 0.1 | Level of pattern noise in eggs |
| `maxEggs` | number | 15 | Maximum number of eggs on screen |
| `spawnRate` | number | 0.05 | Base probability of spawning new eggs |
| `minEggs` | number | 5 | Minimum number of eggs to maintain |

## Density Control

The library provides three main parameters to control the density and flow of eggs:

1. `maxEggs`: Controls the maximum number of eggs allowed on screen at once
   - Higher values create a more chaotic, challenging experience
   - Lower values make the game more manageable
   - Recommended range: 5-30

2. `spawnRate`: Controls how frequently new eggs appear
   - Higher values result in more frequent egg drops
   - Lower values create a more relaxed pace
   - Recommended range: 0.01-0.2

3. `minEggs`: Ensures a minimum number of eggs are always present
   - Higher values maintain a more active gameplay
   - Lower values allow for moments of fewer eggs
   - Recommended range: 1-10

These parameters can be adjusted to create different difficulty levels:
- Easy: `maxEggs: 10, spawnRate: 0.03, minEggs: 3`
- Medium: `maxEggs: 15, spawnRate: 0.05, minEggs: 5`
- Hard: `maxEggs: 20, spawnRate: 0.08, minEggs: 7`

## Security Features

1. **Dynamic Color System**:
   - Random target color selection
   - Multiple noise colors
   - Color variations and patterns
   - Time-based color changes

2. **Movement Patterns**:
   - Random egg trajectories
   - Variable speeds
   - Physics-based motion
   - Unpredictable chicken movement

3. **Anti-Bot Measures**:
   - Multiple layers of noise
   - Pattern-based color variations
   - Dynamic difficulty adjustment
   - Mouse movement validation

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 