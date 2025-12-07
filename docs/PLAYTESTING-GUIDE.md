# Farm Tycoon Playtesting Guide

## Current Build Status: **Ready for Playtesting** ✅

This document provides guidance for playtesting the Farm Tycoon game.

## What's Implemented (Phase 1 MVP)

### Core Systems

- ✅ **Entity System**: Animals (cow, chicken, pig, sheep) and buildings (barn)
- ✅ **Movement System**: Wandering behavior with smooth animations
- ✅ **Resource Production**: Animals produce resources over time
- ✅ **Economic System**: Buy animals, sell resources, manage money
- ✅ **Maintenance System**: Fence health, animal health tracking
- ✅ **Day/Night Cycle**: 24-hour time system with visual sky changes
- ✅ **Notification System**: Toast notifications for events

### UI Features

- ✅ **Tutorial Overlay**: 5-step onboarding for new players
- ✅ **Keyboard Shortcuts**: Space/P (pause), R (repair), H (heal), ? (tutorial)
- ✅ **Visual Enhancements**: Isometric perspective, depth sorting, 3D barn
- ✅ **Bulk Sell**: "Sell All" buttons for each resource type
- ✅ **Help Panel**: In-game keyboard shortcut reference

### Performance

- ✅ **React.memo**: Optimized entity rendering
- ✅ **useMemo/useCallback**: Reduced re-renders
- ✅ **60 FPS game loop**: requestAnimationFrame

## How to Playtest

### Starting the Game

1. Navigate to `/farm` route
2. Tutorial will show automatically on first visit
3. Start with $1000 and 6 animals

### Key Actions to Test

#### 1. Buying Animals

- Click buttons in "Buy Animals" section
- Test affordability checks
- Verify animals spawn and move
- **Expected**: Smooth spawn, immediate movement

#### 2. Resource Production

- Wait for animals to produce resources
- Check resource counter updates
- Verify notification appears
- **Expected**: Resources increase over time

#### 3. Selling Resources

- Click "Sell $X" for individual sales
- Click "Sell All" for bulk sales
- Verify money updates correctly
- **Expected**: Money increases, resources decrease

#### 4. Maintenance

- Click "Repair Fences" when health drops
- Click "Heal Animals" when health drops
- Try keyboard shortcuts (R, H)
- **Expected**: Stats update, notifications appear

#### 5. Day/Night Cycle

- Watch sky gradient change over time
- Observe stars at night (20:00-06:00)
- Check time display updates
- **Expected**: Smooth color transitions

#### 6. Keyboard Controls

- Press Space or P to pause/resume
- Press R to repair fences
- Press H to heal animals
- Press ? to restart tutorial
- **Expected**: Immediate response

### What to Look For

#### Bugs to Report

- [ ] Animals escaping boundaries
- [ ] Resource counts going negative
- [ ] Money calculation errors
- [ ] UI elements overlapping
- [ ] Performance issues (lag, stuttering)
- [ ] Tutorial not appearing
- [ ] Keyboard shortcuts not working

#### Gameplay Balance

- [ ] Is starting money appropriate?
- [ ] Are animal prices balanced?
- [ ] Are resource production rates fair?
- [ ] Is maintenance cost reasonable?
- [ ] Does time pass too fast/slow?

#### User Experience

- [ ] Is tutorial clear and helpful?
- [ ] Are notifications too frequent?
- [ ] Is UI layout intuitive?
- [ ] Are keyboard shortcuts discoverable?
- [ ] Is visual feedback sufficient?

#### Feature Requests

- What features would make the game more fun?
- What information is missing from the UI?
- What actions feel tedious?
- What would you add next?

## Known Limitations

### Not Yet Implemented

- ❌ Animal collision detection
- ❌ Multiple barn support
- ❌ Save/load game state
- ❌ Sound effects
- ❌ Advanced AI (predators, weather events)
- ❌ Upgrades/tech tree
- ❌ Market price fluctuations

### Expected Behavior

- Animals may overlap - this is intentional for now
- No win/lose conditions yet - sandbox mode
- No persistence - refresh resets game
- No sound - visual feedback only

## Feedback Template

When providing feedback, please include:

```
**Browser**: Chrome/Firefox/Safari/Edge
**OS**: Windows/Mac/Linux
**Issue Type**: Bug/Balance/UX/Feature Request

**Description**:
[What happened or what you'd like to see]

**Steps to Reproduce** (for bugs):
1. [Step one]
2. [Step two]
3. [Result]

**Expected**: [What should happen]
**Actual**: [What actually happened]

**Severity**: Critical/High/Medium/Low

**Screenshots**: [If applicable]
```

## Success Criteria

The game is ready for Phase 2 when:

- ✅ Tutorial is clear for new users
- ✅ Core game loop is engaging (buy → produce → sell → maintain)
- ✅ No critical bugs reported
- ✅ Performance is smooth on target devices
- ✅ UI is intuitive without external docs

## Next Steps After Playtesting

Based on feedback, prioritize:

1. **Critical Bugs**: Game-breaking issues
2. **Balance**: Tune numbers for fun gameplay
3. **UX Polish**: Improve clarity and feedback
4. **Phase 2 Features**: Add complexity (see FARM-TYCOON.md)

---

**Playtesting Start Date**: [TBD]
**Version**: Phase 1 MVP
**Build**: Latest main branch
