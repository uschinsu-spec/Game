# Progression Balance Proposal v1.0

## Target pacing

The intended first-pass progression target is 90 days from level 1 to level 100 and from Luyện Khí to Độ Kiếp.

| Đại cảnh giới | Cấp độ kết thúc | Ngày tích lũy |
|---|---:|---:|
| Luyện Khí | 26 | 3 |
| Trúc Cơ | 42 | 10 |
| Kim Đan | 56 | 20 |
| Nguyên Anh | 67 | 32 |
| Hóa Thần | 77 | 46 |
| Luyện Hư | 85 | 60 |
| Hợp Thể | 92 | 73 |
| Đại Thừa | 96 | 83 |
| Độ Kiếp | 100 | 90 |

Each major realm has four stages: Sơ Kỳ, Trung Kỳ, Hậu Kỳ, Viên Mãn (36 total stage records).

## Character EXP

The EXP needed to advance from level L is:

`EXP(L) = round(100 + 25 × L^1.6)`

Level is capped at 100. Character EXP is earned from monster kills and offline progress. It is separate from cultivation EXP.

The total level-up budget is approximately 1.51 million EXP. The target daily average is approximately 16.8k EXP; the planning split is 65% active play and 35% offline progress.

## Cultivation EXP and breakthrough

Cultivation EXP is a separate spendable currency. It is earned through combat (3% of monster character EXP), cultivation (15 per action), daily welfare and kill quests. It is spent at each of the 36 stage breakthroughs.

Major realm gate costs:

| Gate | Cultivation EXP | Gold | Spirit stones | Demon cores |
|---|---:|---:|---:|---:|
| Trúc Cơ | 150 | 200 | 150 | 1 |
| Kim Đan | 350 | 500 | 350 | 1 |
| Nguyên Anh | 700 | 1,000 | 700 | 1 |
| Hóa Thần | 1,200 | 2,000 | 1,200 | 2 |
| Luyện Hư | 1,900 | 4,000 | 1,900 | 2 |
| Hợp Thể | 2,800 | 7,000 | 2,800 | 2 |
| Đại Thừa | 3,900 | 12,000 | 3,900 | 3 |
| Độ Kiếp | 5,200 | 20,000 | 5,200 | 3 |

Inner-stage gates use smaller, increasing resource costs. The stage data also grants HP, ATK and DEF bonuses.

## Combat rewards and loot

Normal-equivalent average EXP by major realm is planned at 70, 85, 100, 120, 145, 170, 200, 240 and 300. Elite monsters pay 3× and bosses 8×; normal base rewards are scaled down to account for the current wave mix so the weighted average remains near the target.

Equipment chance: normal 0.8%, elite 3%, boss 25%. Bosses always drop a Thiên Mục Ma Hạch. Automatic boss waves are spaced at roughly 450 spawned-monster counter units (about 150 waves in the current three-unit wave counter). Manual boss summons remain a separate optional action.

## Offline progress

Offline rewards are capped at 12 hours. The configured rate is 700 character EXP/hour, 240 gold/hour and 7.5 spirit stones/hour (rounded down per minute-based claim). Offline rewards do not simulate kills, quest progress, equipment drops or boss drops.

## Validation status

This is an initial balance pass, not a playtested final economy. Verify actual kill throughput, player deaths, average elite/boss mix, and whether the 90-day target holds under realistic session lengths before merging to main.