---
id: WP06
title: "Bugfix — Game Over Screen Crash on Starvation Death"
lane: done
depends_on: [WP01]
---
# WP06: Bugfix — Game Over Screen Crash

## Problem
When all party members die of starvation (common as Farmer), the Game Over
screen never appears. The game freezes on the Travel scene.

## Root Cause
`SoundManager.playFuneralOrgan()` called `vibrato.frequency.setValueAtTime(5)`
with only 1 argument instead of the required 2. This TypeError crashed
`GameOverScene.create()`, preventing the scene from rendering.

## Fix
Added missing time parameter: `setValueAtTime(5, now + startTime)`

## Commit
- `ae49a9b` fix(audio): add missing time arg to setValueAtTime in funeral organ

## GitHub Issue
- #17 Bug: Game Over screen never appears after party starvation death
