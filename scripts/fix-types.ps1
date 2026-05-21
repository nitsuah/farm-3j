# Fix TypeScript generic type errors

# HeaderCropRow.tsx
$file = 'components/animations/HeaderCropRow.tsx'
(Get-Content $file -Raw) -replace 'useState<Set>\(new Set\(\)\)', 'useState<Set<number>>(new Set())' | Set-Content $file -NoNewline

# GridInteraction.tsx
$file = 'components/farm/GridInteraction.tsx'
(Get-Content $file -Raw) -replace 'const costs: Record = \{', 'const costs: Record<string, number> = {' | Set-Content $file -NoNewline

# FarmContext.tsx
$file = 'lib/farm/FarmContext.tsx'
(Get-Content $file -Raw) -replace 'dispatch: React\.Dispatch;', 'dispatch: React.Dispatch<FarmAction>;' | Set-Content $file -NoNewline

# gameLogic.ts
$file = 'lib/farm/gameLogic.ts'
$content = Get-Content $file -Raw
$content = $content -replace '\): Partial \| null \{', '): Partial<Entity> | null {'
$content = $content -replace 'animal: Partial; trough: Partial', 'animal: Partial<Entity>; trough: Partial<Entity>'
$content | Set-Content $file -NoNewline

# notifications.ts
$file = 'lib/farm/notifications.ts'
(Get-Content $file -Raw) -replace 'let notificationListeners: Array = \[\];', 'let notificationListeners: Array<(notifications: Notification[]) => void> = [];' | Set-Content $file -NoNewline

# types.ts
$file = 'lib/farm/types.ts'
$content = Get-Content $file -Raw
$content = $content -replace 'payload: Partial }', 'payload: Partial<FarmState> }'
$content = $content -replace 'payload: Array;', 'payload: Array<{ id: string; x: number; y: number; direction?: number }>;'
$content | Set-Content $file -NoNewline

Write-Host "All files fixed!"
