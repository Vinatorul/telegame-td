# Cat Kingdom Tower Defense - Gameplay Systems

## Core Tower Defense Mechanics

### Basic Gameplay Loop
1. Players place cat towers along enemy paths
2. Waves of enemies attempt to traverse the path
3. Towers attack enemies within their range
4. Players earn resources from defeated enemies
5. Resources are used to place more towers or upgrade existing ones
6. Players progress through increasingly difficult waves

### Path System
- Predefined paths that enemies follow
- Multiple entry and exit points in advanced levels
- Branching and converging paths in later stages
- Special path tiles that affect enemy movement (slippery ice, sticky mud, etc.)

### Wave System
- Timed waves with increasing difficulty
- Mix of enemy types in each wave
- Special waves (all fast enemies, armored enemies, etc.)
- Boss waves at key intervals
- Optional manual wave triggering for advanced players

## Special Gameplay Mechanics

### Day/Night Cycle
- Cycles between day and night phases during gameplay
- Each complete cycle lasts approximately 5 minutes of real-time
- Transitions (dawn and dusk) last about 30 seconds each

#### Day Phase Effects
- Standard gameplay conditions
- Balanced tower effectiveness
- Regular enemy spawns
- Solar-powered towers get bonuses

#### Night Phase Effects
- Reduced visibility (shorter tower ranges)
- Some towers become less effective (Archer Cat, Warrior Cat)
- Other towers become more powerful (Mage Cat, Scout Cat)
- Nocturnal enemies appear (owls, bats, raccoons)
- Stealth enemies are harder to detect

### Weather System
- Weather changes every few waves
- Each weather condition lasts 2-3 waves
- Can be predicted via UI indicators

#### Weather Types
1. **Sunny**
   - Standard conditions
   - Solar-powered towers get a boost
   - Slight speed reduction for some enemies

2. **Rainy**
   - Water puddles form on paths, slowing some enemies
   - Reduces range for Archer Cats
   - Boosts Water-affinity cats
   - Some enemies (worms) appear more frequently

3. **Windy**
   - Affects projectile accuracy
   - Flying enemies move faster with tailwind, slower against headwind
   - Can blow away certain status effects

4. **Foggy**
   - Reduces vision range for all towers
   - Scout Cats become essential
   - Stealth enemies get additional bonuses

5. **Thunderstorm**
   - Combines rain effects with periodic lightning strikes
   - Lightning can damage enemies but also temporarily disable towers
   - Mage Cats can harness lightning for powerful attacks

## Progression Systems

### Story Progression
- New territories unlock as players complete chapters
- Each territory introduces at least one new tower type
- Special event levels unlock unique tower variants
- Story milestones grant special resources and abilities

### Resource System

#### Primary Resources
- **Gold/Fish Coins**: Basic currency earned from defeating enemies
  - Used for purchasing and upgrading basic towers
  - Earned in all levels

- **Magical Catnip**: Premium resource
  - Used for advanced upgrades and special towers
  - Limited availability, primarily from special enemies and objectives

- **Royal Milk**: Special resource
  - Used for temporary boosts and ultimate abilities
  - Primarily earned from boss battles

#### Resource Collection
- Automatic collection from defeated enemies
- Bonus resources from completing level objectives
- Daily rewards and challenges
- Special resource-focused levels

### Experience System
- Individual towers gain experience when they defeat enemies
- Experience leads to level-ups that improve base stats
  - Damage increase
  - Range extension
  - Attack speed improvement
- Maximum level cap increases with story progression
- Experienced towers can be saved as "veteran" units for future levels

### Skill Tree System
- Each tower type has its own skill tree
- Skill points earned through:
  - Tower experience milestones
  - Story progression
  - Special challenges
- Multiple upgrade paths allowing specialization
- Respec option available for strategic flexibility

#### Example: Archer Cat Skill Tree
- Left Path: Speed Focus (attack speed, movement speed)
- Middle Path: Damage Focus (critical hits, armor penetration)
- Right Path: Utility Focus (slowing effects, multi-target)

## Combat Mechanics

### Tower Targeting
- Default: First enemy in range
- Upgradable targeting options:
  - Strongest enemy
  - Weakest enemy
  - Fastest enemy
  - Closest to exit

### Damage Types
- Physical (standard damage)
- Magical (bypasses some armor)
- True (bypasses all defenses)
- Elemental (special effects based on type)

### Status Effects
- Slow: Reduces enemy movement speed
- Stun: Temporarily stops enemy movement
- Poison: Damage over time
- Weaken: Reduces enemy damage output
- Mark: Increases damage taken from other towers

## Level Objectives

### Primary Objectives
- Survive all waves
- Prevent enemies from reaching the exit
- Protect specific structures or characters

### Secondary Objectives
- Complete the level with a certain number of lives remaining
- Defeat a specific number of special enemies
- Use only certain types of towers
- Complete within a time limit
- Spend under a certain amount of resources

### Rewards
- Star rating system (1-3 stars)
- Bonus resources for secondary objectives
- Unlockable cosmetics and tower variants
- Lore entries and story fragments

## Player Aids and Tutorials

### Tutorial System
- Interactive tutorial levels
- Contextual hints for new mechanics
- Optional advanced strategy tips

### Player Assistance
- Suggested tower placements
- Warning indicators for leaking enemies
- Tower range visualization
- Enemy path highlighting
- Wave composition preview
