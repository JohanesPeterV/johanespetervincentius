#!/usr/bin/env bash
set -euo pipefail

FATAL=0

TSX_LIMIT=300
TS_LIMIT=500

MODE="${1:-all}"

EXEMPT_PATHS=(
  "src/components/ui/"
  "src/registry/registry-base-colors.ts"
)

is_exempt() {
  local file="$1"
  for exempt in "${EXEMPT_PATHS[@]}"; do
    if [[ "$file" == *"$exempt"* ]]; then
      return 0
    fi
  done
  return 1
}

check_file() {
  local file="$1"
  local limit="$2"

  [ -z "$file" ] && return
  [ ! -f "$file" ] && return

  if is_exempt "$file"; then
    return
  fi

  loc=$(wc -l < "$file" | tr -d ' ')
  if [ "$loc" -gt "$limit" ]; then
    echo "  FATAL  $loc LOC  $file  (limit: $limit)"
    FATAL=$((FATAL + 1))
  fi
}

check_staged_files() {
  local grep_pattern="$1"
  local limit="$2"
  local staged
  staged=$(git diff --cached --name-only --diff-filter=ACM 2>/dev/null || true)

  while IFS= read -r file; do
    check_file "$file" "$limit"
  done < <(echo "$staged" | grep -E "$grep_pattern" || true)
}

check_all_files() {
  local pattern="$1"
  local limit="$2"

  while IFS= read -r file; do
    check_file "$file" "$limit"
  done < <(eval "$pattern")
}

if [ "$MODE" = "staged" ]; then
  echo "Checking file sizes (staged files only)..."
  echo ""
  echo "--- .tsx files (limit: ${TSX_LIMIT}) ---"
  check_staged_files '\.tsx$' "$TSX_LIMIT"
  echo ""
  echo "--- .ts files (limit: ${TS_LIMIT}) ---"
  check_staged_files '\.ts$' "$TS_LIMIT"
else
  echo "Checking file sizes (all files)..."
  echo ""
  echo "--- .tsx files (limit: ${TSX_LIMIT}) ---"
  check_all_files \
    "find src -name '*.tsx' -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null" \
    "$TSX_LIMIT"
  echo ""
  echo "--- .ts files (limit: ${TS_LIMIT}) ---"
  check_all_files \
    "find src -name '*.ts' -not -name '*.d.ts' -not -path '*/node_modules/*' -not -path '*/.next/*' 2>/dev/null" \
    "$TS_LIMIT"
fi

echo ""
if [ "$FATAL" -gt 0 ]; then
  echo "RESULT: $FATAL FATAL"
  exit 1
else
  echo "RESULT: All files within limits"
  exit 0
fi
